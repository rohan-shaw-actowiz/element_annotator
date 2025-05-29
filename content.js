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

// Global variables
let selectionActive = false;
let overlay = null; // Dimming overlay
let lineSvg = null; // SVG overlay for lines
let annotations = [];
let lastHoveredElement = null;

// --- UTILITY FUNCTIONS ---

// Get a unique CSS selector for an element (existing function, unchanged)
function getUniqueSelector(el) {
  if (el.id) return `#${el.id}`;
  if (el.className && typeof el.className === 'string') {
    return `${el.tagName.toLowerCase()}.${el.className.trim().replace(/\s+/g, '.')}`;
  }
  return el.tagName.toLowerCase();
}

// Get XPath for an element (existing function, unchanged)
function getElementXPath(element) {
  if (element && element.id !== '') { // Added null check for element
    return `//*[@id="${element.id}"]`;
  }

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
    const part = `${tagName}[${index}]`;
    parts.unshift(part);

    element = element.parentNode;
  }
  return '/' + parts.join('/');
}

// --- OVERLAY AND UI ELEMENT CREATION ---

// Create transparent overlay to show selection mode
function createSelectionOverlay() {
  if (document.getElementById('selection-dim-overlay')) return; // Avoid duplicates
  overlay = document.createElement("div");
  overlay.id = 'selection-dim-overlay';
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = "9998"; // Below lines and labels
  overlay.style.background = "rgba(0,0,0,0.05)";
  overlay.style.pointerEvents = "none"; // Let clicks pass through
  document.body.appendChild(overlay);
}

// Create SVG overlay for drawing connecting lines
function createSvgLineOverlay() {
  if (document.getElementById('annotation-lines-svg')) return; // Avoid duplicates
  lineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  lineSvg.id = 'annotation-lines-svg';
  lineSvg.style.position = 'fixed';
  lineSvg.style.top = '0';
  lineSvg.style.left = '0';
  lineSvg.style.width = '100vw';
  lineSvg.style.height = '100vh';
  lineSvg.style.pointerEvents = 'none'; // Lines should not interfere with clicks
  lineSvg.style.zIndex = '9999'; // Above selection overlay, below labels and button
  document.body.appendChild(lineSvg);
}

// Create the "Done" button
function createDoneButton() {
  if (document.getElementById('annotation-done-btn')) return; // Avoid duplicates
  const doneBtn = document.createElement("button");
  doneBtn.id = "annotation-done-btn";
  doneBtn.innerText = "Save Annotations (Esc)";
  doneBtn.style.position = "fixed";
  doneBtn.style.top = "10px";
  doneBtn.style.right = "10px";
  doneBtn.style.zIndex = "100000"; // Above other elements
  doneBtn.style.padding = "10px 15px";
  doneBtn.style.background = "#007bff";
  doneBtn.style.color = "#fff";
  doneBtn.style.border = "none";
  doneBtn.style.borderRadius = "5px";
  doneBtn.style.cursor = "pointer";
  doneBtn.style.pointerEvents = "all";
  doneBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";

  doneBtn.onclick = () => {
    window.dispatchEvent(new Event("capture-screenshot"));
  };
  document.body.appendChild(doneBtn);
}

// --- ANNOTATION MODE LOGIC ---

function startAnnotationMode() {
  if (selectionActive) return;
  selectionActive = true;
  annotations = []; // Reset annotations

  document.body.style.cursor = "crosshair";
  createSelectionOverlay();
  createSvgLineOverlay();
  createDoneButton();

  document.addEventListener("mouseover", onMouseOver);
  document.addEventListener("mouseout", onMouseOut);
  document.addEventListener("click", onClick, true); // Use capture phase

  window.addEventListener('scroll', updateAllConnectingLines, true);
  window.addEventListener('resize', updateAllConnectingLines);
}

