// --- GLOBAL VARIABLES ---

// State
let selectionActive = false;
let currentAnnotationMode = 'none'; // 'none', 'box', 'arrow'
let isScrolling = false;
let isDragging = false;
let isDrawingArrow = false;
let currentAnnotationColor = 'rgba(255, 80, 0, 0.9)';

// UI Elements
let overlay = null;
let lineSvg = null;
let modeButtonContainer = null;

// Data
let annotations = [];
let lastHoveredElement = null;
let scrollTimeout = null;

// Arrow Drawing temp data
let currentArrowEl, currentArrowHitbox, currentArrowAnnotation;


// --- UTILITY: GET ELEMENT SELECTORS ---

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


// --- UI CREATION ---

function createGlobalOverlays() {
    // Dimming Overlay
    if (!document.getElementById('selection-dim-overlay')) {
        overlay = document.createElement("div");
        overlay.id = 'selection-dim-overlay';
        Object.assign(overlay.style, {
            position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
            zIndex: "9998", background: "rgba(0,0,0,0.05)", pointerEvents: "none",
        });
        document.body.appendChild(overlay);
    }

    // SVG Overlay for lines and arrows
    if (!document.getElementById('annotation-lines-svg')) {
        lineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        lineSvg.id = 'annotation-lines-svg';
        Object.assign(lineSvg.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            pointerEvents: 'none', zIndex: '9999'
        });

        // Define an arrowhead marker
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.id = "arrowhead";
        marker.setAttribute("viewBox", "0 0 10 10");
        marker.setAttribute("refX", "8");
        marker.setAttribute("refY", "5");
        marker.setAttribute("markerWidth", "6");
        marker.setAttribute("markerHeight", "6");
        marker.setAttribute("orient", "auto-start-reverse");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.id = "arrowhead-path"; // ID for dynamic color change
        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.style.fill = currentAnnotationColor;
        marker.appendChild(path);
        defs.appendChild(marker);
        lineSvg.appendChild(defs);

        document.body.appendChild(lineSvg);
    }
}

function createModeButtons() {
    if (document.getElementById('annotation-mode-container')) return;

    modeButtonContainer = document.createElement("div");
    modeButtonContainer.id = "annotation-mode-container";
    Object.assign(modeButtonContainer.style, {
        position: "fixed", top: "10px", right: "10px", zIndex: "100000",
        background: 'rgba(17, 17, 17, 0.8)', borderRadius: '5px', padding: '5px',
        display: 'flex', gap: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(5px)'
    });

    const commonBtnStyle = {
        background: "#333", color: "#fff", border: "1px solid #555",
        borderRadius: "5px", cursor: "pointer", pointerEvents: "all",
        padding: "8px 12px", fontSize: '16px', lineHeight: '1'
    };

    // --- NEW: Color Picker ---
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.title = "Select Annotation Color";
    colorPicker.value = '#ff5000'; // Initial color
    Object.assign(colorPicker.style, {
        height: '34px', width: '40px', padding: '2px', cursor: 'pointer',
        border: '1px solid #555', background: '#333', borderRadius: '5px'
    });
    colorPicker.addEventListener('input', (e) => {
        // Convert hex to rgba for consistency
        const hex = e.target.value;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        currentAnnotationColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
        // Update the arrowhead color dynamically
        document.getElementById('arrowhead-path').style.fill = currentAnnotationColor;
    });

    const boxModeBtn = document.createElement("button");
    boxModeBtn.title = "Box Annotation Mode";
    boxModeBtn.innerText = "+";
    Object.assign(boxModeBtn.style, commonBtnStyle);
    boxModeBtn.onclick = () => startAnnotationMode('box');

    const arrowModeBtn = document.createElement("button");
    arrowModeBtn.title = "Arrow Annotation Mode";
    arrowModeBtn.innerText = "→";
    Object.assign(arrowModeBtn.style, commonBtnStyle);
    arrowModeBtn.onclick = () => startAnnotationMode('arrow');

    const clearAllBtn = document.createElement("button");
    clearAllBtn.title = "Clear All";
    clearAllBtn.innerText = "🗑️";
    Object.assign(clearAllBtn.style, commonBtnStyle);
    clearAllBtn.onclick = clearAllElements;

    const doneBtn = document.createElement("button");
    doneBtn.id = "annotation-done-btn";
    doneBtn.innerText = "Done (q)";
    Object.assign(doneBtn.style, commonBtnStyle, { background: '#007bff', border: '1px solid #0056b3'});
    doneBtn.onclick = () => window.dispatchEvent(new Event("capture-screenshot"));

    modeButtonContainer.appendChild(colorPicker);
    modeButtonContainer.appendChild(boxModeBtn);
    modeButtonContainer.appendChild(arrowModeBtn);
    modeButtonContainer.appendChild(clearAllBtn);
    modeButtonContainer.appendChild(doneBtn);
    document.body.appendChild(modeButtonContainer);
}


