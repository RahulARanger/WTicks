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
	get searchBar() {
		return this.$("#APjFqb");
	}
	get _2rdPage() {
		return this.$("=2");
	}
	get _4thPage() {
		return this.$("=4");
	}
};


const pageClass = new Locators();

async function simple_scroll_test() {
	await browser.url("https://www.google.com");
	console.warn(await browser.getWindowRect(), "before");
	await browser.setWindowRect(0, 0, 1280, 800);
	await browser.setWindowSize(1280, 800);
	console.warn(await browser.getWindowRect(), "after");
	await pageClass.searchBar.waitForEnabled({ reverse: false, timeout: 3500 });
	await pageClass.searchBar.click();
	await pageClass.searchBar.setValue("Rem Chan");
	await expect(pageClass.searchBar).toHaveValue("Rem Chan");
	await browser.keys([Key.Enter]);
	await browser.pause(1000);
	await browser.execute("window.scrollTo(0,900)");
	await pageClass._2rdPage.waitForDisplayed({ reverse: false, timeout: 3000 });
	await pageClass._2rdPage.click();
	await browser.execute("window.scrollTo(0,document.body.scrollHeight)");
	await pageClass._4thPage.click();
}

; (async () => {
	await simple_scroll_test();
	await browser.deleteSession();
})();