self.port.on("cardOpen", function() {
    var close = document.querySelector(CLOSE_CARD_SELECTOR);
    var overlay = document.querySelector(OVERLAY_SELECTOR);

    close.addEventListener("click", function() {
        self.port.emit("cardClose", null);
    });

    overlay.addEventListener("click", function() {
        if (document.querySelector(CARD_WINDOW_SELECTOR) === null) {
            self.port.emit("cardClose", null);
        }
    });
});
