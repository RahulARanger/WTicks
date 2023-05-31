import { describe, expect, test } from "@jest/globals";
import { readExpectation, readMockData } from "./mockFileRead";
import { ToStandaloneScript } from "../src/theory/parser";

describe("Validating the parsed results based on the type of the file uploaded", function () {
	const test_for_test_case = "230fa3c9-362e-4173-8ead-66c052dc68d9";
	const test_for_test_suite = "90f25091-d413-472f-9e66-35569716293b";

	describe("Validating the Script with valid test cases", function () {
		const parser = new ToStandaloneScript();
		parser.feed(readMockData("Adding&RemovingElements.side"));
		parser.parseTestCases();

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
			expect(parser.parseSuite(test_for_test_suite)).toHaveLength(2); // returns the test ids
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
			expect(parser.parseSuite(test_for_test_suite)).toHaveLength(2); // returns the ids of the test cases
			const test_case = parser.parsedTestCases[test_for_test_case];
			expect(test_case?.commands?.at(-1)?.parsed).toBe(
				"await pageClass.AddOrRemoveElementButton.click();"
			);
		});
	});

	describe("file with some variable names", function () {
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
			".MuiIconButton-sizeSmall": "search_button",
			".MuiTypography-h6": "title",
			".css-xkbv5f": "back_button",
		};

		test("Parsing must be successful", function () {
			expect(Object.keys(parser.locators)).toHaveLength(0);
			expect(Object.keys(parser.parsedTestCases)).toHaveLength(0);

			expect(parser.parseTestCases()).toBe(undefined);
			// though its output is less informative but internally it did something useful

			// it has parsed the locators
			expect(Object.keys(parser.locators)).toHaveLength(8);
		});

		test("Expecting the test case to be parsed even if some of them are not used in the suite", function () {
			// it also parses the test cases on high level
			expect(Object.keys(parser.parsedTestCases)).toHaveLength(2);
			expect(parser.parsedTestCases[test_case].step_name).toBe(
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
				".MuiIconButton-sizeSmall",
				".MuiTypography-h6",
				".css-xkbv5f",
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
			const script = parser.genScript(test_case);
			expect(script).toBe(
				readExpectation("testWithVariableNameScript.js")
			);
		});

		const suite_id = "116e6d91-3b23-4b41-b2f8-f2f507bd7ac8";
		const inside_tests = [
			"b8fba4eb-8596-44ba-a748-d8384b8aa598",
			"a75ae196-3bab-4d1c-b7db-ccd3b331ba6b",
		];

		test("Generating the script for the entire suite", function () {
			const tests = parser.parseSuite(suite_id);
			expect(tests).toEqual(inside_tests);

			const script_generated = parser.genScript(...inside_tests);
			expect(script_generated).toBe(
				readExpectation("scenarioGeneratedWithVariableNameScript.js")
			);
		});
	});
});
