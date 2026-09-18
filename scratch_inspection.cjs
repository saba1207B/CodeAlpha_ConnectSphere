const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.resolve('C:/Users/SABAREESH/.gemini/antigravity-ide/brain/06d268b3-f035-4f46-bf8f-beb0ce7eaa4a');
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runDetailedInspection() {
  const inspectionResults = {
    pagesChecked: [],
    consoleErrors: [],
    networkErrors: [],
    flowResults: {}
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['camera', 'microphone']
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      inspectionResults.consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('requestfailed', request => {
    inspectionResults.networkErrors.push({
      url: request.url(),
      failure: request.failure()?.errorText
    });
  });

  console.log('--- 1. Inspecting Home Page ---');
  await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const homeTitle = await page.title();
  const heroHeading = await page.locator('h1').first().textContent().catch(() => 'N/A');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_homepage.png'), fullPage: false });
  inspectionResults.pagesChecked.push({ page: 'Home', url: page.url(), title: homeTitle, hero: heroHeading });

  console.log('--- 2. Inspecting Pricing Page ---');
  await page.goto('http://localhost:5173/#/pricing', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_pricing.png'), fullPage: false });
  inspectionResults.pagesChecked.push({ page: 'Pricing', url: page.url(), title: await page.title() });

  console.log('--- 3. Inspecting Login Page ---');
  await page.goto('http://localhost:5173/#/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_login.png'), fullPage: false });
  inspectionResults.pagesChecked.push({ page: 'Login', url: page.url() });

  console.log('--- 4. Inspecting Register Page ---');
  await page.goto('http://localhost:5173/#/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_register.png'), fullPage: false });
  inspectionResults.pagesChecked.push({ page: 'Register', url: page.url() });

  console.log('--- 5. Testing Registration & Dashboard Flow ---');
  const testEmail = `tester_${Date.now()}@example.com`;
  const testPass = 'Password123!';
  const testName = 'Alex Mercer';

  const nameInput = page.locator('input[type="text"]').first();
  const emailInput = page.locator('input[type="email"]');
  const passInput = page.locator('input[type="password"]').first();
  const submitBtn = page.locator('button[type="submit"]');

  if (await nameInput.count() > 0 && await emailInput.count() > 0 && await passInput.count() > 0) {
    await nameInput.fill(testName);
    await emailInput.fill(testEmail);
    await passInput.fill(testPass);

    // If confirm password exists
    const passInputs = page.locator('input[type="password"]');
    if (await passInputs.count() > 1) {
      await passInputs.nth(1).fill(testPass);
    }

    await submitBtn.click();
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    inspectionResults.flowResults.registrationSuccess = currentUrl.includes('dashboard') || currentUrl.includes('login') || currentUrl.includes('/');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_post_register_dashboard.png'), fullPage: false });
  }

  // Navigate to Dashboard explicitly to check dashboard state
  console.log('--- 6. Inspecting Dashboard ---');
  await page.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_dashboard.png'), fullPage: false });
  inspectionResults.pagesChecked.push({ page: 'Dashboard', url: page.url() });

  // Test Meeting Room (Instant Meeting)
  console.log('--- 7. Inspecting Meeting Room ---');
  const testMeetingId = 'cs-' + Math.random().toString(36).substring(2, 8);
  await page.goto(`http://localhost:5173/#/meeting/${testMeetingId}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // Allow WebRTC / fake media initialization
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_meeting_room.png'), fullPage: false });

  // Try opening sidebar (Chat or Participants)
  const chatButton = page.locator('button:has-text("Chat"), button[title*="Chat"], button[aria-label*="Chat"]').first();
  if (await chatButton.count() > 0) {
    await chatButton.click().catch(() => {});
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_meeting_chat_dock.png'), fullPage: false });
  }

  // Try Whiteboard if present
  const whiteboardBtn = page.locator('button:has-text("Whiteboard"), button[title*="Whiteboard"], button[aria-label*="Whiteboard"]').first();
  if (await whiteboardBtn.count() > 0) {
    await whiteboardBtn.click().catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_meeting_whiteboard.png'), fullPage: false });
  }

  // Check Mobile Responsiveness
  console.log('--- 8. Testing Mobile Viewport (iPhone 14) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_mobile_home.png'), fullPage: false });

  await browser.close();

  const reportPath = path.join(ARTIFACTS_DIR, 'inspection_data.json');
  fs.writeFileSync(reportPath, JSON.stringify(inspectionResults, null, 2));
  console.log('Inspection complete! Data written to:', reportPath);
}

runDetailedInspection().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
