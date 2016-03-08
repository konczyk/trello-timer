var listeners = [
    {
        active: true,
        callback: cardOpenListener
    }
]

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].active) {
                listeners[i].active = listeners[i].callback(mutation);
            }
        }
    });
});

observer.observe(
    document.querySelector(WINDOW_SELECTOR),
    {
        childList: true
    }
);

function cardOpenListener(mutation) {
    if (mutation.addedNodes.length > 0 &&
            document.querySelector(SIDEBAR_SELECTOR) !== null) {
        self.port.emit("cardOpen", null);
        return false;
    }

    return true;
}

self.port.on("enableCardListener", function() {
    for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i].callback === cardOpenListener) {
            listeners[i].active = true;
            return;
        }
    }
});
