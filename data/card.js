self.port.on("cardChanged", function(data) {
    updateCard(data);
});

(function(win) {
    "use strict";

    win.updateCard = updateCard;

    const TRACK_BUTTON_TEXT = " Track time";
    const TRACK_BUTTON_ACTIVE_CLASS = "tt-active";

    var cardId = null,
    trackButton = null,
    trackStart = null,
    trackInterval = null,
    commentButtonClicked = false,
    logRe = new RegExp(/^\s*log\s*`(\d{2}):([0-5]\d):([0-5]\d)`\s*$/),
    options = {
        "show_time_log_section": self.options.show_time_log_section
    };

    mutationObserver.listen("cardOpen", getCard);
    function getCard() {
        setCardId();
        self.port.emit("cardReady", {"cardId": cardId});
        setTrackButton();
        swapIcons(document.querySelector(".window-wrapper .window-sidebar"));
        trackStart = null;
        if (trackInterval !== null) {
            clearInterval(trackInterval);
            trackInterval = null;
        }
        attachEvents();
    }

    function updateCard(params) {
        if (Object.keys(params.options).length > 0) {
            options[params.options.key] = params.options.value;
        }
        insertTimeModule(params.card);
        autostartUnsaved(params.card);
    }

    function setCardId() {
        var path = window.location.pathname;
        if (!path.match(/^\/c\/[A-Za-z0-9]{8,}\/.*$/)) {
            console.error("not a card path: " + path);
        }
        cardId = path.split("/")[2];
    }

    function setTrackButton() {
        trackButton = document.createElement("a");
        trackButton.addEventListener("click", trackTime);
        trackButton.classList.add("button-link");
        trackButton.setAttribute("href", "#");
        trackButton.appendChild(createClockIconNode());
        trackButton.appendChild(document.createTextNode(TRACK_BUTTON_TEXT));

        var container = document.querySelector(".other-actions .u-clearfix");
        container.insertBefore(trackButton, container.firstChild);
    }

    function attachEvents() {
        var close = document.querySelector(".window-wrapper .dialog-close-button");
        var overlay = document.querySelector(".window-overlay");
        var comment = document.querySelector(".new-comment .confirm");
        var comments = ".card-detail-window .js-list-actions";

        mutationObserver.attach(
            comments,
            onComment
        );

        function onCommentButtonClick() {
            commentButtonClicked = true;
        }
        comment.addEventListener("click", onCommentButtonClick);

        function onCardClose() {
            var unsaved = null;
            if (trackStart !== null) {
                unsaved = parseInt((new Date() - trackStart) / 1000, 10);
            }
            self.port.emit("cardClose", {
                "cardId": cardId,
                "unsaved": unsaved
            });
            removeListeners();
        }
        close.addEventListener("click", onCardClose);

        function onOverlayClick() {
            if (document.querySelector(".card-detail-window") === null) {
                onCardClose();
            }
        }
        overlay.addEventListener("click", onOverlayClick);

        function removeListeners() {
            close.removeEventListener("click", onCardClose);
            overlay.removeEventListener("click", onOverlayClick);
            comment.removeEventListener("click", onCommentButtonClick);
            mutationObserver.detach(comments);
        }
    }

    function onComment(mutation) {
        var added = mutation.addedNodes;
        var removed = mutation.removedNodes;
        if (commentButtonClicked && added.length === 1
                && added[0].classList.contains("mod-comment-type")) {
            commentButtonClicked = false;
            logTime(added[0]);
        }
        if (removed.length === 1
                && removed[0].classList.contains("mod-comment-type")) {
            deleteTimeLog(removed[0]);
        }
    }

    function insertTimeModule(card) {
        var
        newModule = getTimeModule(card),
        oldModule = document.querySelector(
            ".window-main-col .tt-time-log-section"
        ),
        beforeNode = document.querySelector(
            ".window-main-col .add-comment-section"),
        syncLink = document.getElementById("tt-sync")
        ;

        if (options.show_time_log_section) {
            if (oldModule === null) {
                beforeNode.parentNode.insertBefore(newModule,
                                                   beforeNode.nextSibling);
            } else {
                beforeNode.parentNode.replaceChild(newModule, oldModule);
            }
            document.getElementById("tt-sync")
                    .addEventListener("click", syncCard);
        } else if (oldModule !== null) {
            beforeNode.parentNode.removeChild(oldModule);
            document.getElementById("tt-sync")
                    .removeEventListener("click", syncCard);
        }
    }

    function autostartUnsaved(card) {
        if (card === null
                || !Number.isInteger(card.unsaved)
                || card.unsaved === 0) {
            return;
        } else {
            startTracking(new Date(Date.now() - card.unsaved * 1000));
        }
    }

    function syncCard(e) {
        var root = ".card-detail-window .mod-comment-type",
            comments = document.querySelectorAll(root),
            timeLogs = [];

        for (let i = 0; i < comments.length; i++) {
            let text = comments[i].querySelector(".current-comment p")
                                  .innerHTML.replace(/<.?code>/g, "`");
            let matches = logRe.exec(text);
            if (matches) {
                let sec = matchesToSec(matches);
                let dt = comments[i].querySelector(".date").getAttribute("dt");
                if (isNaN(Date.parse(dt))) {
                    console.log("Invalid date to log: " + dt);
                } else {
                    timeLogs.push({at: new Date(dt), time: sec});
                }
            }
        }
        timeLogs.reverse();
        self.port.emit("syncTime", {
            "cardId": cardId,
            "timeLogs": timeLogs
        });

        e.preventDefault();
    }

    function trackTime(e) {
        if (trackStart === null) {
            startTracking();
        } else {
            stopTracking();
        }
        e.stopPropagation();
        trackButton.blur();
    }

    function startTracking(time) {
        console.log("Start tracking time for card " + cardId);
        trackStart = time || new Date();
        trackButton.classList.add(TRACK_BUTTON_ACTIVE_CLASS);
        emptyNode(trackButton);
        trackButton.appendChild(document.createTextNode(
            intervalToClock(trackStart, new Date())
        ));
        trackInterval = setInterval(function() {
            trackButton.textContent = intervalToClock(trackStart, new Date());
        }, 1000);
    }

    function stopTracking() {
        console.log("Stop tracking time for card " + cardId);
        var addComment = document.querySelector(".new-comment .confirm");
        var area = document.querySelector(".new-comment .comment-box-input");

        area.value = "log `" +
            intervalToClock(new Date(trackStart), new Date()) +
            "`";
        addComment.removeAttribute("disabled");
        var counter = 0;
        var click = setInterval(function() {
            addComment.click();
            counter++;
            if (area.value === "" || counter > 100) {
                clearInterval(click);
            }
        }, 1);

        clearInterval(trackInterval);
        trackStart = null;
        trackButton.classList.remove(TRACK_BUTTON_ACTIVE_CLASS);
        emptyNode(trackButton);
        trackButton.appendChild(createClockIconNode());
        trackButton.appendChild(document.createTextNode(TRACK_BUTTON_TEXT));
    }

    function deleteTimeLog(commentNode) {
        var contentNode = commentNode.querySelector(".current-comment p");
        var text = contentNode.innerHTML.replace(/<.?code>/g, "`");
        if (logRe.exec(text) !== null) {
            let dt = commentNode.querySelector(".date").getAttribute("dt");
            self.port.emit("removeTime", {
                "cardId": cardId,
                "at": new Date(dt)
            });
        }
    }

    function logTime(commentNode) {
        var matches = logRe.exec(commentNode.querySelector("textarea").value);
        if (matches !== null) {
            let sec = matchesToSec(matches);
            let waitCounter = 0;
            let waitInterval = setInterval(function() {
                let timeNode = commentNode.querySelector(".date");
                if (timeNode !== null) {
                    clearInterval(waitInterval);
                    let dt = timeNode.getAttribute("dt");
                    if (isNaN(Date.parse(dt))) {
                        console.log("Invalid date to log: " + dt);
                    }
                    self.port.emit("logTime", {
                        "cardId": cardId,
                        "time": sec,
                        "at": new Date(dt)
                    });
                } else if (waitCounter >= 10000) {
                    clearInterval(waitInterval);
                    console.log("Waiting for comment dt expired!");
                    self.port.emit("logTimeExpired");
                }
                waitCounter++;
                console.log("Waiting for dt: " + waitCounter);
            }, 50);
        }
    }

    function matchesToSec(matches) {
        return parseInt(matches[1], 10) * 3600 +
               parseInt(matches[2], 10) * 60 +
               parseInt(matches[3], 10);
    }

})(this);
