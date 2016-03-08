self.port.on("addTimeComment", function(times) {
    var card = document.querySelector(CARD_WINDOW_SELECTOR);
    var submit = card.querySelector(COMMENT_BUTTON_SELECTOR);
    var area = card.querySelector(COMMENT_AREA_SELECTOR);

    area.value =
        "logged time `" +
        intervalToClock(new Date(times.start), new Date(times.end)) +
        "`";

    submit.removeAttribute("disabled");
    var counter = 0;
    var click = setInterval(function() {
        submit.click();
        counter++;
        if (area.value === "" || counter > 30) {
            clearInterval(click);
        }
    }, 1);
});
