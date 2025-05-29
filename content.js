// Global variables
let selectionActive = false;
let overlay = null; // Dimming overlay
let lineSvg = null; // SVG overlay for lines
let annotations = [];
let lastHoveredElement = null;

// --- UTILITY FUNCTIONS ---

// Get a unique CSS selector for an element
function getUniqueSelector(el) {
  if (el.id) return `#${el.id}`;
  if (el.className && typeof el.className === 'string') {
    return `${el.tagName.toLowerCase()}.${el.className.trim().replace(/\s+/g, '.')}`;
  }
  return el.tagName.toLowerCase();
}

// Get XPath for an element
function getElementXPath(element) {
  if (element && element.id !== '') {
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

function createSelectionOverlay() {
  if (document.getElementById('selection-dim-overlay')) return;
  overlay = document.createElement("div");
  overlay.id = 'selection-dim-overlay';
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

function createSvgLineOverlay() {
  if (document.getElementById('annotation-lines-svg')) return;
  lineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  lineSvg.id = 'annotation-lines-svg';
  lineSvg.style.position = 'fixed';
  lineSvg.style.top = '0';
  lineSvg.style.left = '0';
  lineSvg.style.width = '100vw';
  lineSvg.style.height = '100vh';
  lineSvg.style.pointerEvents = 'none';
  lineSvg.style.zIndex = '9999';
  document.body.appendChild(lineSvg);
}

function createDoneButton() {
  if (document.getElementById('annotation-done-btn')) return;
  const doneBtn = document.createElement("button");
  doneBtn.id = "annotation-done-btn";
  doneBtn.innerText = "Save Annotations (Esc)";
  doneBtn.style.position = "fixed";
  doneBtn.style.top = "10px";
  doneBtn.style.right = "10px";
  doneBtn.style.zIndex = "100000";
  doneBtn.style.padding = "10px 15px";
  doneBtn.style.background = "#111111";
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

function createClearAllButton() {
  if (document.getElementById('annotation-clear-all-btn')) return;
  const clearAllBtn = document.createElement("button");
  clearAllBtn.id = "annotation-clear-all-btn";
  clearAllBtn.innerText = "🗑️";
  clearAllBtn.style.position = "fixed";
  clearAllBtn.style.top = "10px";
  clearAllBtn.style.right = "215px";
  clearAllBtn.style.zIndex = "100000";
  clearAllBtn.style.padding = "10px 15px";
  clearAllBtn.style.background = "#111111";
  clearAllBtn.style.color = "#fff";
  clearAllBtn.style.border = "none";
  clearAllBtn.style.borderRadius = "5px";
  clearAllBtn.style.cursor = "pointer";
  clearAllBtn.style.pointerEvents = "all";
  clearAllBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  clearAllBtn.onclick = () => {
    clearAllElements();
  };
  document.body.appendChild(clearAllBtn);
}

// --- ANNOTATION MODE LOGIC ---

function startAnnotationMode() {
  if (selectionActive) return;
  selectionActive = true;
  annotations = [];
  document.body.style.cursor = "crosshair";
  createSelectionOverlay();
  createSvgLineOverlay();
  createDoneButton();
  createClearAllButton();
  document.addEventListener("mouseover", onMouseOver);
  document.addEventListener("mouseout", onMouseOut);
  document.addEventListener("click", onClick, true);
  window.addEventListener('scroll', updateAllConnectingLines, true);
  window.addEventListener('resize', updateAllConnectingLines);
}

function stopAnnotationMode() {
  if (!selectionActive) return;
  selectionActive = false;
  console.log("Annotation mode stopped. Annotations to be saved:", annotations.map(a => ({ selector: a.selector, label: a.inputEl.value.trim() })));
  document.body.style.cursor = "default";

  // Remove all annotation elements (inputs, lines, resize handles)
  // annotations.forEach(annotation => {
  //   if (annotation.inputEl && annotation.inputEl.parentNode) {
  //     annotation.inputEl.remove();
  //   }
  //   if (annotation.lineEl && annotation.lineEl.parentNode) {
  //     annotation.lineEl.remove();
  //   }
  //   if (annotation.resizeHandle && annotation.resizeHandle.parentNode) {
  //       annotation.resizeHandle.remove();
  //   }
  //   // Reset style on the annotated element itself if needed, though current border is for screenshot
  //   // annotation.element.style.border = ""; // Example if you wanted to clear it
  // });
  // annotations = []; // Clear the array

  // if (overlay) {
  //   overlay.remove();
  //   overlay = null;
  // }
  // if (lineSvg) {
  //   lineSvg.remove();
  //   lineSvg = null;
  // }
  const doneBtn = document.getElementById("annotation-done-btn");
  if (doneBtn) doneBtn.remove();

  const clearAllBtn = document.getElementById("annotation-clear-all-btn");
  if (clearAllBtn) clearAllBtn.remove();

  document.removeEventListener("mouseover", onMouseOver);
  document.removeEventListener("mouseout", onMouseOut);
  document.removeEventListener("click", onClick, true);
  window.removeEventListener('scroll', updateAllConnectingLines, true);
  window.removeEventListener('resize', updateAllConnectingLines);

  if (lastHoveredElement) {
    lastHoveredElement.style.outline = "";
    lastHoveredElement = null;
  }

  const activeAnnotationsForExport = Array.from(document.querySelectorAll('.annotation-label-input')).map(inputEl => {
      const ann = annotations.find(a => a.inputEl === inputEl); 
      const annotationsToExport = annotations.map(({ selector, inputEl }) => ({
        selector,
        label: inputEl.value.trim()
      }));


      const json = JSON.stringify(annotationsToExport, null, 2);
      const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(json);
      const a = document.createElement("a");
      a.style.display = 'none';
      a.href = dataUrl;
      a.download = "annotations.json";
      document.body.appendChild(a);
      requestAnimationFrame(() => {
        a.click();
        document.body.removeChild(a);
      });
  }); // This needs to be outside the forEach


  // Screenshot attempt with html2canvas
  if (typeof html2canvas === "function") {
    html2canvas(document.body, {
      useCORS: true,
      allowTaint: false, // Set to false unless you specifically need to handle tainted canvases
      logging: false, // Reduce console noise, true for debugging
      scale: window.devicePixelRatio || 1 // Use device pixel ratio for sharper images
    })
    .then(canvas => {
      const image = canvas.toDataURL("image/png");
      const screenshotLink = document.createElement("a");
      screenshotLink.href = image;
      screenshotLink.download = "annotated-screenshot.png"; // More descriptive name
      document.body.appendChild(screenshotLink);
      requestAnimationFrame(() => { // Ensure link is in DOM before click for some browsers
        screenshotLink.click();
        document.body.removeChild(screenshotLink);
      });
    })
    .catch(err => {
      console.error("Screenshot capture failed:", err);
      console.warn("Screenshot couldn't be captured. This might be due to website content restrictions (e.g., iframes or CORS issues with assets).");
    });
  } else {
    console.warn("html2canvas library is not available. Screenshot functionality disabled.");
    // alert("Screenshot functionality is unavailable because the html2canvas library is missing.");
  }
}


// --- MOUSE EVENT HANDLERS FOR ELEMENT SELECTION ---

function onMouseOver(e) {
  if (!selectionActive) return;
  if (lastHoveredElement && lastHoveredElement !== e.target) {
    const isAnnotated = annotations.some(a => a.element === lastHoveredElement);
    if (!isAnnotated) {
        lastHoveredElement.style.outline = "";
    }
  }
  const el = e.target;
  if (el && el.id !== 'annotation-done-btn' && el.id !=='annotation-clear-all-btn' && el !== overlay && el !== lineSvg && !el.closest('#annotation-done-btn') && !el.closest('#annotation-clear-all-btn') && !el.classList.contains('annotation-label-input') && !el.classList.contains('annotation-resize-handle')) {
    const isAnnotated = annotations.some(a => a.element === el);
    if (!isAnnotated) {
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
  }
}

function isValidElement(el) {
  if (!el || typeof el.tagName !== 'string') return false;
  if (el.id === 'annotation-done-btn' || el.id === 'annotation-clear-all-btn' || el.id === 'selection-dim-overlay' || el.id === 'annotation-lines-svg') return false;
  if (el.closest && (el.closest('#annotation-done-btn')|| el.closest('#annotation-clear-all-btn') || el.classList.contains('annotation-label-input') || el.classList.contains('annotation-resize-handle'))) return false;
  if (el === overlay || el === lineSvg) return false;
  if (["BODY", "HTML", "SCRIPT", "STYLE"].includes(el.tagName)) return false;
  return true;
}

function onClick(e) {
  if (!selectionActive) return;
  const clickedElement = e.target;

  if (clickedElement.classList.contains('annotation-label-input') || clickedElement.classList.contains('annotation-resize-handle') || (clickedElement.closest && clickedElement.closest('.annotation-label-input'))) {
    e.stopPropagation(); // Allow interaction with label/handle, prevent deselection
    return;
  }
  
  const x = e.clientX;
  const y = e.clientY;
  const elem = document.elementFromPoint(x, y);

  if (!isValidElement(elem)) return;
  e.preventDefault();
  e.stopPropagation();

  const index = annotations.findIndex(a => a.element === elem);

  if (index !== -1) { // Unselect
    const { element, inputEl, lineEl, resizeHandle } = annotations[index];
    element.style.outline = "";
    element.style.position = "";
    element.style.border = "";
    element.style.boxSizing = "";
    if (element.getAttribute("data-label-act")) element.removeAttribute("data-label-act");
    if (inputEl && inputEl.parentNode) inputEl.remove();
    if (lineEl && lineEl.parentNode) lineEl.remove();
    if (resizeHandle && resizeHandle.parentNode) resizeHandle.remove();
    annotations.splice(index, 1);
  } else { // Select new element
    elem.style.outline = "none";
    elem.style.position = "relative"; // Or check if already relative/absolute
    elem.style.border = "3px dashed rgba(255, 60, 0, 0.81)"; 
    elem.style.boxSizing = "border-box";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter label...";
    input.classList.add('annotation-label-input');
    input.style.position = "absolute";
    input.style.background = "#333";
    input.style.color = "#fff";
    input.style.border = "1px solid #666";
    input.style.padding = "5px 8px"; // Slightly more padding
    input.style.fontSize = "13px";
    input.style.borderRadius = "4px";
    input.style.zIndex = "100001";
    input.style.opacity = "1";
    input.style.pointerEvents = "auto";
    input.style.minWidth = "80px"; // Min width
    input.style.width = "150px"; // Default width
    input.style.cursor = "move"; // Default cursor for the input body

    const elemRect = elem.getBoundingClientRect();
    const inputHeightEstimate = 32; // Adjusted for padding
    input.style.left = (elemRect.right + window.scrollX + 15) + 'px';
    input.style.top = (elemRect.top + window.scrollY + (elemRect.height / 2) - (inputHeightEstimate / 2)) + 'px';
    
    document.body.appendChild(input);
    
    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('annotation-resize-handle');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '10px';
    resizeHandle.style.background = '#555'; // Darker for visibility
    resizeHandle.style.border = '1px solid #888';
    resizeHandle.style.borderRadius = '2px';
    resizeHandle.style.right = '-2px'; // Position at bottom-right of input
    resizeHandle.style.bottom = '-2px';
    resizeHandle.style.cursor = 'se-resize';
    resizeHandle.style.zIndex = "100002"; // Above input
    input.appendChild(resizeHandle); // Append handle to input for relative positioning
                                     // This makes input `position:relative` important if not already.
                                     // Let's make input relative for the handle.
    input.style.position = 'absolute'; // Already absolute, but handle is relative to this.

    const newAnnotation = {
      element: elem,
      inputEl: input,
      selector: getElementXPath(elem),
      lineEl: null,
      resizeHandle: resizeHandle
    };

    input.addEventListener("input", () => {
      const labelValue = input.value.trim();
      if (labelValue) elem.setAttribute("data-label-act", labelValue);
      else elem.removeAttribute("data-label-act");
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur(); // Remove focus on Enter
        }
    });
    input.addEventListener('focus', () => {
        input.style.cursor = 'text'; // Text cursor when focused
    });
    input.addEventListener('blur', () => {
        input.style.cursor = 'move'; // Move cursor when not focused
    });

    input.addEventListener('mousedown', (mouseDownEvent) => {
        // Prevent drag if click is on resize handle
        if (mouseDownEvent.target === resizeHandle) return;
        handleLabelMouseDown(mouseDownEvent, newAnnotation);
    });
    resizeHandle.addEventListener('mousedown', (mouseDownEvent) => handleLabelResizeMouseDown(mouseDownEvent, newAnnotation));
    
    annotations.push(newAnnotation);
    createConnectingLine(newAnnotation);
    input.focus();
    input.style.cursor = 'text'; // Set to text cursor initially on focus
  }
}

// --- LABEL DRAGGING LOGIC ---

function handleLabelMouseDown(e, annotation) {
  if (e.button !== 0) return;
  const label = annotation.inputEl;
  e.stopPropagation(); 

  const initialMouseX = e.clientX;
  const initialMouseY = e.clientY;
  const initialLabelX = label.offsetLeft;
  const initialLabelY = label.offsetTop;
  label.style.cursor = 'grabbing'; // Indicate dragging

  const onMouseMove = (moveEvent) => {
    moveEvent.preventDefault();
    const deltaX = moveEvent.clientX - initialMouseX;
    const deltaY = moveEvent.clientY - initialMouseY;
    label.style.left = initialLabelX + deltaX + 'px';
    label.style.top = initialLabelY + deltaY + 'px';
    updateConnectingLine(annotation);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    label.style.cursor = document.activeElement === label ? 'text' : 'move'; // Reset cursor
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// --- LABEL RESIZING LOGIC ---
function handleLabelResizeMouseDown(e, annotation) {
    if (e.button !== 0) return; // Only left click
    e.preventDefault(); // Prevent text selection or other default actions
    e.stopPropagation(); // Stop event from bubbling to label's drag listener

    const label = annotation.inputEl;
    const initialMouseX = e.clientX;
    // const initialMouseY = e.clientY; // If resizing height too
    const initialWidth = label.offsetWidth;
    // const initialHeight = label.offsetHeight;

    const onResizeMouseMove = (moveEvent) => {
        moveEvent.preventDefault();
        const deltaX = moveEvent.clientX - initialMouseX;
        let newWidth = initialWidth + deltaX;
        const minInputWidth = 50; // Minimum width for the input

        if (newWidth < minInputWidth) {
            newWidth = minInputWidth;
        }
        label.style.width = newWidth + 'px';
        updateConnectingLine(annotation); // Update line as label resizes
    };

    const onResizeMouseUp = () => {
        document.removeEventListener('mousemove', onResizeMouseMove);
        document.removeEventListener('mouseup', onResizeMouseUp);
        // Optional: any cleanup or finalization after resize
    };

    document.addEventListener('mousemove', onResizeMouseMove);
    document.addEventListener('mouseup', onResizeMouseUp);
}


// --- CONNECTING LINE LOGIC ---

function createConnectingLine(annotation) {
  if (!lineSvg) createSvgLineOverlay();
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.style.stroke = "rgba(255, 80, 0, 0.9)";
  line.style.strokeWidth = "2.5";
  lineSvg.appendChild(line);
  annotation.lineEl = line;
  updateConnectingLine(annotation);
}

function updateConnectingLine(annotation) {
  if (!annotation || !annotation.element || !annotation.inputEl || !annotation.lineEl || !lineSvg || !lineSvg.contains(annotation.lineEl)) {
    return;
  }
  const elemRect = annotation.element.getBoundingClientRect();
  const labelRect = annotation.inputEl.getBoundingClientRect();

  const x1 = elemRect.left + elemRect.width / 2 + window.scrollX; // Add scroll offsets for absolute SVG coords
  const y1 = elemRect.top + elemRect.height / 2 + window.scrollY;

  // Connect to the middle of the left edge of the label by default
  let x2 = labelRect.left + window.scrollX;
  let y2 = labelRect.top + labelRect.height / 2 + window.scrollY;
  
  // Smart connection point based on relative position
  const elemCenterX = elemRect.left + elemRect.width / 2;
  const elemCenterY = elemRect.top + elemRect.height / 2;
  const labelCenterX = labelRect.left + labelRect.width / 2;
  const labelCenterY = labelRect.top + labelRect.height / 2;

  const dx = labelCenterX - elemCenterX;
  const dy = labelCenterY - elemCenterY;

  // Determine which edge of the label is closest or most appropriate
  if (Math.abs(dx) > Math.abs(dy)) { // Connect to vertical sides (left/right)
      if (dx > 0) { // Label is to the right of element
          x2 = labelRect.left + window.scrollX; // Connect to left edge of label
      } else { // Label is to the left of element
          x2 = labelRect.right + window.scrollX; // Connect to right edge of label
      }
      y2 = labelRect.top + labelRect.height / 2 + window.scrollY;
  } else { // Connect to horizontal sides (top/bottom)
      if (dy > 0) { // Label is below element
          y2 = labelRect.top + window.scrollY; // Connect to top edge of label
      } else { // Label is above element
          y2 = labelRect.bottom + window.scrollY; // Connect to bottom edge of label
      }
      x2 = labelRect.left + labelRect.width / 2 + window.scrollX;
  }


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

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && selectionActive) {
    window.dispatchEvent(new Event("capture-screenshot"));
  }
});

window.addEventListener("start-annotator", () => {
  console.log("Event 'start-annotator' received.");
  startAnnotationMode();
});

window.addEventListener("capture-screenshot", () => {
  if (!selectionActive) return;
  console.log("Event 'capture-screenshot' received.");
  
  // Explicitly gather data for export BEFORE clearing UI elements
  const annotationsToExport = annotations.map(({ selector, inputEl }) => ({
    selector,
    label: inputEl.value.trim()
  }));

  // Now, call the function that cleans up UI and performs downloads
  performStopAnnotationActions(annotationsToExport);
});


// Renamed stopAnnotationMode to performStopAnnotationActions to reflect its role after data gathering
function performStopAnnotationActions(annotationsToExport) {

  const doneBtn = document.getElementById("annotation-done-btn");
  if (doneBtn) doneBtn.remove();

  const clearAllBtn = document.getElementById("annotation-clear-all-btn");
  if (clearAllBtn) clearAllBtn.remove();

  document.removeEventListener("mouseover", onMouseOver);
  document.removeEventListener("mouseout", onMouseOut);
  document.removeEventListener("click", onClick, true);
  window.removeEventListener('scroll', updateAllConnectingLines, true);
  window.removeEventListener('resize', updateAllConnectingLines);

  if (lastHoveredElement) {
    lastHoveredElement.style.outline = "";
    lastHoveredElement = null;
  }
  
  selectionActive = false; // Ensure it's set here.
  document.body.style.cursor = "default";

  // Download JSON
  const json = JSON.stringify(annotationsToExport, null, 2);
  const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(json);
  const aJson = document.createElement("a");
  aJson.style.display = 'none';
  aJson.href = dataUrl;
  aJson.download = "annotations.json";
  document.body.appendChild(aJson);
  requestAnimationFrame(() => {
    aJson.click();
    document.body.removeChild(aJson);
  });

  // Screenshot
  if (typeof html2canvas === "function") {
    html2canvas(document.body, {
      useCORS: true,
      allowTaint: false,
      logging: false,
      scale: window.devicePixelRatio || 1,
      onclone: (clonedDoc) => {
      }
    }).then(canvas => {
      const image = canvas.toDataURL("image/png");
      const screenshotLink = document.createElement("a");
      screenshotLink.href = image;
      screenshotLink.download = "annotated-screenshot.png";
      document.body.appendChild(screenshotLink);
      requestAnimationFrame(() => {
        screenshotLink.click();
        document.body.removeChild(screenshotLink);
      });
    }).catch(err => {
      console.error("Screenshot capture failed:", err);
    });
  } else {
    console.warn("html2canvas library is not available.");
  }
}

const globalCaptureScreenshotListener = () => {
    if (!selectionActive) return;
    console.log("Event 'capture-screenshot' received (revised flow).");

    // 1. Gather data for export
    const annotationsToExport = annotations.map(({ selector, inputEl }) => ({
        selector,
        label: inputEl.value.trim()
    }));

    // Temporarily set cursor to default for screenshot, hide "Done" button
    const doneBtn = document.getElementById("annotation-done-btn");
    const clearAllBtn = document.getElementById("annotation-clear-all-btn");
    let originalDoneBtnDisplay = '';
    if (doneBtn) {
        originalDoneBtnDisplay = doneBtn.style.display;
        doneBtn.style.display = 'none'; // Hide button for screenshot
    }
    let originalClearAllBtnDisplay = '';
    if (clearAllBtn) {
        originalClearAllBtnDisplay = clearAllBtn.style.display;
        clearAllBtn.style.display = 'none'; // Hide button for screenshot
    }
    const originalBodyCursor = document.body.style.cursor;
    document.body.style.cursor = 'default';


    // 2. Take screenshot (while UI elements are still visible)
    if (typeof html2canvas === "function") {
        html2canvas(document.body, {
            useCORS: true,
            allowTaint: false,
            logging: false,
            scale: window.devicePixelRatio || 1,
            ignoreElements: (element) => element.id === 'annotation-done-btn' || element.id === 'annotation-clear-all-btn', // Alternative way to hide
        }).then(canvas => {
            const image = canvas.toDataURL("image/png");
            const screenshotLink = document.createElement("a");
            screenshotLink.href = image;
            screenshotLink.download = "annotated-screenshot.png";
            document.body.appendChild(screenshotLink); // Firefox requires appending
            screenshotLink.click();
            document.body.removeChild(screenshotLink); // Clean up link

            // 3. THEN, clean up UI elements and download JSON
            finalizeAnnotationStop(annotationsToExport);

        }).catch(err => {
            console.error("Screenshot capture failed:", err);
            // If screenshot fails, still proceed to finalize and save JSON
            finalizeAnnotationStop(annotationsToExport);
        });
    } else {
        console.warn("html2canvas library is not available. Skipping screenshot.");
        // Proceed without screenshot
        finalizeAnnotationStop(annotationsToExport);
    }
};

// Revised capture-screenshot listener for correct order of operations
window.removeEventListener("capture-screenshot", globalCaptureScreenshotListener); // Remove previous if any

window.addEventListener("capture-screenshot", globalCaptureScreenshotListener);


function finalizeAnnotationStop(annotationsToExport) {
    // Restore "Done" button if it was hidden, and cursor
    const doneBtn = document.getElementById("annotation-done-btn");
    const clearAllBtn = document.getElementById("annotation-clear-all-btn");
    if (doneBtn && typeof originalDoneBtnDisplay !== 'undefined') { // originalDoneBtnDisplay might not be set if button never existed
       // doneBtn.style.display = originalDoneBtnDisplay; // Not needed as it will be removed
    }
    selectionActive = false;
    document.body.style.cursor = "default";

    if (doneBtn) doneBtn.remove(); // Now remove it
    if (clearAllBtn) clearAllBtn.remove(); // Now remove it

    document.removeEventListener("mouseover", onMouseOver);
    document.removeEventListener("mouseout", onMouseOut);
    document.removeEventListener("click", onClick, true);
    window.removeEventListener('scroll', updateAllConnectingLines, true);
    window.removeEventListener('resize', updateAllConnectingLines);

    if (lastHoveredElement) { lastHoveredElement.style.outline = ""; lastHoveredElement = null; }
    
    // Download JSON
    const json = JSON.stringify(annotationsToExport, null, 2);
    const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const aJson = document.createElement("a");
    aJson.style.display = 'none';
    aJson.href = dataUrl;
    aJson.download = "annotations.json";
    document.body.appendChild(aJson);
    aJson.click();
    document.body.removeChild(aJson);
}

function clearAllElements() {
  // Remove all annotation elements (inputs, lines, resize handles)
  annotations.forEach(annotation => {
    if (annotation.inputEl && annotation.inputEl.parentNode) {
      annotation.inputEl.remove();
    }
    if (annotation.lineEl && annotation.lineEl.parentNode) {
      annotation.lineEl.remove();
    }
    if (annotation.resizeHandle && annotation.resizeHandle.parentNode) {
        annotation.resizeHandle.remove();
    }

    annotation.element.style.outline = "";
    annotation.element.style.position = "";
    annotation.element.style.border = "";
    annotation.element.style.boxSizing = "";

    if (annotation.element.getAttribute("data-label-act")) annotation.element.removeAttribute("data-label-act");    
    // Reset style on the annotated element itself if needed, though current border is for screenshot
    // annotation.element.style.border = ""; // Example if you wanted to clear it
  });
  annotations = []; // Clear the array

  if (overlay) {
    overlay.remove();
    overlay = null;
  }
  if (lineSvg) {
    lineSvg.remove();
    lineSvg = null;
  }
}