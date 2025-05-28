let selectionActive = false;
let overlay = null;
let annotations = [];

// send capture-screenshot event to window
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    window.dispatchEvent(new Event("capture-screenshot"));
  }
});

if (document.getElementById("capturescreenshot")){
  document.getElementById("capturescreenshot").addEventListener("click", () => {
    window.dispatchEvent(new Event("capture-screenshot"));
});
}

// Get a unique CSS selector for an element
function getUniqueSelector(el) {
  if (el.id) return `#${el.id}`;
  if (el.className && typeof el.className === 'string') {
    return `${el.tagName.toLowerCase()}.${el.className.trim().replace(/\s+/g, '.')}`;
  }
  return el.tagName.toLowerCase();
}

// Create transparent overlay to show selection mode
function createOverlay() {
  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = 9998;
  overlay.style.background = "rgba(0,0,0,0.05)";
  overlay.style.pointerEvents = "none"; // Let clicks pass through
  document.body.appendChild(overlay);
}

function createDoneButton() {
  const doneBtn = document.createElement("button");
  doneBtn.innerText = "To save press escape key or esc key";
  doneBtn.style.position = "fixed";
  doneBtn.style.top = "10px";
  doneBtn.style.right = "10px";
  doneBtn.style.zIndex = 100000;
  doneBtn.style.padding = "8px 12px";
  doneBtn.style.background = "#333";
  doneBtn.style.color = "#fff";
  doneBtn.style.border = "none";
  doneBtn.style.borderRadius = "4px";
  doneBtn.style.cursor = "pointer";
  doneBtn.style.pointerEvents = "all";
  doneBtn.id = "capturescreenshot";
  // doneBtn.onclick = stopAnnotationMode;
  document.body.appendChild(doneBtn);
}

function startAnnotationMode() {
  if (selectionActive) return;
  selectionActive = true;
  annotations = [];

  document.body.style.cursor = "crosshair";
  createOverlay();
  createDoneButton();

  document.addEventListener("mouseover", onMouseOver);
  document.addEventListener("mouseout", onMouseOut);
  document.addEventListener("click", onClick, true); // use capture phase!

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
}

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
  console.log(el);
  console.log(el.tagName);
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

  // Use elementFromPoint to get actual element under cursor
  const elem = document.elementFromPoint(x, y);

  if (!isValidElement(elem)) return;

  // Find if already annotated
  const index = annotations.findIndex(a => a.element === elem);

  if (index !== -1) {
    // Unselect
    const { element, inputEl } = annotations[index];
    // element.style.backgroundColor = "";
    element.style.outline = "";
    element.style.position = "";
    element.style.border = "";
    element.style.boxSizing = "";

    if (element.getAttribute("data-label-act")) {
      element.removeAttribute("data-label-act");
    }
    
    if (inputEl && inputEl.parentNode === element) {
      element.removeChild(inputEl);
    }

    annotations.splice(index, 1);
  } else {
    // Select new element
    elem.style.outline = "none";
    elem.style.position = "relative";
    // elem.style.backgroundColor = "rgba(255, 60, 0, 0.81)";
    elem.style.border = "4px dashed rgba(255, 60, 0, 0.81)"; 
    elem.style.boxSizing = "border-box"; // Ensures border doesn't push the element, but is part of its size

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter label...";
    input.style.position = "absolute";
    input.style.bottom = "5px";
    input.style.right = "5px";
    input.style.background = "#333";
    input.style.color = "#fff";
    input.style.border = "1px solid #666";
    input.style.padding = "2px 5px";
    input.style.fontSize = "12px";
    input.style.borderRadius = "3px";
    input.style.zIndex = 2147483647;
    input.style.opacity = "1";
    input.style.pointerEvents = "auto";
    input.style.maxWidth = "150px";

    if (elem.tagName === "IMG") {
      input.style.width = "100%";
      elem.parentNode.insertBefore(input, elem.nextSibling);
    } else {
      input.style.width = "auto";
      elem.appendChild(input);
    }

    input.focus();

      // Auto-apply data-label as the user types
    input.addEventListener("input", () => {
      const label = input.value.trim();
      if (label) {
        elem.setAttribute("data-label-act", label);
      } else {
        elem.removeAttribute("data-label-act");
      }
    });

    annotations.push({
      element: elem,
      inputEl: input,
      selector: getUniqueSelector(elem)
    });
  }
}

// Start annotator
window.addEventListener("start-annotator", () => {
  startAnnotationMode();
});

// Capture screenshot and save annotations
window.addEventListener("capture-screenshot", () => {
  stopAnnotationMode();

  const exportAnnotations = annotations.map(({ selector, inputEl }) => ({
    selector,
    label: inputEl.value.trim()
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