// --- ANNOTATION MODE MANAGEMENT ---

function startAnnotationMode(mode) {
    if (selectionActive) stopCurrentMode();
    selectionActive = true;
    currentAnnotationMode = mode;
    createGlobalOverlays();
    document.body.style.cursor = "crosshair";

    if (mode === 'box') {
        document.addEventListener("mouseover", onMouseOver);
        document.addEventListener("mouseout", onMouseOut);
        document.addEventListener("click", onBoxAnnotationClick, true);
    } else if (mode === 'arrow') {
        document.addEventListener('mousedown', onArrowMouseDown, true);
    }

    window.addEventListener('scroll', handlePageScroll, true);
    window.addEventListener('resize', updateAllAnnotations);
}

function stopCurrentMode() {
    if (!selectionActive) return;
    document.body.style.cursor = "default";
    document.removeEventListener("mouseover", onMouseOver);
    document.removeEventListener("mouseout", onMouseOut);
    document.removeEventListener("click", onBoxAnnotationClick, true);
    document.removeEventListener('mousedown', onArrowMouseDown, true);
    document.removeEventListener('mousemove', onArrowMouseMove, true);
    document.removeEventListener('mouseup', onArrowMouseUp, true);

    if (lastHoveredElement) {
        lastHoveredElement.style.outline = "";
        lastHoveredElement = null;
    }
    selectionActive = false;
    currentAnnotationMode = 'none';
}

function finalizeAndStop() {
    const annotationsToExport = annotations.map(({ type, selector, inputEl, targetSelector, tailCoords, color }) => ({
        type,
        selector: type === 'box' ? selector : targetSelector,
        label: inputEl ? inputEl.value.trim() : '',
        tailCoords: type === 'arrow' ? tailCoords : undefined,
        color
    }));

    stopCurrentMode();
    if(modeButtonContainer) modeButtonContainer.remove();
    if(overlay) overlay.remove();

    downloadAnnotations(annotationsToExport);
    takeScreenshot().then(() => clearAllElements());
}

