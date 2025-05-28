// let selectionActive = false;
// let overlay = null;
// let annotations = [];

// // send capture-screenshot event to window
// document.addEventListener("keydown", e => {
//   if (e.key === "Escape") {
//     window.dispatchEvent(new Event("capture-screenshot"));
//   }
// });

// if (document.getElementById("capturescreenshot")){
//   document.getElementById("capturescreenshot").addEventListener("click", () => {
//     window.dispatchEvent(new Event("capture-screenshot"));
// });
// }

// // Get a unique CSS selector for an element
// function getUniqueSelector(el) {
//   if (el.id) return `#${el.id}`;
//   if (el.className && typeof el.className === 'string') {
//     return `${el.tagName.toLowerCase()}.${el.className.trim().replace(/\s+/g, '.')}`;
//   }
//   return el.tagName.toLowerCase();
// }

// function getElementXPath(element) {
//   if (element.id !== '') {
//     return `//*[@id="${element.id}"]`;
//   }

//   const parts = [];

//   while (element && element.nodeType === Node.ELEMENT_NODE) {
//     let index = 1;
//     let sibling = element.previousSibling;

//     while (sibling) {
//       if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
//         index++;
//       }
//       sibling = sibling.previousSibling;
//     }

//     const tagName = element.nodeName.toLowerCase();
//     const part = `${tagName}[${index}]`;
//     parts.unshift(part);

//     element = element.parentNode;
//   }

//   return '/' + parts.join('/');
// }

// // Create transparent overlay to show selection mode
// function createOverlay() {
//   overlay = document.createElement("div");
//   overlay.style.position = "fixed";
//   overlay.style.top = 0;
//   overlay.style.left = 0;
//   overlay.style.width = "100vw";
//   overlay.style.height = "100vh";
//   overlay.style.zIndex = 9998;
//   overlay.style.background = "rgba(0,0,0,0.05)";
//   overlay.style.pointerEvents = "none"; // Let clicks pass through
//   document.body.appendChild(overlay);
// }

// function createDoneButton() {
//   const doneBtn = document.createElement("button");
//   doneBtn.innerText = "To save press escape key or esc key";
//   doneBtn.style.position = "fixed";
//   doneBtn.style.top = "10px";
//   doneBtn.style.right = "10px";
//   doneBtn.style.zIndex = 100000;
//   doneBtn.style.padding = "8px 12px";
//   doneBtn.style.background = "#333";
//   doneBtn.style.color = "#fff";
//   doneBtn.style.border = "none";
//   doneBtn.style.borderRadius = "4px";
//   doneBtn.style.cursor = "pointer";
//   doneBtn.style.pointerEvents = "all";
//   doneBtn.id = "capturescreenshot";
//   // doneBtn.onclick = stopAnnotationMode;
//   document.body.appendChild(doneBtn);
// }

// function startAnnotationMode() {
//   if (selectionActive) return;
//   selectionActive = true;
//   annotations = [];

//   document.body.style.cursor = "crosshair";
//   createOverlay();
//   createDoneButton();

//   document.addEventListener("mouseover", onMouseOver);
//   document.addEventListener("mouseout", onMouseOut);
//   document.addEventListener("click", onClick, true); // use capture phase!

// }

// function stopAnnotationMode() {
//   alert("Screenshot & Annotations saved!");
//   selectionActive = false;
//   document.body.style.cursor = "default";
//   if (overlay) overlay.remove();
//   const btn = document.getElementById("capturescreenshot");
//   if (btn) btn.remove();
//   document.removeEventListener("mouseover", onMouseOver);
//   document.removeEventListener("mouseout", onMouseOut);
//   document.removeEventListener("click", onClick, true);
// }

// let lastHoveredElement = null;

// function onMouseOver(e) {
//   if (lastHoveredElement && lastHoveredElement !== e.target) {
//     lastHoveredElement.style.outline = "";
//   }

//   const el = e.target;

//   if (el && el !== overlay && el.id !== "capturescreenshot") {
//     el.style.outline = "2px dashed red";
//     lastHoveredElement = el;
//   }
// }

// function onMouseOut(e) {
//   const el = e.target;
//   if (el && el === lastHoveredElement) {
//     el.style.outline = "";
//     lastHoveredElement = null;
//   }
// }


// function isValidElement(el) {
//   console.log(el);
//   console.log(el.tagName);
//   if (!el) return false;
//   if (el.id === "capturescreenshot") return false;
//   if (el === overlay) return false;
//   if (el.tagName === "BODY" || el.tagName === "HTML") return false;
//   return true;
// }

// function onClick(e) {
//   if (!selectionActive) return;

