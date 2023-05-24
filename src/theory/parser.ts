import {
	TestSuite,
	Test,
	ParsedSuite,
	ParsedTestCase,
	ParsedTestStep,
	Command,
	SideScript,
} from "./sharedTypes";
import { generateClass, generateClassMethod } from "./scriptGenerators";

abstract class GeneralizeVariable {
	parsed?: SideScript;
	parsedTestCases: { [key: string]: ParsedTestCase } = {};
	locators: { [key: string]: string } = {};
	func_names = new Set<string>();
	store_things: { [key: string]: string | number } = {};
	test_var_name = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
	parsedSuites: Array<ParsedSuite> = [];

	abstract frameWorkType: string;
	abstract parseTestCase(testCase: Test): boolean; // returns true if passed else false
	abstract parseTestStep(testStep: Command): false | ParsedTestStep; // WebdriverIO step
	abstract parseSuite(suite: TestSuite): boolean; // returns true if passed else false

	feed(rawString: string) {
		this.parsed = JSON.parse(rawString);
	}

	understandTestCases(): boolean {
		// these are our Gherkin Test Steps
		const tests = this.parsed?.tests || [];
		return tests.every(this.parseTestCase.bind(this));
	}

	understandSuites(): boolean {
		if (!this.parsed?.suites.length) return false;
		return this.parsed.suites.every(this.parseSuite.bind(this));
	}

	_handleLocator(locator: string): string {
		const strategy = locator.substring(0, locator.indexOf("="));
		const value = locator.substring(locator.indexOf("=") + 1);

		switch (strategy) {
			case "id":
				return `#${value}`;
			case "name":
				return `[name='${value}']`;

			case "class":
				return `.${value}`;
			case "linkText":
				return `=${value}`;
			case "partialLink":
				return `*=${value}`;

			case "tag":
			case "css":
			case "xpath":
				return value;

			default:
				throw new Error(`Unsupported locator strategy: ${strategy}`);
		}
	}

	generate_random_name(length: number): string {
		const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		return Array(length)
			.fill(true)
			.map((_) => chars[Math.floor(Math.random() * chars.length)])
			.join("");
	}

	generate_name(name: string | false): string {
		if (name === false) return "";

		const purified = name.replaceAll("^[^a-zA-Z_$]|[^0-9a-zA-Z_$]", "_");
		if (this.func_names.has(purified)) return this.generate_name(false);
		return purified;
	}

	handleLocator(locator: string, var_name: string): string {
		const location = this._handleLocator(locator);
		if (this.locators[location]?.length > 0) return location;

		let func_name = var_name;
		const isUsed = this.func_names.has(func_name);
		const isNotValid = !this.test_var_name.test(func_name);

		this.locators[location] =
			isNotValid || isUsed
				? this.generate_name(isUsed ? false : func_name)
				: func_name;
		this.func_names.add(var_name);

		return location;
	}

	generateLocatorClass(): string {
		return generateClass(
			Object.keys(this.locators).map((key) =>
				generateClassMethod(
					this.locators[key] || this.generate_random_name(6),
					key
				)
			)
		);
	}

	hasSuites(): boolean {
		return (
			this.parsed?.suites.some((suite) => {
				return suite.tests.length > 0;
			}) || false
		);
	}
}

export default class ToGherkin extends GeneralizeVariable {
	frameWorkType: string = "Gherkin";
	check = /^(Given|When|Then|And|But) .+$/;

	parseTestCase(testCase: Test): boolean {
		const name = testCase.name;
		if (!this.check.test(name)) return false;

		const commands = [];
		for (let command of testCase.commands) {
			const result = this.parseTestStep(command);
			if (result) commands.push(result);
		}

		this.parsedTestCases[testCase.id] = {
			step_name: name,
			commands,
			id: testCase.id, // required for test case organization in suites
		};

		return true;
	}

	parseTestStep(testStep: Command): false | ParsedTestStep {
		return {
			isLocator: true,
			target: this.handleLocator(testStep.target, testStep.comment),
			value: testStep.value,
			command_name: testStep.command,
		};
	}

	parseSuite(suite: TestSuite): boolean {
		// assuming test cases were already parsed
		const testSteps: Array<string> = [];

		suite.tests.forEach((testID) => {
			const testCase = this.parsedTestCases[testID]; // testID are not manually written so please do not manipulate this
			if (!testCase) return false;
			testSteps.push(testCase.step_name);
		});

		if (testSteps.length > 0)
			this.parsedSuites.push({
				name: suite.name,
				steps: testSteps,
			});

		return testSteps.length > 0;
	}

	isValidFile() {
		return this.hasSuites() && this.parsed?.name;
	}

	genScenario(scenario: ParsedSuite): string {
		return [
			"\t",
			"Scenario: ",
			scenario.name,
			...scenario.steps.map((step) => `\n\t\t${step}`),
			"\n",
		].join("");
	}

	generateGherkinFile(): string {
		return [
			"Feature: ",
			this.parsed?.name,
			"\n",
			this.parsedSuites.map(this.genScenario.bind(this)),
		].join("");
	}
}
export interface DispatchedGherkinMessage {
	action: "test-step" | "test-case" | "test-scenario";
	data: boolean | string;
}

// TODO: Write a react compatible class
