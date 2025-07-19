// Ruby Browser - Advanced Multi-Tab Proxy Browser
// Quantum Services

// Global variables for tab management
let tabs = [];
let activeTabId = null;
let tabCounter = 0;

// Stealth mode functionality
function runStealthMode() {
  const title = "Calculator - Google Search";
  const icon = "ixlicon.png";
  const src = window.location.href;
  const popup = window.open("about:blank", "_blank");
  
  if (!popup || popup.closed) {
    alert("Popup blocked. Please allow popups for Stealth Mode to work.");
    return;
  }
  
  popup.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <link rel="icon" href="${icon}">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            background: #000;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe src="${src}"></iframe>
      </body>
    </html>
  `);
  
  popup.document.close();
  window.location.href = "https://www.ixl.com";
}

// Tab management functions
function createNewTab(url = null, title = 'New Tab') {
  const tabId = `tab-${++tabCounter}`;
  const tab = {
    id: tabId,
    title: title,
    url: url,
    isHome: !url,
    history: [],
    historyIndex: -1
  };
  
  tabs.push(tab);
  renderTabs();
  createTabContent(tabId);
  switchToTab(tabId);
  
  if (url) {
    loadUrlInTab(tabId, url);
  }
  
  return tabId;
}

function closeTab(tabId) {
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;
  
  // Remove tab from array
  tabs.splice(tabIndex, 1);
  
  // Remove tab content
  const tabContent = document.getElementById(`content-${tabId}`);
  if (tabContent) tabContent.remove();
  
  // Handle active tab switching
  if (tabs.length === 0) {
    createNewTab();
  } else if (activeTabId === tabId) {
    const newActiveIndex = Math.min(tabIndex, tabs.length - 1);
    switchToTab(tabs[newActiveIndex].id);
  }
  
  renderTabs();
}

function switchToTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Show selected tab content
  const tabContent = document.getElementById(`content-${tabId}`);
  if (tabContent) {
    tabContent.classList.add('active');
  }
  
  activeTabId = tabId;
  renderTabs();
  updateNavigationButtons();
}

function renderTabs() {
  const tabsList = document.getElementById('tabs-list');
  if (!tabsList) return;
  
  tabsList.innerHTML = '';
  
  tabs.forEach(tab => {
    const tabElement = document.createElement('div');
    tabElement.className = `side-tab ${tab.id === activeTabId ? 'active' : ''}`;
    
    // Generate favicon letter
    const favicon = tab.url ? tab.url.charAt(0).toUpperCase() : 'R';
    
    // Truncate long titles and URLs
    const displayTitle = tab.title.length > 25 ? tab.title.substring(0, 25) + '...' : tab.title;
    const displayUrl = tab.url ? 
      (tab.url.length > 35 ? tab.url.substring(0, 35) + '...' : tab.url) : 
      'Ruby Home';
    
    tabElement.innerHTML = `
      <div class="tab-favicon">${favicon}</div>
      <div class="tab-info">
        <div class="tab-title">${displayTitle}</div>
        <div class="tab-url">${displayUrl}</div>
      </div>
      <button class="tab-close" onclick="event.stopPropagation(); closeTab('${tab.id}')">
        <i class="bi bi-x"></i>
      </button>
    `;
    
    tabElement.onclick = (e) => {
      if (!e.target.closest('.tab-close')) {
        switchToTab(tab.id);
      }
    };
    
    tabsList.appendChild(tabElement);
  });
}

function createTabContent(tabId) {
  const contentArea = document.getElementById('tab-contents');
  if (!contentArea) return;
  
  const tabContent = document.createElement('div');
  tabContent.id = `content-${tabId}`;
  tabContent.className = 'tab-content';
  
  const tab = tabs.find(t => t.id === tabId);
  
  if (tab && tab.isHome) {
    tabContent.innerHTML = `
      <div class="welcome-screen">
        <h1 class="welcome-title">Ruby</h1>
        <p class="welcome-subtitle">Advanced Proxy Browser with Multi-Tab Support</p>
      </div>
    `;
  } else {
    tabContent.innerHTML = `<iframe title="Ruby Proxy View" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>`;
  }
  
  contentArea.appendChild(tabContent);
}

function loadUrlInTab(tabId, url) {
  const tabContent = document.getElementById(`content-${tabId}`);
  const iframe = tabContent?.querySelector('iframe');
  
  if (iframe) {
    // Show loading state
    showLoader();
    
    iframe.onload = function() {
      hideLoader();
      
      // Update tab history
      const tab = tabs.find(t => t.id === tabId);
      if (tab) {
        tab.history.push(url);
        tab.historyIndex = tab.history.length - 1;
        updateNavigationButtons();
      }
    };
    
    iframe.onerror = function() {
      hideLoader();
      console.error('Failed to load URL:', url);
    };
    
    iframe.src = url;
    
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      tab.isHome = false;
      tab.url = url;
    }
  }
}

function updateTabTitle(tabId, title) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.title = title.length > 20 ? title.substring(0, 20) + '...' : title;
    renderTabs();
  }
}

// URL generation and validation
function generateSearchUrl(query) {
  // Try to parse as URL first
  try {
    const url = new URL(query);
    return url.toString();
  } catch {
    // Try adding https://
    try {
      const url = new URL(`https://${query}`);
      if (url.hostname.includes('.')) {
        return url.toString();
      }
    } catch {}
  }
  
  // Default to DuckDuckGo search
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
}

