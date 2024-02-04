import "dotenv/config";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";

const STATUS_INDICATOR_XPATH = `//div[@data-cy="project-status-indicator" and text()="Running"]|//div[@data-cy="project-status-indicator" and text()="Ready"]|//div[@data-cy="project-status-indicator" and not(text())]`;
const RUN_NOTEBOOK_SELECTOR = `span[data-cy="run-notebook"]`;
const STOP_EXECUTION_XPATH = `//span[text()="Stop execution"]`;

const URL = process.env.DEEPNOTE_URL!;

async function main() {
    const browser = await puppeteer.use(StealthPlugin()).launch({
        headless: "new",
        userDataDir: "./user_data",
    });

    const page = await browser.newPage();
    await page.goto(URL);
    await page.waitForNetworkIdle();
    await page.waitForXPath(STATUS_INDICATOR_XPATH);

    const ele = await page.$(RUN_NOTEBOOK_SELECTOR);
    if (!ele) {
        const stop_ele = await page.$x(STOP_EXECUTION_XPATH);
        if (stop_ele.length > 0) {
            console.log("Notebook is already running");
        } else {
            throw new Error("Notebook is not running and cannot be started");
        }
    } else {
        await ele.click();
        await page.waitForXPath(STOP_EXECUTION_XPATH, { timeout: 300000 });
        console.log("Stated notebook");
    }

    await browser.close();
}

main();
