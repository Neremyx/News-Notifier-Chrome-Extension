# News Notifier Chrome Extension

A Chrome extension that keeps you updated with the latest news based on your interests using the NewsAPI.org service.

## Features

- Select your interests from official NewsAPI categories:
  - Business
  - Entertainment
  - Health
  - Science
  - Sports
  - Technology
- Modern dark theme interface
- Category filters for news history
- Receive desktop notifications for new articles
- Smart duplicate detection to avoid notification spam
- View news history within the extension
- One-click access to full articles

## Prerequisites

Before installing the extension, you need to get your API key:

1. Go to [NewsAPI.org](https://newsapi.org)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Note: The free plan has some limitations:
   - 100 requests per day
   - News updates every 24 hours
   - No real-time updates
   - Only works with development version of the extension

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Neremyx/News-Notifier-Chrome-Extension.git
   ```
2. Open `background.js` and replace the API key:
   ```javascript
   // ⚠️ IMPORTANT: Replace with your own NewsAPI key
   const apiKey = 'YOUR_API_KEY_HERE'
   ```
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked" and select the extension directory
6. Click the extension icon in the toolbar to configure your preferences

## Usage

1. Click the extension icon in the Chrome toolbar
2. Select the news categories you're interested in
3. Click "Update News" to fetch the latest news
4. Use the category filters in "Recent News" to filter by category
5. Click on any news title to read the full article

The extension will:

- Show desktop notifications for new articles
- Keep a history of recent news
- Cache news for one hour to optimize API usage
- Show 5 most recent articles per selected category

## How it Works

1. Initial Load:

   - Fetches news for selected categories
   - Shows a notification for the most recent article
   - Displays all articles in the Recent News section

2. News Updates:
   - News is cached for 1 hour due to NewsAPI limitations
   - New notifications only show for articles not previously shown
   - News history maintains the latest articles per category

## Permissions Used

- `storage`: To save your preferences and news cache
- `notifications`: To show desktop notifications
- `activeTab`: To open news articles when clicked

## Development Notes

If you want to modify the extension:

1. The API key is located in `background.js`:

   ```javascript
   // ⚠️ IMPORTANT: Replace with your own NewsAPI key
   const apiKey = 'YOUR_API_KEY_HERE'
   ```

2. Key files:

   - `popup.html`: Extension UI
   - `popup.js`: UI logic and news display
   - `background.js`: News fetching and notification handling

3. API Limitations (Free Plan):
   - 100 requests per day
   - News updates every 24 hours
   - Developer version only
