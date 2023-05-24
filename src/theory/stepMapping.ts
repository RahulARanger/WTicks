import { ParsedTestStep } from "./sharedTypes";

export function mapSteps(step: ParsedTestStep): boolean | string {
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
				? `await expect(locators.${step.target})`
				: `await locators.${step.target}`
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

		default: {
			throw new Error(
				"This step is not expected, please let the owner know that there is a new command if the command is a valid ones"
			);
		}
	}
}