//   e.preventDefault();
//   e.stopPropagation();

//   const x = e.clientX;
//   const y = e.clientY;

//   // Use elementFromPoint to get actual element under cursor
//   const elem = document.elementFromPoint(x, y);

//   if (!isValidElement(elem)) return;

//   // Find if already annotated
//   const index = annotations.findIndex(a => a.element === elem);

//   if (index !== -1) {
//     // Unselect
//     const { element, inputEl } = annotations[index];
//     // element.style.backgroundColor = "";
//     element.style.outline = "";
//     element.style.position = "";
//     element.style.border = "";
//     element.style.boxSizing = "";

//     if (element.getAttribute("data-label-act")) {
//       element.removeAttribute("data-label-act");
//     }
    
//     if (inputEl && inputEl.parentNode === element) {
//       element.removeChild(inputEl);
//     }

//     annotations.splice(index, 1);
//   } else {
//     // Select new element
//     elem.style.outline = "none";
//     elem.style.position = "relative";
//     // elem.style.backgroundColor = "rgba(255, 60, 0, 0.81)";
//     elem.style.border = "4px dashed rgba(255, 60, 0, 0.81)"; 
//     elem.style.boxSizing = "border-box"; // Ensures border doesn't push the element, but is part of its size

//     const input = document.createElement("input");
//     input.type = "text";
//     input.placeholder = "Enter label...";
//     input.style.position = "absolute";
//     input.style.bottom = "5px";
//     input.style.right = "5px";
//     input.style.background = "#333";
//     input.style.color = "#fff";
//     input.style.border = "1px solid #666";
//     input.style.padding = "2px 5px";
//     input.style.fontSize = "12px";
//     input.style.borderRadius = "3px";
//     input.style.zIndex = 2147483647;
//     input.style.opacity = "1";
//     input.style.pointerEvents = "auto";
//     input.style.maxWidth = "150px";

//     if (elem.tagName === "IMG") {
//       input.style.width = "100%";
//       elem.parentNode.insertBefore(input, elem.nextSibling);
//     } else {
//       input.style.width = "auto";
//       elem.appendChild(input);
//     }

//     input.focus();

//       // Auto-apply data-label as the user types
//     input.addEventListener("input", () => {
//       const label = input.value.trim();
//       if (label) {
//         elem.setAttribute("data-label-act", label);
//       } else {
//         elem.removeAttribute("data-label-act");
//       }
//     });

//     annotations.push({
//       element: elem,
//       inputEl: input,
//       selector: getElementXPath(elem)
//     });
//   }
// }

// // Start annotator
// window.addEventListener("start-annotator", () => {
//   startAnnotationMode();
// });

// // Capture screenshot and save annotations
// window.addEventListener("capture-screenshot", () => {
//   stopAnnotationMode();

//   const exportAnnotations = annotations.map(({ selector, inputEl }) => ({
//     selector,
//     label: inputEl.value.trim()
//   }));

//   // Save JSON
//   const json = JSON.stringify(exportAnnotations, null, 2);
//   const blob = new Blob([json], { type: "application/json" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "annotations.json";
//   a.click();

//   // Screenshot
//   html2canvas(document.body, { useCORS: true, logging: false }).then(canvas => {
//     const image = canvas.toDataURL("image/png");
//     const link = document.createElement("a");
//     link.download = "annotated-page.png";
//     link.href = image;
//     link.click();
//   });
// });

let selectionActive = false;
let overlay = null;
let annotations = [];
let sidebar = null;
let isSidebarCollapsed = false;
const connectors = [];

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
  .annotation-sidebar {
    position: fixed;
    top: 50px;
    right: 10px;
    width: 250px;
    max-height: 80vh;
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 2147483647;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .sidebar-header {
    padding: 10px;
    background: #333;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
  
  .sidebar-content {
    padding: 10px;
    overflow-y: auto;
    max-height: calc(80vh - 40px);
  }
  
  .annotation-item {
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid #eee;
    border-radius: 4px;
    position: relative;
  }
  
  .annotation-item input {
    width: 100%;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 3px;
  }
  
  .annotation-highlight {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #ff3c00;
    border-radius: 50%;
    z-index: 2147483646;
    transition: transform 0.2s ease;
  }
  
  .annotation-connector {
    position: fixed;
    background: #ff3c00;
    z-index: 2147483645;
    pointer-events: none;
    transition: all 0.2s ease;
  }
  
  .sidebar-collapsed {
    width: 40px;
  }
  
  .sidebar-collapsed .sidebar-content {
    display: none;
  }
  
  .toggle-icon {
    transition: transform 0.3s ease;
  }
  
  .sidebar-collapsed .toggle-icon {
    transform: rotate(180deg);
  }
  
  .annotated-element {
    position: relative;
    border: 4px dashed rgba(255, 60, 0, 0.81) !important;
    box-sizing: border-box !important;
  }
`;
document.head.appendChild(style);

// Event listeners for triggering the tool
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    window.dispatchEvent(new Event("capture-screenshot"));
  }
});

if (document.getElementById("capturescreenshot")) {
  document.getElementById("capturescreenshot").addEventListener("click", () => {
    window.dispatchEvent(new Event("capture-screenshot"));
  });
}

// Element selector functions
function getUniqueSelector(el) {
  if (el.id) return `#${el.id}`;
  if (el.className && typeof el.className === 'string') {
    return `${el.tagName.toLowerCase()}.${el.className.trim().replace(/\s+/g, '.')}`;
  }
  return el.tagName.toLowerCase();
}

function getElementXPath(element) {
  if (element.id !== '') return `//*[@id="${element.id}"]`;

  const parts = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = element.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    const tagName = element.nodeName.toLowerCase();
    parts.unshift(`${tagName}[${index}]`);
    element = element.parentNode;
  }
  return '/' + parts.join('/');
}

