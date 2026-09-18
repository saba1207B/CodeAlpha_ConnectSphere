const { chromium } = require('playwright');

async function testLaunch() {
  const channels = ['chrome', 'msedge', undefined];
  for (const channel of channels) {
    try {
      console.log(`Attempting to launch with channel: ${channel || 'default chromium'}...`);
      const browser = await chromium.launch({
        channel,
        headless: false,
        args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
      });
      console.log(`SUCCESS launching with channel: ${channel || 'default chromium'}`);
      const page = await browser.newPage();
      await page.goto('http://localhost:5173/');
      console.log('Page title:', await page.title());
      await page.waitForTimeout(2000);
      await browser.close();
      return channel;
    } catch (e) {
      console.log(`Failed with channel ${channel}:`, e.message);
    }
  }
  return null;
}

testLaunch().then(ch => {
  console.log('Working channel found:', ch);
  process.exit(ch ? 0 : 1);
});
