import { describe, expect, test } from "@jest/globals";
import ToGherkin, { generateClassMethod } from "../src/theory/parser";
import { readMockData } from "./mockFileRead";

describe("Validating the Generation for the Variables from a Simple Side File", function () {
	const parser = new ToGherkin();
	parser.feed(readMockData("SingleTest-Scenario.side"));

	const test_case = parser.parsed?.tests.at(0);

	test("Ability to read", function () {
		expect(parser.parsed).not.toBeUndefined();
		expect(parser.parsed?.tests).not.toBeUndefined();
		expect(parser.parsed?.url).toBe("https://yticks.vercel.app/video");

		expect(parser.parsed?.tests).toHaveLength(1);
		expect(test_case).not.toBeUndefined();
	});

	test("Extracting the required information from the test case", function () {
		expect(test_case?.commands).toHaveLength(6);
		expect(test_case?.name).toBe("AssertSearchBar");
	});
});

describe("Validating if the non gherkin steps are recognized", function () {
	const parser = new ToGherkin();
	parser.feed(readMockData("NotAGherkinTestStep.side"));
	const test_case = parser.parsed?.tests[0];

	test("The name of the test case is not a valid gherkin step", function () {
		expect(test_case).not.toBeUndefined();
		if (test_case) expect(parser.parseTestCase(test_case)).toBe(false);
		expect(parser.parsedTestCases).toHaveLength(0);
		// in that case we do not parse the test case
		// so make sure to have the some important gherkin keywords
	});
});

describe("Validating if the locators are assigned a function names", function () {
	const parser = new ToGherkin();
	parser.feed(readMockData("WithVariableNames.side"));
	const test_case = parser.parsed?.tests[0];
	const locatorFound = "#:Ril56:"; // id=:Ril56:

	test("verifying if a valid gherkin step is parsed properly", function () {
		expect(test_case).not.toBeUndefined();
		if (test_case) expect(parser.parseTestCase(test_case)).toBe(true);
		expect(Object.keys(parser.locators)).toHaveLength(1);
		expect(parser.parsedTestCases).toHaveLength(1);
	});

	test("Validating the details of the parsed test step", function () {
		const test_step = parser.parsedTestCases[0];
		expect(test_step.step_name).toBe("Given I have reached the URL");
		expect(test_step.commands).toHaveLength(1);
	});

	test("Validating the details of the locator found", function () {
		const func_name = parser.locators[locatorFound];
		expect(func_name).not.toBeUndefined();
		expect(func_name).toBe(""); // because we didn't name the locator in the first test
	});

	test("Validating if the details of the locators are updated as the test cases are parsed", function () {
		const test_case = parser.parsed?.tests[1];
		expect(test_case).not.toBeUndefined();
		if (test_case) expect(parser.parseTestCase(test_case)).toBe(true);
		expect(Object.keys(parser.locators)).toHaveLength(1); // there is still one locator
		expect(parser.parsedTestCases).toHaveLength(2);

		const func_name = parser.locators[locatorFound];
		expect(func_name).not.toBeUndefined();
		expect(func_name).toBe("search_bar"); // because we didn't name the locator in the first test
	});

	test("now that we have parsed all the test cases", function () {
		expect(parser.parsed?.tests.length).toBe(parser.parsedTestCases.length);
	});

	test("we can now generate the code for the locator method", function () {
		expect(parser.locators[locatorFound]).not.toBeUndefined();

		const classMethod = generateClassMethod(
			parser.locators[locatorFound],
			locatorFound
		);

		expect(classMethod).toBe(`
	get search_bar(){
		return $("#:Ril56:");
	}`);
	});

	test("Verifying the code generated for the Locators class", function () {
		expect(parser.generateLocatorClass()).toBe(
			`
class Locators {
	get search_bar(){
		return $("#:Ril56:");
	}
}
`
		);
	});
});

describe("Verifying the locator mapping strategy", function () {
	const parser = new ToGherkin();

	test("Verifying the locators for the xpath selectors", function () {
		const test_cases = [
			"xpath=//div[@id='__next']/nav/div/div[2]/div/input",
			`xpath=//button[text()="Sign In"]`,
			`xpath=//label[text()="Remember me"]/input[@type="checkbox"]`,
		];
		const results = [
			"//div[@id='__next']/nav/div/div[2]/div/input",
			`//button[text()="Sign In"]`,
			`//label[text()="Remember me"]/input[@type="checkbox"]`,
		];

		test_cases.forEach((test_case, index) => {
			expect(parser._handleLocator(test_case)).toBe(results[index]);
		});
	});
});
