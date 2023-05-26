import {
	TestSuite,
	Test,
	ParsedSuite,
	ParsedTestCase,
	ParsedTestStep,
	Command,
	SideScript,
	LocationResult,
} from "./sharedTypes";
import { generateClass, generateClassMethod } from "./scriptGenerators";
import { mapSteps, parseLocators } from "./stepMapping";

abstract class GeneralizeVariable {
	testMap: { [key: string]: ParsedTestCase } = {};
	parsed?: SideScript;
	parsedTestCases: { [key: string]: ParsedTestCase } = {};
	locators: { [key: string]: string } = {};
	func_names = new Set<string>();
	store_things: { [key: string]: string | number } = {};
	test_var_name = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
	parsedSuites: Array<ParsedSuite> = [];

	abstract frameWorkType: string;

	feed(rawString: string) {
		this.parsed = JSON.parse(rawString);
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

		// if the name given by the user is not valid then we replace the spaces or small things with _
		const purified = name.replaceAll("^[^a-zA-Z_$]|[^0-9a-zA-Z_$]", "_");
		if (this.func_names.has(purified)) return this.generate_name(false);
		return purified;
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

	patchCommands(...test_ids: Array<string>) {
		test_ids.forEach((test_id) => {
			const test_case = this.parsedTestCases[test_id];
			if (!test_case) return;
			test_case.commands = test_case.commands.map((step) => {
				if (step.parsed) return step;
				const text = mapSteps(step, this.locators[step.target]);
				return {
					...step,
					parsed: text,
				};
			});
		});
	}

	patchNames() {
		Object.keys(this.locators).forEach((key) => {
			if (this.locators[key]) return;
			this.locators[key] = this.generate_random_name(6);
		});
	}

	handleLocator(locator: string, var_name: string): LocationResult {
		const location = parseLocators(locator);

		if (this.locators[location.target]?.length > 0) return location;

		let func_name = var_name;
		const isUsed = this.func_names.has(func_name);
		const isNotValid = !this.test_var_name.test(func_name);

		this.locators[location.target] =
			isNotValid || isUsed
				? this.generate_name(isUsed ? false : func_name)
				: func_name;
		this.func_names.add(var_name);

		return location;
	}

	parseTestStep(testStep: Command): false | ParsedTestStep {
		return {
			value: testStep.value,
			command_name: testStep.command,
			...this.handleLocator(
				testStep.target,
				this.locators[testStep.target] || ""
			),
		};
	}

	parseTestCase(testCase: Test): boolean {
		const commands = [];
		for (let command of testCase.commands) {
			const result = this.parseTestStep(command);
			if (result) commands.push(result);
		}

		this.parsedTestCases[testCase.id] = {
			step_name: testCase.name,
			commands,
			id: testCase.id, // required for test case organization in suites
		};

		return true;
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

	parseTestCases() {
		const tests = this.parsed?.tests || [];
		return tests.every(this.parseTestCase.bind(this));
	}

	hasTests(suite: TestSuite): boolean {
		return suite.tests.length > 0;
	}

	hasSuites(): boolean {
		return this.parsed?.suites.some(this.hasTests.bind(this)) || false;
	}

	isValidFile(): boolean {
		return this.hasSuites() && Boolean(this.parsed?.name);
	}
}

export class ToStandaloneScript extends GeneralizeVariable {
	frameWorkType: string = "Standalone";
}

export default class ToGherkin extends GeneralizeVariable {
	frameWorkType: string = "Gherkin";
	check = /^(Given|When|Then|And|But) .+$/;

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
