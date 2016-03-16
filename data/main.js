var {PageMod} = require("sdk/page-mod");
var self = require("sdk/self");
var {prefs} = require("sdk/simple-prefs");

var {saveTime, getTimePerCard} = require("./storage");
//require("./http_observer");

PageMod({
    include: "https://trello.com/*",
    contentScriptFile: [
        "./onload.js",
        "./utils.js",
        "./mutation_observer.js",
        "./board.js",
        "./card.js"
    ],
    contentStyleFile: "./style.css",
    contentScriptWhen: "start",
    contentScriptOptions: prefs,
    attachTo: ["existing", "top"],
    onAttach: function(worker) {

        function refresh(opts) {
            getTimePerCard(function(time) {
                worker.port.emit("listsChanged",
                                 {"time": time, "options": opts || {}});
            });
        }

        worker.port.on("listsChange", function() {
            refresh();
        });

        worker.port.on("cardOpen", function() {
            worker.port.emit("cardOpen", null);
        });

        worker.port.on("cardClose", function() {
            refresh();
        });

        worker.port.on("logTime", function(logEntry) {
            saveTime(logEntry);
        });

        // preferences changed
        var prefSet = require("sdk/simple-prefs");
        prefSet.on("", function(key) {
            refresh({"key": key, "value": prefSet.prefs[key]});
        });
    }
});
