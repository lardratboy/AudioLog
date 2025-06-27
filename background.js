const MAX_LOG_ENTRIES = 50;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.audible === true) {
    console.log(`Tab ${tab.id} started playing audio: ${tab.title}`);
    addTabToHistory(tab);
  }
});

async function addTabToHistory(tab) {
  const result = await chrome.storage.local.get({ audioHistory: [] });
  let history = result.audioHistory;

  // Prevent logging if the most recent entry is for the same tab ID
  if (history.length > 0 && history[0].tabId === tab.id) {
    return;
  }
  
  const newEntry = {
    tabId: tab.id,
    title: tab.title,
    url: tab.url,
    favIconUrl: tab.favIconUrl,
    timestamp: new Date().toISOString()
  };

  history.unshift(newEntry);

  if (history.length > MAX_LOG_ENTRIES) {
    history = history.slice(0, MAX_LOG_ENTRIES);
  }

  await chrome.storage.local.set({ audioHistory: history });
}