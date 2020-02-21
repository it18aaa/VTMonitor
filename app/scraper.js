const puppeteer = require('puppeteer');

async function getStatus(credentials, url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    await page.type('#txtBadge', credentials.badge);
    await page.type('#txtPin', credentials.pin);

    // wrap the 'click and wait' in a promise to prevent deadlock
    await Promise.all([
        page.click('#btnClocking'),
        page.waitForNavigation()
    ]);

    const data = await page.evaluate(() => {
        // TODO: easier way to do this
        const tds = Array.from(document.querySelectorAll('.label'));
        return tds.map(td => td.innerText);
    });

    await browser.close();
    return data;
}
 
module.exports = {
    getStatus: getStatus
}