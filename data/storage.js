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

function saveTimer(timer) {
    var trans = db.transaction(["timers"], "readwrite");
    trans.oncomplete = function() {
        console.log("saveTimer transaction completed");
    }
    trans.onerror = idb.onerror;

    var request = trans.objectStore("timers").add(timer);
    request.onsuccess = function(e) {
        console.log("Stored new timer: " + JSON.stringify(timer));
    }
}

function groupByCards(objects) {
    var items = {};
    objects.forEach(function(el) {
        var start = new Date(el.start);
        var end = new Date(el.end);
        var time = parseInt(end - start, 10) / 1000;
        if (!items[el.card]) {
            items[el.card] = {
                total: time,
                today: 0
            }
        } else {
            items[el.card].total += time;
        }

        if (start.toDateString() === new Date().toDateString()) {
            items[el.card].today += time;
        }
    });

    return items;
}

function getTimersPerCard(callback) {
    console.log("getTimesPerCard started");
    var trans = db.transaction(["timers"], "readwrite");
    var store = trans.objectStore("timers");

    var request = store.getAll();
    request.onsuccess = function() {
        console.log("getTimesPerCard transaction completed");
        var items = groupByCards(request.result);
        callback(items);
    }
}

exports.saveTimer = saveTimer;
exports.getTimersPerCard = getTimersPerCard;
