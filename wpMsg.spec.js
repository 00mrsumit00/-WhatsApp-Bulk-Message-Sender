import { test, expect } from '@playwright/test';
const ExcelJS = require('exceljs');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============= CONFIGURATION =============
const CONFIG = {
  USER_DATA_DIR: 'C:/Users/amepa/OneDrive/Desktop/PLAYWRIGHT/playwright-whatsapp-msg/session_data',
  EXCEL_FILE_PATH: 'C:/Users/amepa/OneDrive/Desktop/PLAYWRIGHT/playwright-whatsapp-msg/DB/wp-contact.xlsx',
  DELAYS: {
    AFTER_SEND: 1000,        // Wait after sending message
    BETWEEN_ACTIONS: 1000,   // General delay between actions
    TYPING_SIMULATION: 500, // Simulate typing time
    NEW_CHAT: 1000,          // Wait for contact search
  },
  RESUME_FROM_LAST: true,    // Skip contacts already marked as "✅Done" or "❌Failed"
  TAKE_SCREENSHOTS: false,   // Set to true to save screenshots
  SCREENSHOT_DIR: './screenshots'
};

// ============= UTILITY FUNCTIONS =============
function logWithTimestamp(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    'info': '📋',
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'progress': '🔄'
  }[type] || 'ℹ️';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function createScreenshotDir() {
  if (CONFIG.TAKE_SCREENSHOTS && !fs.existsSync(CONFIG.SCREENSHOT_DIR)) {
    fs.mkdirSync(CONFIG.SCREENSHOT_DIR, { recursive: true });
  }
}

function validateExcelFile() {
  if (!fs.existsSync(CONFIG.EXCEL_FILE_PATH)) {
    throw new Error(`Excel file not found at: ${CONFIG.EXCEL_FILE_PATH}`);
  }
}

// ============= MAIN TEST FUNCTION =============
test('WhatsApp Bulk Message Sender', async () => {
  logWithTimestamp('Starting WhatsApp Bulk Message Sender...', 'info');
  
  // Validate setup
  validateExcelFile();
  createScreenshotDir();
  
  // Load Excel workbook
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(CONFIG.EXCEL_FILE_PATH);
  const worksheet = workbook.getWorksheet(1);
  
  if (!worksheet) {
    throw new Error('Worksheet not found in Excel file');
  }

  logWithTimestamp(`Found ${worksheet.rowCount - 1} contacts in Excel file`, 'info');
  
  // Start processing
  await processBulkMessages(worksheet, workbook);
  
  logWithTimestamp('Bulk messaging completed!', 'success');
});

// ============= BROWSER & PROCESSING =============
async function processBulkMessages(worksheet, workbook) {
  // Launch browser with persistent context (keeps WhatsApp logged in)
  const browser = await chromium.launchPersistentContext(CONFIG.USER_DATA_DIR, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com');
  
  logWithTimestamp('Waiting for WhatsApp to load...', 'progress');
  logWithTimestamp('Please ensure WhatsApp is logged in, then press Resume in browser', 'warning');
  
  // Wait for user to confirm WhatsApp is ready
  await page.pause();

  // Statistics tracking
  const stats = {
    total: 0,
    sent: 0,
    failed: 0,
    skipped: 0
  };

  // Process each row
  for (let currentRow = 2; currentRow <= worksheet.rowCount; currentRow++) {
    const row = worksheet.getRow(currentRow);
    
    // Read contact data
    const contact = {
      srNo: (row.getCell(1).value || '').toString().trim(),
      name: (row.getCell(2).value || '').toString().trim(),
      contactNo: (row.getCell(3).value || '').toString().trim(),
      message: (row.getCell(4).value || '').toString().trim(),
      status: (row.getCell(5).value || '').toString().trim()
    };

    // Skip empty rows
    if (!contact.contactNo || !contact.message) {
      logWithTimestamp(`Row ${currentRow}: Skipping empty contact`, 'warning');
      continue;
    }

    stats.total++;

    // Skip already processed contacts (if resume mode is enabled)
    if (CONFIG.RESUME_FROM_LAST && (contact.status === '✅Done' || contact.status === '❌Failed')) {
      logWithTimestamp(`Row ${currentRow}: Skipping ${contact.name} (already ${contact.status})`, 'info');
      stats.skipped++;
      continue;
    }

    // Send message
    logWithTimestamp(`Processing ${stats.total}: ${contact.name} (${contact.contactNo})`, 'progress');
    
    const status = await sendWhatsappMessage(page, contact, currentRow);
    
    // Update Excel with status
    row.getCell(5).value = status;
    row.commit();
    await workbook.xlsx.writeFile(CONFIG.EXCEL_FILE_PATH);

    // Update statistics
    if (status === '✅Done') {
      stats.sent++;
    } else {
      stats.failed++;
    }

    // Close chat and wait before next message
    await page.keyboard.press('Escape');
    await page.waitForTimeout(CONFIG.DELAYS.AFTER_SEND);
  }

  // Display final statistics
  logWithTimestamp('='.repeat(50), 'info');
  logWithTimestamp('FINAL STATISTICS:', 'info');
  logWithTimestamp(`Total Contacts: ${stats.total}`, 'info');
  logWithTimestamp(`Successfully Sent: ${stats.sent}`, 'success');
  logWithTimestamp(`Failed: ${stats.failed}`, 'error');
  logWithTimestamp(`Skipped: ${stats.skipped}`, 'warning');
  logWithTimestamp('='.repeat(50), 'info');

  await page.pause();

  await page.waitForTimeout(3000);
  await browser.close();
}

// ============= MESSAGE SENDING FUNCTION =============
async function sendWhatsappMessage(page, contact, rowNumber) {
  try {
    // Open new chat
    await page.waitForTimeout(CONFIG.DELAYS.BETWEEN_ACTIONS);
    await page.getByLabel('New chat', { exact: true }).click();
    await page.waitForTimeout(200);

    // Search for contact
    await page.getByRole('textbox').first().fill(contact.contactNo);
    await page.waitForTimeout(CONFIG.DELAYS.NEW_CHAT);

    // Check if contact exists on WhatsApp
    const noResults = await page.locator("text=No results found").count();
    
    if (noResults > 0) {
      logWithTimestamp(`Contact ${contact.contactNo} (${contact.name}) not found on WhatsApp`, 'error');
      return "❌Failed";
    }

    // Select contact
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Type and send message
    await page.locator('#main').getByRole('textbox').fill(contact.message);
    await page.waitForTimeout(CONFIG.DELAYS.TYPING_SIMULATION);
    
    await page.locator('#main').getByRole('button', { name: 'Send' }).click();
    await page.waitForTimeout(100);

    // Take screenshot if enabled
    if (CONFIG.TAKE_SCREENSHOTS) {
      const screenshotPath = path.join(CONFIG.SCREENSHOT_DIR, `${rowNumber}_${contact.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      logWithTimestamp(`Screenshot saved: ${screenshotPath}`, 'info');
    }

    logWithTimestamp(`Message sent to ${contact.srNo} - ${contact.name}`, 'success');
    return "✅Done";

  } catch (error) {
    logWithTimestamp(`Error sending to ${contact.name}: ${error.message}`, 'error');
    return "❌Failed";
  }

}