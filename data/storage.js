var {indexedDB, IDBKeyRange} = require("sdk/indexed-db");
const VERSION = 1;
const TIMELOG = "timelog";
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
    if (!db.objectStoreNames.contains(TIMELOG)) {
        var store = db.createObjectStore(TIMELOG, {autoIncrement: true});
        store.createIndex("card", "card", {unique: false});
        store.createIndex("start", "start", {unique: false});
        store.createIndex("end", "end", {unique: false});
        console.log("created " + TIMELOG);
    }
}

function saveTime(logEntry) {
    var trans = db.transaction([TIMELOG], "readwrite");
    trans.oncomplete = function() {
        console.log("saveTime transaction completed");
    }
    trans.onerror = idb.onerror;

    var request = trans.objectStore(TIMELOG).add(logEntry);
    request.onsuccess = function(e) {
        console.log("Stored new time log : " + JSON.stringify(logEntry));
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

function getTimePerCard(callback) {
    console.log("getTimePerCard started");
    var trans = db.transaction([TIMELOG], "readwrite");
    var store = trans.objectStore(TIMELOG);

    var request = store.getAll();
    request.onsuccess = function() {
        console.log("getTimePerCard transaction completed");
        var items = groupByCards(request.result);
        callback(items);
    }
}

exports.saveTime = saveTime;
exports.getTimePerCard = getTimePerCard;
