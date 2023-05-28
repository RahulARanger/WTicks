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

export function mapSteps(
	step: ParsedTestStep,
	locator_name: string
): boolean | string {
	// unsupported but expected
	switch (step.command_name) {
		case "run": {
			console.info(
				"run is ignored as we combine all the test scripts based on the parts of the scenario"
			);
			return true;
		}

		case "if":
		case "while": {
			console.info(
				"found script related commands, hence skipping the step to parse"
			);
			return true;
		}
	}

	// supported

	const isOpposite = step.command_name.startsWith("assertNot");

	const template = !step.isLocator
		? "await "
		: step.command_name.startsWith("assert")
		? `await expect(pageClass.${locator_name}).${oppPrefix(isOpposite)}`
		: `await pageClass.${locator_name}.`;

	switch (
		isOpposite ? step.command_name.replace("Not", "") : step.command_name
	) {
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
			return template + `.toHaveText(${insideQuotes(step.value)})`;
		}
		case "assertTitle": {
			return (
				browserAssertion(isOpposite) +
				`toHaveTitle(${insideQuotes(step.value)});`
			);
		}

		case "assertElementPresent": {
			return template + `toBeDisplayed();`;
		}

		case "assertEditable": {
			return template + `toBeEnabled();`;
		}

		case "assertChecked": {
			return template + `toBeChecked();`;
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
			throw new Error(
				"This step is not expected, please let the owner know that there is a new command if the command is a valid ones"
			);
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
