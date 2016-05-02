var {PageMod} = require("sdk/page-mod");
var self = require("sdk/self");
var {prefs} = require("sdk/simple-prefs");

var {logTime, getCards} = require("./storage");
//require("./http_observer");

PageMod({
    include: "https://trello.com/*",
    contentScriptFile: [
        "./utils.js",
        "./onload.js",
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
            getCards(function(cards) {
                worker.port.emit("listsChanged",
                                 {"cardsData": cards, "options": opts || {}});
            });
        }

        worker.port.on("contentLoaded", function() {
            console.log("main: contentLoaded");
            refresh();
        });

        worker.port.on("listsChange", function() {
            console.log("main: listsChange");
            refresh();
        });

        worker.port.on("cardClose", function() {
            console.log("main: cardClose");
            refresh();
        });

        worker.port.on("logTime", function(data) {
            console.log("main: logTime");
            logTime(data, function(info) {
                worker.port.emit("loggedTime", info);
            });
        });

        // preferences changed
        var prefSet = require("sdk/simple-prefs");
        prefSet.on("", function(key) {
            refresh({"key": key, "value": prefSet.prefs[key]});
        });
    }
});
