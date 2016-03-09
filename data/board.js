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
    },
    "enable_completed_card": {
        "value": self.options.enable_completed_card,
        "handler": toggleCompletedCard,
        "init": true,
        "default_formatter": formatHours,
        "complete_formatter": formatTotalHours
    }
};

self.port.on("initLists", function(timers) {
    var lists = document.querySelectorAll(CARD_LIST_SELECTOR);
    for (let i = 0; i < lists.length; i++) {
        let map = getCardsMap(lists[i]);
        switchDueDateIcons(lists[i]);
        addTimerBadges(map, timers);
        let header = lists[i].querySelector(HEADER_ICON_SELECTOR);
        header.parentNode.insertBefore(createListHeader(map, timers), header);
    }
    Object.keys(options).forEach(function(key) {
        if (options[key].init) {
            toggleCard(options[key].handler);
        }
    });
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
    el.dataset.total = total;
    el.dataset.today = today;
    el.appendChild(formatTodayHours(today, total));

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
        newBadge.dataset.today = today;
        newBadge.dataset.total = total;
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

function toggleCompletedCard(cardNode) {
    var enabled = options["enable_completed_card"].value;
    var ckIcon = cardNode.querySelector(CHECKLIST_ICON_SELECTOR);
    var calIcon = cardNode.querySelector(DUE_DATE_ICON_SELECTOR);
    var timer = cardNode.querySelector(TIMER_BADGE_SELECTOR);
    var timerText = timer.querySelector(BADGE_TEXT_SELECTOR);
    var cardComplete = cardNode.classList.contains(CARD_COMPLETE_CLASS);

    if (!ckIcon || !calIcon || !enabled) {
        enabled = false;
    } else {
        let checklist = ckIcon.parentNode.classList.contains(COMPLETE_CLASS);
        let due_date = calIcon.parentNode.classList.contains(DUE_NOW_CLASS) ||
                       calIcon.parentNode.classList.contains(DUE_PAST_CLASS);
        enabled = checklist && due_date;
    }

    if (enabled && !cardComplete) {
        let formatter = options.enable_completed_card.complete_formatter;
        let newTime = formatter(timer.dataset.today, timer.dataset.total);
        cardNode.classList.add(CARD_COMPLETE_CLASS);
        timerText.replaceChild(newTime, timerText.firstChild);
    }

    if (!enabled && cardComplete) {
        let formatter = options.enable_completed_card.default_formatter;
        let newTime = formatter(timer.dataset.today, timer.dataset.total);
        cardNode.classList.remove(CARD_COMPLETE_CLASS);
        timerText.replaceChild(newTime, timerText.firstChild);
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

function formatTotalHours(today, total) {
    return document.createTextNode(toHours(total));
}

function formatTodayHours(today, total) {
    return document.createTextNode(toHours(today));
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
