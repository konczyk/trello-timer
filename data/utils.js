const CLOCK_ICON = (function() {
    var icon = document.createElement("span");
    icon.classList.add("icon-sm", "icon-clock2");
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
    t.classList.add("badge-text", "badge-text-today");
    b.appendChild(t);
    t = document.createElement("span");
    t.classList.add("badge-text", "badge-text-total");
    b.appendChild(t);
    t = document.createElement("span");
    t.classList.add("badge-text", "badge-text-estimate");
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
    var diff = (endTime - startTime) / 1000,
        h = Math.floor(diff / 3600),
        m = Math.floor((diff %= 3600) / 60),
        s = Math.floor(diff % 60);
    return (h <= 9 ? "0" : "") + h + ":" +
           (m <= 9 ? "0" : "") + m + ":" +
           (s <= 9 ? "0" : "") + s;
}

function intervalToMinClock(diff) {
    var h = parseFloat(diff / 1000 / 3600) % 24;

    return h.toFixed(1);
}

function secToHumanTime(sec) {
    var h = Math.floor(sec / 3600),
        m = Math.floor((sec %= 3600) / 60),
        s = Math.floor(sec % 60);

    return (h <= 9 ? "0" : "") + h + " h " +
           (m <= 9 ? "0" : "") + m + " min. " +
           (s <= 9 ? "0" : "") + s + " sec.";
}

function toHours(time) {
    return (time / 3600).toFixed(1);
}

function formatHours(el) {
    return document.createTextNode(toHours(el));
}

function formatTotalHours(today, total) {
    return document.createTextNode(toHours(total));
}

function formatTodayHours(today, total, estimate) {
    today = toHours(today);
    estimate = estimate && estimate > 0 ? toHours(estimate - total) : null;
    if (estimate === null) {
        return document.createTextNode(today);
    } else {
        return document.createTextNode(today + ' | ' + estimate);
    }
}

function emptyNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

