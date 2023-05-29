import { describe, expect, test } from "@jest/globals";
import { readMockData } from "./mockFileRead";
import { ToStandaloneScript } from "../src/theory/parser";

describe("Validating the parsed results based on the type of the file uploaded", function () {
	const test_for_test_case = "230fa3c9-362e-4173-8ead-66c052dc68d9";
	const test_for_test_suite = "90f25091-d413-472f-9e66-35569716293b";

	describe("Validating the Script with valid test cases", function () {
		const parser = new ToStandaloneScript();
		parser.feed(readMockData("Adding&RemovingElements.side"));
		const result = parser.parseTestCases();

		test("Parsing must be successful", function () {
			expect(result).toBe(true);
		});

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
			expect(parser.parseSuite(test_for_test_suite)).toBe(
				"Assertion for Adding and Removing the Elements"
			);
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
			expect(parser.parseSuite(test_for_test_suite)).toBe(
				"Assertion for Adding and Removing the Elements"
			);
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

		test("Parsing must be successful", function () {
			expect(parser.parseTestCases()).toBe(true);
		});

		test("Expecting the test case to be parsed even if some of them are not used in the suite", function () {
			expect(Object.keys(parser.parsedTestCases)).toHaveLength(2);
		});

		test("Verifying the Locators collected", function () {
			const locations = Object.keys(locators);
			expect(locations).toHaveLength(3);
			expect(locations).toEqual([
				"#:Ril56:",
				"#:Ril56:-label",
				".MuiTypography-root",
			]);
		});

		test("Verifying if the parser is able to detect the names from the script", function () {
			const given_name = locators["#:Ril56:"];
			expect(given_name).toEqual("search_bar");
		});

		test("patching the variable names even those which are already defined", function () {
			expect(parser.func_names.has("search_bar")).toBe(true);

			expect(parser.patchName("#:Ril56:", "search_bar_location")).toBe(
				true
			);
			expect(parser.patchName("#:Ril56:-label", "search_bar_label")).toBe(
				true
			);
			expect(
				parser.patchName(".MuiTypography-root", "confirm_button")
			).toBe(true);

			expect(parser.func_names.has("search_bar")).toBe(false);
		});

		test("Checking if the parser still needs a patch", function () {
			expect(parser.needForPatch()).toBe(false);
		});

		test("Verifying the script generated at the end", function () {
			const scriptGenerated = parser.genScript;
			expect(scriptGenerated).toBe("");
		});
	});
});