async function takeScreenshot() {
    if (typeof html2canvas !== "function") {
        console.warn("html2canvas library is not available.");
        return;
    }

    if (modeButtonContainer) modeButtonContainer.style.display = 'none';

    try {
        const canvas = await html2canvas(document.body, {
            useCORS: true,
            scale: window.devicePixelRatio || 1,
            ignoreElements: (element) => element.id === 'annotation-mode-container',
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "annotated-screenshot.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("Screenshot capture failed:", err);
    } finally {
        if (modeButtonContainer) modeButtonContainer.style.display = 'flex';
    }
}

// --- EVENT HANDLERS (SCROLL & GENERAL) ---

function handlePageScroll() {
    isScrolling = true;
    if (lastHoveredElement && !annotations.some(a => a.element === lastHoveredElement)) {
        lastHoveredElement.style.outline = "";
        lastHoveredElement = null;
    }
    clearTimeout(scrollTimeout);
    updateAllAnnotations();
    scrollTimeout = setTimeout(() => { isScrolling = false; }, 150);
}

function isValidTarget(el) {
    if (!el || typeof el.tagName !== 'string') return false;
    if (el.closest && (el.closest('#annotation-mode-container') || el.classList.contains('annotation-label-input') || el.classList.contains('annotation-resize-handle'))) return false;
    if (["BODY", "HTML", "SCRIPT", "STYLE"].includes(el.tagName) || el === overlay || el === lineSvg) return false;
    return true;
}


// --- BOX ANNOTATION LOGIC ---

function onMouseOver(e) {
    if (isScrolling || isDragging) return;
    if (lastHoveredElement && lastHoveredElement !== e.target) {
        if (!annotations.some(a => a.element === lastHoveredElement)) {
            lastHoveredElement.style.outline = "";
        }
    }
    const el = e.target;
    if (isValidTarget(el) && !annotations.some(a => a.element === el)) {
        el.style.outline = "2px dashed red";
        lastHoveredElement = el;
    }
}

function onMouseOut(e) {
    if (e.target === lastHoveredElement && !annotations.some(a => a.element === e.target)) {
        e.target.style.outline = "";
    }
}

function onBoxAnnotationClick(e) {
    if (isScrolling || isDragging || !isValidTarget(e.target)) return;
    e.preventDefault();
    e.stopPropagation();

    const elem = e.target;
    const index = annotations.findIndex(a => a.element === elem);

    if (index !== -1) {
        removeAnnotation(index);
    } else {
        if (lastHoveredElement) lastHoveredElement.style.outline = "";
        
        elem.style.border = `3px dashed ${currentAnnotationColor}`;
        elem.style.boxSizing = "border-box";

        const annotation = createLabelAndHandle(elem.getBoundingClientRect());
        const newAnnotation = {
            type: 'box',
            element: elem,
            selector: getElementXPath(elem),
            color: currentAnnotationColor,
            ...annotation
        };

        annotations.push(newAnnotation);
        createConnectingLine(newAnnotation);
        addLabelListeners(newAnnotation);
    }
}


// --- ARROW ANNOTATION LOGIC ---

function onArrowMouseDown(e) {
    if (e.button !== 0 || !isValidTarget(e.target) || isScrolling || isDragging) return;
    e.preventDefault();
    e.stopPropagation();

    isDrawingArrow = true;
    document.body.style.cursor = 'crosshair';

    // Arrow starts at mouse down (TAIL)
    const tailCoords = { x: e.clientX, y: e.clientY };

    // Create label at the tail
    const labelRect = { top: e.clientY, left: e.clientX + 15, width: 0, height: 0 };
    const labelAnnotation = createLabelAndHandle(labelRect);

    // Create SVG elements for arrow and its hitbox
    currentArrowEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    currentArrowEl.style.stroke = currentAnnotationColor;
    currentArrowEl.style.strokeWidth = "2.5";
    currentArrowEl.style.fill = "none";
    currentArrowEl.setAttribute("marker-end", "url(#arrowhead)");
    currentArrowEl.style.pointerEvents = 'none';

    currentArrowHitbox = document.createElementNS("http://www.w3.org/2000/svg", "path");
    currentArrowHitbox.style.stroke = "transparent";
    currentArrowHitbox.style.strokeWidth = "15"; // Makes it easier to click
    currentArrowHitbox.style.fill = "none";
    currentArrowHitbox.style.pointerEvents = 'stroke';
    currentArrowHitbox.style.cursor = 'pointer';

    lineSvg.appendChild(currentArrowEl);
    lineSvg.appendChild(currentArrowHitbox);

    currentArrowAnnotation = {
        type: 'arrow',
        arrowEl: currentArrowEl,
        arrowHitbox: currentArrowHitbox,
        tailCoords: tailCoords,
        color: currentAnnotationColor,
        ...labelAnnotation
    };
    
    document.addEventListener('mousemove', onArrowMouseMove, true);
    document.addEventListener('mouseup', onArrowMouseUp, true);
}

function onArrowMouseMove(e) {
    if (!isDrawingArrow) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = currentArrowAnnotation.tailCoords.x;
    const startY = currentArrowAnnotation.tailCoords.y;
    const endX = e.clientX;
    const endY = e.clientY;
    const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
    currentArrowEl.setAttribute("d", pathData);
    currentArrowHitbox.setAttribute("d", pathData);
}

function onArrowMouseUp(e) {
    if (!isDrawingArrow) return;
    e.preventDefault();
    e.stopPropagation();
    
    isDrawingArrow = false;
    document.body.style.cursor = "crosshair";
    document.removeEventListener('mousemove', onArrowMouseMove, true);
    document.removeEventListener('mouseup', onArrowMouseUp, true);
    
    const targetElement = document.elementFromPoint(e.clientX, e.clientY);
    if (!isValidTarget(targetElement)) {
        // Arrow points to nothing valid, cancel it
        removeAnnotation(currentArrowAnnotation, true);
        return;
    }
    
    Object.assign(currentArrowAnnotation, {
        targetElement: targetElement,
        targetSelector: getElementXPath(targetElement)
    });
    
    const annIndex = annotations.push(currentArrowAnnotation) - 1;
    addLabelListeners(currentArrowAnnotation);
    
    // Add listener to the hitbox for deletion
    currentArrowHitbox.onclick = () => {
       const indexToRemove = annotations.findIndex(a => a === currentArrowAnnotation);
       if (indexToRemove > -1) removeAnnotation(indexToRemove);
    };

    updateArrowAnnotation(currentArrowAnnotation); // Final draw
}


// --- LABEL & HANDLE CREATION AND MANAGEMENT ---

function createLabelAndHandle(rect) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter label...";
    input.classList.add('annotation-label-input');
    Object.assign(input.style, {
        position: "absolute", background: "#333", color: "#fff",
        border: "1px solid #666", padding: "5px 8px", fontSize: "13px",
        borderRadius: "4px", zIndex: "100001", pointerEvents: "auto",
        minWidth: "80px", width: "150px", cursor: "move",
        left: (rect.left + window.scrollX) + 'px',
        top: (rect.top + window.scrollY) + 'px'
    });
    document.body.appendChild(input);

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('annotation-resize-handle');
    Object.assign(resizeHandle.style, {
        position: 'absolute', width: '10px', height: '10px',
        background: '#555', border: '1px solid #888',
        borderRadius: '2px', right: '-2px', bottom: '-2px',
        cursor: 'se-resize', zIndex: "100002"
    });
    input.appendChild(resizeHandle);
    
    return { inputEl: input, resizeHandle: resizeHandle };
}

function addLabelListeners(annotation) {
    const { inputEl, resizeHandle } = annotation;
    inputEl.addEventListener('focus', () => inputEl.style.cursor = 'text');
    inputEl.addEventListener('blur', () => inputEl.style.cursor = 'move');
    inputEl.addEventListener('keydown', e => e.key === 'Enter' && inputEl.blur());

    const onDragStart = (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        document.body.style.cursor = 'grabbing';
        
        const label = inputEl;
        e.stopPropagation();
        const initialMouseX = e.clientX;
        const initialMouseY = e.clientY;
        const initialLabelX = label.offsetLeft;
        const initialLabelY = label.offsetTop;

        const onDragMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - initialMouseX;
            const deltaY = moveEvent.clientY - initialMouseY;
            label.style.left = initialLabelX + deltaX + 'px';
            label.style.top = initialLabelY + deltaY + 'px';
            
            // --- MODIFICATION: Dragging the label moves the arrow tail ---
            if (annotation.type === 'arrow') {
                annotation.tailCoords = {
                    x: label.getBoundingClientRect().left,
                    y: label.getBoundingClientRect().top
                };
            }
            updateAnnotationShapes(annotation);
        };

        const onDragEnd = () => {
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);
            isDragging = false;
            document.body.style.cursor = 'crosshair';
            inputEl.style.cursor = document.activeElement === label ? 'text' : 'move';
        };
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
    };
    
    const onResizeStart = (e) => { /* ... (same as before) ... */ };
    inputEl.addEventListener('mousedown', onDragStart);
    resizeHandle.addEventListener('mousedown', onResizeStart);
    inputEl.focus();
}


