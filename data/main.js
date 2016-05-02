var {PageMod} = require("sdk/page-mod");
var self = require("sdk/self");
var {prefs} = require("sdk/simple-prefs");
var notifications = require("sdk/notifications");

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
            logTime(
                data,
                function(card) {
                    console.log("logTime success: " + JSON.stringify(card));
                    notifications.notify({
                        title: "Trello Timer",
                        text: "Tracked time successfully saved!",
                    });
                },
                function(e) {
                    console.log("logTime failure: " + e);
                    notifications.notify({
                        title: "Trello Timer",
                        text: "Tracked time could not be saved",
                    });
                }
            );
        });

        // preferences changed
        var prefSet = require("sdk/simple-prefs");
        prefSet.on("", function(key) {
            refresh({"key": key, "value": prefSet.prefs[key]});
        });
    }
});
