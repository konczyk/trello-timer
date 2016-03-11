var events = require("sdk/system/events");
var {Ci} = require("chrome");

function listener(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    console.log(channel.URI.path.substring(0, 50));
}

events.on("http-on-examine-response", listener);
/*

const {Cc, Ci} = require("chrome");

var httpObserver = {
    requiredHost: "trello.com",
    requiredType: "application/json",
    listeners: {},
    observer: Cc["@mozilla.org/observer-service;1"]
                .getService(Ci.nsIObserverService),
    init: function() {
        this.detach();
        this.observer.addObserver(
            this, "http-on-examine-response", false);
    },
    on: function(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [callback];
        } else {
            this.listeners[event].push(callback);
        }
    },
    observe: function(subject, topic, data) {
        var channel = subject.QueryInterface(Ci.nsIHttpChannel);
        console.log(channel.URI.host);
        if (channel.URI.host !== this.requiredHost ||
                channel.contentType.indexOf(this.requiredType) < 0) {
            return;
        }
        this.examine(channel.URI.path);
    },
    examine: function(path) {
        if (path.match(/^\/\d+\/Boards\/[^\?]+\?lists=open/)) {
            this.notify("listsRequested");
        }
    },
    notify: function(event) {
        if (this.listeners[event]) {
            console.log("HTTP event: " + event);
            this.listeners[event].forEach(function(callback) {
                callback();
            });
        }
    },
    detach: function() {
        try {
            this.observer.removeObserver(this, "http-on-examine-response");
        } catch (e) {}
    }
};

exports.httpObserver = httpObserver;
*/
