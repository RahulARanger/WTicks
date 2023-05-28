import { describe, expect, test } from "@jest/globals";
import { readMockData } from "./mockFileRead";
import { ToStandaloneScript } from "../src/theory/parser";

describe("Validating the parsed results based on the type of the file uploaded", function () {
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

		test("After patching the names of the locators, we patch the whole script", function () {});
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
	});
});
