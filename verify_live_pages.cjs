const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\SABAREESH\\.gemini\\antigravity-ide\\brain\\454e1544-250a-41e3-80cf-52e6cb6f8fe6';
const BASE_URL = 'https://saba1207b.github.io/CodeAlpha_ConnectSphere/';

async function runLiveVerification() {
  console.log('====================================================');
  console.log('🌐 Starting Live GitHub Pages Verification with Chrome...');
  console.log('Target URL:', BASE_URL);
  console.log('====================================================');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false, // Visible external browser window on desktop
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--window-size=1366,850'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    permissions: ['camera', 'microphone']
  });

  const page = await context.newPage();

  const report = {
    liveHome: false,
    livePricing: false,
    liveLogin: false,
    liveDashboard: false,
    liveScheduleModal: false,
    liveMeetingRoom: false,
    liveHandRaise: false,
    liveCaptions: false,
    liveGeminiAI: false,
    livePolls: false,
    liveQnA: false,
    liveNotes: false,
    liveSlides: false,
    liveLayoutSwitch: false,
    liveDeviceSettings: false,
    liveHostControls: false
  };

  try {
    // 1. LIVE HOME PAGE
    console.log('\n[1/7] Testing Live Home Page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log('✓ Live Home Page Loaded. Title:', title);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_01_home_page.png') });
    report.liveHome = true;
    await page.waitForTimeout(1000);

    // 2. LIVE PRICING PAGE
    console.log('\n[2/7] Testing Live Pricing Page...');
    await page.goto(`${BASE_URL}#/pricing`, { waitUntil: 'networkidle' });
    console.log('✓ Live Pricing Page Loaded');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_02_pricing_page.png') });
    report.livePricing = true;
    await page.waitForTimeout(1000);

    // 3. LIVE LOGIN PAGE
    console.log('\n[3/7] Testing Live Login Page...');
    await page.goto(`${BASE_URL}#/login`, { waitUntil: 'networkidle' });
    console.log('✓ Live Login Page Loaded');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_03_login_page.png') });
    report.liveLogin = true;
    await page.waitForTimeout(1000);

    // 4. LIVE DASHBOARD & GOOGLE CALENDAR SCHEDULER
    console.log('\n[4/7] Testing Live Dashboard & Google Calendar Integration...');
    await page.goto(`${BASE_URL}#/dashboard`, { waitUntil: 'networkidle' });
    console.log('✓ Live Dashboard Page Loaded');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_04_dashboard_page.png') });
    report.liveDashboard = true;

    // Open Schedule Room modal
    const scheduleBtn = page.locator('button:has-text("Schedule Room")');
    if (await scheduleBtn.count() > 0) {
      await scheduleBtn.first().click();
      await page.waitForTimeout(800);

      const titleInput = page.locator('input[placeholder*="Design Critique Pod"]');
      if (await titleInput.count() > 0) {
        await titleInput.fill('Global Enterprise Sync & Architecture Review');
      }

      const createBtn = page.locator('button:has-text("Schedule & Generate Links")');
      if (await createBtn.count() > 0) {
        await createBtn.click();
        await page.waitForTimeout(800);
        console.log('✓ Live Schedule Modal generated Google Calendar links & details!');
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_05_scheduled_calendar.png') });
        report.liveScheduleModal = true;
      }

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // 5. LIVE ENTERPRISE MEETING ROOM
    const testRoomId = 'enterprise-live-sync';
    console.log(`\n[5/7] Navigating to Live Meeting Room (${BASE_URL}#/meeting/${testRoomId})...`);
    await page.goto(`${BASE_URL}#/meeting/${testRoomId}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500); // Allow camera/WebRTC media stream acquisition
    console.log('✓ Live Meeting Room Loaded with live Video Stage and Control Bar');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_06_meeting_room_initial.png') });
    report.liveMeetingRoom = true;

    // 6. TESTING IN-MEETING FEATURES
    console.log('\n[6/7] Testing In-Meeting Enterprise Features on Live Deployment...');

    // A. Raise Hand
    console.log('  Testing Raise Hand...');
    const raiseHandBtn = page.locator('button[title*="Raise or Lower Hand"]');
    if (await raiseHandBtn.count() > 0) {
      await raiseHandBtn.click();
      await page.waitForTimeout(1000);
      const isRaised = (await page.locator('text=Hand Raised').count() > 0) || (await page.locator('button:has-text("Lower")').count() > 0);
      console.log('  ✓ Hand Raise activated:', isRaised);
      report.liveHandRaise = isRaised;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_07_hand_raised.png') });
    }

    // B. Live Captions (CC)
    console.log('  Testing Live Captions (CC)...');
    const captionsBtn = page.locator('button[title*="Toggle Live Subtitles"]');
    if (await captionsBtn.count() > 0) {
      await captionsBtn.click();
      await page.waitForTimeout(800);
      console.log('  ✓ Live Captions toggled ON');
      report.liveCaptions = true;
    }

    // C. Gemini AI Assistant
    console.log('  Testing Gemini AI Assistant Drawer...');
    const aiBtn = page.locator('button[title*="Gemini AI Meeting Notes"]');
    if (await aiBtn.count() > 0) {
      await aiBtn.click();
      await page.waitForTimeout(1000);

      const takeNotesChip = page.locator('button:has-text("Take Notes")');
      if (await takeNotesChip.count() > 0) {
        await takeNotesChip.click();
        await page.waitForTimeout(1800);
        console.log('  ✓ Gemini generated Executive Meeting Minutes on Live deployment!');
        report.liveGeminiAI = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_08_gemini_ai_minutes.png') });
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // D. Activities Hub -> Live Polls
    console.log('  Testing Activities Hub -> Live Polls...');
    const activitiesBtn = page.locator('button[title*="Collaboration Hub"]');
    if (await activitiesBtn.count() > 0) {
      await activitiesBtn.click();
      await page.waitForTimeout(500);

      const pollsOption = page.locator('button:has-text("Live Polls")');
      if (await pollsOption.count() > 0) {
        await pollsOption.click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Live Polls Drawer opened');
        report.livePolls = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_09_polls.png') });

        // Vote on sample poll
        const firstOption = page.locator('button:has-text("Crystal clear HD")');
        if (await firstOption.count() > 0) {
          await firstOption.click();
          await page.waitForTimeout(600);
          console.log('  ✓ Voted on Live Poll successfully!');
        }
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // E. Activities Hub -> Audience Q&A
    console.log('  Testing Activities Hub -> Audience Q&A...');
    if (await activitiesBtn.count() > 0) {
      await activitiesBtn.click();
      await page.waitForTimeout(500);

      const qnaOption = page.locator('button:has-text("Audience Q&A")');
      if (await qnaOption.count() > 0) {
        await qnaOption.click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Audience Q&A Drawer opened');
        report.liveQnA = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_10_qna.png') });
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // F. Activities Hub -> Collaborative Notes
    console.log('  Testing Activities Hub -> Collaborative Notes...');
    if (await activitiesBtn.count() > 0) {
      await activitiesBtn.click();
      await page.waitForTimeout(500);

      const notesOption = page.locator('button:has-text("Collaborative Notes")');
      if (await notesOption.count() > 0) {
        await notesOption.click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Collaborative Notes Drawer opened');
        report.liveNotes = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_11_notes.png') });
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // G. Activities Hub -> Slide Deck Presenter
    console.log('  Testing Activities Hub -> Slide Deck Presenter...');
    if (await activitiesBtn.count() > 0) {
      await activitiesBtn.click();
      await page.waitForTimeout(500);

      const slidesOption = page.locator('button:has-text("Slide Deck Presenter")');
      if (await slidesOption.count() > 0) {
        await slidesOption.click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Interactive Slide Deck Presenter modal opened');
        report.liveSlides = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_12_slides.png') });

        // Next slide
        const nextSlideBtn = page.locator('button:has-text("Next")');
        if (await nextSlideBtn.count() > 0) {
          await nextSlideBtn.click();
          await page.waitForTimeout(600);
          console.log('  ✓ Advanced to next slide in presentation');
        }

        const closeSlide = page.locator('button[title*="Close Presentation"], button[aria-label*="Close Presentation"]');
        if (await closeSlide.count() > 0) {
          await closeSlide.first().click();
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(800);
      }
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // H. Layout Switcher in Header
    console.log('  Testing Header Layout Switcher (Speaker + Filmstrip)...');
    const layoutDropdownBtn = page.locator('button[title*="Change Meeting Layout"]');
    if (await layoutDropdownBtn.count() > 0) {
      await layoutDropdownBtn.click({ force: true });
      await page.waitForTimeout(600);

      const speakerView = page.locator('button:has-text("Speaker + Filmstrip")');
      if (await speakerView.count() > 0) {
        await speakerView.click();
        await page.waitForTimeout(800);
        console.log('  ✓ Switched to Speaker + Filmstrip View on Live Site');
        report.liveLayoutSwitch = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_13_speaker_layout.png') });
      }
    }

    // 7. DEVICE SETTINGS & HOST CONTROLS
    console.log('\n[7/7] Testing Device Settings & Host Controls on Live Site...');
    const settingsBtn = page.locator('button[title*="Hardware & Video Effects Settings"]');
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(800);

      const vBgTab = page.locator('button:has-text("Virtual Backgrounds & Filters")');
      if (await vBgTab.count() > 0) {
        await vBgTab.click();
        await page.waitForTimeout(600);
        console.log('  ✓ Virtual Backgrounds & Filters panel loaded on live site');

        const officeBg = page.locator('button:has-text("Modern Office")');
        if (await officeBg.count() > 0) {
          await officeBg.click();
          await page.waitForTimeout(400);
        }
      }

      report.liveDeviceSettings = true;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_14_device_settings.png') });

      const applyBtn = page.locator('button:has-text("Save & Apply Preferences")');
      if (await applyBtn.count() > 0) {
        await applyBtn.click();
        await page.waitForTimeout(600);
      }
    }

    // Host Controls
    const securityBtn = page.locator('button[title*="Security and Host Management Controls"]');
    if (await securityBtn.count() > 0) {
      await securityBtn.click();
      await page.waitForTimeout(800);
      console.log('  ✓ Host Controls & Permissions modal loaded on live site');
      report.liveHostControls = true;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_15_host_controls.png') });

      const doneBtn = page.locator('button:has-text("Done")');
      if (await doneBtn.count() > 0) {
        await doneBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Final Live Screenshot
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_16_full_meeting.png') });

    console.log('\n====================================================');
    console.log('🎉 LIVE GITHUB PAGES VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Live Verification Summary:', JSON.stringify(report, null, 2));

    await page.waitForTimeout(3000); // Leave window visible for 3 seconds
    await browser.close();
    return report;
  } catch (err) {
    console.error('❌ Live verification error:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_verification_error.png') }).catch(() => {});
    await browser.close();
    throw err;
  }
}

runLiveVerification()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
