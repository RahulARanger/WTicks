import { LocationResult, ParsedTestStep } from "./sharedTypes";

export function mapSteps(
	step: ParsedTestStep,
	locator_name: string
): boolean | string {
	// unsupported but expected
	switch (step.command_name) {
		case "run": {
			console.info("run is not referred in favour of BDD Approach");
			return true;
		}
	}

	// supported

	const template =
		"\t" + step.isLocator
			? step.command_name.startsWith("assert")
				? `await expect(locators.${locator_name})`
				: `await locators.${locator_name}.`
			: "await";

	switch (step.command_name) {
		case "click": {
			return template + "click();";
		}
		case "type": {
			return template + `setValue("${step.value}");`;
		}

		case "open": {
			return `browser.url("${step.value}");`;
		}

		case "setWindowSize": {
			const [width, height] = step.target.split("x");
			return `browser.size(${width}, ${height})`;
		}

		// assertions

		case "assertText": {
			return template + `.toHaveText("${step.value}")`;
		}
		case "assertTitle": {
			return `await expect(browser).toHaveTitle(${step.value});`;
		}

		case "assertElementPresent": {
			return `await expect(locators.${locator_name}).toBeDisplayed();`;
		}

		// browser actions
		case "pause": {
			return `browser.pause(${step.value});`;
		}

		case "executeScript": {
			return `browser.execute(${step.value});`;
		}

		case "waitForVisible": {
			return template + `waitForDisplayed(${step.value})`;
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
				"Target is not a valid possibly the command doesn't require one, hence ignoring it"
			);
	}

	return {
		isLocator: locator !== location,
		target: location,
	};
}
