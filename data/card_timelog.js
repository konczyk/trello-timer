(function(win) {
    "use strict";

    window.getTimeModule = getTimeModule;

    function getTimeModule(card) {
        var html = buildTimeModule(),
            content = html.querySelector("dl")
        ;

        content.appendChild(buildTerm("Today"));
        content.appendChild(buildDefinition(card.todayTime));

        content.appendChild(buildTerm("Total"));
        content.appendChild(buildDefinition(card.totalTime));

        return html;
    }

    function buildTimeModule() {
        var d1 = document.createElement("div"),
            d2 = document.createElement("div"),
            icon = document.createElement("span"),
            title = document.createElement("h3"),
            content = document.createElement("div"),
            list = document.createElement("dl")
        ;

        d1.classList.add("window-module", "tt-time-log-section");
        d2.classList.add("window-module-title",
                         "window-module-title-no-divider");
        d1.appendChild(d2);

        icon.classList.add("window-module-title-icon", "icon-lg",
                           "icon-clock");
        d2.appendChild(icon);

        title.textContent = "Time log";
        d2.appendChild(title);

        content.classList.add("u-gutter");
        content.appendChild(list);
        d1.appendChild(content);

        return d1;
    }

    function buildTerm(text) {
        var dt = document.createElement("dt");
        dt.textContent = text;

        return dt;
    }

    function buildDefinition(sec) {
        var dd = document.createElement("dd");
        dd.textContent = secToHumanTime(sec);

        return dd;
    }

})(this);
