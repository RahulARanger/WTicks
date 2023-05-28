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

export function generateRunnerScript() {
	return;
}
