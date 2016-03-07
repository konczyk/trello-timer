const TRACK_BUTTON_TEXT = " Track time";
const TRACK_BUTTON_ACTIVE_CLASS = "tt-active";
const ICON = (function() {
    var icon = document.createElement("span");
    icon.classList.add("icon-sm", "icon-clock");
    return icon;
})();

var trackStart = null;
var button = null;
var trackInterval = null;

self.port.on("attachTrackButton", function() {
    var container = document.querySelector(".other-actions .u-clearfix");
    button = makeButton();
    container.insertBefore(button, container.firstChild);
});

function makeButton() {
    var node = document.createElement("a");
    node.classList.add("button-link");
    node.setAttribute("href", "#");
    node.appendChild(ICON.cloneNode());
    node.appendChild(document.createTextNode(TRACK_BUTTON_TEXT));
    node.addEventListener("click", track);

    return node;
}

function track(e) {
    if (trackStart === null) {
        startTracking();
    } else {
        stopTracking();
    }
    e.stopPropagation();
    button.blur();
}

function startTracking() {
    trackStart = new Date();
    button.classList.add(TRACK_BUTTON_ACTIVE_CLASS);
    emptyNode(button);
    button.appendChild(document.createTextNode("00:00:00"));
    trackInterval = setInterval(tick, 1000);
}

function stopTracking() {
    self.port.emit("trackingStopped", trackStart, new Date());
    clearInterval(trackInterval);
    trackStart = null;
    button.classList.remove(TRACK_BUTTON_ACTIVE_CLASS);
    emptyNode(button);
    button.appendChild(ICON.cloneNode());
    button.appendChild(document.createTextNode(TRACK_BUTTON_TEXT));
}

function emptyNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function tick() {
    var diff = (new Date() - trackStart) / 1000;
    var h = Math.floor(diff / 3600) % 24;
    var m = Math.floor((diff - h*3600) / 60) % 60;
    var s = Math.floor((diff - h*3600 - m*60) % 60);
    button.textContent =
        (h <= 9 ? "0" : "") + h + ":" +
        (m <= 9 ? "0" : "") + m + ":" +
        (s <= 9 ? "0" : "") + s;
}
