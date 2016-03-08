var trackStart = null;
var button = null;
var trackInterval = null;
var card = null;
var interruptedTimers = [];

self.port.on("attachTrackButton", function() {
    card = getCardIdFromURL();
    var container = document.querySelector(ACTIONS_SELECTOR);
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
    node.appendChild(CLOCK_ICON.cloneNode());
    node.appendChild(document.createTextNode(TRACK_BUTTON_TEXT));
    swapIcons();

    return node;
}

function swapIcons() {
    var calendar = document.querySelector(DUE_DATE_ICON_SELECTOR);
    calendar.classList.remove("icon-clock");
    calendar.classList.add("icon-calendar");
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
    self.port.emit("timerStop", {
        card: getCardIdFromURL(),
        start: trackStart,
        end: new Date()
    });
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