// Overlay functions
function createOverlay() {
  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = "9998";
  overlay.style.background = "rgba(0,0,0,0.05)";
  overlay.style.pointerEvents = "none";
  document.body.appendChild(overlay);
}

function createDoneButton() {
  const doneBtn = document.createElement("button");
  doneBtn.innerText = "To save press escape key or esc key";
  doneBtn.style.position = "fixed";
  doneBtn.style.top = "10px";
  doneBtn.style.right = "10px";
  doneBtn.style.zIndex = "100000";
  doneBtn.style.padding = "8px 12px";
  doneBtn.style.background = "#333";
  doneBtn.style.color = "#fff";
  doneBtn.style.border = "none";
  doneBtn.style.borderRadius = "4px";
  doneBtn.style.cursor = "pointer";
  doneBtn.style.pointerEvents = "all";
  doneBtn.id = "capturescreenshot";
  document.body.appendChild(doneBtn);
}

// Sidebar functions
function createSidebar() {
  sidebar = document.createElement('div');
  sidebar.className = 'annotation-sidebar';
  
  const header = document.createElement('div');
  header.className = 'sidebar-header';
  header.innerHTML = `
    <span>Annotations</span>
    <span class="toggle-icon">→</span>
  `;
  
  const content = document.createElement('div');
  content.className = 'sidebar-content';
  
  sidebar.appendChild(header);
  sidebar.appendChild(content);
  document.body.appendChild(sidebar);
  
  header.addEventListener('click', () => {
    isSidebarCollapsed = !isSidebarCollapsed;
    sidebar.classList.toggle('sidebar-collapsed', isSidebarCollapsed);
    updateConnectors();
  });
}

function addAnnotationToSidebar(annotation) {
  if (!sidebar) createSidebar();
  
  const content = sidebar.querySelector('.sidebar-content');
  const item = document.createElement('div');
  item.className = 'annotation-item';
  
  const highlight = document.createElement('div');
  highlight.className = 'annotation-highlight';
  annotation.element.appendChild(highlight);
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter label...';
  input.value = annotation.label || '';
  
  input.addEventListener('input', () => {
    const label = input.value.trim();
    annotation.label = label;
    if (label) {
      annotation.element.setAttribute('data-label-act', label);
    } else {
      annotation.element.removeAttribute('data-label-act');
    }
  });
  
  item.addEventListener('mouseenter', () => {
    annotation.element.style.boxShadow = '0 0 0 2px rgba(255, 60, 0, 0.5)';
    highlight.style.transform = 'scale(1.5)';
  });
  
  item.addEventListener('mouseleave', () => {
    annotation.element.style.boxShadow = '';
    highlight.style.transform = '';
  });
  
  item.appendChild(input);
  content.appendChild(item);
  
  annotation.sidebarItem = item;
  annotation.highlight = highlight;
  
  createConnector(annotation);
  window.addEventListener('scroll', updateConnectors);
  window.addEventListener('resize', updateConnectors);
}

function createConnector(annotation) {
  const connector = document.createElement('div');
  connector.className = 'annotation-connector';
  document.body.appendChild(connector);
  connectors.push({ annotation, element: connector });
  updateConnector(annotation, connector);
}

