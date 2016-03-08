self.port.on("addTimeComment", function(times) {
    var card = document.querySelector(".card-detail-window");
    var submit = card.querySelector(".new-comment .confirm");

    card.querySelector(".comment-box-input").value =
        "logged time `" +
        intervalToClock(new Date(times.start), new Date(times.end)) +
        "`";
    submit.removeAttribute("disabled");
    setTimeout(function() {
        submit.click();
    }, 20);
});
