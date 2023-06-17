import { remote, Key } from "webdriverio";
import { expect } from "expect-webdriverio";
import { readFileSync } from "fs";
import { resolve } from "node:path"
import { cwd } from "process";

// if you are using browser runner to execute the scripts then you can ignore the below configuration for the browser
const browser = await remote({
    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: process.env.CI ? ['headless', 'disable-gpu'] : []
        }
    }
});


class Locators {
    $(location) {
        return browser.$(location);
    }
    get UploadButton() {
        return this.$(".MuiButtonBase-root");
    }
    get UploadDesc() {
        return this.$(".MuiTypography-root");
    }
    get UploadBox() {
        return this.$(".MuiPaper-root");
    }
    get uploadInput() {
        return this.$(".MuiBox-root > div");
    }
    get UploadAgain() {
        return this.$(".MuiChip-label");
    }
    get Alerts() {
        return this.$(".MuiIconButton-colorWarning");
    }
    get ScriptViewer() {
        return this.$(".MuiPaper-elevation1");
    }
    get DefaultScript() {
        return this.$(".string");
    }
    get DownloadGeneratedFile() {
        return this.$(".MuiIconButton-colorSuccess");
    }
    get AppTitle() {
        return this.$(".MuiTypography-h6");
    }
    get TestCaseSelectionPane() {
        return this.$(".css-vmlcwe .MuiPaper-root ");
    }
    get PickTheTestCaseOrSuite() {
        return this.$("#grouped-demo");
    }
    get PickTestItemLabel() {
        return this.$("#grouped-demo-label");
    }
    get OneofTheMenuItem() {
        return this.$("li:nth-child(1) > .MuiListSubheader-root");
    }
    get TestCaseMenuLabel() {
        return this.$("li:nth-child(2) > .MuiListSubheader-root");
    }
    get uploadFileInput() {
        return this.$("input[accept='.side']")
    }
};


const pageClass = new Locators();

async function homePage() {
    await browser.url("https://wticks.vercel.app/converter");
    await pageClass.UploadButton.waitForExist({ reverse: false, timeout: 5000 });
    await expect(pageClass.UploadButton).toHaveText("UPLOAD FILE");
    await expect(pageClass.UploadDesc).toHaveText("Upload the recorded.side file");
    await expect(pageClass.UploadBox).toBePresent();


    // const generated = await browser.uploadFile(resolve(cwd(), "__tests__", "testData", "WithVariableNames.side"));
    await pageClass.uploadFileInput.setValue(resolve(cwd(), "__tests__", "testData", "WithVariableNames.side"));

    await expect(pageClass.UploadAgain).toBePresent();
    await expect(pageClass.UploadAgain).toHaveText("Upload file again");
    await expect(pageClass.Alerts).toBePresent();
    await expect(pageClass.ScriptViewer).toBePresent();
    await expect(pageClass.DefaultScript).toHaveText("\"Please complete the required info for generating the script ...\"");
    await expect(pageClass.AppTitle).toHaveText("WTicks");
    await expect(pageClass.TestCaseSelectionPane).toBePresent();
    await expect(pageClass.PickTheTestCaseOrSuite).toBePresent();
    await expect(pageClass.PickTheTestCaseOrSuite).toBePresent();
    await pageClass.PickTestItemLabel.click();
    await expect(pageClass.PickTestItemLabel).toHaveText("Pick the Test case/suite to export")
    await expect(pageClass.PickTheTestCaseOrSuite).toHaveAttr("placeholder", "Not yet selected");
    await expect(pageClass.OneofTheMenuItem).toBePresent();
    await expect(pageClass.OneofTheMenuItem).toHaveText("Test Suites");
    await expect(pageClass.TestCaseMenuLabel).toHaveText("Test Cases");
}

; (async () => {
    await homePage();
    await browser.deleteSession();
})();