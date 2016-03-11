var {PageMod} = require("sdk/page-mod");
var self = require("sdk/self");
var {prefs} = require("sdk/simple-prefs");

var {saveTimer, getTimersPerCard} = require("./storage");
//require("./http_observer");

PageMod({
    include: "https://trello.com/*",
    contentScriptFile: [
        "./onload.js",
        "./const.js",
        "./utils.js",
        "./mutation_observer.js",
        "./board.js",
        "./card.js",
        "./track_button.js",
        "./comments.js",
    ],
    contentStyleFile: "./style.css",
    contentScriptWhen: "start",
    contentScriptOptions: prefs,
    attachTo: ["existing", "top"],
    onAttach: function(worker) {

        worker.port.on("listsChange", function() {
            getTimersPerCard(function(timers) {
                worker.port.emit("syncLists", timers);
            });
        });

        worker.port.on("cardOpen", function() {
            worker.port.emit("cardOpen", null);
        });

        worker.port.on("cardClose", function() {
            worker.port.emit("cardClose", null);
        });

        worker.port.on("timerStop", function(timer) {
            worker.port.emit("timerStop", timer);
            saveTimer(timer);
        });

        // preferences changed
        var prefSet = require("sdk/simple-prefs");
        prefSet.on("", function(key) {
            var param = {"key": key, "value": prefSet.prefs[key]};
            try {
                worker.port.emit("toggleCards", param);
            } catch (e) {
                console.log(e.message);
            }
        });
    }
});
