export interface TestSuite {
	id: string;
	name: string;
	persistSession: boolean;
	parallel: boolean;
	timeout: number;
	tests: Array<string>;
}

export interface Command {
	id: string;
	comment: string;
	command: string;
	target: string;
	targets: Array<string>;
	value: string;
}

export interface Test {
	id: string;
	name: string;
	commands: Array<Command>;
}

export interface SideScript {
	id: string;
	version: "2.0";
	name: string;
	url: string;
	tests: Array<Test>;
	suites: Array<TestSuite>;
}

export interface ParsedTestCase {
	test_name: string;
	commands: Array<ParsedTestStep>;
	id: string;
}

export interface LocationResult {
	target: string;
	isLocator: boolean;
}

export interface ParsedTestStep extends LocationResult {
	isLocator: boolean;
	target: string;
	value: string;
	command_name: string;
	logged?: string;
	parsed?: string | boolean;
}

// export interface ShareDetails {
// 	result?: ParsedTestStep;
// }

export type dispatcher = (details?: ParsedTestStep) => void;
