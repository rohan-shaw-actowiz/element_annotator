// Send event to content script in the active tab
function sendEventToActiveTab(eventName) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0].id) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (eventName) => {
          window.dispatchEvent(new Event(eventName));
        },
        args: [eventName],
      });
    }
  });
}

document.getElementById("start-annotation").addEventListener("click", () => {
  sendEventToActiveTab("start-annotator");
});

document.getElementById("capture").addEventListener("click", () => {
  sendEventToActiveTab("capture-screenshot");
});
