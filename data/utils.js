function intervalToClock(startTime, endTime) {
    var diff = (endTime - startTime) / 1000;
    var h = Math.floor(diff / 3600) % 24;
    var m = Math.floor((diff - h*3600) / 60) % 60;
    var s = Math.floor((diff - h*3600 - m*60) % 60);
    return (h <= 9 ? "0" : "") + h + ":" +
           (m <= 9 ? "0" : "") + m + ":" +
           (s <= 9 ? "0" : "") + s;
}

function intervalToMinClock(diff) {
    var h = parseFloat(diff / 1000 / 3600) % 24;

    return h.toFixed(1);
}

function getCardIdFromURL() {
    var path = window.location.pathname;
    if (!path.match(/^\/c\/[A-Za-z0-9]{8,}\/.*$/)) {
        console.error("not a card path: " + path);
    }

    return path.split("/")[2];
}
