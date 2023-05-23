import { describe, expect, test } from "@jest/globals";
import { readExpectation, readMockData } from "./mockFileRead";
import ToGherkin from "../src/theory/parser";

describe("Verifying the code generation for the multiple test steps", function () {
	const parser = new ToGherkin();
	parser.feed(readMockData("Adding&RemovingElements.side"));
	const expectedFeatureFile = readExpectation(
		"Adding&RemovingElements.feature"
	);

	test("Parsing all the test cases", function () {
		expect(parser.understandTestCases()).toBe(true);
		expect(Object.keys(parser.parsedTestCases)).toHaveLength(2);
	});

	test("Parsing all the suite", function () {
		expect(parser.understandSuites()).toBe(true);
		expect(parser.parsedSuites).toHaveLength(1);
	});

	test("Generating the feature file", function () {
		expect(parser.generateGherkinFile()).toBe(expectedFeatureFile);
	});
});