function updateConnector(annotation, connector) {
  if (!annotation.sidebarItem || !annotation.highlight) return;
  
  const sidebarRect = sidebar.getBoundingClientRect();
  const itemRect = annotation.sidebarItem.getBoundingClientRect();
  const elementRect = annotation.element.getBoundingClientRect();
  const highlightRect = annotation.highlight.getBoundingClientRect();
  
  const startX = isSidebarCollapsed ? sidebarRect.left : itemRect.left;
  const startY = itemRect.top + itemRect.height / 2;
  const endX = elementRect.left + highlightRect.left + highlightRect.width / 2;
  const endY = elementRect.top + highlightRect.top + highlightRect.height / 2;
  
  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
  
  connector.style.width = `${length}px`;
  connector.style.height = '2px';
  connector.style.left = `${startX}px`;
  connector.style.top = `${startY}px`;
  connector.style.transformOrigin = '0 0';
  connector.style.transform = `rotate(${angle}deg)`;
}

function updateConnectors() {
  connectors.forEach(({ annotation, element }) => {
    updateConnector(annotation, element);
  });
}

// Annotation mode functions
function startAnnotationMode() {
  if (selectionActive) return;
  selectionActive = true;
  annotations = [];

  document.body.style.cursor = "crosshair";
  createOverlay();
  createDoneButton();

  document.addEventListener("mouseover", onMouseOver);
  document.addEventListener("mouseout", onMouseOut);
  document.addEventListener("click", onClick, true);
}

function stopAnnotationMode() {
  alert("Screenshot & Annotations saved!");
  selectionActive = false;
  document.body.style.cursor = "default";
  
  if (overlay) overlay.remove();
  const btn = document.getElementById("capturescreenshot");
  if (btn) btn.remove();
  
  document.removeEventListener("mouseover", onMouseOver);
  document.removeEventListener("mouseout", onMouseOut);
  document.removeEventListener("click", onClick, true);
  
  connectors.forEach(({ element }) => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  connectors.length = 0;
  
  if (sidebar && sidebar.parentNode) {
    sidebar.parentNode.removeChild(sidebar);
    sidebar = null;
  }
  
  window.removeEventListener('scroll', updateConnectors);
  window.removeEventListener('resize', updateConnectors);
}

// Mouse event handlers
let lastHoveredElement = null;

function onMouseOver(e) {
  if (lastHoveredElement && lastHoveredElement !== e.target) {
    lastHoveredElement.style.outline = "";
  }

  const el = e.target;
  if (el && el !== overlay && el.id !== "capturescreenshot") {
    el.style.outline = "2px dashed red";
    lastHoveredElement = el;
  }
}

function onMouseOut(e) {
  const el = e.target;
  if (el && el === lastHoveredElement) {
    el.style.outline = "";
    lastHoveredElement = null;
  }
}

function isValidElement(el) {
  if (!el) return false;
  if (el.id === "capturescreenshot") return false;
  if (el === overlay) return false;
  if (el.tagName === "BODY" || el.tagName === "HTML") return false;
  return true;
}

function onClick(e) {
  if (!selectionActive) return;

  e.preventDefault();
  e.stopPropagation();

  const x = e.clientX;
  const y = e.clientY;
  const elem = document.elementFromPoint(x, y);

  if (!isValidElement(elem)) return;

  const index = annotations.findIndex(a => a.element === elem);

  if (index !== -1) {
    // Remove annotation
    const { element, highlight, sidebarItem } = annotations[index];
    element.classList.remove('annotated-element');
    
    if (highlight && highlight.parentNode) {
      highlight.parentNode.removeChild(highlight);
    }
    
    if (sidebarItem && sidebarItem.parentNode) {
      sidebarItem.parentNode.removeChild(sidebarItem);
    }
    
    const connectorIndex = connectors.findIndex(c => c.annotation === annotations[index]);
    if (connectorIndex !== -1) {
      connectors[connectorIndex].element.remove();
      connectors.splice(connectorIndex, 1);
    }
    
    annotations.splice(index, 1);
  } else {
    // Add new annotation
    elem.classList.add('annotated-element');
    
    const annotation = {
      element: elem,
      selector: getElementXPath(elem),
      label: ''
    };
    
    annotations.push(annotation);
    addAnnotationToSidebar(annotation);
    updateConnectors();
  }
}

// Event handlers for starting and capturing
window.addEventListener("start-annotator", () => {
  startAnnotationMode();
});

window.addEventListener("capture-screenshot", () => {
  stopAnnotationMode();

  const exportAnnotations = annotations.map(({ selector, label }) => ({
    selector,
    label
  }));

  // Save JSON
  const json = JSON.stringify(exportAnnotations, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "annotations.json";
  a.click();

  // Screenshot
  html2canvas(document.body, { useCORS: true, logging: false }).then(canvas => {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "annotated-page.png";
    link.href = image;
    link.click();
  });
});