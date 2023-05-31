import { remote } from "webdriverio";
import { expect } from "expect-webdriverio";


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
		return this.$(".MuiTooltip-tooltip");
	}
	get body() {
		return this.$("#__next");
	}
	get search_button() {
		return this.$(".MuiIconButton-sizeSmall");
	}
	get title() {
		return this.$(".MuiTypography-h6");
	}
	get back_button() {
		return this.$(".css-xkbv5f");
	}
};


const pageClass = new Locators();

async function validating_the_search_bar_with_invalid_url() {
	await browser.url("https://yticks.vercel.app/video");
	await pageClass.youtube_search_bar.setValue("https://www.youtube.com/watch?v=sAuEeM_6zpk");
	await expect(pageClass.youtube_search_bar).toHaveValue("https://www.youtube.com/watch?v=sAuEeM_6zpk");
	await expect(pageClass.search_bar_location).toHaveText("You can now search")
	await pageClass.search_button.click();
	await expect(pageClass.title).toHaveText("YTicks")
	await pageClass.back_button.click();
	await pageClass.youtube_search_bar.click();
	await browser.pause(600);
	await expect(pageClass.title).toHaveText("YTicks")
}

async function validating_the_search_bar() {
	await browser.url("https://yticks.vercel.app/video");
	await browser.setWindowSize(518, 480);
	await expect(pageClass.search_bar_location).toHaveText("Paste a valid Youtube URL")
	await expect(pageClass.youtube_search_bar).toBePresent();
	await pageClass.youtube_search_bar.click();
	await expect(pageClass.search_bar_icon).toBePresent();
	await pageClass.search_bar_icon.click();
	await browser.pause(600);
	await pageClass.search_bar_icon.click();
	await expect(pageClass.tooltip).toHaveText("Invalid Input")
	await pageClass.youtube_search_bar.click();
	await pageClass.body.click();
	await pageClass.youtube_search_bar.setValue("checking");
	await expect(pageClass.search_bar_location).toHaveText("Paste a valid Youtube URL")
	await pageClass.search_bar_icon.click();
	await expect(pageClass.tooltip).toBePresent();
	await pageClass.youtube_search_bar.click();
}

; (async () => {
	await validating_the_search_bar_with_invalid_url();
	await validating_the_search_bar();
	await browser.deleteSession();
})();