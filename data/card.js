self.port.on("attachCardListeners", function() {
    var close = document.querySelector(".window-wrapper .dialog-close-button");
    var overlay = document.querySelector(".window-overlay");

    close.addEventListener("click", function() {
        self.port.emit("cardClose", null);
    });

    overlay.addEventListener("click", function() {
        if (document.querySelector(".card-detail-window") === null) {
            self.port.emit("cardClose", null);
        }
    });
});
