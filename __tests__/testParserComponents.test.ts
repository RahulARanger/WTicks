import { describe, expect, test } from "@jest/globals";
import {
	parseLocators,
	mapSteps,
	insideQuotes,
	transitions,
	identifyKeys,
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
		["2ndPage", "_2ndPage"],
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
	type testsType = Array<ExpectedStepResult>;

	const assertTests: testsType = [
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
				target: "css=.added-manually",
				command_name: "assertElementPresent",
				value: "true",
			},
			output: "await expect(pageClass.locator_name).toBePresent();",
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
		{
			input: {
				isLocator: true,
				command_name: "verifyNotChecked",
				target: "input#checkbox",
				value: "",
			},
			output: "await expect(pageClass.locator_name).not.toBeChecked();",
		},
		{
			input: {
				isLocator: true,
				command_name: "verifyNotText",
				target: "div#error",
				value: "Failed",
			},
			output: 'await expect(pageClass.locator_name).not.toHaveText("Failed");',
		},
	];

	const browserActionTests: testsType = [
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
				command_name: "sendKeys",
				target: "id=APjFqb",
				value: "${KEY_ENTER}",
			},
			output: "await browser.keys([Key.Enter]);",
		},
		{
			input: {
				isLocator: false,
				command_name: "sendKeys",
				target: "id=APjFqb",
				value: "${KEY_ENTER}",
			},
			output: "await browser.keys([Key.Enter]);", // make sure to add a command to ensure the target has the focus
		},
		{
			input: {
				isLocator: true,
				command_name: "sendKeys",
				target: "id=APjFqb",
				value: "searched${KEY_ENTER}",
			},
			output: 'await browser.keys(["s","e","a","r","c","h","e","d",Key.Enter]);',
		},
		{
			input: {
				isLocator: false,
				command_name: "pause",
				target: "3000",
				value: "",
			},
			output: "await browser.pause(3000);",
		},
	];

	const userActionTests: testsType = [
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
				target: ".checkbox",
				value: "",
				command_name: "check",
			},
			output: `if(!pageClass.locator_name.isSelected()) await pageClass.locator_name.click();`,
		},
		{
			input: {
				isLocator: true,
				target: ".checkbox",
				value: "",
				command_name: "uncheck",
			},
			output: `if(pageClass.locator_name.isSelected()) await pageClass.locator_name.click();`,
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
				isLocator: false,
				target: "Hello There",
				command_name: "echo",
				value: "",
			},
			output: `console.log("Hello There");`,
		},
	];

	const waitForTests: testsType = [
		{
			input: {
				isLocator: true,
				target: "input",
				command_name: "waitForElementEditable",
				value: "1500",
			},
			output: `await pageClass.locator_name.waitForEnabled({ reverse: false, timeout: 1500 });`,
		},
		{
			input: {
				isLocator: true,
				target: "input",
				command_name: "waitForElementPresent",
				value: "1500",
			},
			output: `await pageClass.locator_name.waitForExist({ reverse: false, timeout: 1500 });`,
		},
		{
			input: {
				isLocator: true,
				target: "input",
				command_name: "waitForElementVisible",
				value: "3e3",
			},
			output: `await pageClass.locator_name.waitForDisplayed({ reverse: false, timeout: 3e3 });`,
		},
		{
			input: {
				isLocator: true,
				target: "input",
				command_name: "waitForElementNotEditable",
				value: "1500",
			},
			output: `await pageClass.locator_name.waitForEnabled({ reverse: true, timeout: 1500 });`,
		},
	];

	const miscTests: testsType = [
		{
			input: {
				isLocator: false,
				target: "Some Script",
				value: "",
				command_name: "run",
			},
			output: "await Some_Script();",
		},
	];

	function mapTests({
		input,
		output,
	}: {
		input: ParsedTestStep;
		output: boolean | string;
	}) {
		expect(mapSteps(input, locator_name)).toEqual(output);
	}

	test.each<ExpectedStepResult>(assertTests)(
		"Verifying the Mappings for the Assertions: $input",
		mapTests
	);
	test.each<ExpectedStepResult>(browserActionTests)(
		"Verifying the Mappings for the browser actions: $input",
		mapTests
	);
	test.each<ExpectedStepResult>(userActionTests)(
		"Verifying the Mappings for the user actions: $input",
		mapTests
	);
	test.each<ExpectedStepResult>(waitForTests)(
		"Verifying the Mappings for the wait for elements: $input",
		mapTests
	);
	test.each<ExpectedStepResult>(miscTests)(
		"Verifying the Mappings for the misc steps: $input",
		mapTests
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

describe("Verifying the support for the sendKeyCommands", function () {
	const tests = [
		{
			input: "Sample ${KEY_ENTER}",
			output: '["S","a","m","p","l","e"," ",Key.Enter]',
		},
		{
			input: "",
			output: "[]",
		},
		{
			input: "plain",
			output: '["p","l","a","i","n"]',
		},
		{
			input: "${KEY_ENTER}",
			output: "[Key.Enter]",
		},
		{
			input: "KEY_ENTER",
			output: '["K","E","Y","_","E","N","T","E","R"]',
		},
		{
			input: "${KEY_CTRL}v${KEY_ENTER}",
			output: '[Key.Ctrl,"v",Key.Enter]',
		},
	];

	test.each(tests)(
		'Assertion with the Input: "$input"',
		function ({ input, output }) {
			expect(identifyKeys(input)).toEqual(output);
		}
	);
});
