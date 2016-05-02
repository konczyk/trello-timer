(function(win) {
    "use strict";

    const TRACK_BUTTON_TEXT = " Track time";
    const TRACK_BUTTON_ACTIVE_CLASS = "tt-active";

    var cardId = null,
    trackButton = null,
    trackStart = null,
    trackInterval = null,
    commentButtonClicked = false,
    logRe = new RegExp(/^\s*log\s*`(\d{2}):([0-5]\d):([0-5]\d)`\s*$/);

    mutationObserver.listen("cardOpen", setupCard);

    function setupCard() {
        setCardId();
        setTrackButton();
        swapIcons(document.querySelector(".window-wrapper .window-sidebar"));
        trackStart = null;
        if (trackInterval !== null) {
            clearInterval(trackInterval);
            trackInterval = null;
        }
        attachEvents();
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
            self.port.emit("cardClose", null);
            removeListeners();
        }
        close.addEventListener("click", onCardClose);

        function onOverlayClick() {
            if (document.querySelector(".card-detail-window") === null) {
                self.port.emit("cardClose", null);
            }
            removeListeners();
        }
        overlay.addEventListener("click", onOverlayClick);

        function removeListeners() {
            close.removeEventListener("click", onCardClose);
            overlay.removeEventListener("click", onOverlayClick);
            comment.removeEventListener("click", onCommentButtonClick);
            mutationObserver.detach(comments);
        }
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

    function onComment(mutation) {
        var added = mutation.addedNodes;
        if (commentButtonClicked && added.length === 1
                && added[0].classList.contains("mod-comment-type")) {
            commentButtonClicked = false;
            parseComment(added[0]);
        }
    }

    function parseComment(commentNode) {
        var matches = logRe.exec(commentNode.querySelector("textarea").value);
        if (matches !== null) {
            let sec = parseInt(matches[1], 10) * 3600 +
                      parseInt(matches[2], 10) * 60 +
                      parseInt(matches[3], 10);
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
                } else if (waitCounter >= 5000) {
                    clearInterval(waitInterval);
                    console.log("Waiting for comment dt expired!");
                }
                waitCounter++;
                console.log("Waiting for dt: " + waitCounter);
            }, 50);
        }
    }

})(this);
