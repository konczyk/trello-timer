const WINDOW_MATCHER = ".window-wrapper";
const CARD_MATCHER = WINDOW_MATCHER + " .card-detail-window";

var observer = new MutationObserver(function(mutations) {
    var mutation = mutations[0];
    if (mutation.addedNodes.length > 0 &&
            document.querySelector(CARD_MATCHER) !== null) {
        self.port.emit("cardOpen", null);
    }
});

observer.observe(
    document.querySelector('.window-wrapper'),
    {
        childList: true
    }
);
