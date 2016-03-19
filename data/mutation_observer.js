window.mutationObserver = {
    listeners: {},
    observers: {},
    attach: function(target, callback, options) {
        if (!this.observers[target]) {
            this.observers[target] = new MutationObserver(function(mutations) {
                mutations.forEach(callback);
            });
        }
        this.observers[target].observe(document.querySelector(target),
                                      options || {childList: true});
    },
    detach: function(target) {
        if (this.observers[target]) {
            this.observers[target].disconnect();
        }
    },
    listen: function(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },
    notify: function(event) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(function(callback) {
                callback();
            });
        }
    }
}

window.addEventListener("load",function() {

    function emit(event) {
        console.log("Mutation event: " + event);
        self.port.emit(event);
        mutationObserver.notify(event);
    }

    mutationObserver.attach(
        "#content",
        function(mutation) {
            if (mutation.addedNodes.length > 0) {
                emit("listsChange");
            }
        }
    );

    mutationObserver.attach(
        ".window-overlay .window-wrapper",
        function(mutation) {
            var added = mutation.addedNodes;
            if (added.length === 1 &&
                   added[0].classList.contains("card-detail-window")) {
                emit("cardOpen");
            }
        }
    );

    mutationObserver.attach(
        "body",
        function(mutation) {
            var removed = mutation.removedNodes;
            if (removed.length === 1 &&
                   removed[0].classList.contains("list-card")) {
                emit("listsChange");
            }
        }

    )
});