function isURL(input) {
  try {
    const url = new URL(input.includes("://") ? input : "https://" + input);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

// Search and navigation handlers
function searchHandler(e) {
  e.preventDefault();
  
  const input = document.getElementById("urlInput");
  const value = input.value.trim();
  
  if (!value || typeof __uv$config === "undefined") return;
  
  let finalUrl = "";
  let title = "";
  
  if (isURL(value)) {
    const fullUrl = value.includes("://") ? value : "https://" + value;
    finalUrl = __uv$config.prefix + __uv$config.encodeUrl(fullUrl);
    title = new URL(fullUrl).hostname;
  } else {
    finalUrl = __uv$config.prefix + __uv$config.encodeUrl(generateSearchUrl(value));
    title = `Search: ${value}`;
  }
  
  // Check for blank mode
  const blankMode = document.getElementById("blankMode");
  if (blankMode && blankMode.checked) {
    const win = window.open("about:blank", "_blank");
    const iframe = win.document.createElement("iframe");
    iframe.style = "border:none;width:100vw;height:100vh;";
    iframe.src = finalUrl;
    win.document.body.style.margin = "0";
    win.document.body.appendChild(iframe);
  } else {
    // Load in current tab or create new tab
    if (!activeTabId || tabs.find(t => t.id === activeTabId)?.isHome) {
      createNewTab(finalUrl, title);
    } else {
      loadUrlInTab(activeTabId, finalUrl);
      updateTabTitle(activeTabId, title);
    }
  }
  
  input.value = "";
}

// Page loading functions
function loadPage(path) {
  const title = path.split('.')[0].charAt(0).toUpperCase() + path.split('.')[0].slice(1);
  
  if (!activeTabId || tabs.find(t => t.id === activeTabId)?.isHome) {
    createNewTab(path, title);
  } else {
    loadUrlInTab(activeTabId, path);
    updateTabTitle(activeTabId, title);
  }
}

function goHome() {
  if (activeTabId) {
    const tabContent = document.getElementById(`content-${activeTabId}`);
    if (tabContent) {
      tabContent.innerHTML = `
        <div class="welcome-screen">
          <h1 class="welcome-title">Ruby</h1>
          <p class="welcome-subtitle">Advanced Proxy Browser with Multi-Tab Support</p>
        </div>
      `;
    }
    
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) {
      tab.isHome = true;
      tab.title = 'Home';
      tab.url = null;
    }
    
    renderTabs();
  }
}

// Navigation controls
function updateNavigationButtons() {
  const backBtn = document.getElementById("backBtn");
  const forwardBtn = document.getElementById("forwardBtn");
  
  if (!activeTabId) return;
  
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;
  
  // Update button states based on history
  if (backBtn) {
    backBtn.disabled = tab.historyIndex <= 0;
    backBtn.style.opacity = tab.historyIndex <= 0 ? '0.5' : '1';
  }
  
  if (forwardBtn) {
    forwardBtn.disabled = tab.historyIndex >= tab.history.length - 1;
    forwardBtn.style.opacity = tab.historyIndex >= tab.history.length - 1 ? '0.5' : '1';
  }
}

function navigateBack() {
  if (!activeTabId) return;
  
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab || tab.historyIndex <= 0) return;
  
  const iframe = document.querySelector(`#content-${activeTabId} iframe`);
  if (iframe) {
    try {
      iframe.contentWindow.history.back();
      tab.historyIndex--;
      updateNavigationButtons();
    } catch (e) {
      console.warn('Cannot navigate back:', e);
    }
  }
}

function navigateForward() {
  if (!activeTabId) return;
  
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab || tab.historyIndex >= tab.history.length - 1) return;
  
  const iframe = document.querySelector(`#content-${activeTabId} iframe`);
  if (iframe) {
    try {
      iframe.contentWindow.history.forward();
      tab.historyIndex++;
      updateNavigationButtons();
    } catch (e) {
      console.warn('Cannot navigate forward:', e);
    }
  }
}

