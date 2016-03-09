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
        "complete_formatter": formatTotalHours,
        "onFinish": updateListHeader
    }
};

self.port.on("syncLists", function(timers) {
    var lists = document.querySelectorAll(CARD_LIST_SELECTOR);
    for (let i = 0; i < lists.length; i++) {
        let map = getCardsMap(lists[i]);
        switchDueDateIcons(lists[i]);
        addTimerBadges(map, timers);
        let header = lists[i].querySelector(HEADER_ICON_SELECTOR);
        let oldTotal = lists[i].querySelector(LIST_TOTAL_SELECTOR);
        let newTotal = createListHeader(map, timers);
        if (oldTotal === null) {
            header.parentNode.insertBefore(newTotal, header);
        } else {
            header.parentNode.replaceChild(newTotal, oldTotal);
        }
    }
    Object.keys(options).forEach(function(key) {
        if (options[key].init) {
            toggleCard(options[key].handler);
            if (options[key].onFinish) {
                options[key].onFinish();
            }
        }
    });
});

self.port.on("toggleCards", function(change) {
    if (options[change.key]) {
        options[change.key].value = change.value;
        toggleCard(options[change.key].handler);
        if (options[change.key].onFinish) {
            options[change.key].onFinish();
        }
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
    el.classList.add(LIST_TOTAL_CLASS);
    el.dataset.total = total;
    el.dataset.today = today;
    el.appendChild(formatTodayHours(today, total));

    return el;
}

function updateListHeader() {
    var lists = document.querySelectorAll(CARD_LIST_SELECTOR);
    for (let i = 0; i < lists.length; i++) {
        let map = getCardsMap(lists[i]);
        if (map.size > 0) {
            let complete = 0;
            map.forEach(function(cardNode, cardId) {
                if (cardNode.classList.contains(CARD_COMPLETE_CLASS)) {
                    complete++;
                }
            });
            let header = lists[i].querySelector(LIST_TOTAL_SELECTOR);
            let formatter = map.size === complete ?
                                formatTotalHours:
                                formatTodayHours;
            header.replaceChild(
                formatter(header.dataset.today, header.dataset.total),
                header.firstChild
            );
        }
    }
}

function addTimerBadges(cardMap, timers) {
    cardMap.forEach(function(cardNode, cardId) {
        var today = timers[cardId] ? timers[cardId].today : 0;
        var total = timers[cardId] ? timers[cardId].total : 0;
        var oldBadge = cardNode.querySelector(TIMER_BADGE_SELECTOR);
        var badge = oldBadge || BADGE.cloneNode(true);
        var text = badge.querySelector(BADGE_TEXT_SELECTOR);

        if (!oldBadge) {
            text.appendChild(formatHours(today, total));
            toggleTimerBadge(cardNode, badge);
        } else {
            text.replaceChild(formatHours(today, total), text.firstChild);
            toggleTimerBadge(cardNode);
        }
        badge.dataset.today = today;
        badge.dataset.total = total;
    })
}

function switchDueDateIcons(listContainer) {
    var dateIcons = listContainer.querySelectorAll(CLOCK_ICON_SELECTOR);
    for (let i = 0; i < dateIcons.length; i++) {
        if (!dateIcons[i].parentNode.classList.contains(TIME_BADGE_CLASS)) {
            dateIcons[i].classList.remove(CLOCK_ICON_CLASS);
            dateIcons[i].classList.add(DUE_DATE_ICON_CLASS);
        }
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
            .toggle(HIDE_CLASS, options["hide_desc_badge"].value);
    }
}

function toggleCompletedCard(cardNode) {
    var enabled = options["enable_completed_card"].value;
    var ckIcon = cardNode.querySelector(CHECKLIST_ICON_SELECTOR);
    var calIcon = cardNode.querySelector(DUE_DATE_ICON_SELECTOR);

    if (!ckIcon || !calIcon || !enabled) {
        enabled = false;
    } else {
        let checklist = ckIcon.parentNode.classList.contains(COMPLETE_CLASS);
        let due_date = calIcon.parentNode.classList.contains(DUE_NOW_CLASS) ||
                       calIcon.parentNode.classList.contains(DUE_PAST_CLASS);
        enabled = checklist && due_date;
    }

    var timer = cardNode.querySelector(TIMER_BADGE_SELECTOR);
    var timerText = timer.querySelector(BADGE_TEXT_SELECTOR);
    var cardComplete = cardNode.classList.contains(CARD_COMPLETE_CLASS);

    if (enabled) {
        let formatter = options.enable_completed_card.complete_formatter;
        let newTime = formatter(timer.dataset.today, timer.dataset.total);
        cardNode.classList.add(CARD_COMPLETE_CLASS);
        timerText.replaceChild(newTime, timerText.firstChild);
    } else if (cardComplete) {
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
            .toggle(HIDE_CLASS, options["hide_comment_badge"].value);
    }
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
    var link = badgeContainer.parentNode.querySelector(CARD_URL_SELECTOR);
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
