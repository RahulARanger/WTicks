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

	// test("Generating the locators class", function () {
	// 	expect(Array.from(parser.var_names)).toHaveLength(1); // because none of the locators are named by the user

	// 	// names are generated once the generateLocatorClass is called
	// 	const classString = parser.generateLocatorClass();
	// 	expect(classString).toMatch(/^\nclass Locators {\n/);
	// 	expect(classString).toMatch(/}\n$/);
	// });
});

describe("Verifying if the scripts with no suites are detected", function () {
	test("Verifying the case if there are no test suites", function () {
		const parser = new ToGherkin();
		parser.feed(readMockData("SingleTest-Scenario.side"));

		expect(parser.isValidFile()).toBe(false);
		expect(parser.hasSuites()).toBe(false);
	});
});
