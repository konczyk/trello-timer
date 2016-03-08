self.port.on("addTimeComment", function(times) {
    var card = document.querySelector(".card-detail-window");
    var submit = card.querySelector(".new-comment .confirm");
    var area = card.querySelector(".comment-box-input");

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
