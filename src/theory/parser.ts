interface Suites {}

interface Command {
	id: string;
	comment: string;
	command: string;
	target: string;
	targets: Array<string>;
	value: string;
}

interface Test {
	id: string;
	name: string;
	commands: Array<Command>;
}

interface SideScript {
	id: string;
	version: "2.0";
	name: string;
	url: string;
	tests: Array<Test>;
}

interface ParsedTestCase {
	step_name: string;
}

export default class GeneralizeVariable {
	parsed?: SideScript;
	parsedTestCases: Array<ParsedTestCase> = [];

	feed(rawString: string) {
		this.parsed = JSON.parse(rawString);
	}

	understandTestCases() {
		// these are our Gherkin Test Steps
		const tests = this.parsed?.tests || [];
		this.parsedTestCases = tests.map(function (test: Test) {
			const g_type = ``;
			return {
				step_name: test.name,
			};
		});
	}
}
