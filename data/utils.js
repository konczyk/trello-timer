const CLOCK_ICON = (function() {
    var icon = document.createElement("span");
    icon.classList.add("icon-sm", "icon-clock");
    return icon;
})();

const BADGE = (function() {
    var b = document.createElement("div");
    b.classList.add("badge", "timer-badge");
    b.setAttribute("title", "time");
    var icon = createClockIconNode();
    icon.classList.add("badge-icon");
    b.appendChild(icon);
    var t = document.createElement("span");
    t.classList.add("badge-text");
    b.appendChild(t);
    return b;
})();

function createClockIconNode() {
    return CLOCK_ICON.cloneNode();
}

function createTimerBadgeNode() {
    return BADGE.cloneNode(true);
}

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

function toHours(time) {
    return ((time / 3600) % 24).toFixed(1);
}

function formatHours(today, total) {
    return document.createTextNode(
        toHours(today) + " [" + toHours(total) + "]"
    );
}

function formatTotalHours(today, total) {
    return document.createTextNode(toHours(total));
}

function formatTodayHours(today, total) {
    return document.createTextNode(toHours(today));
}

function emptyNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function swapIcons(node) {
    var calendar = node.querySelector(".icon-clock");
    calendar.classList.remove("icon-clock");
    calendar.classList.add("icon-calendar");
}