function stopAnnotationMode() {
  if (!selectionActive) return; // Prevent multiple calls
  selectionActive = false;

  console.log("Annotation mode stopped. Annotations to be saved:", annotations.map(a => ({ selector: a.selector, label: a.inputEl.value.trim() })));

  document.body.style.cursor = "default";

  if (overlay) {
    overlay.remove();
    overlay = null;
  }
  if (lineSvg) {
    lineSvg.remove();
    lineSvg = null;
  }
  const doneBtn = document.getElementById("annotation-done-btn");
  if (doneBtn) doneBtn.remove();

  document.removeEventListener("mouseover", onMouseOver);
  document.removeEventListener("mouseout", onMouseOut);
  document.removeEventListener("click", onClick, true);
  window.removeEventListener('scroll', updateAllConnectingLines, true);
  window.removeEventListener('resize', updateAllConnectingLines);

  // Clear outline from the last hovered element if it wasn't selected
  if (lastHoveredElement) {
    lastHoveredElement.style.outline = "";
    lastHoveredElement = null;
  }

  // Reset styles for annotated elements that will remain (for screenshot)
  // The border style is part of the annotation.
  // If elements were unselected, their styles are reset in onClick.

  // Prepare and download annotations JSON
  const exportAnnotations = annotations.map(({ selector, inputEl }) => ({
    selector,
    label: inputEl.value.trim()
  }));

  const url = URL.createObjectURL(new Blob([JSON.stringify(exportAnnotations)], { type: "application/json" }));

  const a = document.createElement("a");
  a.style.display = 'none';
  a.href = url;
  a.download = "annotations.json";
  document.body.appendChild(a); // Important: append before clicking
  requestAnimationFrame(() => {
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Capture screenshot (ensure html2canvas library is loaded)
  if (typeof html2canvas === 'function') {
    // Temporarily make lines and labels visible for screenshot if they were hidden
    // (Not necessary with current z-indexing and pointer-events: none for SVG)
    html2canvas(document.body, {
      useCORS: true,
      logging: false,
      // Allow tainted canvases for cross-origin images if necessary,
      // though this might restrict toDataURL if the server doesn't send CORS headers.
      // allowTaint: true,
      onclone: (clonedDoc) => {
        // You could make modifications to the cloned document before screenshot
        // For example, ensure all annotation elements are clearly visible
        annotations.forEach(ann => {
            const el = clonedDoc.querySelector(ann.selector); //This might not work if XPath is complex or IDs are dynamic
            // A more robust way would be to iterate cloned elements and match based on a unique temporary attribute
            // For now, we rely on current styles being captured.
        });
      }
    }).then(canvas => {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.style.display = 'none';
      link.href = image;
      link.download = "screenshot.png";
      document.body.appendChild(link);
      requestAnimationFrame(() => {
        link.click();
        document.body.removeChild(link);
      })
    }).catch(err => {
        console.error("Error capturing screenshot:", err);
    });
  } else {
    console.warn("html2canvas library not found. Screenshot not captured.");
  }
}

// --- MOUSE EVENT HANDLERS FOR ELEMENT SELECTION ---

function onMouseOver(e) {
  if (!selectionActive) return;
  if (lastHoveredElement && lastHoveredElement !== e.target) {
    // Only remove outline if it wasn't selected (doesn't have a border)
    const isAnnotated = annotations.some(a => a.element === lastHoveredElement);
    if (!isAnnotated) {
        lastHoveredElement.style.outline = "";
    }
  }

  const el = e.target;
  if (el && el.id !== 'annotation-done-btn' && el !== overlay && el !== lineSvg && !el.closest('#annotation-done-btn')) {
    const isAnnotated = annotations.some(a => a.element === el);
    if (!isAnnotated) { // Don't outline already selected elements
        el.style.outline = "2px dashed red";
    }
    lastHoveredElement = el;
  }
}

function onMouseOut(e) {
  if (!selectionActive) return;
  const el = e.target;
  if (el && el === lastHoveredElement) {
    const isAnnotated = annotations.some(a => a.element === el);
    if (!isAnnotated) {
        el.style.outline = "";
    }
    // lastHoveredElement = null; // Keep lastHoveredElement to handle re-entry if needed
  }
}

function isValidElement(el) {
  if (!el || typeof el.tagName !== 'string') return false; // Basic check
  if (el.id === 'annotation-done-btn' || el.id === 'selection-dim-overlay' || el.id === 'annotation-lines-svg') return false;
  if (el.closest && el.closest('#annotation-done-btn')) return false; // Ignore clicks on button content
  if (el === overlay || el === lineSvg) return false;
  if (el.tagName === "BODY" || el.tagName === "HTML" || el.tagName === "SCRIPT" || el.tagName === "STYLE") return false;
  // Also ignore clicks on existing annotation input fields
  if (el.classList.contains('annotation-label-input')) return false;
  return true;
}

function onClick(e) {
  if (!selectionActive) return;

  const clickedElement = e.target;

  // If click is on an existing label's input field, let it be for text editing.
  if (clickedElement.classList.contains('annotation-label-input')) {
    // Allow focus and text input, but stop propagation to prevent deselection if clicking inside.
    // The drag functionality is handled by mousedown on the input.
    e.stopPropagation();
    return;
  }
  
  // Use elementFromPoint for accuracy, especially with overlapping elements
  const x = e.clientX;
  const y = e.clientY;
  const elem = document.elementFromPoint(x, y);

  if (!isValidElement(elem)) return;

  e.preventDefault();
  e.stopPropagation(); // Crucial to prevent event bubbling

  const index = annotations.findIndex(a => a.element === elem);

  if (index !== -1) { // Element is already annotated, so unselect it
    const { element, inputEl, lineEl } = annotations[index];
    element.style.outline = ""; // Remove selection outline if any
    element.style.position = ""; // Reset position if it was changed
    element.style.border = "";   // Remove annotation border
    element.style.boxSizing = "";

    if (element.getAttribute("data-label-act")) {
      element.removeAttribute("data-label-act");
    }
    
    if (inputEl && inputEl.parentNode) inputEl.remove();
    if (lineEl && lineEl.parentNode) lineEl.remove();

    annotations.splice(index, 1);
  } else { // New element to annotate
    elem.style.outline = "none"; // Remove hover outline
    elem.style.position = "relative"; // Or ensure its positioning context is suitable
    elem.style.border = "3px dashed rgba(255, 60, 0, 0.81)"; 
    elem.style.boxSizing = "border-box";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter label...";
    input.classList.add('annotation-label-input'); // For identification and styling
    input.style.position = "absolute"; // Positioned relative to document.body
    input.style.background = "#333";
    input.style.color = "#fff";
    input.style.border = "1px solid #666";
    input.style.padding = "4px 8px";
    input.style.fontSize = "13px";
    input.style.borderRadius = "4px";
    input.style.zIndex = "100001"; // Above lines and overlay
    input.style.opacity = "1";
    input.style.pointerEvents = "auto"; // Allow interaction
    input.style.maxWidth = "180px";
    input.style.minWidth = "100px"; // Ensure a minimum width

    // Initial position of the label (e.g., to the right and vertically centered with the element)
    const elemRect = elem.getBoundingClientRect();
    const inputHeightEstimate = 30; // Estimate based on padding and font size
    input.style.left = (elemRect.right + window.scrollX + 15) + 'px';
    input.style.top = (elemRect.top + window.scrollY + (elemRect.height / 2) - (inputHeightEstimate / 2)) + 'px';
    
    document.body.appendChild(input);
    
    const newAnnotation = {
      element: elem,
      inputEl: input,
      selector: getElementXPath(elem), // Or getUniqueSelector(elem) if preferred
      lineEl: null
    };

    input.addEventListener("input", () => {
      const labelValue = input.value.trim();
      if (labelValue) {
        elem.setAttribute("data-label-act", labelValue);
      } else {
        elem.removeAttribute("data-label-act");
      }
    });

    input.addEventListener('mousedown', (mouseDownEvent) => handleLabelMouseDown(mouseDownEvent, newAnnotation));
    
    annotations.push(newAnnotation);
    createConnectingLine(newAnnotation); // Create and draw the initial line
    input.focus();
  }
}

// --- LABEL DRAGGING LOGIC ---

function handleLabelMouseDown(e, annotation) {
  if (e.button !== 0) return; // Only allow left-click drags
  
  const label = annotation.inputEl;
  // e.preventDefault(); // Prevent text selection if dragging starts on text
  e.stopPropagation(); // Stop event from bubbling further (e.g. to onClick)

  const initialMouseX = e.clientX;
  const initialMouseY = e.clientY;
  const initialLabelX = label.offsetLeft;
  const initialLabelY = label.offsetTop;

  const onMouseMove = (moveEvent) => {
    moveEvent.preventDefault(); // Prevent text selection during drag
    const deltaX = moveEvent.clientX - initialMouseX;
    const deltaY = moveEvent.clientY - initialMouseY;
    label.style.left = initialLabelX + deltaX + 'px';
    label.style.top = initialLabelY + deltaY + 'px';
    updateConnectingLine(annotation);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    // Optional: Snap to grid or other actions on drop
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// --- CONNECTING LINE LOGIC ---

function createConnectingLine(annotation) {
  if (!lineSvg) createSvgLineOverlay(); // Ensure SVG canvas exists

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.style.stroke = "rgba(255, 80, 0, 0.9)"; // Slightly more opaque
  line.style.strokeWidth = "2.5";
  // line.style.strokeDasharray = "4,4"; // Optional: dashed line
  lineSvg.appendChild(line);
  annotation.lineEl = line;
  updateConnectingLine(annotation);
}

function updateConnectingLine(annotation) {
  if (!annotation || !annotation.element || !annotation.inputEl || !annotation.lineEl || !lineSvg || !lineSvg.contains(annotation.lineEl)) {
    return; // Exit if any required part is missing
  }

  const elemRect = annotation.element.getBoundingClientRect();
  const labelRect = annotation.inputEl.getBoundingClientRect(); // Viewport-relative

  // Point on element (center)
  const x1 = elemRect.left + elemRect.width / 2;
  const y1 = elemRect.top + elemRect.height / 2;

  // Point on label (middle of the edge closest to the element, or just left edge)
  // For simplicity, connect to the middle of the left edge of the label.
  let x2 = labelRect.left;
  let y2 = labelRect.top + labelRect.height / 2;

  // A more sophisticated approach might choose which side of the label to connect to
  // based on its position relative to the element.
  // Example: if label is to the left of element, connect to label's right edge.
  // if (labelRect.right < elemRect.left) { // Label is to the left
  //   x2 = labelRect.right;
  // } else if (labelRect.left > elemRect.right) { // Label is to the right
  //   x2 = labelRect.left;
  // }
  // // Similar logic for top/bottom if desired

  annotation.lineEl.setAttribute('x1', x1);
  annotation.lineEl.setAttribute('y1', y1);
  annotation.lineEl.setAttribute('x2', x2);
  annotation.lineEl.setAttribute('y2', y2);
}

function updateAllConnectingLines() {
  if (!selectionActive || !lineSvg) return;
  annotations.forEach(updateConnectingLine);
}

// --- EVENT LISTENERS TO START/STOP ANNOTATION ---

// Listener for the Escape key to stop annotation and capture
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && selectionActive) { // Only if active
    window.dispatchEvent(new Event("capture-screenshot"));
  }
});

// Listener for custom event to start annotation mode
window.addEventListener("start-annotator", () => {
  console.log("Event 'start-annotator' received.");
  startAnnotationMode();
});

// Listener for custom event to capture screenshot and save annotations
window.addEventListener("capture-screenshot", () => {
  if (!selectionActive) return; // Only if active
  console.log("Event 'capture-screenshot' received.");
  stopAnnotationMode();
});
