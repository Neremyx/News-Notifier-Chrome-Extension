let currentFilter = 'all'
let allNews = []

// Cache DOM elements
const elements = {
  historyContainer: null,
  saveButton: null,
  categoryFilter: null,
}

// Initialize DOM elements after page load
const initElements = () => {
  elements.historyContainer = document.getElementById('news-history')
  elements.saveButton = document.getElementById('save-button')
  elements.categoryFilter = document.getElementById('category-filter')
}

// Function to format the date
const formatDate = date => {
  return new Date(date).toLocaleString()
}

// Function to filter and display news
const filterAndDisplayNews = (news, category = 'all') => {
  const filteredNews = category === 'all' ? news : news.filter(item => item.category === category)

  if (!filteredNews || filteredNews.length === 0) {
    elements.historyContainer.innerHTML = `
      <div class="news-item no-news">
        <p>${
          category === 'all'
            ? 'No news available yet. Select your interests and click Update News.'
            : `No news available for ${category} category.`
        }</p>
      </div>
    `
    return
  }

  elements.historyContainer.innerHTML = filteredNews
    .map(
      item => `
      <div class="news-item" data-category="${item.category}">
        <h3><a href="${item.url}" target="_blank">
          ${item.title}
        </a></h3>
        <p>${item.description || ''}</p>
        <p class="news-meta">
          ${formatDate(item.publishedAt)} - ${item.category}
        </p>
      </div>
    `
    )
    .join('')
}

// Function to update filter buttons state
const updateFilterButtons = category => {
  document.querySelectorAll('.filter-button').forEach(button => {
    button.classList.toggle('active', button.dataset.category === category)
  })
}

// Function to display news (simplified)
const displayNews = news => {
  allNews = news
  filterAndDisplayNews(news, currentFilter)
}

// Function to show temporary success message
const showSuccessMessage = () => {
  const originalText = elements.saveButton.textContent
  const originalColor = elements.saveButton.style.backgroundColor

  elements.saveButton.textContent = 'News Updated!'
  elements.saveButton.style.backgroundColor = '#45a049'

  setTimeout(() => {
    elements.saveButton.textContent = originalText
    elements.saveButton.style.backgroundColor = originalColor
  }, 1500)
}

// Function to get checked interests
const getCheckedInterests = () => {
  return Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(
    checkbox => checkbox.value
  )
}

// Function to set checkboxes based on interests
const setInterestCheckboxes = interests => {
  interests.forEach(interest => {
    const checkbox = document.getElementById(interest)
    if (checkbox) {
      checkbox.checked = true
    }
  })
}

// Async function to load initial data
const loadInitialData = async () => {
  try {
    // Load interests and news history in parallel
    const [syncData, localData] = await Promise.all([
      new Promise(resolve => chrome.storage.sync.get({ interests: [] }, resolve)),
      new Promise(resolve => chrome.storage.local.get({ newsHistory: [] }, resolve)),
    ])

    // Set checkboxes and display news
    setInterestCheckboxes(syncData.interests)
    displayNews(localData.newsHistory)
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
}

// Async function to save preferences and update news
const savePreferencesAndUpdate = async () => {
  try {
    const interests = getCheckedInterests()

    if (interests.length === 0) {
      alert('Please select at least one category')
      return
    }

    // Disable button during operation
    elements.saveButton.disabled = true

    // Save preferences
    await new Promise(resolve => {
      chrome.storage.sync.set(
        {
          interests,
          lastUpdate: null,
          forceUpdate: true,
        },
        resolve
      )
    })

    // Request news update
    const response = await new Promise(resolve => {
      chrome.runtime.sendMessage(
        {
          type: 'GET_IMMEDIATE_NEWS',
          interests: interests,
        },
        resolve
      )
    })

    if (response && response.news) {
      // Save and display news
      await new Promise(resolve => {
        chrome.storage.local.set(
          {
            newsHistory: response.news,
            lastShownNews: response.news.map(n => n.url),
          },
          resolve
        )
      })
      displayNews(response.news)
    }

    showSuccessMessage()
  } catch (error) {
    console.error('Error saving preferences:', error)
    alert('Error updating news. Please try again.')
  } finally {
    elements.saveButton.disabled = false
  }
}

// Event handler for category filter clicks
const handleCategoryFilter = e => {
  if (e.target.classList.contains('filter-button')) {
    currentFilter = e.target.dataset.category
    updateFilterButtons(currentFilter)
    filterAndDisplayNews(allNews, currentFilter)
  }
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  initElements()
  loadInitialData()

  // Set up event listeners
  elements.categoryFilter.addEventListener('click', handleCategoryFilter)
  elements.saveButton.addEventListener('click', savePreferencesAndUpdate)
})
