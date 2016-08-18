var {indexedDB, IDBKeyRange} = require("sdk/indexed-db");

const VERSION = 1;
const CARDS = "trelloCards";

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
    var trans = e.target.transation;
    if (e.newVersion === 1) {
        var store = db.createObjectStore(CARDS, {keyPath: "cardId"});
        store.createIndex("lastLogged", "lastLogged", {unique: false});
    }
}

function logTime(data, onSuccess, onError) {
    var trans = db.transaction(CARDS, "readwrite");
    var store = trans.objectStore(CARDS);
    trans.oncomplete = function() {
        console.log("logTime transaction completed");
    }
    trans.onerror = onError;

    var getReq = store.get(data.cardId);
    getReq.onsuccess = function(e) {
        var card = getReq.result || createCard(data.cardId);
        if (data.timeLogs) {
            card.timeLogs = data.timeLogs;
        } else {
            card.timeLogs.push({"at": data.at, "time": data.time});
        }
        if (card.timeLogs.length === 0) {
            delReq = store.delete(data.cardId);
            delReq.onsuccess = function() {
                onSuccess(card);
            }
            delReq.onerror = onError;
        } else {
            card.lastLogged = card.timeLogs[card.timeLogs.length-1].at;
            card.totalTime = getTotalTime(card.timeLogs);
            card.unsaved = null;
            putReq = store.put(card);
            putReq.onsuccess = function() {
                onSuccess(card);
            }
        }
    }
}

function logEstimate(data, onSuccess, onError) {
    var trans = db.transaction(CARDS, "readwrite");
    var store = trans.objectStore(CARDS);
    trans.oncomplete = function() {
        console.log("logEstimate transaction completed");
    }
    trans.onerror = onError;

    var getReq = store.get(data.cardId);
    getReq.onsuccess = function(e) {
        var card = getReq.result || createCard(data.cardId);
        card.estimatedTime = data.time
        putReq = store.put(card);
        putReq.onsuccess = function() {
            onSuccess(card);
        }
    }
}


function logUnsavedTime(data, onSuccess) {
    var trans = db.transaction(CARDS, "readwrite");
    var store = trans.objectStore(CARDS);
    trans.oncomplete = function() {
        console.log("logUnsavedTime transaction completed");
    }
    trans.onerror = idb.onerror;

    var getReq = store.get(data.cardId);
    getReq.onsuccess = function(e) {
        var card = getReq.result || createCard(data.cardId);
        card.unsaved = data.unsaved;
        putReq = store.put(card);
    }
}

function removeTime(data, onSuccess, onError) {
    var trans = db.transaction(CARDS, "readwrite");
    var store = trans.objectStore(CARDS);
    trans.oncomplete = function() {
        console.log("removeTime transaction completed");
    }
    trans.onerror = onError;

    var getReq = store.get(data.cardId);
    getReq.onsuccess = function(e) {
        var card = getReq.result;
        if (!card) {
            return onError(new Error("removeTime card not found " + data.cardId));
        }

        var idx = card.timeLogs.findIndex(function(element, index, array) {
            if (element.at !== data.at) {
                return false;
            }
            return true;
        });

        if (idx === -1) {
            return onError(new Error(
                "removeTime dt " + data.at + " not found for " + data.cardId));
        }

        card.timeLogs.splice(idx, 1);

        if (card.timeLogs.length === 0) {
            delReq = store.delete(data.cardId);
            delReq.onsuccess = function() {
                onSuccess(card);
            }
            delReq.onerror = onError;
        } else {
            card.lastLogged = card.timeLogs[card.timeLogs.length-1].at;
            card.totalTime = getTotalTime(card.timeLogs);
            putReq = store.put(card);
            putReq.onsuccess = function() {
                onSuccess(card);
            }
            putReq.onerror = onError;
        }
    }
    getReq.onerror = onError;
}

function getTotalTime(timeLog) {
    var total = 0;
    timeLog.forEach(function(val) {
        total += val.time;
    });

    return total;
}

function createCard(cardId) {
    return {
        "cardId": cardId,
        "lastLogged": null,
        "unsaved": null,
        "totalTime": 0,
        "estimatedTime": 0,
        "timeLogs": []
    };
}

function getCards(callback) {
    console.log("getCards started");
    var trans = db.transaction(CARDS);
    var store = trans.objectStore(CARDS);

    var request = store.getAll();
    request.onsuccess = function() {
        var items = request.result;
        var ret = {};
        items.forEach(function(v, k) {
            ret[v.cardId] = {
                "unsaved": v.unsaved || null,
                "totalTime": v.totalTime,
                "todayTime": getTodayTime(v.lastLogged, v.timeLogs),
                "estimatedTime": v.estimatedTime || 0
            };
        });
        callback(ret);
    }

    trans.oncomplete = function(e) {
        console.log("getCards transaction completed");
    }
    trans.onerror = idb.onerror;
}

function getCard(cardId, callback) {
    console.log("getCard started");
    var trans = db.transaction(CARDS);
    var store = trans.objectStore(CARDS);

    var request = store.get(cardId);
    request.onsuccess = function() {
        var card = request.result;
        if (card) {
            card.todayTime = getTodayTime(card.lastLogged, card.timeLogs);
        } else {
            card = null;
        }
        callback(card);
    }

    trans.oncomplete = function(e) {
        console.log("getCard " + cardId + " transaction completed");
    }
    trans.onerror = idb.onerror;
}

function getTodayTime(lastLogged, timeLogs) {
    var today = 0;
    var now = new Date();

    if (new Date(lastLogged).toDateString() !== now.toDateString()) {
        return 0;
    }

    for (let i = timeLogs.length - 1; i >= 0; i--) {
        let at = new Date(timeLogs[i].at);
        if (at.toDateString() === now.toDateString()) {
            today += timeLogs[i].time;
        } else {
            break;
        }
    }

    return today;
}

exports.logTime = logTime;
exports.logEstimate = logEstimate;
exports.logUnsavedTime = logUnsavedTime;
exports.removeTime = removeTime;
exports.getCards = getCards;
exports.getCard = getCard;
