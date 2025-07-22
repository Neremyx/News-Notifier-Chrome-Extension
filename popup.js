let currentFilter = 'all'
let allNews = []

// Function to format the date
const formatDate = date => {
  return new Date(date).toLocaleString()
}

// Function to filter and display news
const filterAndDisplayNews = (news, category = 'all') => {
  const filteredNews = category === 'all' ? news : news.filter(item => item.category === category)

  const historyContainer = document.getElementById('news-history')
  if (!filteredNews || filteredNews.length === 0) {
    historyContainer.innerHTML = `
      <div class="news-item" style="text-align: center; color: #666;">
        <p>${
          category === 'all'
            ? 'No news available yet. Select your interests and click Update News.'
            : `No news available for ${category} category.`
        }</p>
      </div>
    `
    return
  }

  historyContainer.innerHTML = filteredNews
    .map(
      item => `
      <div class="news-item" data-category="${item.category}">
        <h3><a href="${item.url}" target="_blank" style="color: #4caf50; text-decoration: none;">
          ${item.title}
        </a></h3>
        <p>${item.description || ''}</p>
        <p style="color: #666; font-size: 11px; margin-top: 5px;">
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

// Function to display news
const displayNewsHistory = news => {
  allNews = news
  filterAndDisplayNews(news, currentFilter)
}

document.addEventListener('DOMContentLoaded', () => {
  // Load saved preferences and news history
  chrome.storage.sync.get(
    {
      interests: [],
      newsHistory: [],
    },
    items => {
      // Check the appropriate interest checkboxes
      items.interests.forEach(interest => {
        const checkbox = document.getElementById(interest)
        if (checkbox) {
          checkbox.checked = true
        }
      })

      // Display existing news history
      displayNewsHistory(items.newsHistory)
    }
  )

  // Set up category filter buttons
  document.getElementById('category-filter').addEventListener('click', e => {
    if (e.target.classList.contains('filter-button')) {
      currentFilter = e.target.dataset.category
      updateFilterButtons(currentFilter)
      filterAndDisplayNews(allNews, currentFilter)
    }
  })

  // Save preferences when the save button is clicked
  document.getElementById('save-button').addEventListener('click', () => {
    // Get all checked interests
    const interests = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(
      checkbox => checkbox.value
    )

    if (interests.length === 0) {
      alert('Please select at least one category')
      return
    }

    // Save preferences and request immediate news update
    chrome.storage.sync.set(
      {
        interests,
        lastUpdate: null,
        forceUpdate: true, // Force immediate update
      },
      () => {
        // Request immediate news update and show results
        chrome.runtime.sendMessage(
          {
            type: 'GET_IMMEDIATE_NEWS',
            interests: interests,
          },
          response => {
            if (response && response.news) {
              // Save and display the new articles
              chrome.storage.sync.set({
                newsHistory: response.news,
                lastShownNews: response.news.map(n => n.url),
              })
              displayNewsHistory(response.news)
            }
          }
        )

        // Show a success message
        const button = document.getElementById('save-button')
        button.textContent = 'News Updated!'
        button.style.backgroundColor = '#45a049'
        setTimeout(() => {
          button.textContent = 'Save Preferences'
          button.style.backgroundColor = '#4CAF50'
        }, 1500)
      }
    )
  })
})
