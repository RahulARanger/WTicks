import { describe, expect, test } from "@jest/globals";
import {
	parseLocators,
	mapSteps,
	insideQuotes,
	transitions,
} from "../src/theory/stepMapping";
import { LocationResult, ParsedTestStep } from "../src/theory/sharedTypes";
import {
	dollar_method,
	generateClass,
	generateClassMethod,
	to_good_name,
} from "../src/theory/scriptGenerators";

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

describe("Verifying the helper functions for step mapping", function () {
	const verifyTests = [
		["verifyElementPresent", "assertElementPresent"],
		["verifyElementNotPresent", "assertElementNotPresent"],
		["verifyChecked", "assertChecked"],
		["verifyEditable", "assertEditable"],
		["verifyNotSelectedValue", "assertNotSelectedValue"],
	];

	test.each(verifyTests)(
		"Verifying the mapping for the verify- related steps to assert with input $input",
		function (input, output) {
			expect(transitions(input)).toBe(output);
		}
	);

	const verifyNames = [
		["verifyingTheName", "verifyingTheName"],
		["", "_"],
		["#@$#$", "_____"],
		["_$_", "___"],
		["first word", "first_word"],
		["0thTest", "_0thTest"],
		["0.69", "_0_69"],
	];

	test.each(verifyNames)(
		"Verifying the conversion of input to suitable name for js's variables / functions; $input",
		function (input, output) {
			expect(to_good_name(input)).toBe(output);
		}
	);
});

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
			output: "await Some_Script();",
		},
		{
			input: {
				isLocator: true,
				target: ".button",
				value: "",
				command_name: "click",
			},
			output: `await pageClass.locator_name.click();`,
		},
		{
			input: {
				isLocator: true,
				target: "input",
				command_name: "type",
				value: "dummy_text",
			},
			output: `await pageClass.locator_name.setValue("dummy_text");`,
		},
		{
			input: {
				isLocator: true,
				target: "css=.added-manually",
				command_name: "assertElementPresent",
				value: "true",
			},
			output: "await expect(pageClass.locator_name).toBePresent();",
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
			output: "await expect(pageClass.locator_name).toBeEnabled();",
		},
		{
			input: {
				isLocator: true,
				target: "input#selected",
				command_name: "assertNotEditable",
				value: "",
			},
			output: "await expect(pageClass.locator_name).not.toBeEnabled();",
		},
		{
			input: {
				isLocator: true,
				target: "input#checkbox",
				command_name: "assertChecked",
				value: "",
			},
			output: "await expect(pageClass.locator_name).toBeChecked();",
		},
		{
			input: {
				isLocator: true,
				target: "input#checkbox",
				command_name: "assertNotChecked",
				value: "",
			},
			output: "await expect(pageClass.locator_name).not.toBeChecked();",
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
		{
			input: {
				isLocator: false,
				command_name: "runScript",
				target: "window.scrollTo(0,900)",
				value: "",
			},
			output: `await browser.execute("window.scrollTo(0,900)");`,
		},
		{
			input: {
				isLocator: true,
				command_name: "verifyElementPresent",
				target: "input#search",
				value: "",
			},
			output: "await expect(pageClass.locator_name).toBePresent();",
		},
		{
			input: {
				isLocator: true,
				command_name: "verifyElementNotPresent",
				target: "input#search",
				value: "",
			},
			output: "await expect(pageClass.locator_name).not.toBePresent();",
		},
	];

	test.each<ExpectedStepResult>(tests)(
		"Verifying the result if the step is of $input",
		function ({ input, output }) {
			expect(mapSteps(input, locator_name)).toEqual(output);
		}
	);
});

describe("Verifying the inside quotes scripts", function () {
	type testsType = [string | number, string | number];

	const tests: Array<testsType> = [
		["checking", `\"checking\"`],
		[69, 69],
		[6.6, 6.6],
		["First Line\nSecond Line", `\"First Line\nSecond Line\"`],
		["", '""'],
		["This one is 'Single Quotes'", "\"This one is 'Single Quotes'\""],
		[
			"Then we have template quotes: `${some_var}`",
			'"Then we have template quotes: `${some_var}`"',
		],
		['It has some "quotes"', '"It has some "quotes""'],
	];

	test.each<testsType>(tests)(
		"Verifying the result inside the quotes scripts with input: %p",
		function (input, output) {
			expect(insideQuotes(input)).toBe(output);
		}
	);
});

describe("Verifying the locator class generated at the end", function () {
	const create_form = generateClassMethod("createForm", "#create-form");
	const input = generateClassMethod("input", "input");
	const submit_button = generateClassMethod("submitForm", "#submit-form");
	const locator_class = generateClass([create_form, input, submit_button]);

	const expected = [
		`\n\tget createForm() {\n\t\treturn this.$("#create-form");\n\t}`,
		`\n\tget input() {\n\t\treturn this.$("input");\n\t}`,
		`\n\tget submitForm() {\n\t\treturn this.$("#submit-form");\n\t}`,
	];

	test("Verifying the class method generated", function () {
		expect(create_form).toBe(expected[0]);
		expect(input).toBe(expected[1]);
		expect(submit_button).toBe(expected[2]);
	});

	test("Verifying the class generated without the any variables requested to store", function () {
		expect(locator_class).toBe(
			`\nclass Locators {${dollar_method}${expected.join("")}\n};\n`
		);
	});
});

// describe("Verifying the script generated for the block of commands", function () {});

// SCRIPT GENERATED at the end is of the types:

// 1. META DATA
// 2. Locators Class
// 3. Block of commands
