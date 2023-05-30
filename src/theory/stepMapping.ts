import { to_good_name } from "./scriptGenerators";
import { LocationResult, ParsedTestStep } from "./sharedTypes";

function oppPrefix(isOpposite: boolean): string {
	return isOpposite ? "not." : "";
}

function browserAssertion(isOpposite: boolean) {
	return `await expect(browser).${oppPrefix(isOpposite)}`;
}

export function insideQuotes(value: any): any {
	// if string then inside the quotes else it is not
	return typeof value === "string" ? `\"${value}\"` : value;
}

export function transitions(command_name: string) {
	const to_assert = command_name.startsWith("verify");
	let f_command_name = to_assert
		? command_name.replace("verify", "assert")
		: command_name;

	return f_command_name;
}

export function mapSteps(
	step: ParsedTestStep,
	locator_name: string
): boolean | string {
	// unsupported but expected
	switch (step.command_name) {
		case "if":
		case "while": {
			console.info(
				"found script related commands, hence skipping the step to parse"
			);
			return true;
		}
	}

	// supported

	let command_name = transitions(step.command_name);
	const isOpposite = command_name.startsWith("assertNot");

	command_name = isOpposite ? command_name.replace("Not", "") : command_name;

	const template = !step.isLocator
		? "await "
		: command_name.startsWith("assert")
		? `await expect(pageClass.${locator_name}).${oppPrefix(isOpposite)}`
		: `await pageClass.${locator_name}.`;

	switch (command_name) {
		case "run": {
			return `await ${to_good_name(step.target)}();`;
		}
		case "check":
		case "click": {
			return template + "click();";
		}
		case "type": {
			return template + `setValue(${insideQuotes(step.value)});`;
		}

		case "open": {
			return template + `browser.url(${insideQuotes(step.target)});`;
		}

		case "setWindowSize": {
			const [width, height] = step.target.split("x");
			return template + `browser.setWindowSize(${width}, ${height});`;
		}

		// assertions

		case "assertText": {
			return template + `toHaveText(${insideQuotes(step.value)})`;
		}
		case "assertTitle": {
			return (
				browserAssertion(isOpposite) +
				`toHaveTitle(${insideQuotes(step.value)});`
			);
		}

		case "assertElementPresent": {
			return template + "toBePresent();";
		}
		case "assertElementNotPresent": {
			return template + "not.toBePresent();";
		}

		case "assertEditable": {
			return template + "toBeEnabled();";
		}

		case "assertChecked": {
			return template + "toBeChecked();";
		}

		case "assertText": {
			return template + `toHaveText(${insideQuotes(step.value)});`;
		}

		case "assertValue": {
			return template + `toHaveValue(${insideQuotes(step.value)});`;
		}

		// browser actions
		case "pause": {
			return template + `browser.pause(${insideQuotes(step.value)});`;
		}

		case "runScript": {
			return template + `browser.execute(${insideQuotes(step.target)});`;
		}

		case "waitForVisible": {
			return template + `waitForDisplayed(${insideQuotes(step.value)})`;
		}

		case "debugger": {
			console.warn(
				"Not Recommended to use debugger mode for script generation"
			);
			return template + "debug();";
		}

		case "echo": {
			return `console.log("${step.target}");`;
		}

		default: {
			console.error(
				`${step.command_name} is not a valid locator, let me know if it is one, it might be missed from my side.`
			);
			return false;
		}
	}
}

export function parseLocators(locator: string): LocationResult {
	const strategy = locator.substring(0, locator.indexOf("="));
	const value = locator.substring(locator.indexOf("=") + 1);

	let location = locator;
	switch (strategy) {
		case "id":
			location = `#${value}`;
			break;
		case "name":
			location = `[name='${value}']`;
			break;
		case "class":
			location = `.${value}`;
			break;

		case "link":
			location = `a=${value}`;
			break;
		case "linkText":
			location = `=${value}`;
			break;
		case "partialLinkText":
			location = `*=${value}`;
			break;

		case "tag":
		case "tagName":
		case "css":
		case "xpath":
			location = value;
			break;

		default:
			console.info(
				`${location} - not saved as locator, as it is not one.`
			);
	}

	return {
		isLocator: locator !== location,
		target: location,
	};
}
