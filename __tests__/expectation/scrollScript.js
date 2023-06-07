import { remote, Key } from "webdriverio";
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
	get ShowMore() {
		return this.$(".MuiTypography-alignCenter");
	}
	get search_bar_location() {
		return this.$("#\\:Ril56\\:-label");
	}
	get youtube_search_bar() {
		return this.$("#\\:Ril56\\:");
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

async function loading_More_comments() {
	await searching_for_a_Video();
	await browser.pause(500);
	await browser.execute("document.querySelector(\".MuiTypography-alignCenter\").scrollIntoView()");
	await expect(pageClass.ShowMore).toHaveText("Show More");
	await pageClass.ShowMore.click();
	await browser.pause(500);
	await browser.execute("document.querySelector(\".MuiTypography-alignCenter\").scrollIntoView()");
	await pageClass.ShowMore.click();
}

async function searching_for_a_Video() {
	await browser.url("https://yticks.vercel.app/video");
	await browser.setWindowSize(1280, 800);
	await pageClass.youtube_search_bar.waitForEnabled({ reverse: false, timeout: 1000 });
	await pageClass.youtube_search_bar.setValue("https://www.youtube.com/watch?v=sAuEeM_6zpk");
	await expect(pageClass.youtube_search_bar).toHaveValue("https://www.youtube.com/watch?v=sAuEeM_6zpk");
	await expect(pageClass.search_bar_location).toHaveText("You can now search");
	await pageClass.search_button.click();
	await expect(pageClass.title).toHaveText("YTicks");
	await pageClass.back_button.click();
	await pageClass.youtube_search_bar.click();
	await browser.pause(600);
	await browser.keys([Key.Enter]);
	await expect(pageClass.title).toHaveText("YTicks");
}

; (async () => {
	await loading_More_comments();
	await browser.deleteSession();
})();