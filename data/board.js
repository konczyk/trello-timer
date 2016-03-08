self.port.on("initLists", function(timers) {
    var lists = document.querySelectorAll(CARDS_SELECTOR);
    for (var i = 0; i < lists.length; i++) {
        var listTotal = 0;
        var listToday = 0;
        var badges = lists[i].querySelectorAll(BADGES_SELECTOR);
        for (var j = 0; j < badges.length; j++) {
            var newBadge = BADGE.cloneNode(true);
            var card = getCardIfForBadges(badges[j]);
            var total = 0;
            var today = 0;
            if (timers[card]) {
                total = timers[card].total;
                today = timers[card].today;
            }
            listTotal += total;
            listToday += today;
            newBadge.querySelector(BADGE_TEXT_SELECTOR)
                .appendChild(toHoursNode(today, total));
            badges[j].appendChild(newBadge);
        }
        var el = document.createElement("span");
        el.classList.add("tt-list-total");
        el.appendChild(toHoursNode(listToday, listTotal));
        var dd = lists[i].parentNode.querySelector(HEADER_ICON_SELECTOR);
        dd.parentNode.insertBefore(el, dd);
    }
});

function toHoursNode(today, total) {
    return document.createTextNode(
        toHours(today) + " [" + toHours(total) + "]"
    );
}

function getCardIfForBadges(badges) {
    var link = badges.parentNode.querySelector(".list-card-title");
    if (!link) {
        console.log("cannnot find card URL");
    }

    var parser = document.createElement("a");
    parser.href = link.getAttribute("href");

    if (!parser.pathname.match(/^\/c\/[A-Za-z0-9]{8,}\/.*$/)) {
        console.error("not a card path: " + parser.pathname);
    }

    return parser.pathname.split("/")[2];
}

function toHours(time) {
    return ((time / 3600) % 24).toFixed(1);
}
