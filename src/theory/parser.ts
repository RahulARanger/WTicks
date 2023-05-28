import {
	TestSuite,
	Test,
	ParsedTestCase,
	ParsedTestStep,
	Command,
	SideScript,
	LocationResult,
	dispatcher,
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
	dispatcher?: dispatcher;

	abstract frameWorkType: string;

	feed(rawString: string) {
		this.parsed = JSON.parse(rawString);
	}

	feedDispatcher(dispatcher: dispatcher) {
		this.dispatcher = dispatcher;
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
				const text = mapSteps(step, this.locators[step.target]);
				return {
					...step,
					parsed: text,
				};
			});
		});
	}

	needForPatch() {
		return !Object.keys(this.locators).every((key) => {
			if (this.locators[key]) return true;
			return false;
		});
	}

	patchName(locator: string, name: string): boolean {
		// once if the names are patched then we would need patch the commands and hence the suite
		if (!this.test_var_name.test(name) && this.func_names.has(name))
			return false;

		if (this.locators[locator])
			this.func_names.delete(this.locators[locator]);

		this.locators[locator] = name;
		this.func_names.add(name);

		return true;
	}

	handleLocator(locator: string, var_name: string): LocationResult {
		const location = parseLocators(locator);

		// means it already has a name which is not ""
		if (this.locators[location.target]?.length > 0) return location;
		if (!location.isLocator) return location;

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
			...this.handleLocator(testStep.target, testStep.comment || ""),
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

		return commands.length > 0;
	}

	parseSuite(suite_id: string): void | string {
		// assuming test cases were already parsed
		if (!this.parsed?.suites) return;

		const suite = this.parsed?.suites.find(
			(suite) => suite_id === suite.id
		);

		if (!suite) return;
		this.patchCommands(...suite.tests);
		return suite.name;
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
		return (
			this.hasSuites() &&
			Boolean(this.parsed?.name) &&
			this.parsed?.version === "2.0"
		);
	}
}

export abstract class Listener extends GeneralizeVariable {
	parseTestCase(testCase: Test): boolean {
		const result = super.parseTestCase(testCase);
		if (!result)
			this.dispatcher &&
				this.dispatcher({
					type: "parsedTestCase",
					result: testCase.name,
				});
		return result;
	}

	parseTestCases(): boolean {
		const result = super.parseTestCases();
		this.dispatcher &&
			this.dispatcher({
				type: "parsedTestCases",
				result: result,
			});

		return result;
	}

	parseSuite(suite_id: string): string | void {
		const result = super.parseSuite(suite_id);

		if (result)
			this.dispatcher &&
				this.dispatcher({
					type: "parsedSuite",
					result,
				});
		return result;
	}
}

export class ToStandaloneScript extends Listener {
	frameWorkType: string = "Standalone";

	genScript(): string {
		const browser_options = `
// if you are using browser runner to execute the scripts then you can ignore the below configuration for the browser
const browser = await remote({
	capabilities: {
		browserName: 'chrome',
		'goog:chromeOptions': {
			args: process.env.CI ? ['headless', 'disable-gpu'] : []
		}
	}
});
`;
		return [
			`import { remote } from 'webdriverio';`,
			`import {$} from "@wdio/globals";`,
			browser_options,
			this.generateLocatorClass(),
		].join("");
	}
}
