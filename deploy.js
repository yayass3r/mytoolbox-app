const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const filePath = '/home/z/my-project/deploy-toolbox.tar.gz';

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Step 1: Login
    console.log('Step 1: Logging in...');
    await page.goto('https://cloud.appwrite.io/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.locator('input[type="email"]').fill('yayass3r@gmail.com');
    await page.locator('input[type="password"]').fill('@1412Yasser');

    // Click the correct Sign in button (not GitHub)
    await page.locator('button:has-text("Sign in")').last().click();

    // Wait for successful login
    await page.waitForTimeout(5000);
    const url = page.url();
    if (url.includes('github.com')) {
        console.error('ERROR: Redirected to GitHub instead of email login');
        await browser.close();
        process.exit(1);
    }
    console.log('Logged in! URL:', url);

    // Step 2: Navigate to deployments tab for MyToolBox
    console.log('Step 2: Navigating to MyToolBox deployments...');
    await page.goto('https://cloud.appwrite.io/console/project-nyc-69f0f89f003186d816ca/sites/site-69f2379b00030d57a875/deployments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('On deployments page');

    // Step 3: Click Create deployment
    console.log('Step 3: Opening Create deployment...');
    await page.getByRole('button', { name: 'Create deployment' }).click();
    await page.waitForTimeout(2000);

    // Step 4: Click Manual
    console.log('Step 4: Selecting Manual...');
    await page.getByRole('button', { name: 'Manual' }).click();
    await page.waitForTimeout(2000);
    console.log('Manual upload dialog open');

    // Step 5: Upload file using setInputFiles on the hidden file input
    console.log('Step 5: Uploading file...');
    await page.setInputFiles('input[type="file"]', filePath);
    console.log('File set on input element');

    // Wait for UI to update
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/home/z/my-project/debug-upload.png' });

    // Step 6: Click Create/submit button in the dialog
    console.log('Step 6: Submitting deployment...');

    // Find the Create button that's now enabled (in the deployment dialog)
    // List visible buttons to debug
    const btns = page.locator('button');
    const totalBtns = await btns.count();
    let clicked = false;
    for (let i = totalBtns - 1; i >= 0; i--) {
        const text = (await btns.nth(i).textContent()).trim();
        const enabled = await btns.nth(i).isEnabled().catch(() => false);
        if (text === 'Create' && enabled) {
            console.log(`Clicking Create button at index ${i}`);
            await btns.nth(i).click();
            clicked = true;
            break;
        }
    }
    if (!clicked) {
        console.error('Could not find enabled Create button');
        for (let i = 0; i < totalBtns; i++) {
            const text = (await btns.nth(i).textContent()).trim();
            const visible = await btns.nth(i).isVisible().catch(() => false);
            const enabled = await btns.nth(i).isEnabled().catch(() => false);
            if (visible) console.log(`  Button ${i}: "${text}" enabled=${enabled}`);
        }
        await browser.close();
        process.exit(1);
    }

    console.log('Deployment submitted! Waiting for processing...');

    // Wait a moment then navigate back to deployments
    await page.waitForTimeout(5000);

    // Step 7: Monitor deployment status
    console.log('Step 7: Monitoring deployment status...');
    let status = 'unknown';
    let attempts = 0;
    const maxAttempts = 36; // 6 minutes

    while (status !== 'Active' && attempts < maxAttempts) {
        await page.waitForTimeout(10000);
        attempts++;

        try {
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            const rows = page.locator('table tbody tr');
            const rowCount = await rows.count();
            if (rowCount > 0) {
                const statusCell = rows.first().locator('td').nth(1);
                status = (await statusCell.textContent()).trim();
                console.log(`[${attempts * 10}s] Status: ${status}`);
            }
        } catch (e) {
            console.log(`[${attempts * 10}s] Checking...`);
        }

        if (status === 'Active') break;
    }

    console.log('\n============================================');
    console.log('  DEPLOYMENT RESULT');
    console.log('============================================');
    console.log(`  Status:  ${status}`);
    console.log(`  URL:     https://personal-projects-toolbox-pro.appwrite.network`);
    console.log(`  Site ID: 69f2379b00030d57a875`);
    console.log('============================================');

    await page.screenshot({ path: '/home/z/my-project/debug-final.png' });
    await browser.close();
})().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
