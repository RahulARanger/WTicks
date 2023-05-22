import { describe, expect, test } from "@jest/globals";
import GeneralizeVariable from "../src/theory/parser";
import { readMockData } from "./mockFileRead";

describe("Validating the Generation for the Variables from a Simple Side File", function () {
	const parser = new GeneralizeVariable();
	parser.feed(readMockData("SingleTest-Scenario.side"));

	test("Ability to read", function () {
		expect(parser.parsed).not.toBeUndefined();
		expect(parser.parsed?.tests).not.toBeUndefined();
		expect(parser.parsed?.url).toBe("https://yticks.vercel.app/video");
	});

	const test_case = parser.parsed?.tests.at(0);

	test("Ability to understand", function () {
		expect(parser.parsed?.tests).toHaveLength(1);
		expect(test_case).not.toBeUndefined();
	});

	test("Understanding the only one test present", function () {
		expect(test_case?.commands).toHaveLength(6);
		expect(test_case?.name).toBe("AssertSearchBar");
	});
});
