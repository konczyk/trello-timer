var {PageMod} = require("sdk/page-mod");
var {activeTab} = require("sdk/tabs");
var {URL} = require("sdk/url");
var {storeTimer, getTimersPerCard} = require("./storage");

function getCardId() {
    var path = URL(activeTab.url).path;
    if (!path.match(/^\/c\/[A-Za-z0-9]{8,}\/.*$/)) {
        console.error("not a card path: " + path);
    }

    return path.split("/")[2];
}

PageMod({
    include: "https://trello.com/*",
    contentScriptFile: [
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
            worker.port.emit("attachTrackButton", getCardId());
            worker.port.emit("attachCardListeners", null);
        });
        worker.port.on("timerStop", function(times) {
            worker.port.emit("addTimeComment", times);
            saveTimer(getCardId(), times.start, times.end);
        });
        worker.port.on("cardClose", function() {
            worker.port.emit("cleanTrackButton", null);
            worker.port.emit("enableCardListener", null);
        });
    }
});
