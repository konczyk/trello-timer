var {indexedDB, IDBKeyRange} = require("sdk/indexed-db");
const VERSION = 1;
var db;

var idb = indexedDB.open("TrelloTimer", VERSION);

idb.onerror = function(e) {
    console.error(e.value);
}

idb.onsuccess = function(e) {
    db = e.target.result;
}

idb.onupgradeneeded = function(e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains("timers")) {
        var store = db.createObjectStore("timers", {autoIncrement: true});
        store.createIndex("card", "card", {unique: false});
        store.createIndex("start", "start", {unique: false});
        store.createIndex("end", "end", {unique: false});
        console.log("created timers");
    }
}

function saveTimer(cardId, startTime, endTime) {
    var item = {
        "card": cardId,
        "start": startTime,
        "end": endTime
    };
    var trans = db.transaction(["timers"], "readwrite");
    trans.oncomplete = function() {
        console.log("transaction completed");
    }
    trans.onerror = idb.onerror;

    var request = trans.objectStore("timers").add(item);
    request.onsuccess = function(e) {
        console.log("Stored new timer: " + JSON.stringify(item));
    }
}

function getTimersPerCard(callback) {
    var trans = db.transaction(["timers"], "readwrite");
    var store = trans.objectStore("timers");
    var items = {};

    trans.oncomplete = function() {
        console.log("getTimesPerCard: transaction completed");
        callback(items);
    }
    trans.onerror = idb.onerror;

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);
    cursorRequest.onerror = idb.onerror;

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(!!result == false) {
            return;
        }

        var card = result.value.card;
        var start = new Date(result.value.start);
        var end = new Date(result.value.end);
        var time = parseInt(end - start, 10) / 1000;
        if (!items[card]) {
            items[card] = {
                total: time,
                today: 0
            }
        } else {
            items[card].total += time;
        }

        if (start.toDateString() === new Date().toDateString()) {
            items[card].today += time;
        }

        result.continue();
    }
}

exports.saveTimer = saveTimer;
exports.getTimersPerCard = getTimersPerCard;
