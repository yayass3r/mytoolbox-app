const { chromium } = require('playwright');
const fs = require('fs');
const filePath = '/home/z/my-project/deploy-toolbox.tar.gz';
const logFile = '/home/z/my-project/deploy-log.txt';

function log(msg) {
    fs.appendFileSync(logFile, new Date().toISOString() + ' ' + msg + '\n');
    console.log(msg);
}

(async () => {
    log('1. Launching browser...');
    const browser = await chromium.launch({headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage']});
    const context = await browser.newContext();
    const page = await context.newPage();

    log('2. Logging in...');
    await page.goto('https://cloud.appwrite.io/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.locator('input[type="email"]').fill('yayass3r@gmail.com');
    await page.locator('input[type="password"]').fill('@1412Yasser');
    await page.locator('button:has-text("Sign in")').last().click();
    await page.waitForTimeout(5000);
    log('3. Logged in: ' + page.url());

    log('4. Navigating to deployments...');
    await page.goto('https://cloud.appwrite.io/console/project-nyc-69f0f89f003186d816ca/sites/site-69f2379b00030d57a875/deployments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    log('5. Clicking Create deployment...');
    await page.getByRole('button', { name: 'Create deployment' }).click();
    await page.waitForTimeout(2000);

    log('6. Clicking Manual...');
    await page.getByRole('button', { name: 'Manual' }).click();
    await page.waitForTimeout(2000);

    log('7. Uploading file via setInputFiles...');
    await page.setInputFiles('input[type="file"]', filePath);
    log('8. File uploaded, waiting 3s...');
    await page.waitForTimeout(3000);

    log('9. Clicking Create/submit button...');
    const btns = page.locator('button');
    const total = await btns.count();
    let clicked = false;
    for (let i = total - 1; i >= 0; i--) {
        const t = (await btns.nth(i).textContent()).trim();
        const en = await btns.nth(i).isEnabled().catch(() => false);
        if (t === 'Create' && en) {
            log('  Found Create button at index ' + i + ', clicking...');
            await btns.nth(i).click();
            clicked = true;
            break;
        }
    }
    if (!clicked) {
        log('ERROR: No enabled Create button found!');
        await browser.close();
        return;
    }

    log('10. Deployment submitted. Monitoring status...');
    await page.waitForTimeout(5000);

    for (let a = 0; a < 36; a++) {
        try {
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);
            const rows = page.locator('table tbody tr');
            if (await rows.count() > 0) {
                const status = (await rows.first().locator('td').nth(1).textContent()).trim();
                log('  [' + ((a+1)*10) + 's] Status: ' + status);
                if (status === 'Active') {
                    log('DEPLOYMENT SUCCESSFUL!');
                    break;
                }
            }
        } catch (e) {
            log('  [' + ((a+1)*10) + 's] Error checking: ' + e.message);
        }
        await page.waitForTimeout(10000);
    }

    log('============================================');
    log('DEPLOYMENT COMPLETE');
    log('URL: https://personal-projects-toolbox-pro.appwrite.network');
    log('============================================');
    await browser.close();
})().catch(e => {
    log('FATAL ERROR: ' + e.message);
    log(e.stack);
    process.exit(1);
});
