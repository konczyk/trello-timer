var events = require("sdk/system/events");
var {Ci} = require("chrome");

function listener(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    console.log(channel.URI.path.substring(0, 50));
}

events.on("http-on-examine-response", listener);
