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

function addTimer(cardId, startTime, endTime) {
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

exports.addTimer = addTimer;
