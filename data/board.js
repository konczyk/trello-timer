const TIME_ICON_POSITION_FIRST = 0;
const TIME_ICON_POSITION_LAST = 1;

var options = {
    "timer_badge_position": {
        "value": self.options.timer_badge_position,
        "handler": toggleTimerBadge,
        "init": false
    },
    "hide_desc_badge": {
        "value": self.options.hide_desc_badge,
        "handler": toggleDescBadge,
        "init": true
    },
    "hide_comment_badge": {
        "value": self.options.hide_comment_badge,
        "handler": toggleCommentBadge,
        "init": true
    }
};

self.port.on("initLists", function(timers) {
    var lists = document.querySelectorAll(CARD_LIST_SELECTOR);
    for (let i = 0; i < lists.length; i++) {
        let map = getCardsMap(lists[i]);
        switchDueDateIcons(lists[i]);
        addTimerBadges(map, timers);
        Object.keys(options).forEach(function(key) {
            if (options[key].init) {
                toggleCard(options[key].handler);
            }
        });
        let header = lists[i].querySelector(HEADER_ICON_SELECTOR);
        header.parentNode.insertBefore(createListHeader(map, timers), header);
    }
});

self.port.on("toggleCards", function(change) {
    if (options[change.key]) {
        options[change.key].value = change.value;
        toggleCard(options[change.key].handler);
    }
});

function toggleCard(callback) {
    var lists = document.querySelectorAll(CARD_LIST_SELECTOR);
    for (let i = 0; i < lists.length; i++) {
        let map = getCardsMap(lists[i]);
        map.forEach(function(cardNode, cardId) {
            callback(cardNode);
        });
    }
}

function createListHeader(cardMap, timers) {
    var today = 0;
    var total = 0;
    cardMap.forEach(function(cardNode, cardId) {
        today += (timers[cardId] ? timers[cardId].today : 0);
        total += (timers[cardId] ? timers[cardId].total : 0);
    });
    let el = document.createElement("span");
    el.classList.add("tt-list-total");
    el.appendChild(formatHours(today, total));

    return el;
}

function addTimerBadges(cardMap, timers) {
    cardMap.forEach(function(cardNode, cardId) {
        var newBadge = BADGE.cloneNode(true);
        var today = timers[cardId] ? timers[cardId].today : 0;
        var total = timers[cardId] ? timers[cardId].total : 0;
        newBadge.querySelector(BADGE_TEXT_SELECTOR)
            .appendChild(formatHours(today, total));
        toggleTimerBadge(cardNode, newBadge);
    })
}

function switchDueDateIcons(listContainer) {
    var dateIcons = listContainer.querySelectorAll(CLOCK_ICON_SELECTOR);
    for (let i = 0; i < dateIcons.length; i++) {
        dateIcons[i].classList.remove(CLOCK_ICON_CLASS);
        dateIcons[i].classList.add(DUE_DATE_ICON_CLASS);
    }
}

function toggleTimerBadge(cardNode, newBadge) {
    var badgeContainer = cardNode.querySelector(BADGES_SELECTOR);
    var badgeNode = newBadge ||
                    badgeContainer.querySelector(TIMER_BADGE_SELECTOR);
    var index = 0;
    if (options["timer_badge_position"].value === TIME_ICON_POSITION_LAST) {
        index = badgeContainer.childNodes.length - 1;
    }
    badgeContainer.insertBefore(badgeNode, badgeContainer.childNodes[index]);
}

function toggleDescBadge(cardNode) {
    var icon = cardNode.querySelector(DESC_ICON_SELECTOR);
    if (icon) {
        icon.parentNode.classList
            .toggle("tt-hide", options["hide_desc_badge"].value);
    }
}

function toggleCommentBadge(cardNode) {
    var icon = cardNode.querySelector(COMMENT_ICON_SELECTOR);
    if (icon) {
        icon.parentNode.classList
            .toggle("tt-hide", options["hide_comment_badge"].value);
    }
}

function formatHours(today, total) {
    return document.createTextNode(
        toHours(today) + " [" + toHours(total) + "]"
    );
}

function getCardsMap(listContainer) {
    var map = new Map();
    var cards = listContainer.querySelectorAll(CARD_SELECTOR);
    for (let i = 0; i < cards.length; i++) {
        map.set(
            extractCardId(cards[i].querySelector(CARD_URL_SELECTOR)),
            cards[i]);
    }

    return map;
}

function extractCardId(badgeContainer) {
    var link = badgeContainer.parentNode.querySelector(".list-card-title");
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
