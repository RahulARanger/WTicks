export function generateClassMethod(
	method_name: string,
	locator_path: string
): string {
	return [
		"\n\tget ",
		method_name,
		"() {\n",
		"\t\treturn ",
		`this.$("${locator_path}");`,
		"\n\t}",
	].join("");
}

export const dollar_method =
	"\n\t$(location) {\n\t\treturn browser.$(location);\n\t}";

export function generateClass(methods: Array<string>): string {
	if (!methods.length) return "";
	return ["\nclass Locators {", dollar_method, ...methods, "\n};\n"].join("");
}

export const imports_required = [
	'import { remote, Key } from "webdriverio";',
	'import { expect } from "expect-webdriverio";',
].join("\n");

export const browser_options = `
// if you are using browser runner to execute the scripts then you can ignore the below configuration for the browser
const browser = await remote({
	capabilities: {
		browserName: 'chrome',
		'goog:chromeOptions': {
			args: process.env.CI ? ['headless', 'disable-gpu'] : []
		}
	}
});`;

export function to_good_name(name: string): string {
	let trimmed_name = name.trim().replace(/[^a-zA-Z0-9]/g, "_");

	// If the string starts with a digit or is an empty string, add a prefix
	if (/^[0-9]/.test(trimmed_name) || trimmed_name === "")
		trimmed_name = `_${trimmed_name}`;

	return trimmed_name;
}

export function generate_async_func(name: string, commands: string): string {
	return `async function ${name}() {\n${commands}\n}`;
}

// Generating Immediately Invoked Function Expression (IIFE)
export function generating_caller_iife(func_names_to_call: string[]): string {
	return `; (async () => {\n${func_names_to_call
		.map((_name) => `\tawait ${_name}();`)
		.join("\n")}\n})();`;
}