// --- ANNOTATION DRAWING & UPDATING ---

function createConnectingLine(annotation) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.style.stroke = annotation.color;
    line.style.strokeWidth = "2.5";
    lineSvg.appendChild(line);
    annotation.lineEl = line;
    updateBoxAnnotation(annotation);
}

function updateAllAnnotations() {
    if (!selectionActive || !lineSvg) return;
    annotations.forEach(updateAnnotationShapes);
}

function updateAnnotationShapes(annotation) {
    if (annotation.type === 'box') {
        updateBoxAnnotation(annotation);
    } else if (annotation.type === 'arrow') {
        updateArrowAnnotation(annotation);
    }
}

function updateBoxAnnotation(annotation) {
    const { element, inputEl, lineEl, color } = annotation;
    if (!element || !inputEl || !lineEl || !lineSvg.contains(lineEl)) return;

    element.style.borderColor = color;
    lineEl.style.stroke = color;

    const elemRect = element.getBoundingClientRect();
    const labelRect = inputEl.getBoundingClientRect();
    const x1 = elemRect.left + elemRect.width / 2;
    const y1 = elemRect.top + elemRect.height / 2;
    const [x2, y2] = getSmartConnectionPoint(elemRect, labelRect);
    lineEl.setAttribute('x1', x1);
    lineEl.setAttribute('y1', y1);
    lineEl.setAttribute('x2', x2);
    lineEl.setAttribute('y2', y2);
}