function refreshPage() {
  if (!activeTabId) return;
  
  const iframe = document.querySelector(`#content-${activeTabId} iframe`);
  if (iframe) {
    try {
      iframe.contentWindow.location.reload();
    } catch (e) {
      // Fallback: reload by resetting src
      iframe.src = iframe.src;
    }
  }
}

// Utility functions
function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'block';
  }
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  }
}

function updateBatteryStatus() {
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      function updateBattery() {
        const level = `${Math.round(battery.level * 100)}%`;
        const batteryElement = document.getElementById("battery");
        if (batteryElement) {
          batteryElement.textContent = level;
        }
      }
      
      updateBattery();
      battery.addEventListener("levelchange", updateBattery);
    });
  }
}

function updateTime() {
  const now = new Date();
  const timeText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const timeElement = document.getElementById("time");
  if (timeElement) {
    timeElement.textContent = timeText;
  }
}

function waitForUVConfig(callback) {
  if (typeof __uv$config !== "undefined") {
    callback();
  } else {
    setTimeout(() => waitForUVConfig(callback), 50);
  }
}

// Enhanced meteor animation
function spawnMeteor() {
  const meteorZone = document.getElementById("meteorZone");
  if (!meteorZone) return;
  
  meteorZone.innerHTML = "";
  
  const meteor = document.createElement("div");
  meteor.className = "meteor";
  meteor.style.left = Math.random() * window.innerWidth + "px";
  meteor.style.top = "0px";
  
  // Add ruby-themed styling
  meteor.style.background = "linear-gradient(45deg, #dc2626, #ef4444)";
  meteor.style.boxShadow = "0 0 15px rgba(220, 38, 127, 0.8)";
  
  meteorZone.appendChild(meteor);
  
  // Remove meteor after animation
  setTimeout(() => {
    if (meteor.parentNode) {
      meteor.parentNode.removeChild(meteor);
    }
  }, 3000);
}

// Main initialization function
window.onload = function() {
  console.log('🔴 Ruby Browser - Initializing...');
  
  // Hide loader and show content
  const loader = document.getElementById('loader');
  const content = document.getElementById('content');
  
  if (loader) loader.style.display = 'none';
  if (content) content.style.display = 'block';
  
  // Initialize first tab
  createNewTab();
  
  // Setup stealth mode
  const stealthEnabled = JSON.parse(localStorage.getItem("stealthModeEnabled")) || false;
  const checkbox = document.getElementById("blankMode");
  
  if (checkbox) {
    checkbox.checked = stealthEnabled;
    if (stealthEnabled) runStealthMode();
    
    checkbox.addEventListener("change", function() {
      const isChecked = checkbox.checked;
      localStorage.setItem("stealthModeEnabled", JSON.stringify(isChecked));
      if (isChecked) runStealthMode();
    });
  }
  
  // Setup battery and time updates
  updateBatteryStatus();
  updateTime();
  setInterval(updateTime, 1000);
  
  // Setup meteor spawning
  spawnMeteor();
  setInterval(spawnMeteor, 10000);
  
  // Wait for UV config and setup search
  waitForUVConfig(() => {
    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
      searchForm.addEventListener("submit", searchHandler);
    }
  });
  
  // Setup navigation controls
  const backBtn = document.getElementById("backBtn");
  const forwardBtn = document.getElementById("forwardBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  
  if (backBtn) {
    backBtn.onclick = navigateBack;
  }
  
  if (forwardBtn) {
    forwardBtn.onclick = navigateForward;
  }
  
  if (refreshBtn) {
    refreshBtn.onclick = refreshPage;
  }
  
  // Setup link handlers for internal navigation
  document.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http')) {
        e.preventDefault();
        loadPage(href);
      }
    });
  });
  
  console.log('🔴 Ruby Browser - Ready!');
};

// Expose global functions for HTML onclick handlers
window.createNewTab = createNewTab;
window.closeTab = closeTab;
window.switchToTab = switchToTab;
window.loadPage = loadPage;
window.goHome = goHome;
window.runStealthMode = runStealthMode;

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl+T: New tab
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    createNewTab();
  }
  
  // Ctrl+W: Close tab
  if (e.ctrlKey && e.key === 'w') {
    e.preventDefault();
    if (activeTabId) closeTab(activeTabId);
  }
  
  // Ctrl+R: Refresh
  if (e.ctrlKey && e.key === 'r') {
    e.preventDefault();
    refreshPage();
  }
  
  // Alt+Left: Back
  if (e.altKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    navigateBack();
  }
  
  // Alt+Right: Forward
  if (e.altKey && e.key === 'ArrowRight') {
    e.preventDefault();
    navigateForward();
  }
});

console.log('🔴 Ruby Browser JS - Loaded!');
