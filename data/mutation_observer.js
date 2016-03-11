var mutationObserver = {
    attach: function(target, callback, options) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(callback);
        });
        observer.observe(target, options || {childList: true});
    }
}

window.addEventListener("load",function() {

    function emit(event) {
        console.log("Mutation event: " + event);
        self.port.emit(event);
    }

    mutationObserver.attach(
        document.getElementById("content"),
        function(mutation) {
            if (mutation.addedNodes.length > 0) {
                emit("listsChange");
            }
        }
    );

    mutationObserver.attach(
        document.querySelector(".window-overlay .window-wrapper"),
        function(mutation) {
            var added = mutation.addedNodes;
            if (added.length === 1 &&
                   added[0].classList.contains("card-detail-window")) {
                emit("cardOpen");
            }
        }
    );

    mutationObserver.attach(
        document.querySelector("body"),
        function(mutation) {
            var removed = mutation.removedNodes;
            if (removed.length === 1 &&
                   removed[0].classList.contains("list-card")) {
                emit("listsChange");
            }
        }

    )
});