function updateArrowAnnotation(annotation) {
    const { targetElement, arrowEl, arrowHitbox, tailCoords, color } = annotation;
    if (!targetElement || !arrowEl || !lineSvg.contains(arrowEl)) return;
    
    arrowEl.style.stroke = color;
    document.getElementById('arrowhead-path').style.fill = color; // Ensure arrowhead color matches

    const targetRect = targetElement.getBoundingClientRect();
    const endPoint = getSmartConnectionPoint(tailCoords, targetRect); // Arrow points to edge of target
    
    const pathData = `M ${tailCoords.x} ${tailCoords.y} L ${endPoint[0]} ${endPoint[1]}`;
    arrowEl.setAttribute("d", pathData);
    arrowHitbox.setAttribute("d", pathData);
}

function getSmartConnectionPoint(rectA, rectB) {
    const centerA = { x: rectA.left || rectA.x, y: rectA.top || rectA.y };
    const centerB = { x: rectB.left + rectB.width / 2, y: rectB.top + rectB.height / 2 };
    const dx = centerB.x - centerA.x;
    const dy = centerB.y - centerA.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        return [dx > 0 ? rectB.left : rectB.right, centerB.y];
    } else {
        return [centerB.x, dy > 0 ? rectB.top : rectB.bottom];
    }
}


// --- CLEANUP AND DATA EXPORT ---

function removeAnnotation(indexOrObject, isTemporary = false) {
    let annotation;
    let index;

    if (typeof indexOrObject === 'number') {
        index = indexOrObject;
        annotation = annotations[index];
    } else {
        annotation = indexOrObject;
        index = annotations.findIndex(a => a === annotation);
    }

    if (!annotation) return;

    if (annotation.type === 'box') {
        annotation.element.style.border = "";
        annotation.element.style.boxSizing = "";
        if(annotation.lineEl) annotation.lineEl.remove();
    } else if (annotation.type === 'arrow') {
        if(annotation.arrowEl) annotation.arrowEl.remove();
        if(annotation.arrowHitbox) annotation.arrowHitbox.remove();
    }
    
    if (annotation.inputEl) annotation.inputEl.remove();
    if (index > -1 && !isTemporary) {
        annotations.splice(index, 1);
    }
}

function clearAllElements() {
    [...annotations].forEach((ann) => removeAnnotation(ann));
    annotations = [];
}

// --- GLOBAL EVENT LISTENERS TO START/STOP ---

function handleKeydown(e) {
    if (e.key === "q" && selectionActive) {
        window.dispatchEvent(new Event("capture-screenshot"));
    }
}

// All other functions (download, screenshot, listeners) remain largely the same
// ...

function downloadAnnotations(data) {
    const json = JSON.stringify(data, null, 2);
    const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "annotations.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function startAnnotatorListener() {
    console.log("Event 'start-annotator' received.");
    createModeButtons();
    document.addEventListener("keydown", handleKeydown);
}

function captureScreenshotListener() {
    if (!selectionActive) return;
    console.log("Event 'capture-screenshot' received.");
    finalizeAndStop();
}

window.removeEventListener("start-annotator", startAnnotatorListener);
window.removeEventListener("capture-screenshot", captureScreenshotListener);
document.removeEventListener("keydown", handleKeydown);

window.addEventListener("start-annotator", startAnnotatorListener);
window.addEventListener("capture-screenshot", captureScreenshotListener);