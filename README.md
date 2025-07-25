# News Notifier Chrome Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Neremyx/News-Notifier-Chrome-Extension)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen.svg)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![NewsAPI](https://img.shields.io/badge/NewsAPI-Integration-red.svg)](https://newsapi.org)

A Chrome extension that keeps you updated with the latest news based on your interests using the NewsAPI.org service.

## Features

- **Multi-Category Selection**: Choose from up to 6 official NewsAPI categories simultaneously:
  - Business
  - Entertainment
  - Health
  - Science
  - Sports
  - Technology
- **Modern Dark Theme Interface**: Clean, responsive design with organized 2-column layout
- **Category Filters**: Filter news history by specific categories
- **Desktop Notifications**: Receive automatic notifications for new articles with click-to-read functionality
- **Automatic Updates**: Real-time popup updates when new articles are detected (no manual refresh needed)
- **Periodic News Checking**: Automatic background monitoring every 30 minutes for fresh content
- **Smart Duplicate Detection**: Advanced filtering to avoid notification spam
- **Local News History**: View and browse recent articles within the extension
- **One-Click Article Access**: Direct links to full articles
- **Optimized Storage Management**: Efficient handling of large datasets with hybrid storage strategy

## Prerequisites

Before installing the extension, you need to get your API key:

1. Go to [NewsAPI.org](https://newsapi.org)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Note: The free plan has some limitations:
   - 100 requests per day
   - Development use only
   - Standard news update frequency
   - No real-time breaking news alerts

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

1. **Initial Setup**:

   - Click the extension icon in the Chrome toolbar
   - Select the news categories you're interested in (up to 6 categories)
   - Click "Update News" to fetch the latest articles

2. **Browsing News**:

   - Use the category filter buttons in "Recent News" to view specific categories
   - Click "All" to see articles from all selected categories
   - Click on any article title to read the full story on the original website

3. **Notifications**:
   - Receive automatic desktop notifications when new articles are available
   - Click notifications to open articles directly
   - Notifications appear automatically every 30 minutes, when the browser starts, or when updating preferences
   - **Real-time Updates**: The popup automatically refreshes to show new articles without manual interaction

The extension will automatically:

- **Monitor for new articles every 30 minutes** with background checking system
- Cache news for one hour to optimize API usage and performance
- **Update the popup interface in real-time** when new articles are detected
- Handle multiple categories simultaneously without storage quota issues
- Keep a searchable history of recent articles
- Prevent duplicate notifications for the same articles
- Sync your category preferences across Chrome installations

## How it Works

1. Initial Load:

   - Fetches news for selected categories
   - Shows notifications for all new articles
   - Displays all articles in the Recent News section
   - Each article gets its own notification
   - Caches news data locally for better performance

2. **Storage Management**:

   - **User Preferences**: Synced across devices using Chrome sync storage
   - **News Data & Cache**: Stored locally for optimal performance with large datasets
   - **Smart Storage Strategy**: Hybrid approach prevents quota errors when using multiple categories
   - **Efficient Duplicate Detection**: Advanced filtering to avoid showing the same articles twice

3. **News Updates**:
   - **Automatic Background Monitoring**: Extension checks for new articles every 30 minutes automatically
   - **Smart Caching**: News cached locally for 1 hour to optimize API usage
   - **Multiple Triggers**: Updates occur periodically, when browser starts, preferences change, or manual refresh
   - **Real-time Popup Updates**: Interface automatically refreshes when new articles are detected
   - **Category Management**: Each category shows recent articles with efficient filtering
   - **Dynamic Filtering**: Real-time category filters in the popup interface

## Permissions Used

- **`storage`**:
  - **Sync storage**: For user preferences (selected categories) - synced across devices
  - **Local storage**: For news cache, history, and notification data - optimized for large datasets
- **`notifications`**: To show desktop notifications for new articles with click-to-read functionality
- **`activeTab`**: To open news articles in new tabs when clicked
- **`alarms`**: For periodic background checking of new articles every 30 minutes

## Development Notes

If you want to modify the extension:

1. The API key is located in `background.js`:

   ```javascript
   // ⚠️ IMPORTANT: Replace with your own NewsAPI key
   const apiKey = 'YOUR_API_KEY_HERE'
   ```

2. Key files:

   - `popup.html`: Extension UI
   - `popup.js`: UI logic, news display, and storage management
   - `background.js`: News fetching, notification handling, and service worker functionality

3. **Storage Strategy**:

   - **Preferences**: Chrome sync storage (for cross-device synchronization)
   - **News data**: Chrome local storage (for better performance with large datasets)
   - **Notifications**: Local storage (for quick access to article data)
   - **Hybrid Approach**: Prevents storage quota errors when using multiple categories simultaneously
   - **Real-time Updates**: Storage change listeners enable automatic popup refreshing

4. **Automatic Updates System**:

   - **Background Alarms**: Chrome alarms API triggers news checking every 30 minutes
   - **Storage Listeners**: Popup automatically detects and displays new articles
   - **Efficient Monitoring**: Smart caching prevents excessive API calls while maintaining freshness

5. **API Limitations (Free Plan)**:

   - 100 requests per day
   - Development use only
   - Standard update frequency
   - No real-time breaking news

6. **Background Processing**:
   - Service worker architecture for efficient resource usage
   - Automatic news checking every 30 minutes via Chrome alarms
   - Real-time popup updates using storage change listeners
   - Smart notification management to prevent spam
