var {PageMod} = require("sdk/page-mod");
var {saveTimer, getTimersPerCard} = require("./storage");
var {prefs} = require("sdk/simple-prefs");

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
    contentScriptWhen: "ready",
    contentScriptOptions: prefs,
    onAttach: function(worker) {
        worker.port.emit("attachObservers", null);
        worker.port.on("boardReady", function() {
            getTimersPerCard(function(timers) {
                worker.port.emit("initLists", timers);
            });
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
            worker.port.emit("enableCardOpenListener", null);
        });
        var prefSet = require("sdk/simple-prefs");
        prefSet.on("timer_badge_position", function() {
            worker.port.emit("toggleTimerBadges",
                             prefSet.prefs["timer_badge_position"]);
        });
        prefSet.on("hide_desc_badge", function() {
            worker.port.emit("toggleDescBadges",
                             prefSet.prefs["hide_desc_badge"]);
        });
    }
});
