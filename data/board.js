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
        var listComplete = isListComplete(cardMap);
        cardMap.forEach(function(cardNode, cardId) {
            let hasData = cardsData[cardId];
            let cardComplete = isCardComplete(cardNode);
            today += (hasData ? cardsData[cardId].todayTime : 0);
            total += (hasData && (!cardComplete || listComplete) ?
                cardsData[cardId].totalTime : 0);
            estimate += (hasData && !cardComplete ?
                cardsData[cardId].estimatedTime : 0);
        });
        let el = document.createElement("span");
        el.classList.add("tt-list-total");
        el.dataset.total = total;
        el.dataset.today = today;
        el.dataset.estimate = estimate;
        if (listComplete) {
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

    function toggleCompletedCard(cardNode) {
        let enabled = options.enable_completed_card
                        && cardNode.querySelector('.is-due-complete') !== null;

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

})(this);
