var listeners = [
    {
        active: true,
        target: WINDOW_SELECTOR,
        callback: cardOpenListener
    },
    {
        active: true,
        target: BOARD_SELECTOR,
        callback: boardReadyListener
    }
]

function attachObservers() {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(runListeners);
    });

    observer.observe(document.querySelector(WINDOW_SELECTOR),
                     {childList: true});
    observer.observe(document.querySelector(BOARD_SELECTOR),
                     {childList: true});

    runListeners();
}

function runListeners(mutation) {
    for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i].active
                && (!mutation || mutation.target === document.querySelector(listeners[i].target))) {
            listeners[i].active = listeners[i].callback(mutation);
        }
    }
}

function cardOpenListener(mutation) {
    if ((!mutation || mutation.addedNodes.length > 0) &&
            document.querySelector(SIDEBAR_SELECTOR) !== null) {
        console.log("matching mutation: cardOpen");
        self.port.emit("cardOpen", null);
        return false;
    }

    return true;
}

function boardReadyListener(mutation) {
    if ((!mutation || mutation.addedNodes.length > 0) &&
            document.querySelector(CARDS_SELECTOR) !== null) {
        console.log("matching mutation: boardReady");
        self.port.emit("boardReady", null);
        return false;
    }

    return true;
}

self.port.on("attachObservers", attachObservers);

self.port.on("enableCardOpenListener", function() {
    for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i].callback === cardOpenListener) {
            console.log("enabled mutation: cardOpen");
            listeners[i].active = true;
            return;
        }
    }
});
