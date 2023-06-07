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
import {
	browser_options,
	generateClass,
	generateClassMethod,
	generate_async_func,
	generating_caller_iife,
	imports_required,
	to_good_name,
} from "./scriptGenerators";
import { mapSteps, parseLocators } from "./stepMapping";

export const test_var_name = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
abstract class GeneralizeVariable {
	testMap: { [key: string]: ParsedTestCase } = {};
	parsed?: SideScript;
	parsedTestCases: { [key: string]: ParsedTestCase } = {};
	locators: { [key: string]: string } = {};
	func_names = new Set<string>();
	store_things: { [key: string]: string | number } = {};
	dispatcher?: dispatcher;

	abstract frameWorkType: string;

	feed(rawString: string) {
		this.parsed = JSON.parse(rawString);
	}

	feedDispatcher(dispatcher: dispatcher) {
		this.dispatcher = dispatcher;
	}

	generate_name(name: string | false): string {
		if (name === false) return "";

		// if the name given by the user is not valid then we replace the spaces or small things with _
		const purified = to_good_name(name);
		if (this.func_names.has(purified)) return this.generate_name(false);
		return purified;
	}
	patchCommands(...test_ids: Array<string>): Set<string> {
		const ids = new Set(test_ids);
		this.dispatcher && this.dispatcher(); // resetting the logs

		ids.forEach((test_id) => {
			const test_case = this.parsedTestCases[test_id];
			if (!test_case) return; // doesn't happen but for safe side

			test_case.commands = test_case.commands
				.map((step) => {
					let text = mapSteps(step, this.locators[step.target]);

					// this is required for supporting the run command
					if (step.command_name == "run") {
						// we find the test_case_id by the test name
						const test_name = step.target;
						const test_case = this.findTestCaseByName(test_name);
						if (!test_case) {
							console.error("Test case not found: " + test_name);
							text = false; // if not found
						} else ids.add(test_case); // else we ask the parser to patch its commands too
					}

					return {
						...step,
						parsed: text,
						logged: new Date().toLocaleTimeString(),
					};
				})
				.filter((command) => {
					if (command.parsed) return command.parsed;
					this.dispatcher && this.dispatcher(command); //sending the info that this command was not patched
				});
			// at last we filter the commands whose result is a falsy value as it might not be supported or valid step name
		});
		return ids;
	}

	needForPatch() {
		return !Object.keys(this.locators).every((key) => {
			if (this.locators[key]) return true;
			return false;
		});
	}

	patchName(locator: string, name: string): boolean {
		// once if the names are patched then we would need patch the commands and hence the suite
		if (!test_var_name.test(name) && this.func_names.has(name))
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
		// isUsed is valuable info for validation and it cannot be used everytime
		// hence converting all the rest of the duplicates to null string

		this.locators[location.target] = isUsed ? "" : func_name;
		this.func_names.add(var_name);

		return location;
	}

	findTestCaseByName(name: string): string | undefined {
		return (this.parsed?.tests || []).find((test_case) => {
			return test_case.name === name;
		})?.id;
	}

	parseTestStep(testStep: Command): false | ParsedTestStep {
		return {
			value: testStep.value,
			command_name: testStep.command,
			...this.handleLocator(testStep.target, testStep.comment || ""),
		};
	}

	parseTestCase(
		testCase: Test,
		locatorsEncountered: Set<string>,
		testCasesEncountered: Set<string>
	) {
		const commands = [];
		const parsedTestCases = new Set([
			testCase.id,
			...Array.from(testCasesEncountered || []),
		]);
		const run_test_ids = [];

		for (let command of testCase.commands) {
			const result = this.parseTestStep(command);
			if (!result) continue;

			commands.push(result);
			result.isLocator &&
				locatorsEncountered &&
				locatorsEncountered.add(result.target);

			if (result.command_name === "run") {
				const test_id = this.findTestCaseByName(result.target);
				if (!test_id || parsedTestCases.has(test_id)) {
					if (!test_id)
						console.error(
							`We have failed to find the locators of ${result.target} test case`
						);
					continue;
				}
				run_test_ids.push(test_id);
			}
		}
		if (run_test_ids.length)
			this._parseTestCases(
				locatorsEncountered,
				parsedTestCases,
				...run_test_ids
			);

		this.parsedTestCases[testCase.id] = {
			test_name: testCase.name,
			commands,
			id: testCase.id, // required for test case organization in suites
		};
	}

	fetchSuite(suite_id: string): void | TestSuite {
		// assuming test cases were already parsed
		if (!this.parsed?.suites) return;

		const suite = this.parsed?.suites.find(
			(suite) => suite_id === suite.id
		);
		return suite;
	}

	parseSuite(suite_id: string): string[] | void {
		const suite = this.fetchSuite(suite_id);
		if (!suite) return;
		this.patchCommands(...suite.tests);
		return suite.tests;
	}

	parseAllTestCases() {
		if (this.parsed?.tests.length)
			this.parseTestCases(...this.parsed?.tests.map((test) => test.id));
	}

	_parseTestCases(
		locatorsEncountered: Set<string>,
		testCasesEncountered: Set<string>,
		..._test_ids: string[]
	) {
		const test_ids = new Set(
			_test_ids.filter((_id) => !testCasesEncountered.has(_id))
		); // has test ids that needs to be parsed as it was not encountered before

		this.parsed?.tests
			.filter((test) => test_ids.has(test.id))
			.forEach((test_case) =>
				this.parseTestCase(
					test_case,
					locatorsEncountered,
					testCasesEncountered
				)
			);
	}

	parseTestCases(..._test_ids: string[]): Set<string> {
		const result: Set<string> = new Set();
		this._parseTestCases(result, new Set(), ..._test_ids);
		return result;
	}

	parseSuiteCases(suite_id: string): Set<string> {
		const suite = this.fetchSuite(suite_id);
		if (!suite) return new Set(); // this won't happen from UI as we select from the options
		return this.parseTestCases(...suite.tests);
	}

	isValidFile(): boolean {
		return (
			Boolean(this.parsed?.name) &&
			(this.parsed?.version === "2.0" || this.parsed?.version === "3.0")
		);
	}
}

export class ToStandaloneScript extends GeneralizeVariable {
	frameWorkType: string = "Standalone";

	genScript(
		locators: string[],
		flow: string[],
		...test_case_ids: string[]
	): string {
		if (flow && !test_case_ids.length) test_case_ids.push(...flow);

		const tests = test_case_ids.map((test_case_id) => {
			const test = this.parsedTestCases[test_case_id];
			const func_name = to_good_name(test.test_name);
			return generate_async_func(
				func_name,
				test.commands.map((command) => `\t${command.parsed}`).join("\n")
			);
		});

		return [
			imports_required,
			browser_options,
			generateClass(
				locators.map((key) =>
					generateClassMethod(this.locators[key], key)
				)
			),
			"const pageClass = new Locators();",
			...tests,
			generating_caller_iife([
				...flow.map((_id) =>
					to_good_name(this.parsedTestCases[_id].test_name)
				),
				"browser.deleteSession",
			]),
		].join("\n\n");
	}
}
