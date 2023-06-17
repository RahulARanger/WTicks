# WTicks

[![Regression Tests](https://github.com/RahulARanger/WTicks/actions/workflows/test-execution.yaml/badge.svg)](https://github.com/RahulARanger/WTicks/actions/workflows/test-execution.yaml)
[![Tested with webdriver.io](https://img.shields.io/badge/tested%20with-webdriver.io-%23ea5906)](https://webdriver.io/)

WTicks enables you to convert the selenium recorded scripts to simple standalone webdriverio scripts.

To Get Started, you can simply upload the [.side](https://www.selenium.dev/selenium-ide/docs/en/introduction/getting-started) file [here](https://wticks.vercel.app/converter).
Select the Test case / suite, and then WTicks will fetch all the locators used, name those locators and then you can have your generated script.

Please refer to the output structure and suggest if required.

## Output structure

-   Suite = Object with List of Test Cases
-   Test Case = Object with List of Commands

### Parsing the Test Cases

Here we detect all the locators used by the user. it will assume the a particular command's comment as the name of the locator used in it.

Let's say if the script has:

-   `{target: "#foo", command: "verifyText", comment: "fooButton", value: "foo"}`
-   `{target: "#foo", command: "click", comment: "since we verified the fooButton now we can click it"}`
-   `{target: "#foo", command: "verifyText", comment: "registeredButton", value: "registered"}`

It will assume the name of the locator: "#foo" as "fooButton" but not as "since we...." / "registeredButton". as it first appeared.

Test Cases are parsed in the order as arranged in recorder.

### Requesting for user input

-   First we request for the Test Case / Suite after the selection, we would fetch its associated locators and for which,
-   we would request you to fill the name for the locators before generating the script if not found the file that was uploaded. so assign them a valid js variable / function name. [NOTE: duplicate names are not allowed]

### Parsing the commands

Now we map each command inside the script to a webdriverio command then finally we combine to generate the script.

#### Supported Mappings:

| Selenium Command                                | WebdriverIO Command                                         |
| ----------------------------------------------- | ----------------------------------------------------------- |
| click                                           | `$(...).click()`                                            |
| type                                            | `$(...).setValue()`                                         |
| echo                                            | `console.log(...)`                                          |
| uncheck                                         | `if $(...).isSelected() $(...).click()`                     |
| check                                           | `if !$(...).isSelected() $(...).click()`                    |
| open                                            | `browser.url(...)`                                          |
| pause                                           | `browser.pause(...)`                                        |
| sendKeys                                        | `browser.sendKeys([Key....,...])`                           |
| debugger                                        | `browser.debug()`                                           |
| setWindowSize                                   | `browser.size(..., ...)`                                    |
| runScript                                       | `browser.script(...)`                                       |
| assertText or verifyText                        | `expect($(...)).toHaveText(...)`                            |
| assertTitle or verifyTitle                      | `expect(browser).toHaveTitle(...)`                          |
| assertElementPresent or verifyElementPresent    | `expect($(...)).toBePresent()`                              |
| assertEditable or verifyEditable                | `expect($(...)).toBeEnabled()`                              |
| assertChecked or verifyChecked                  | `expect($(...)).toBeChecked()`                              |
| assertValue or verifyValue                      | `expect($(...)).toHaveValue(...)`                           |
| assertNotText or verifyNotText                  | `expect($(...)).not.toHaveText(...)`                        |
| assertNotTitle or verifyNotTitle                | `expect(browser).not.toHaveTitle(...)`                      |
| assertElementNotPresent or verifyElementPresent | `expect($(...)).not.toBePresent()`                          |
| assertNotEditable or verifyNotEditable          | `expect($(...)).not.toBeEnabled()`                          |
| assertNotChecked or verifyNotChecked            | `expect($(...)).not.toBeChecked()`                          |
| assertNotValue or verifyNotValue                | `expect($(...)).not .toHaveValue(...)`                      |
| waitForElementEditable                          | `$(...).waitForEnabled({ timeout: ..., reverse: false })`   |
| waitForElementNotEditable                       | `$(...).waitForEnabled({ timeout: ..., reverse: true })`    |
| waitForElementPresent                           | `$(...).waitForExist({ timeout: ..., reverse: false})`      |
| waitForElementNotPresent                        | `$(...).waitForExist({ timeout: ..., reverse: true})`       |
| waitForElementVisible                           | `$(...).waitForDisplayed({ timeout: ..., reverse: false })` |
| waitForElementNotVisible                        | `$(...).waitForDisplayed({ timeout: ..., reverse: true })`  |

### Example Output:

```js
import { remote, Key } from "webdriverio"; // Key is for sendKeys command
import { expect } from "expect-webdriverio";
// above lines for the imports required for performing assertions and running a standalone runner

// if you are using browser runner to execute the scripts then you can ignore the below configuration for the browser
const browser = await remote({
	capabilities: {
		browserName: "chrome",
		"goog:chromeOptions": {
			args: process.env.CI ? ["headless", "disable-gpu"] : [],
		},
	},
});

class Locators {
	$(location) {
		return browser.$(location); // you can either have it like this or simply $(location)
	}
	get search_bar_location() {
		return this.$("#\\:Ril56\\:-label");
	}
	get youtube_search_bar() {
		return this.$("#\\:Ril56\\:");
	}
	get search_bar_icon() {
		return this.$(".MuiInputAdornment-root > span");
	}
	get tooltip() {
		return this.$(".MuiTooltip-tooltip"); // $(".MuiTooltip-tooltip"); would do if you are running in WDIO Test runner: https://webdriver.io/docs/setuptypes/#the-wdio-testrunner
	}
	get body() {
		// name of the function = name of the locator associated with it
		return this.$("#__next"); // locator
	}
}
//

const pageClass = new Locators();

// TEST CASE
async function validating_the_search_bar() {
	// name of the function = name of the test case
	await browser.url("https://yticks.vercel.app/video"); // mapped webdriverio commands
	await browser.setWindowSize(518, 480);
	await expect(pageClass.search_bar_location).toHaveText(
		"Paste a valid Youtube URL"
	);
	await expect(pageClass.youtube_search_bar).toBePresent();
	await pageClass.youtube_search_bar.click();
	await expect(pageClass.search_bar_icon).toBePresent();
	await pageClass.search_bar_icon.click();
	await browser.pause(600);
	await pageClass.search_bar_icon.click();
	await expect(pageClass.tooltip).toHaveText("Invalid Input");
	await pageClass.youtube_search_bar.click();
	await pageClass.body.click();
	await pageClass.youtube_search_bar.setValue("checking");
	await expect(pageClass.search_bar_location).toHaveText(
		"Paste a valid Youtube URL"
	);
	await pageClass.search_bar_icon.click();
	await expect(pageClass.tooltip).toBePresent();
	await pageClass.youtube_search_bar.click();
}

(async () => {
	// list of test cases to run in case of the suite, it will list all the names of the test cases to run here
	await validating_the_search_bar();

	await browser.deleteSession(); // deletes the session after executing the cases
	// not required if used in the WDIO Test Runner
})();
```

## Setup

-   Create a npm package `npm init` on a directory
-   In package.json mention `type: "module"`
-   Create a file, copy the generated script, run it.

### Missing Pieces

There are several commands I missed as mentioned here: https://www.selenium.dev/selenium-ide/docs/en/api/commands, part of the reason is because i am looking for the expected webdriverio command or else it is selenium specific, either way I might have missed too, Happy to take note some critical misses.
