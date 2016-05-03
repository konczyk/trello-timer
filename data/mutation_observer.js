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
    attachToNode: function(node, callback, options) {
        node.dataset.observed = 1;
        new MutationObserver(function(mutations) {
            mutations.forEach(callback);
        }).observe(node, options || {childList: true});
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
    notify: function(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(function(callback) {
                callback(data);
            });
        }
    }
}

window.addEventListener("load",function() {

    function emit(event, data) {
        console.log("Mutation event: " + event);
        self.port.emit(event);
        mutationObserver.notify(event, data);
    }

    // detect new lists
    function detectNewList() {
        mutationObserver.attach(
            "#board",
            function(mutation) {
                var added = mutation.addedNodes;
                if (added.length === 1
                        && added[0].classList.contains("js-list")
                        && added[0].classList.contains("list-wrapper")) {

                    let node = added[0].querySelector(".list-cards");
                    if (node.dataset.observed !== "1") {
                        detectListMutation(node);
                        emit("listAdded");
                    }
                }
            }
        );
    }

    // detect list changed
    function detectListsMutations() {
        var lists = document.getElementById("board")
                            .querySelectorAll(".list-cards");
        for (let i = 0; i < lists.length; i++) {
            detectListMutation(lists[i]);
        }
    }

    function detectListMutation(listNode) {
        mutationObserver.attachToNode(
            listNode,
            function(mutation) {
                var added = mutation.addedNodes;
                if (added.length === 1
                        && added[0].childNodes.length > 0
                        && added[0].classList.contains("list-card")
                        && added[0].nextSibling !== null
                        && added[0].nextSibling
                                   .classList.contains("card-composer")
                        && added[0].querySelector(".timer-badge") === null) {
                    emit("cardAdded", added[0]);
                }
            }
        );
    }

    detectNewList();
    detectListsMutations();

    // detect board switch
    mutationObserver.attach(
        "#content",
        function(mutation) {
            if (mutation.addedNodes.length > 0) {
                emit("listsChange");
            }
        }
    );

    // detect card open
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

    // detect card drag & drop
    mutationObserver.attach(
        "body",
        function(mutation) {
            var removed = mutation.removedNodes;
            if (removed.length === 1 &&
                   removed[0].classList.contains("list-card")) {
                emit("listsChange");
            }
        }
    );
});
