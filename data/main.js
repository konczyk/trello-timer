var {PageMod} = require("sdk/page-mod");
var self = require("sdk/self");
var {prefs} = require("sdk/simple-prefs");
var notifications = require("sdk/notifications");

var {logTime, logUnsavedTime, removeTime} = require("./storage");
var {getCards, getCard} = require("./storage");
//require("./http_observer");

PageMod({
    include: "https://trello.com/*",
    contentScriptFile: [
        "./utils.js",
        "./onload.js",
        "./mutation_observer.js",
        "./board.js",
        "./card_timelog.js",
        "./card.js"
    ],
    contentStyleFile: "./style.css",
    contentScriptWhen: "start",
    contentScriptOptions: prefs,
    attachTo: ["existing", "top"],
    onAttach: function(worker) {

        var openCardId = null;

        function refreshBoard(opts) {
            getCards(function(cards) {
                worker.port.emit("listsChanged",
                                 {"cardsData": cards, "options": opts || {}});
            });
        }

        function refreshCard(opts) {
            getCard(openCardId, function(card) {
                worker.port.emit("cardChanged",
                                 {"card": card, "options": opts || {}});
            });
        }

        worker.port.on("contentLoaded", function() {
            console.log("main: contentLoaded");
            refreshBoard();
        });

        worker.port.on("listsChange", function() {
            console.log("main: listsChange");
            refreshBoard();
        });

        worker.port.on("cardReady", function(data) {
            console.log("main: cardReady " + data.cardId);
            openCardId = data.cardId;
            refreshCard(data.cardId);
        });

        worker.port.on("cardClose", function(card) {
            console.log("main: cardClose" + JSON.stringify(card));
            if (card.unsaved !== null) {
                logUnsavedTime(card);
            }
            openCardId = null;
            refreshBoard();
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
                    refreshCard();
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

        worker.port.on("logTimeExpired", function(data) {
            notifications.notify({
                title: "Trello Timer",
                text: "Tracked time could not be saved, time expired! " +
                      "Try syncing your data",
            });
        });

        worker.port.on("syncTime", function(data) {
            logTime(
                data,
                function(card) {
                    console.log("syncTime success: " + JSON.stringify(card));
                    notifications.notify({
                        title: "Trello Timer",
                        text: "Tracked time successfully synced!",
                    });
                    refreshCard();
                },
                function(e) {
                    console.log("logTime failure: " + e);
                    notifications.notify({
                        title: "Trello Timer",
                        text: "Tracked time could not be synced",
                    });
                }
            );
        });

        worker.port.on("removeTime", function(data) {
            removeTime(
                data,
                function(card) {
                    console.log("removeTime success: " + JSON.stringify(card));
                    notifications.notify({
                        title: "Trello Timer",
                        text: "Tracked time successfully removed!",
                    });
                    refreshCard();
                },
                function(e) {
                    console.log("removeTime failure: " + e);
                    notifications.notify({
                        title: "Trello Timer",
                        text: "Tracked time could not be removed",
                    });
                }
            );
        });

        // preferences changed
        var prefSet = require("sdk/simple-prefs");
        prefSet.on("", function(key) {
            console.log(key);
            console.log(openCardId);
            refreshBoard({"key": key, "value": prefSet.prefs[key]});
            if (openCardId !== null) {
                refreshCard({"key": key, "value": prefSet.prefs[key]});
            }
        });
    }
});
