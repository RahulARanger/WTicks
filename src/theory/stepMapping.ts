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

function handleAssertions(step: ParsedTestStep, locator_name: string) {
	const isOpposite = step.command_name.includes("Not");
	const template = `await expect(pageClass.${locator_name}).${oppPrefix(
		isOpposite
	)}`;
	switch (step.command_name.replace("Not", "").replace("verify", "assert")) {
		case "assertText": {
			return template + `toHaveText(${insideQuotes(step.value)});`;
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
		default: {
			return false;
		}
	}
}

function handleUserActions(step: ParsedTestStep, locator_name: string) {
	const template = `await pageClass.${locator_name}.`;

	switch (step.command_name) {
		case "click": {
			return template + "click();";
		}
		case "check": {
			return (
				`if(!pageClass.${locator_name}.isSelected()) ` +
				template +
				"click();"
			);
		}
		case "uncheck": {
			return (
				`if(pageClass.${locator_name}.isSelected()) ` +
				template +
				"click();"
			);
		}
		case "type": {
			return template + `setValue(${insideQuotes(step.value)});`;
		}

		case "echo": {
			return `console.log("${step.target}");`;
		}
		default: {
			return false;
		}
	}
}

function handleBrowserBasedActions(step: ParsedTestStep, locator_name: string) {
	const template = "await browser.";

	switch (step.command_name) {
		case "open": {
			return template + `url(${insideQuotes(step.target)});`;
		}
		case "setWindowSize": {
			const [width, height] = step.target.split("x");
			return template + `setWindowSize(${width}, ${height});`;
		}
		case "pause": {
			return template + `pause(${step.target});`;
		}
		case "sendKeys": {
			return template + `keys(${identifyKeys(step.value)});`;
		}
		case "runScript": {
			return template + `execute(${insideQuotes(step.target)});`;
		}
		case "debugger": {
			console.warn(
				"Not Recommended to use debugger mode for script generation"
			);
			return template + "debug();";
		}
		default: {
			return false;
		}
	}
}

function handleWaitForRequired(step: ParsedTestStep, locator_name: string) {
	const isOpposite = step.command_name.includes("Not");

	const template = `await pageClass.${locator_name}.`;
	const values = `({ reverse: ${isOpposite}, timeout: ${step.value} });`;
	switch (step.command_name.replace("Not", "")) {
		case "waitForElementEditable": {
			return template + "waitForEnabled" + values;
		}
		case "waitForElementPresent": {
			return template + "waitForExist" + values;
		}
		case "waitForElementVisible": {
			return template + "waitForDisplayed" + values;
		}
		default: {
			return false;
		}
	}
}

export function handleMisc(step: ParsedTestStep, locator_name: string) {
	const template = "await ";

	switch (step.command_name) {
		case "run": {
			return template + `${to_good_name(step.target)}();`;
		}
		default: {
			return false;
		}
	}
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

	const command_name = step.command_name;

	if (command_name.startsWith("assert") || command_name.startsWith("verify"))
		return handleAssertions(step, locator_name);
	else if (command_name.startsWith("waitFor"))
		return handleWaitForRequired(step, locator_name);
	else
		return (
			handleUserActions(step, locator_name) ||
			handleBrowserBasedActions(step, locator_name) ||
			handleMisc(step, locator_name)
		);
}

export function parseLocators(locator: string): LocationResult {
	const strategy = locator.substring(0, locator.indexOf("="));
	const value = locator.substring(locator.indexOf("=") + 1);

	let location = locator;
	switch (strategy) {
		case "id":
			location = `#${value}`.replaceAll(":", "\\\\:"); // https://stackoverflow.com/a/3544927/12318454;
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
		isLocator: location !== locator,
		target: location,
	};
}

export function identifyKeys(target: string): string {
	const actual_split = /(?:\$\{KEY_(\w+)\})/g;
	const test_split = /(\$\{KEY_\w+\})/g;

	const ref = target.split(actual_split).filter((value) => value);
	return (
		"[" +
		target
			.split(test_split)
			.filter((value) => value)
			.map((value, index) => {
				if (value == ref[index])
					return JSON.stringify(value.split("")).slice(1, -1);
				const command = ref[index].toLowerCase();
				return "Key." + command[0].toUpperCase() + command.slice(1);
			})
			.join(",") +
		"]"
	);
}

/**
 * [ '', 'ENTER', '' ]
* [ '', '${KEY_ENTER}', '' ]
comparing both the array gives guarantee that which one is command and which is text we remove "" to avoid extra commas
 */
