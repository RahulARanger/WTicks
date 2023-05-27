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

		test("Verifying the name of the locator collected from the script", function () {
			const given_name = locators["#:Ril56:"];
			expect(given_name).toEqual("search_bar");
		});
	});
});
