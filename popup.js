document.addEventListener('DOMContentLoaded', async () => {
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  const { audioHistory = [] } = await chrome.storage.local.get('audioHistory');

  historyList.innerHTML = ''; 

  if (audioHistory.length === 0) {
    historyList.innerHTML = '<li class="empty-message">No audio has been played recently.</li>';
    return;
  }

  const openTabs = await chrome.tabs.query({});
  const openTabIds = new Set(openTabs.map(t => t.id));

  audioHistory.forEach(entry => {
    const li = document.createElement('li');
    const isTabOpen = openTabIds.has(entry.tabId);

    li.className = 'history-item';
    if (!isTabOpen) {
      li.classList.add('closed');
    }

    const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    li.innerHTML = `
      <img src="${entry.favIconUrl || 'icons/default_favicon.png'}" class="favicon" alt="">
      <div class="info">
        <div class="title">${entry.title}</div>
        <div class="meta">Played at ${time}</div>
      </div>
    `;

    if (isTabOpen) {
      li.addEventListener('click', () => {
        chrome.tabs.update(entry.tabId, { active: true });
        chrome.tabs.get(entry.tabId, (tab) => {
           chrome.windows.update(tab.windowId, { focused: true });
        });
      });
      li.title = "Click to go to this tab";
    } else {
       li.title = "This tab has been closed";
    }

    historyList.appendChild(li);
  });

  clearHistoryBtn.addEventListener('click', async () => {
    await chrome.storage.local.set({ audioHistory: [] });
    historyList.innerHTML = '<li class="empty-message">History cleared.</li>';
  });
});