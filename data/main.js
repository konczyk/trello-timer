var {PageMod} = require("sdk/page-mod");
var {activeTab} = require("sdk/tabs");
var {URL} = require("sdk/url");

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
        "./listeners.js",
        "./trackButton.js",
        "./comments.js",
    ],
    contentStyleFile: "./style.css",
    onAttach: function(worker) {
        worker.port.on("cardOpen", function() {
            worker.port.emit("attachTrackButton", null);
        });
        worker.port.on("timerStop", function(times) {
            worker.port.emit("addTimeComment", times);
        });

    }
});
