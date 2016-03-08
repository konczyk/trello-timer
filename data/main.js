var {PageMod} = require("sdk/page-mod");
var {saveTimer, getTimersPerCard} = require("./storage");

PageMod({
    include: "https://trello.com/*",
    contentScriptFile: [
        "./const.js",
        "./utils.js",
        "./observers.js",
        "./board.js",
        "./card.js",
        "./track_button.js",
        "./comments.js",
    ],
    contentStyleFile: "./style.css",
    onAttach: function(worker) {
        getTimersPerCard(function(timers) {
            worker.port.emit("updateLists", timers);
        });
        worker.port.on("cardOpen", function() {
            worker.port.emit("attachTrackButton", null);
            worker.port.emit("attachCardListeners", null);
        });
        worker.port.on("timerStop", function(timer) {
            worker.port.emit("addTimeComment", timer);
            saveTimer(timer);
        });
        worker.port.on("cardClose", function() {
            worker.port.emit("cleanTrackButton", null);
            worker.port.emit("enableCardListener", null);
        });
    }
});
