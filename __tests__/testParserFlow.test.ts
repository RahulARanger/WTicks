import { describe, expect, test } from "@jest/globals";
import { readExpectation, readMockData } from "./mockFileRead";
import { ToStandaloneScript } from "../src/theory/parser";

describe("Validating the parsed results based on the type of the file uploaded", function () {
	const test_for_test_case = "230fa3c9-362e-4173-8ead-66c052dc68d9";
	const test_for_test_suite = "90f25091-d413-472f-9e66-35569716293b";

	describe("Validating the Script with valid test cases", function () {
		const parser = new ToStandaloneScript();
		parser.feed(readMockData("Adding&RemovingElements.side"));
		parser.parseAllTestCases();

		test("Validating the locators collected", function () {
			const locators = Array.from(Object.keys(parser.locators));
			expect(locators).toHaveLength(3);
			expect(locators).toEqual([
				// order is same as that of the script
				"=Add/Remove Elements",
				"button",
				".added-manually",
			]);
		});

		test("Checking if the parser needs a patch for the names", function () {
			expect(parser.needForPatch()).toBe(true);
		});

		test("Patching the Names", function () {
			const locators = parser.locators;
			locators["=Add/Remove Elements"] = "modifyElementButton";
			locators["button"] = "normal_button";
			locators[".added-manually"] = "addedManually";

			expect(
				parser.patchName("=Add/Remove Elements", "modifyElementButton")
			).toBe(true);
			expect(parser.patchName("button", "normal_button")).toBe(true);
			expect(parser.patchName(".added-manually", "addedManually")).toBe(
				true
			);

			expect(parser.func_names.has("normal_button")).toBe(true);
			expect(parser.func_names.has("addedManually")).toBe(true);
			expect(parser.func_names.has("modifyElementButton")).toBe(true);
		});

		test("Now we parse the required suite", function () {
			expect(parser.parseSuite(test_for_test_suite).size).toBe(2); // returns the test ids
		});

		test("While the suite is parsed, the commands are mapped", function () {
			const test_case = parser.parsedTestCases[test_for_test_case];
			expect(test_case).not.toBeUndefined();
			const parsed_steps: Array<string> = [];

			test_case.commands.forEach((command) => {
				expect(command.parsed).not.toBe(false);
				expect(typeof command.parsed).toBe("string");
				if (typeof command.parsed === "string")
					parsed_steps.push(command.parsed);
			});

			const [open_command, setWindowSize, click] = [...parsed_steps];
			expect(open_command).toBe(
				`await browser.url("https://the-internet.herokuapp.com/");`
			);
			expect(setWindowSize).toBe(
				"await browser.setWindowSize(1296, 736);"
			);
			expect(click).toBe("await pageClass.modifyElementButton.click();");
		});

		test("if the variables is renamed then we would need to parse suite again", function () {
			expect(
				parser.patchName(
					"=Add/Remove Elements",
					"AddOrRemoveElementButton"
				)
			).toBe(true);
			expect(parser.func_names.has("modifyElementButton")).toBe(false);
			const test_case = parser.parsedTestCases[test_for_test_case];

			const click_command = test_case?.commands?.at(-1);
			expect(click_command?.parsed).not.toBe(
				"await pageClass.AddOrRemoveElementButton.click();"
			);
		});

		test("while the suite is parsed, it will patch all the required commands", function () {
			expect(parser.parseSuite(test_for_test_suite).size).toBe(2); // returns the ids of the test cases
			const test_case = parser.parsedTestCases[test_for_test_case];
			expect(test_case?.commands?.at(-1)?.parsed).toBe(
				"await pageClass.AddOrRemoveElementButton.click();"
			);
		});
	});

	describe("Verifying the script generation for a particular test case", function () {
		const parser = new ToStandaloneScript();
		parser.feed(readMockData("WithVariableNames.side"));

		const locators = parser.locators;
		const test_case = "a75ae196-3bab-4d1c-b7db-ccd3b331ba6b";

		const search_bar = "search_bar";
		const search_bar_locator = "#\\\\:Ril56\\\\:";

		const patched_names: { [key: string]: string } = {
			"#\\\\:Ril56\\\\:-label": "search_bar_location",
			"#\\\\:Ril56\\\\:": "youtube_search_bar",
			".MuiInputAdornment-root > span": "search_bar_icon",
			".MuiTooltip-tooltip": "tooltip",
			"#__next": "body",
		};

		test("Parsing must be successful", function () {
			expect(Object.keys(parser.locators)).toHaveLength(0);
			expect(Object.keys(parser.parsedTestCases)).toHaveLength(0);

			expect(parser.parseTestCases(test_case)).toEqual(
				new Set(Object.keys(patched_names))
			);

			// it has parsed the locators
			expect(Object.keys(parser.locators)).toHaveLength(5);
			// Total 8 locators are there but we are specifically requested for a test case so we need to filter it out
		});

		test("Expecting the test case to be parsed even if some of them are not used in the suite", function () {
			// it also parses the test cases on high level
			expect(Object.keys(parser.parsedTestCases)).toHaveLength(1);
			// we only the test case that we parsed so we based on the previous test case we would need to call the parseAllTestCases to ensure that all are passed
			// but we would need to support this scenario as well
			expect(parser.parsedTestCases[test_case].test_name).toBe(
				"Validating the search bar"
			);
		});

		test("Verifying the Locators collected", function () {
			const locations = Object.keys(locators);
			expect(locations).toEqual([
				"#\\\\:Ril56\\\\:-label",
				search_bar_locator,
				".MuiInputAdornment-root > span",
				".MuiTooltip-tooltip",
				"#__next",
			]);
		});

		test("Verifying if the parser is able to detect the names from the script", function () {
			const given_name = locators[search_bar_locator];
			expect(given_name).toBe(search_bar);
		});

		test("patching the variable names even those which are already defined", function () {
			expect(parser.func_names.has(search_bar)).toBe(true);
			expect(
				parser.patchName(
					search_bar_locator,
					patched_names[search_bar_locator]
				)
			).toBe(true);
			expect(parser.func_names.has(search_bar)).toBe(false);
		});

		test("Patching rest of the locators", function () {
			expect(parser.needForPatch()).toBe(true);

			Object.keys(patched_names).forEach(function (name) {
				expect(parser.patchName(name, patched_names[name])).toBe(true); // patch was successfully
			});
		});

		test("Checking if the parser still needs a patch", function () {
			expect(parser.needForPatch()).toBe(false);
		});

		test("Parsing the commands for the requested test case", function () {
			const parsed_test_case = parser.parsedTestCases[test_case];

			parsed_test_case.commands.forEach((command) => {
				expect(command.parsed).toBeUndefined();
			});

			const test_cases_patched = parser.patchCommands(test_case);
			expect(test_cases_patched).toEqual(new Set([test_case]));

			parsed_test_case.commands.forEach((command) => {
				expect(typeof command.parsed).toBe("string");
			});
		});

		test("Generating the script required for the test case", function () {
			const script = parser.genScript(Object.keys(patched_names), [
				test_case,
			]);
			expect(script).toBe(
				readExpectation("testWithVariableNameScript.js")
			);
		});
	});

	describe("Verifying the script generation for the scenario", function () {
		const suite_id = "116e6d91-3b23-4b41-b2f8-f2f507bd7ac8";
		const inside_tests = [
			"b8fba4eb-8596-44ba-a748-d8384b8aa598",
			"a75ae196-3bab-4d1c-b7db-ccd3b331ba6b",
		];

		const patched_names: { [key: string]: string } = {
			"#\\\\:Ril56\\\\:-label": "search_bar_location",
			"#\\\\:Ril56\\\\:": "youtube_search_bar",
			".MuiInputAdornment-root > span": "search_bar_icon",
			".MuiTooltip-tooltip": "tooltip",
			"#__next": "body",
			".MuiIconButton-sizeSmall": "search_button",
			".MuiTypography-h6": "title",
			".css-xkbv5f": "back_button",
		};

		const parser = new ToStandaloneScript();
		parser.feed(readMockData("WithVariableNames.side"));

		test("Parsing the locators", function () {
			expect(parser.locators).toEqual({});
			expect(parser.parseSuiteCases(suite_id)).toEqual(
				new Set(Object.keys(patched_names))
			);
		});

		test("Patching the Names", function () {
			Object.keys(patched_names).forEach((locator) =>
				parser.patchName(locator, patched_names[locator])
			);
			expect(parser.locators).toEqual(patched_names);
		});

		test("Parsing the Suite", function () {
			const tests = parser.parseSuite(suite_id);
			expect(tests).toEqual(new Set(inside_tests));
		});

		test("verifying the script generation and ensuring that it only depends on the external locators but not its internal ones", function () {
			// parser has its locators which is vast compared to the locators that UI could request which is restricted to the particular test case / suite
			// as long as UI sends valid locators we should not generate locator class for all unused locators

			const script_generated = parser.genScript(
				Object.keys(patched_names),
				inside_tests
			);
			expect(script_generated).toBe(
				readExpectation("scenarioGeneratedWithVariableNameScript.js")
			);

			parser.locators["dummy"] = "dummy";

			expect(script_generated).toBe(
				readExpectation("scenarioGeneratedWithVariableNameScript.js")
			);
		});

		test("Verifying the script generation are really dependent on the external locators", function () {
			patched_names["dummy"] = "dummy";
			const script_generated = parser.genScript(
				Object.keys(patched_names),
				inside_tests
			);

			expect(script_generated).not.toBe(
				readExpectation("scenarioGeneratedWithVariableNameScript.js")
			);

			delete patched_names["dummy"];
		});

		test("Verifying if the parseAll is working as expected or not", function () {
			parser.locators = {}; //mocking reset
			expect(Object.keys(parser.locators)).not.toEqual(
				Object.keys(patched_names)
			);
			parser.parseAllTestCases();
			patched_names[".MuiTypography-alignCenter"] = "showMore";
			// this is the only one locator it has apart from the scenario so adding to the expected result
			expect(Object.keys(parser.locators)).toEqual(
				Object.keys(patched_names)
			);
		});
	});

	describe("Executing Multiple Test cases due to the run command", function () {
		const parser = new ToStandaloneScript();
		parser.feed(readMockData("WithVariableNames.side"));
		const test_case = "1b958017-b1ba-4de5-b21b-7b5018a0c187";
		const helper_test_case = "b8fba4eb-8596-44ba-a748-d8384b8aa598";
		const patch_for_main_test_case: { [key: string]: string } = {
			".MuiTypography-alignCenter": "ShowMore",
		};

		const patch_for_helper_test_case: { [key: string]: string } = {
			"#\\\\:Ril56\\\\:-label": "search_bar_location",
			"#\\\\:Ril56\\\\:": "youtube_search_bar",
			".MuiIconButton-sizeSmall": "search_button",
			".MuiTypography-h6": "title",
			".css-xkbv5f": "back_button",
		};
		const patched = {
			...patch_for_main_test_case,
			...patch_for_helper_test_case,
		};
		parser.parseAllTestCases();

		test("Verifying if parsing a test case with run will also parse the other test case", function () {
			const locators = parser.parseTestCases(test_case);
			// parses helper_test_case too as it we would need to provide its locators as well
			expect(locators).toEqual(new Set(Object.keys(patched)));
			expect(parser.parsedTestCases[test_case].test_name).toBe(
				"Loading more comments"
			);
		});

		test("patching the subset of the names", function () {
			Object.keys(patched).forEach((key) => {
				expect(parser.patchName(key, patched[key])).toBe(true);
			});
		});

		test("Patching the commands", function () {
			const test_ids = parser.patchCommands(test_case);
			expect(test_ids).toEqual(new Set([helper_test_case, test_case]));
		});

		test("Generating the script", function () {
			expect(
				parser.genScript(
					Object.keys(patched),
					[test_case],
					test_case,
					helper_test_case
				)
			).toBe(readExpectation("scrollScript.js"));
		});
	});
});
