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
});
