self.port.on("listsChanged", function(logEntries) {
    updateLists(logEntries);
});

(function(win) {
    'use strict';

    win.updateLists = updateLists;

    const TIME_ICON_POSITION_FIRST = 0;
    const TIME_ICON_POSITION_LAST = 1;

    var options = {
        "timer_badge_position": self.options.timer_badge_position,
        "hide_desc_badge": self.options.hide_desc_badge,
        "hide_comment_badge": self.options.hide_comment_badge,
        "enable_completed_card": self.options.enable_completed_card
    },
    cardRe = new RegExp(/^\/c\/([A-Za-z0-9]{8,})\/.*$/);

    mutationObserver.listen("cardAdded", function(card) {
        addTimerBadges(card);
    });

    function updateLists(params) {
        if (Object.keys(params.options).length > 0) {
            options[params.options.key] = params.options.value;
        }
        var cardsData = params.cardsData;

        var lists = getListsNode();
        for (let i = 0; i < lists.length; i++) {
            let map = getCardsMap(lists[i]);
            map.forEach(function(cardNode, cardId) {
                addTimerBadges(cardNode, cardsData[cardId]);
                toggleCalendarIcons(cardNode);
                toggleDescBadge(cardNode);
                toggleCommentsBadge(cardNode);
                toggleCompletedCard(cardNode);
            });
            let header = getListHeaderNode(lists[i]);
            let oldTotal = getListTotalNode(lists[i]);
            let newTotal = createListHeader(map, cardsData);
            if (oldTotal === null) {
                header.insertBefore(newTotal, header.lastChild);
            } else {
                header.replaceChild(newTotal, oldTotal);
            }
        }
    }

    function createListHeader(cardMap, cardsData) {
        var today = 0;
        var total = 0;
        var estimate = 0;
        cardMap.forEach(function(cardNode, cardId) {
            today += (cardsData[cardId] ? cardsData[cardId].todayTime : 0);
            total += (cardsData[cardId] ? cardsData[cardId].totalTime : 0);
            estimate += (cardsData[cardId] ? cardsData[cardId].estimatedTime : 0);
        });
        let el = document.createElement("span");
        el.classList.add("tt-list-total");
        el.dataset.total = total;
        el.dataset.today = today;
        el.dataset.estimate = estimate;
        if (isListComplete(cardMap)) {
            el.appendChild(formatTotalHours(today, total));
        } else {
            el.appendChild(formatTodayHours(today, total, estimate));
        }

        return el;
    }

    function getCardsMap(listContainer) {
        var map = new Map();
        var cards = listContainer.querySelectorAll(".list-card-details");
        for (let i = 0; i < cards.length; i++) {
            let cardLink = getCardUrlNode(cards[i]);
            if (cardLink !== null) {
                map.set(extractCardId(cardLink), cards[i]);
            }
        }

        return map;
    }

    function extractCardId(cardLink) {
        if (!cardLink || !cardLink.getAttribute("href")) {
            console.log("cannnot find card URL");
        }

        var parser = document.createElement("a");
        parser.href = cardLink.getAttribute("href");

        var matches = cardRe.exec(parser.pathname);
        if (!matches) {
            console.error("not a card path: " + parser.pathname);
        }

        return matches[1];
    }

    function addTimerBadges(cardNode, cardData) {
        var unsaved = cardData ? cardData.unsaved : null,
            oldBadge = getTimerBadgeNode(cardNode),
            badge = oldBadge || createTimerBadgeNode();

        badge.dataset.today = cardData ? cardData.todayTime : 0;
        badge.dataset.total = cardData ? cardData.totalTime : 0;
        badge.dataset.estimate = cardData ? cardData.estimatedTime : 0;

        updateTimerBadge(badge, oldBadge);
        toggleTimerBadge(cardNode, !oldBadge ? badge : null);

        badge.classList.toggle("tt-tracked-today", badge.dataset.today > 0);
        badge.classList.toggle("tt-unsaved", Number.isInteger(unsaved));
    }

    function updateTimerBadge(badge, oldBadge) {
        var today = getTimerBadgeToday(badge),
            total = getTimerBadgeTotal(badge),
            estimate = getTimerBadgeEstimate(badge);

        if (!oldBadge) {
            today.appendChild(formatHours(badge.dataset.today));
            total.appendChild(formatHours(badge.dataset.total));
            if (badge.dataset.estimate > 0) {
                estimate.appendChild(formatHours(badge.dataset.estimate));
            } else {
                estimate.appendChild(document.createTextNode(""));
            }
        } else {
            today.replaceChild(formatHours(badge.dataset.today),
                               today.firstChild);
            total.replaceChild(formatHours(badge.dataset.total),
                               total.firstChild);
            estimate.replaceChild(
                badge.dataset.estimate > 0 ?
                    formatHours(badge.dataset.estimate) :
                    document.createTextNode(""),
                estimate.firstChild);
        }
    }

    function toggleTimerBadge(cardNode, newBadge) {
        var badgesNode = getBadgesNode(cardNode),
            badgeNode = newBadge || getTimerBadgeNode(badgesNode),
            index = 0;

        if (options.timer_badge_position === TIME_ICON_POSITION_LAST) {
            index = badgesNode.childNodes.length - 1;
        }

        badgesNode.insertBefore(badgeNode, badgesNode.childNodes[index]);
    }

    function toggleCalendarIcons(cardNode) {
        var icons = getClockIconNodes(cardNode);
        for (let i = 0; i < icons.length; i++) {
            if (!isTimerBadge(icons[i].parentNode)) {
                swapIcons(icons[i].parentNode);
            }
        }
    }

    function toggleDescBadge(cardNode) {
        var icon = getDescIconNode(cardNode);
        toggleBadgeVisibility(icon, "hide_desc_badge");
    }

    function toggleCommentsBadge(cardNode) {
        var icon = getCommentsIconNode(cardNode);
        toggleBadgeVisibility(icon, "hide_comment_badge");
    }

    function toggleBadgeVisibility(icon, opt) {
        if (icon) {
            var classList = icon.parentNode.classList;
            classList.toggle("tt-hide", options[opt]);
        }
    }

    function toggleCompletedCard(cardNode) {
        let enabled = options.enable_completed_card,
            checkIcon = getChecklistIconNode(cardNode),
            dueIcon = getDueDateIconNode(cardNode);

        if (!checkIcon || !dueIcon || !enabled) {
            enabled = false;
        } else {
            let checklist = isChecklistCompleteBadge(checkIcon.parentNode);
            let dueDate = isDueDatePastBadge(dueIcon.parentNode);
            enabled = checklist && dueDate;
        }

        let timer = getTimerBadgeNode(cardNode),
            timerToday = getTimerBadgeToday(timer),
            timerEstimate = getTimerBadgeEstimate(timer),
            cardComplete = isCardComplete(cardNode);

        if (enabled) {
            markCardCompleted(cardNode);
            timerToday.classList.add("hide");
            timerEstimate.classList.add("hide");
        } else if (cardComplete) {
            markCardNotCompleted(cardNode);
            timerToday.classList.remove("hide");
            timerEstimate.classList.remove("hide");
        }
    }

    function getListsNode() {
        return document.querySelectorAll(".list");
    }

    function getListHeaderNode(ctx) {
        return ctx.querySelector(".list-header");
    }

    function getListTotalNode(ctx) {
        return ctx.querySelector(".tt-list-total");
    }

    function getCardUrlNode(ctx) {
        return ctx.querySelector(".list-card-title");
    }

    function isCardComplete(card) {
        return card.classList.contains("tt-card-complete");
    }

    function isListComplete(cardMap) {
        for (let [cardId, cardNode] of cardMap) {
            if (!isCardComplete(cardNode)) {
                return false;
            }
        }

        return true;
    }

    function markCardCompleted(card) {
        card.classList.add("tt-card-complete");
    }

    function markCardNotCompleted(card) {
        card.classList.remove("tt-card-complete");
    }

    function getBadgesNode(ctx) {
        return ctx.querySelector(".badges");
    }

    function isTimerBadge(node) {
        return node.classList.contains("timer-badge");
    }

    function isChecklistCompleteBadge(node) {
        return node.classList.contains("is-complete");
    }

    function isDueDatePastBadge(node) {
        var cList = node.classList;
        return cList.contains("is-due-now") || cList.contains("is-due-past");
    }

    function getTimerBadgeNode(ctx) {
        return ctx.querySelector(".timer-badge");
    }

    function getTimerBadgeToday(ctx) {
        return ctx.querySelector(".badge-text-today");
    }

    function getTimerBadgeTotal(ctx) {
        return ctx.querySelector(".badge-text-total");
    }

    function getTimerBadgeEstimate(ctx) {
        return ctx.querySelector(".badge-text-estimate");
    }

    function getClockIconNodes(ctx) {
        return ctx.querySelectorAll(".icon-clock");
    }

    function getDescIconNode(ctx) {
        return ctx.querySelector(".icon-description");
    }

    function getChecklistIconNode(ctx) {
        return ctx.querySelector(".icon-checklist");
    }

    function getDueDateIconNode(ctx) {
        return ctx.querySelector(".icon-calendar");
    }

    function getCommentsIconNode(ctx) {
        return ctx.querySelector(".icon-comment");
    }

})(this);
