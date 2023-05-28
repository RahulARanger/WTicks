import { remote, Key } from "webdriverio";
import { expect } from "expect-webdriverio";

const browser = await remote({
    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: process.env.CI ? ['headless', 'disable-gpu'] : []
        }
    }
})

class Locators {
    $(location) {
        return browser.$(location);
    }

    get search_bar() {
        return this.$("#APjFqb");
    }

    get second_link() {
        return this.$("a=2");
    }

    get third_link() {
        return this.$("td:nth-child(4) .SJajHc");
    }

    get fourth_link() {
        return this.$("a=4");
    }
};

const pageClass = new Locators();

; (async () => {
    //scrolling 
    await browser.url('https://www.google.com/')

    await pageClass.search_bar.setValue("Rem")
    await browser.keys(Key.Enter);
    await expect(pageClass.search_bar).toHaveValue("Rem")
    await browser.scroll(0, 900);
    await pageClass.second_link.click();
    await browser.scroll(0, 1801.3333740234375)
    await pageClass.third_link.click();
    await pageClass.fourth_link.click();

    await browser.deleteSession();
})();