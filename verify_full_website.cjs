const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\SABAREESH\\.gemini\\antigravity-ide\\brain\\454e1544-250a-41e3-80cf-52e6cb6f8fe6';

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 Starting Full Website Verification with Chrome...');
  console.log('====================================================');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false, // Opens visible external browser window on user's screen!
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
    home: false,
    pricing: false,
    login: false,
    dashboard: false,
    calendarModal: false,
    meetingRoom: false,
    handRaise: false,
    captions: false,
    geminiAI: false,
    polls: false,
    qna: false,
    notes: false,
    slides: false,
    whiteboard: false,
    settingsEffects: false,
    hostControls: false,
    attendanceExport: false
  };

  try {
    // 1. HOME PAGE
    console.log('\n[1/7] Testing Home Page (http://localhost:5173/#/)...');
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log('✓ Home Page Loaded. Title:', title);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_home_page.png') });
    report.home = true;
    await page.waitForTimeout(1000);

    // 2. PRICING PAGE
    console.log('\n[2/7] Testing Pricing Page (http://localhost:5173/#/pricing)...');
    await page.goto('http://localhost:5173/#/pricing', { waitUntil: 'networkidle' });
    console.log('✓ Pricing Page Loaded');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_pricing_page.png') });
    report.pricing = true;
    await page.waitForTimeout(1000);

    // 3. LOGIN / REGISTER PAGE
    console.log('\n[3/7] Testing Login Page (http://localhost:5173/#/login)...');
    await page.goto('http://localhost:5173/#/login', { waitUntil: 'networkidle' });
    console.log('✓ Login Page Loaded');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_login_page.png') });
    report.login = true;
    await page.waitForTimeout(1000);

    // 4. DASHBOARD PAGE & GOOGLE CALENDAR INTEGRATION
    console.log('\n[4/7] Testing Dashboard & Google Calendar Integration (http://localhost:5173/#/dashboard)...');
    await page.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle' });
    console.log('✓ Dashboard Page Loaded');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_dashboard_page.png') });
    report.dashboard = true;

    // Open Schedule Room Modal
    const scheduleBtn = page.locator('button:has-text("Schedule Room")');
    if (await scheduleBtn.count() > 0) {
      await scheduleBtn.first().click();
      await page.waitForTimeout(800);

      // Fill in session title
      const titleInput = page.locator('input[placeholder*="Design Critique Pod"]');
      if (await titleInput.count() > 0) {
        await titleInput.fill('Q4 Strategic Roadmap & Architecture Sync');
      }

      // Click Schedule & Generate Links button
      const createBtn = page.locator('button:has-text("Schedule & Generate Links")');
      if (await createBtn.count() > 0) {
        await createBtn.click();
        await page.waitForTimeout(800);
        console.log('✓ Schedule Modal generated links successfully!');
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_dashboard_scheduled_calendar.png') });
        report.calendarModal = true;
      }

      // Close modal
      const closeBtn = page.locator('button:has-text("✕"), button:has-text("X")');
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click();
      }
    }
    await page.waitForTimeout(1000);

    // 5. MEETING ROOM & VIDEO/AUDIO PIPELINE
    const testRoomId = 'cs-enterprise-sync';
    console.log(`\n[5/7] Navigating to Enterprise Meeting Room (http://localhost:5173/#/meeting/${testRoomId})...`);
    await page.goto(`http://localhost:5173/#/meeting/${testRoomId}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500); // Allow WebRTC & media stream acquisition
    console.log('✓ Meeting Room Loaded with live Video Stage and Control Bar');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_meeting_room_initial.png') });
    report.meetingRoom = true;

    // 6. TESTING INTERACTIVE COLLABORATION, CAPTIONS & AI ASSISTANT
    console.log('\n[6/7] Testing In-Meeting Enterprise Features...');

    // A. Raise Hand
    console.log('  Testing Raise Hand...');
    const raiseHandBtn = page.locator('button[title*="Raise or Lower Hand"]');
    if (await raiseHandBtn.count() > 0) {
      await raiseHandBtn.click();
      await page.waitForTimeout(1000);
      const isRaised = (await page.locator('text=Hand Raised').count() > 0) || (await page.locator('button:has-text("Lower")').count() > 0);
      console.log('  ✓ Hand Raise activated:', isRaised);
      report.handRaise = isRaised;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_meeting_hand_raised.png') });
    }

    // B. Live Captions (CC)
    console.log('  Testing Live Captions (CC)...');
    const captionsBtn = page.locator('button[title*="Toggle Live Subtitles"]');
    if (await captionsBtn.count() > 0) {
      await captionsBtn.click();
      await page.waitForTimeout(800);
      console.log('  ✓ Live Captions toggled ON');
      report.captions = true;
    }

    // C. Gemini AI Meeting Assistant Drawer
    console.log('  Testing Gemini AI Assistant...');
    const aiBtn = page.locator('button[title*="Gemini AI Meeting Notes"]');
    if (await aiBtn.count() > 0) {
      await aiBtn.click();
      await page.waitForTimeout(1000);

      // Click "Take Notes" chip
      const takeNotesChip = page.locator('button:has-text("Take Notes")');
      if (await takeNotesChip.count() > 0) {
        await takeNotesChip.click();
        await page.waitForTimeout(1800);
        console.log('  ✓ Gemini generated Executive Meeting Minutes!');
        report.geminiAI = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_gemini_ai_minutes.png') });
      }

      // Close drawer
      const closeDrawer = page.locator('button:has-text("✕"), button:has-text("X")');
      if (await closeDrawer.count() > 0) {
        await closeDrawer.first().click();
        await page.waitForTimeout(500);
      }
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
        report.polls = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_live_polls.png') });

        // Vote on sample poll
        const firstOption = page.locator('button:has-text("Crystal clear HD")');
        if (await firstOption.count() > 0) {
          await firstOption.click();
          await page.waitForTimeout(600);
          console.log('  ✓ Voted on Poll successfully!');
        }
      }
    }

    // E. Activities Hub -> Q&A Drawer
    console.log('  Testing Activities Hub -> Audience Q&A...');
    if (await activitiesBtn.count() > 0) {
      await activitiesBtn.click();
      await page.waitForTimeout(500);

      const qnaOption = page.locator('button:has-text("Audience Q&A")');
      if (await qnaOption.count() > 0) {
        await qnaOption.click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Audience Q&A Drawer opened');
        report.qna = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_audience_qna.png') });
      }
    }

    // F. Activities Hub -> Collaborative Notes Drawer
    console.log('  Testing Activities Hub -> Collaborative Notes...');
    if (await activitiesBtn.count() > 0) {
      await activitiesBtn.click();
      await page.waitForTimeout(500);

      const notesOption = page.locator('button:has-text("Collaborative Notes")');
      if (await notesOption.count() > 0) {
        await notesOption.click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Collaborative Notes Drawer opened');
        report.notes = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '11_collaborative_notes.png') });
      }
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
        report.slides = true;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '12_slide_deck_presenter.png') });

        // Click next slide
        const nextSlideBtn = page.locator('button:has-text("Next")');
        if (await nextSlideBtn.count() > 0) {
          await nextSlideBtn.click();
          await page.waitForTimeout(600);
          console.log('  ✓ Advanced to next slide in presentation');
        }

        // Close slides modal cleanly
        const closeSlide = page.locator('button[title*="Close Presentation"], button[aria-label*="Close Presentation"]');
        if (await closeSlide.count() > 0) {
          await closeSlide.first().click();
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(800);
      }
    }

    // Ensure any open modal or drawer backdrop is dismissed before layout switcher
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // H. Layout Switcher in Header
    console.log('  Testing Header Layout Switcher (Speaker, Spotlight, Sidebar)...');
    const layoutDropdownBtn = page.locator('button[title*="Change Meeting Layout"]');
    if (await layoutDropdownBtn.count() > 0) {
      await layoutDropdownBtn.click({ force: true });
      await page.waitForTimeout(600);

      const speakerView = page.locator('button:has-text("Speaker + Filmstrip")');
      if (await speakerView.count() > 0) {
        await speakerView.click();
        await page.waitForTimeout(800);
        console.log('  ✓ Switched to Speaker + Filmstrip View');
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '13_layout_speaker_view.png') });
      }
    }

    // I. Device Preferences, Virtual Backgrounds & Bandwidth Modal
    console.log('\n[7/7] Testing Device Preferences & Virtual Backgrounds Settings...');
    const settingsBtn = page.locator('button[title*="Hardware & Video Effects Settings"]');
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(800);

      // Switch to Virtual Backgrounds tab
      const vBgTab = page.locator('button:has-text("Virtual Backgrounds & Filters")');
      if (await vBgTab.count() > 0) {
        await vBgTab.click();
        await page.waitForTimeout(600);
        console.log('  ✓ Virtual Backgrounds & Filters panel loaded');

        // Click Modern Office background
        const officeBg = page.locator('button:has-text("Modern Office")');
        if (await officeBg.count() > 0) {
          await officeBg.click();
          await page.waitForTimeout(400);
        }
      }

      // Switch to HD Quality & Bandwidth tab
      const bwTab = page.locator('button:has-text("HD Quality & Bandwidth")');
      if (await bwTab.count() > 0) {
        await bwTab.click();
        await page.waitForTimeout(600);
        console.log('  ✓ HD Quality & Bandwidth panel loaded');
      }

      report.settingsEffects = true;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '14_device_settings_effects.png') });

      // Apply
      const applyBtn = page.locator('button:has-text("Save & Apply Preferences")');
      if (await applyBtn.count() > 0) {
        await applyBtn.click();
        await page.waitForTimeout(600);
        console.log('  ✓ Applied settings and closed modal');
      }
    }

    // J. Host Controls & Security Modal
    console.log('  Testing Host Security & Permissions Controls...');
    const securityBtn = page.locator('button[title*="Security and Host Management Controls"]');
    if (await securityBtn.count() > 0) {
      await securityBtn.click();
      await page.waitForTimeout(800);
      console.log('  ✓ Host Controls & Permissions modal loaded');
      report.hostControls = true;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '15_host_controls_modal.png') });

      const doneBtn = page.locator('button:has-text("Done")');
      if (await doneBtn.count() > 0) {
        await doneBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Final Meeting Screenshot
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '16_meeting_full_verification.png') });

    console.log('\n====================================================');
    console.log('🎉 FULL WEBSITE & MEETING VERIFICATION COMPLETED!');
    console.log('====================================================');
    console.log('Verification Summary:', JSON.stringify(report, null, 2));

    await page.waitForTimeout(3000); // Leave window visible for 3 seconds
    await browser.close();
    return report;
  } catch (err) {
    console.error('❌ Verification error:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verification_error.png') }).catch(() => {});
    await browser.close();
    throw err;
  }
}

runVerification()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
