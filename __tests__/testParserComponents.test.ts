import { describe, expect, test } from "@jest/globals";
import { parseLocators, mapSteps } from "../src/theory/stepMapping";
import { LocationResult, ParsedTestStep } from "../src/theory/sharedTypes";

interface ExpectedLocationResult {
	input: string;
	output: LocationResult;
}

describe("Parsing the locator strategy", function () {
	const tests: Array<ExpectedLocationResult> = [
		{ input: "", output: { isLocator: false, target: "" } },
		{
			input: "unknown_target",
			output: { isLocator: false, target: "unknown_target" },
		},
		// NEGATIVE TEST CASES ENDS
		{
			input: "linkText=Add/Remove Elements",
			output: { isLocator: true, target: "=Add/Remove Elements" },
		},
		{
			input: "css=li:nth-child(2) > a",
			output: { isLocator: true, target: "li:nth-child(2) > a" },
		},
		{
			input: "xpath=//a[contains(text(),'Add/Remove Elements')]",
			output: {
				isLocator: true,
				target: "//a[contains(text(),'Add/Remove Elements')]",
			},
		},
		{
			input: "css=button",
			output: { isLocator: true, target: "button" },
		},
		{
			input: "css=#myElement .myClass",
			output: { isLocator: true, target: "#myElement .myClass" },
		},
		{
			input: "partialLinkText=Click",
			output: { isLocator: true, target: "*=Click" },
		},
		{
			input: "name=myInput",
			output: { isLocator: true, target: "[name='myInput']" },
		},
		{
			input: "tagName=div",
			output: { isLocator: true, target: "div" },
		},
		{
			input: `link=My "Link"`,
			output: { isLocator: true, target: `a=My "Link"` },
		},
		{
			input: "linkText=Learn & Explore",
			output: { isLocator: true, target: "=Learn & Explore" },
		},
	];
	test.each<ExpectedLocationResult>(tests)(
		"Checking for the Locator Strategy for the Input '$input'",
		function ({ input, output }: ExpectedLocationResult) {
			expect(parseLocators(input)).toEqual(output);
		}
	);
});

interface ExpectedStepResult {
	input: ParsedTestStep;
	output: boolean | string;
}

describe("Validating the step mappings", function () {
	const locator_name = "locator_name";
	const tests: Array<ExpectedStepResult> = [
		{
			input: {
				isLocator: false,
				target: "Some Script",
				value: "",
				command_name: "run",
			},
			output: true,
		},
		{
			input: {
				isLocator: true,
				target: ".button",
				value: "",
				command_name: "click",
			},
			output: `await locators.locator_name.click();`,
		},
		{
			input: {
				isLocator: true,
				target: "input",
				command_name: "type",
				value: "dummy_text",
			},
			output: `await locators.locator_name.setValue("dummy_text");`,
		},
		{
			input: {
				isLocator: true,
				target: "css=.added-manually",
				command_name: "assertElementPresent",
				value: "true",
			},
			output: "await expect(locators.locator_name).toBeDisplayed();",
		},
		{
			input: {
				isLocator: false,
				target: "1296x736",
				command_name: "setWindowSize",
				value: "",
			},
			output: "await browser.setWindowSize(1296, 736);",
		},
		{
			input: {
				isLocator: false,
				target: "https://the-internet.herokuapp.com/",
				command_name: "open",
				value: "",
			},
			output: `await browser.url("https://the-internet.herokuapp.com/");`,
		},
		{
			input: {
				isLocator: true,
				target: "input#selected",
				command_name: "assertEditable",
				value: "",
			},
			output: "await expect(locators.locator_name).toBeEnabled();",
		},
		{
			input: {
				isLocator: true,
				target: "input#selected",
				command_name: "assertNotEditable",
				value: "",
			},
			output: "await expect(locators.locator_name).not.toBeEnabled();",
		},
		{
			input: {
				isLocator: true,
				target: "input#checkbox",
				command_name: "assertChecked",
				value: "",
			},
			output: "await expect(locators.locator_name).toBeChecked();",
		},
		{
			input: {
				isLocator: true,
				target: "input#checkbox",
				command_name: "assertNotChecked",
				value: "",
			},
			output: "await expect(locators.locator_name).not.toBeChecked();",
		},
		{
			input: {
				isLocator: false,
				target: "Hello There",
				command_name: "echo",
				value: "",
			},
			output: `console.log("Hello There");`,
		},
	];

	test.each<ExpectedStepResult>(tests)(
		"Verifying the result if the step is of $input",
		function ({ input, output }) {
			expect(mapSteps(input, locator_name)).toEqual(output);
		}
	);
});
