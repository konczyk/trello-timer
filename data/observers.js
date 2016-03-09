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
            document.querySelector(CARD_LIST_SELECTOR) !== null) {
        console.log("matching mutation: boardReady");
        self.port.emit("boardReady", null);
    }

    return true;
}

function enableListener(cb) {
    for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i].callback === cb) {
            console.log("enabled mutation: " + cb);
            listeners[i].active = true;
            return;
        }
    }
}

self.port.on("attachObservers", attachObservers);

self.port.on("enableCardOpenListener", function() {
    enableListener(cardOpenListener);
});

self.port.on("enableBoardReadyListener", function() {
    enableListener(BoardReadyListener);
});
