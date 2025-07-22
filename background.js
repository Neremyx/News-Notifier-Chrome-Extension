// Store hashes of previously shown news to avoid duplicates
let seenNewsHashes = new Set()

// Function to hash the content of a news article
function hashNewsContent(title, description) {
  const str = title + description
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString()
}

// Function to check if news content is similar to previously shown news
function isNewContent(title, description) {
  const hash = hashNewsContent(title, description)
  if (seenNewsHashes.has(hash)) {
    return false
  }
  seenNewsHashes.add(hash)
  // Keep the size of the set manageable
  if (seenNewsHashes.size > 1000) {
    seenNewsHashes.clear()
  }
  return true
}

// Function to fetch news based on preferences
async function fetchNews(interests) {
  try {
    // ⚠️ IMPORTANT: Replace with your own NewsAPI key from https://newsapi.org
    const apiKey = 'YOUR_API_KEY_HERE'

    // Get last update time from storage
    const { lastUpdate, forceUpdate } = await chrome.storage.sync.get(['lastUpdate', 'forceUpdate'])
    const now = new Date().getTime()

    // If not forcing update and last update was less than 1 hour ago, return cached news
    if (!forceUpdate && lastUpdate && now - lastUpdate < 3600000) {
      const { cachedNews } = await chrome.storage.sync.get('cachedNews')
      if (cachedNews && cachedNews.length > 0) {
        return cachedNews
      }
    }

    // Clear forceUpdate flag
    await chrome.storage.sync.remove('forceUpdate')

    // Make parallel requests for each category
    const newsPromises = interests.map(async category => {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=5&apiKey=${apiKey}`,
        {
          headers: {
            'X-Api-Key': apiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.articles.map(article => ({
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        publishedAt: article.publishedAt,
        category: category,
      }))
    })

    // Wait for all requests to complete
    const newsArrays = await Promise.all(newsPromises)

    // Get 5 most recent articles from each category
    const allNews = newsArrays.reduce((acc, categoryNews, index) => {
      // Sort articles by date for this category
      const sortedNews = categoryNews
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 5) // Keep 5 most recent from each category
      return [...acc, ...sortedNews]
    }, [])

    // Cache the results
    await chrome.storage.sync.set({
      cachedNews: allNews,
      lastUpdate: now,
    })

    return allNews
  } catch (error) {
    console.error('Error fetching news:', error)
    // Try to return cached news if available
    const { cachedNews } = await chrome.storage.sync.get('cachedNews')
    return cachedNews || []
  }
}

// Function to show notification
function showNewsNotification(newsItem) {
  if (!newsItem || !newsItem.url) {
    console.error('Invalid news item:', newsItem)
    return
  }

  console.log('Preparing notification for:', newsItem.title)

  const notificationId = btoa(newsItem.url).slice(0, 20)
  const notificationOptions = {
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: newsItem.title || 'News Update',
    message: newsItem.description || 'Click to read more',
    contextMessage: `Category: ${newsItem.category}`,
    buttons: [{ title: 'Read More' }],
    requireInteraction: false,
    priority: 2,
  }

  // First store the news item
  chrome.storage.local
    .set({ [notificationId]: newsItem })
    .then(() => {
      // Then create the notification
      return chrome.notifications.create(notificationId, notificationOptions)
    })
    .then(() => {
      console.log('Notification created successfully')
    })
    .catch(error => {
      console.error('Error showing notification:', error)
    })
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_IMMEDIATE_NEWS') {
    fetchNews(message.interests)
      .then(news => {
        if (news && news.length > 0) {
          // Store the URLs of shown news to avoid duplicates
          chrome.storage.sync
            .set({
              lastShownNews: news.map(n => n.url),
              newsHistory: news,
            })
            .then(() => {
              // Show notification for the most recent news
              showNewsNotification(news[0])

              // Send news back to popup
              sendResponse({ news })

              // Log for debugging
              console.log('Showing notification for:', news[0].title)
            })
        } else {
          console.log('No news available to show')
          sendResponse({ news: [] })
        }
      })
      .catch(error => {
        console.error('Error fetching news:', error)
        sendResponse({ news: [] })
      })
    return true // Will respond asynchronously
  }
})

// Listen for notification clicks and button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    openNewsUrl(notificationId)
  }
})

// Also handle clicking on the notification itself
chrome.notifications.onClicked.addListener(notificationId => {
  openNewsUrl(notificationId)
})

// Helper function to open news URL
function openNewsUrl(notificationId) {
  chrome.storage.local.get([notificationId], function (result) {
    if (result[notificationId]) {
      const newsItem = result[notificationId]
      chrome.tabs.create({
        url: newsItem.url,
        active: true,
      })
      // Clear the notification but keep the history
      chrome.notifications.clear(notificationId)
    } else {
      console.error('No news item found for notification:', notificationId)
    }
  })
}

// Service worker self-registration and error handling
self.addEventListener('install', event => {
  console.log('Service Worker installing.')
  event.waitUntil(
    // Clear cache and stored data on install
    Promise.all([
      chrome.storage.sync.clear(),
      chrome.storage.local.clear(),
      self.skipWaiting(), // Activate service worker immediately
    ])
  )
})

self.addEventListener('activate', event => {
  console.log('Service Worker activating.')
  event.waitUntil(
    // Ensure the service worker takes control immediately
    self.clients.claim()
  )
})

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  // Reset all storage on extension install/update
  chrome.storage.sync.clear()
  chrome.storage.local.clear()
})

// Listen for preference updates and check news immediately
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_PREFERENCES') {
    // Check news immediately after preferences update
    chrome.storage.sync.get(['interests'], async ({ interests }) => {
      if (interests && interests.length > 0) {
        const news = await fetchNews(interests)
        if (news && news.length > 0) {
          showNewsNotification(news[0])
        }
      }
    })
  }
})
