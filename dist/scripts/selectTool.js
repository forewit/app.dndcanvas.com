import { Entity } from "./entity.js";
import { Note } from "./note.js";
import * as keys from "../modules/keys.js";
import * as gestures from "../modules/gestures.js";
// constants
const ZOOM_INTENSITY = 0.2, INERTIAL_FRICTION = 0.8, // 0 = infinite friction, 1 = no friction
INERTIAL_MEMORY = 0.2, // 0 = infinite memory, 1 = no memory
INERTIA_TIMEOUT = 30, // ms
EPSILON = 0.01; // replacement for 0 to prevent divide-by-zero errors
// state management
let activeBoard = null, activeLayer = null, selected = [], handleBounds = null, selectBoxBounds = null, isPanning = false, lastPanTime = 0, vx = 0, vy = 0;
// define handles entity
let handles = new Entity(9999, 0, 0, 0);
handles.render = (board) => {
    if (!handleBounds)
        return;
    let ctx = board.ctx;
    // draw selection box
    ctx.save();
    ctx.translate(handleBounds.left + handleBounds.w / 2, handleBounds.top + handleBounds.h / 2);
    ctx.rotate(handleBounds.rad);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 3;
    ctx.strokeRect(-handleBounds.w / 2, -handleBounds.h / 2, handleBounds.w, handleBounds.h);
    ctx.restore();
};
// define selectBox entity
let selectBox = new Entity(9999, 0, 0, 0);
selectBox.render = (board) => {
    if (!selectBoxBounds)
        return;
    // draw selection box
    board.ctx.save();
    board.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    board.ctx.lineWidth = 3;
    board.ctx.strokeRect(selectBoxBounds.left, selectBoxBounds.top, selectBoxBounds.w, selectBoxBounds.h);
    board.ctx.restore();
};
const enable = (board, layer) => {
    // reset state
    activeBoard = board;
    activeLayer = layer;
    selected = [];
    isPanning = false;
    vx = 0;
    vy = 0;
    // add gesture event listeners
    gestures.enable(activeBoard.canvas);
    activeBoard.canvas.addEventListener("gesture", gestureHandler);
    // setup keybindings
    setupKeybindings();
    // add UI entities
    activeBoard.add(handles);
    activeBoard.add(selectBox);
};
const disable = () => {
    if (activeBoard) {
        // remove gesture event listeners
        gestures.disable(activeBoard.canvas);
        activeBoard.canvas.removeEventListener("gesture", gestureHandler);
        // remove keybindings
        keys.unbind("Control+r, Control+R, Meta+r, Meta+R, Control+a, Control+A, Meta+a, Meta+A");
        // remove UI entities
        activeBoard.destroy(handles);
        activeBoard.destroy(selectBox);
    }
};
export const selectTool = {
    name: "select",
    enable,
    disable
};
const setupKeybindings = () => {
    // Prevent reloading the page
    keys.bind("Control+r, Control+R, Meta+r, Meta+R", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Prevented reload.");
    });
    // Select all entities
    keys.bind("Control+a, Control+A, Meta+a, Meta+A", (e) => {
        // TODO: select all entities
        console.log("TODO: select all entities");
    });
};
const gestureHandler = (e) => {
    if (!activeLayer || !activeBoard)
        return;
    // convert window coordinates to board coordinates
    let scaleFactor = window.devicePixelRatio / activeBoard.scale;
    let x = (e.detail.x - activeBoard.left) * scaleFactor + activeBoard.origin.x, y = (e.detail.y - activeBoard.top) * scaleFactor + activeBoard.origin.y, dx = (e.detail.dx) ? e.detail.dx * scaleFactor : 0, dy = (e.detail.dy) ? e.detail.dy * scaleFactor : 0, zoom = e.detail.zoom || 1, event = e.detail.event || null;
    // triage gestures by name
    switch (e.detail.name) {
        case "left-click":
        case "tap":
            if (!keys.down["Shift"])
                clearSelection();
            selectPoint(x, y);
            break;
        case "longclick":
            activeBoard.canvas.style.cursor = "grabbing";
            break;
        case "longclick-release":
            activeBoard.canvas.style.cursor = "";
            break;
        case "longclick-dragging":
        case "touch-dragging":
        case "middle-click-dragging":
            activeBoard.canvas.style.cursor = "grabbing";
            pan(dx, dy);
            break;
        case "pinching":
            activeBoard.zoom(x, y, zoom);
            pan(dx, dy);
            break;
        case "wheel":
            activeBoard.zoom(x, y, wheelToZoomFactor(event));
            break;
        case "longclick-drag-end":
        case "middle-click-drag-end":
        case "touch-drag-end":
        case "pinch-end":
            activeBoard.canvas.style.cursor = "";
            endPanning();
            break;
        case "longclick-drag-start":
        case "left-click-drag-start":
        case "right-click-drag-start":
        case "longpress-drag-start":
            if (!keys.down["Shift"])
                clearSelection();
            startSelectBox(x, y);
            break;
        case "longpress-dragging":
        case "left-click-dragging":
        case "right-click-dragging":
        case "longpress-dragging":
            updateSelectBox(x, y, dx, dy);
            break;
        case "longpress-drag-end":
        case "left-click-drag-end":
        case "right-click-drag-end":
        case "longpress-drag-end":
            endSelectBox();
            break;
    }
};
const startSelectBox = (x, y) => {
    selectBoxBounds = { left: x, top: y, right: x, bottom: y, w: 0, h: 0 };
};
const updateSelectBox = (x, y, dx, dy) => {
    if (!selectBoxBounds)
        return;
    if (dx > 0) {
        // moving right while inside the selection box
        if (x < selectBoxBounds.right)
            selectBoxBounds.left += dx;
        // moving right while outside the selection box
        else
            selectBoxBounds.right += dx;
    }
    else {
        // moving left while inside the selection box
        if (x > selectBoxBounds.left)
            selectBoxBounds.right += dx;
        // moving left while outside the selection box
        else
            selectBoxBounds.left += dx;
    }
    if (dy > 0) {
        // moving down while inside the selection box
        if (y < selectBoxBounds.bottom)
            selectBoxBounds.top += dy;
        // moving down while outside the selection box
        else
            selectBoxBounds.bottom += dy;
    }
    else {
        // moving up while inside the selection box
        if (y > selectBoxBounds.top)
            selectBoxBounds.bottom += dy;
        // moving up while outside the selection box
        else
            selectBoxBounds.top += dy;
    }
    // update width and height
    selectBoxBounds.w = selectBoxBounds.right - selectBoxBounds.left;
    selectBoxBounds.h = selectBoxBounds.bottom - selectBoxBounds.top;
    // outline entities in the selection box
    let entities = activeLayer.rectIntersection(selectBoxBounds.left, selectBoxBounds.top, selectBoxBounds.w, selectBoxBounds.h);
    for (let entity of activeLayer.entities) {
        entity.outline = (entities.findIndex(e => e.ID === entity.ID) > -1);
    }
};
const endSelectBox = () => {
    if (!selectBoxBounds)
        return;
    // select all entities in selection box
    let entities = activeLayer.rectIntersection(selectBoxBounds.left, selectBoxBounds.top, selectBoxBounds.w, selectBoxBounds.h);
    for (let entity of entities) {
        entity.outline = false;
        if (selected.findIndex(e => e.ID === entity.ID) > -1)
            continue;
        selected.push(entity);
    }
    // reset selection box bounds
    selectBoxBounds = null;
    // update handles
    handleBounds = getBounds(selected);
};
const selectPoint = (x, y) => {
    // check active layer for intersections
    let entity = activeLayer.firstIntersection(x, y);
    // select intersected entity if not already selected
    if (entity && selected.findIndex((e) => e.ID === entity.ID) === -1) {
        selected.push(entity);
        handleBounds = getBounds(selected);
    }
    // break target focus
    if (selected.length == 0)
        document.activeElement.blur();
    else if (entity instanceof Note) {
        // focus on note if it is selected
        entity.elm.focus();
    }
};
const clearSelection = () => {
    selected = [];
    handleBounds = null;
};
const getBounds = (entities) => {
    if (entities.length === 0)
        return null;
    // allow a rotated bounding box if there is only one entity
    if (entities.length === 1) {
        return {
            left: entities[0].x - entities[0].w / 2,
            top: entities[0].y - entities[0].h / 2,
            w: entities[0].w,
            h: entities[0].h,
            rad: entities[0].rad
        };
    }
    let boundingLeft = entities[0].x, boundingRight = entities[0].x, boundingTop = entities[0].y, boundingBottom = entities[0].y;
    for (let entity of entities) {
        let angle = entity.rad % (Math.PI);
        if (angle > Math.PI / 2)
            angle = Math.PI - angle;
        let halfW = (Math.sin(angle) * entity.h + Math.cos(angle) * entity.w) / 2, halfH = (Math.sin(angle) * entity.w + Math.cos(angle) * entity.h) / 2;
        let left = entity.x - halfW, right = entity.x + halfW, top = entity.y - halfH, bottom = entity.y + halfH;
        boundingLeft = Math.min(boundingLeft, left);
        boundingRight = Math.max(boundingRight, right);
        boundingTop = Math.min(boundingTop, top);
        boundingBottom = Math.max(boundingBottom, bottom);
    }
    let width = boundingRight - boundingLeft, height = boundingBottom - boundingTop;
    return {
        left: boundingTop,
        top: boundingLeft,
        w: width,
        h: height,
        rad: 0
    };
};
const wheelToZoomFactor = (e) => {
    // normalize wheel direction
    let direction = e.deltaY < 0 ? 1 : -1;
    // calculate zoom factor
    return Math.exp(direction * ZOOM_INTENSITY);
};
const pan = (dx, dy) => {
    if (!isPanning) {
        isPanning = true;
        vx = 0;
        vy = 0;
    }
    activeBoard.pan(dx, dy);
    // update velocity
    vx = dx * INERTIAL_MEMORY + vx * (1 - INERTIAL_MEMORY);
    vy = dy * INERTIAL_MEMORY + vy * (1 - INERTIAL_MEMORY);
    lastPanTime = performance.now();
};
const endPanning = () => {
    isPanning = false;
    // drop inertia if too much time has passed
    let elapsed = performance.now() - lastPanTime;
    if (elapsed > INERTIA_TIMEOUT)
        return;
    requestAnimationFrame(inertia);
    function inertia() {
        // stop inertia if new pan starts or velocity is low
        if (isPanning || (Math.abs(vx) < EPSILON && Math.abs(vy) < EPSILON))
            return;
        // move board and update velocity
        activeBoard.pan(vx, vy);
        vx *= INERTIAL_FRICTION;
        vy *= INERTIAL_FRICTION;
        requestAnimationFrame(inertia);
    }
};
