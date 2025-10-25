# 📱 WhatsApp Bulk Message Sender

An automated tool to send personalized WhatsApp messages in bulk using Playwright. Perfect for businesses, schools, or anyone needing to send mass notifications via WhatsApp Web.

<img width="1600" height="856" alt="image" src="https://github.com/user-attachments/assets/58698a0f-89c4-44ea-959d-e81fc7b84327" />



## ✨ Features

- 📊 **Excel Integration** - Read contacts and messages from Excel file
- 🔄 **Auto Resume** - Skip already sent messages
- 📈 **Progress Tracking** - Real-time status updates
- ✅ **Status Updates** - Automatically marks "Done" or "Failed" in Excel
- 🖼️ **Screenshot Support** - Optional screenshot capture
- ⚡ **Smart Delays** - Configurable delays to avoid WhatsApp blocks
- 📝 **Detailed Logging** - Timestamped logs with statistics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Visual Studio Code** - [Download here](https://code.visualstudio.com/)
- **WhatsApp Account** - Active WhatsApp account with phone number

## 🚀 Quick Start Guide

### Step 1: Create Project Folder

Create a new folder and open it in VS Code:

```bash
# Create folder
mkdir whatsapp-bulk-sender
cd whatsapp-bulk-sender

# Open in VS Code
code .
```

### Step 2: Initialize Playwright

Open the **VS Code Terminal** (`Terminal > New Terminal` or `` Ctrl+` ``) and run:

```bash
npm init playwright@latest
```

When prompted, choose:
- ✅ Do you want to use TypeScript or JavaScript? → **JavaScript**
- ✅ Where to put your end-to-end tests? → **tests** (press Enter)
- ✅ Add a GitHub Actions workflow? → **No**
- ✅ Install Playwright browsers? → **Yes**

This will automatically create:
```
whatsapp-bulk-sender/
├── tests/
│   └── example.spec.js
├── playwright.config.js
├── package.json
└── package-lock.json
```

### Step 3: Replace the Script

1. Delete or replace the content of `tests/example.spec.js`
2. Copy and paste the script from below (or download `wpMsg.spec.js` from this repository)
3. Save the file

**📥 Script:** Copy the content from [`wpMsg.spec.js`](./wpMsg.spec.js) in this repository

### Step 4: Create Database Folder

In VS Code terminal, create the DB folder:

```bash
mkdir DB
```

Then:
1. Download the sample Excel file: [`wp-contact.xlsx`](./wp-contact.xlsx)
2. Place it inside the `DB/` folder

**OR** create your own Excel file with this format:

| Sr No | Name        | Contact No    | Message                | Status |
|-------|-------------|---------------|------------------------|--------|
| 1     | John Doe    | 919876543210  | Hello John!            |        |
| 2     | Jane Smith  | 918765432109  | Hi Jane, how are you?  |        |

**Important:** 
- Column A: Serial Number
- Column B: Name
- Column C: Phone number with country code (no + or spaces)
- Column D: Your custom message
- Column E: Leave empty (auto-filled by script)

### Step 5: Configure Playwright

Open `playwright.config.js` and find the `use:` section. Update it to:

```javascript
use: {
  /* Base URL to use in actions like `await page.goto('/')`. */
  // baseURL: 'http://127.0.0.1:3000',

  /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
  trace: 'on-first-retry',
  
  headless: false,  // Run tests with visible browser
  browserName: 'chromium',  // Use Chrome browser
},
```

### Step 6: Update Script Configuration

Open `tests/example.spec.js` (or `tests/wpMsg.spec.js`) and update paths:

```javascript
const CONFIG = {
  USER_DATA_DIR: './session_data',           // WhatsApp session storage
  EXCEL_FILE_PATH: './DB/wp-contact.xlsx',   // Your Excel file path
  DELAYS: {
    AFTER_SEND: 5000,        // Wait after sending (5 seconds)
    BETWEEN_ACTIONS: 1000,   // General delay (1 second)
    TYPING_SIMULATION: 2800, // Typing simulation (2.8 seconds)
    NEW_CHAT: 2000,          // Contact search delay (2 seconds)
  },
  RESUME_FROM_LAST: true,    // Skip already processed contacts
  TAKE_SCREENSHOTS: false,   // Set true to save screenshots
  SCREENSHOT_DIR: './screenshots'
};
```

### Step 7: Install ExcelJS

Install the required Excel library:

```bash
npm install exceljs
```

### Step 8: Run the Tool

Run the script using:

```bash
npx playwright test tests/example.spec.js --headed
```

**OR** if you renamed the file:

```bash
npx playwright test
```

### Step 9: Login to WhatsApp

1. Browser will open automatically
2. Go to WhatsApp Web and scan the QR code
3. Wait for WhatsApp to fully load
4. **Press the "Resume" button** in the Playwright debug toolbar OR **Press the "F8" on Keyboard**
5. Automation will start! ✨

## 📁 Final Project Structure

After setup, your folder should look like:

```
whatsapp-bulk-sender/
│
├── tests/
│   └── example.spec.js (or wpMsg.spec.js)    # Main automation script
│
├── DB/
│   └── wp-contact.xlsx                       # Excel file with contacts
│
├── session_data/                             # WhatsApp session (auto-created)
│
├── screenshots/                              # Screenshots (if enabled)
│
├── node_modules/                             # Dependencies (auto-created)
│
├── playwright.config.js                      # Playwright configuration
│
├── package.json                              # Project info
│
└── package-lock.json                         # Dependency lock file
```

## 📝 Excel File Format Explained

Your Excel file **MUST** follow this exact format:

| Column | Name       | Description                          | Example          |
|--------|------------|--------------------------------------|------------------|
| A      | Sr No      | Serial number                        | 1, 2, 3...       |
| B      | Name       | Contact name                         | John Doe         |
| C      | Contact No | Phone with country code (no +)       | 919876543210     |
| D      | Message    | Custom message for each contact      | Hello John!      |
| E      | Status     | Leave empty (auto-filled)            | Done/Failed      |

**Phone Number Format:**
- ✅ Correct: `919876543210` (country code + number)
- ❌ Wrong: `+91 9876543210` or `9876543210`

## 🎯 Understanding the Output

### Console Output

```
[10:30:45] 📋 Starting WhatsApp Bulk Message Sender...
[10:30:46] 📋 Found 50 contacts in Excel file
[10:30:50] 🔄 Processing 1: John Doe (919876543210)
[10:30:55] ✅ Message sent to 1 - John Doe
[10:31:00] 🔄 Processing 2: Jane Smith (918765432109)
[10:31:05] ❌ Contact 918765432109 (Jane Smith) not found on WhatsApp
...
[10:45:30] 📋 ==================================================
[10:45:30] 📋 FINAL STATISTICS:
[10:45:30] 📋 Total Contacts: 50
[10:45:30] ✅ Successfully Sent: 48
[10:45:30] ❌ Failed: 2
[10:45:30] ⚠️  Skipped: 0
[10:45:30] 📋 ==================================================
```

### Excel Status Updates

After running, column E will be updated:
- **Done** ✅ - Message sent successfully
- **Failed** ❌ - Contact not found or error occurred

## ⚙️ Configuration Options

Edit these settings in the script (`CONFIG` section):

```javascript
const CONFIG = {
  // Adjust delays (in milliseconds)
  DELAYS: {
    AFTER_SEND: 5000,        // Increase to 8000-10000 for safety
    BETWEEN_ACTIONS: 1000,   
    TYPING_SIMULATION: 2800, 
    NEW_CHAT: 2000,          
  },
  
  RESUME_FROM_LAST: true,    // Set false to reprocess all contacts
  TAKE_SCREENSHOTS: true,    // Set true to save screenshots
};
```

## 🔧 Troubleshooting

### Issue: "Cannot find module 'exceljs'"
**Solution:** 
```bash
npm install exceljs
```

### Issue: "Contact not found on WhatsApp"
**Solution:** Check phone number format. Must include country code without '+' or spaces.
- ✅ Correct: `919876543210`
- ❌ Wrong: `+91 9876543210`

### Issue: WhatsApp keeps logging out
**Solution:** Don't delete the `session_data` folder. It stores your login session.

### Issue: Getting blocked by WhatsApp
**Solution:** Increase delays in CONFIG:
```javascript
DELAYS: {
  AFTER_SEND: 10000,  // Increase to 10 seconds
}
```

### Issue: Script not finding Excel file
**Solution:** Make sure:
1. Excel file is in `DB/wp-contact.xlsx`
2. Path in script matches: `EXCEL_FILE_PATH: './DB/wp-contact.xlsx'`

## ⚠️ Important Safety Tips

1. **Test First**: Start with 2-3 contacts to ensure everything works
2. **Slow Down**: Use 8-10 second delays between messages
3. **Daily Limits**: Don't send more than 100-200 messages per day
4. **Personalize**: Avoid sending identical messages to everyone
5. **Backup**: Keep a backup copy of your Excel file
6. **Resume Feature**: Use `RESUME_FROM_LAST: true` to avoid duplicates

## 📚 Command Reference

```bash
# Run the automation (visible browser)
npx playwright test tests/example.spec.js --headed

# Run in background (headless mode)
npx playwright test tests/example.spec.js

# Run specific test file
npx playwright test tests/wpMsg.spec.js --headed

# Install additional browsers
npx playwright install

# Update Playwright
npm install -D @playwright/test@latest
```

## 🎥 Video Tutorial

> 📹 Coming soon! Check the [Issues](../../issues) page for updates.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**Important:**
- This tool is for educational and personal use only
- Use responsibly and follow WhatsApp's Terms of Service
- The developers are not responsible for misuse or account bans
- Respect recipients' privacy and consent
- Avoid spam or unsolicited messages

## 🌟 Show Your Support

If this project helped you, please give it a ⭐️!

## 📞 Need Help?

- 📖 [Check Documentation](../../wiki)
- 🐛 [Report Issues](../../issues)
- 💬 [Discussions](../../discussions)

---

**Made with ❤️ by [Your Name]**

### Quick Links
- [Download Sample Excel](./DB/wp-contact.xlsx)
- [View Script](./tests/wpMsg.spec.js)
- [Configuration Guide](#configuration-options)
