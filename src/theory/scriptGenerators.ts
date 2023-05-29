export function generateClassMethod(
	method_name: string,
	locator_path: string
): string {
	return [
		"\n\tget ",
		method_name,
		"() {\n",
		"\t\treturn ",
		`$("${locator_path}");`,
		"\n\t}",
	].join("");
}

export const dollar_method =
	"\n\tfunction $(location) {\n\t\treturn browser.$(location);\n\t}";

export function generateClass(methods: Array<string>): string {
	if (!methods.length) return "";
	return ["\nclass Locators {", dollar_method, ...methods, "\n};\n"].join("");
}

export const start_of_script = `import { remote, Key } from "webdriverio";
import { expect } from "expect-webdriverio";

const browser = await remote({
    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: process.env.CI ? ['headless', 'disable-gpu'] : []
        }
    }
})
// commands specific to the test suite starts now
`;

export function to_good_name(name: string): string {
	return name.replaceAll("^[^a-zA-Z_$]|[^0-9a-zA-Z_$]", "_");
}

export function generate_async_func(name: string, commands: string): string {
	return `async function ${name}() {\n${commands}\n}`;
}

// Generating Immediately Invoked Function Expression (IIFE)
export function generating_caller_iife(func_names_to_call: string[]): string {
	return `; (async () => {\n${func_names_to_call
		.map((_name) => `\t${_name}();`)
		.join("\n")}\n})();`;
}
