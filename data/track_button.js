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
var card = null;
var interruptedTimers = [];

self.port.on("attachTrackButton", function(cardId) {
    card = cardId;
    var container = document.querySelector(".other-actions .u-clearfix");
    button = makeButton();
    container.insertBefore(button, container.firstChild);
    if (oldTime = findInterruptedTime()) {
        startTracking(oldTime);
    }
});

self.port.on("cleanTrackButton", function() {
    if (trackStart !== null) {
        interruptedTimers.push({
            "card": card,
            "time": trackStart
        });
        trackStart = null;
        card = null;
        button = null;
        clearInterval(trackInterval);
    }
});

function makeButton() {
    var node = document.createElement("a");
    node.addEventListener("click", track);
    node.classList.add("button-link");
    node.setAttribute("href", "#");
    node.appendChild(ICON.cloneNode());
    node.appendChild(document.createTextNode(TRACK_BUTTON_TEXT));

    return node;
}

function findInterruptedTime() {
    var time = null;
    var idx = null;
    for (var i = 0; i < interruptedTimers.length; i++) {
        if (interruptedTimers[i].card === card) {
            time = interruptedTimers[i].time;
            idx = i;
            break;
        }
    }
    if (idx !== null) {
        interruptedTimers.splice(idx, 1);
    }

    return time;
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

function startTracking(time) {
    trackStart = time || new Date();
    button.classList.add(TRACK_BUTTON_ACTIVE_CLASS);
    emptyNode(button);
    button.appendChild(document.createTextNode(
        intervalToClock(trackStart, new Date())
    ));
    trackInterval = setInterval(function() {
        button.textContent = intervalToClock(trackStart, new Date());
    }, 1000);
}

function stopTracking() {
    self.port.emit("timerStop", {start: trackStart, end: new Date()});
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
