(function(win) {
    "use strict";

    window.getTimeModule = getTimeModule;

    function getTimeModule(card) {
        var html = buildTimeModule(),
            content = html.querySelector("dl")
        ;

        content.appendChild(buildTerm("Today"));
        content.appendChild(buildDefinition(card ? card.todayTime : 0));

        content.appendChild(buildTerm("Total"));
        content.appendChild(buildDefinition(card ? card.totalTime : 0));

        if (card && card.estimatedTime > 0) {
            content.appendChild(buildTerm("Estimate"));
            content.appendChild(buildDefinition(card.estimatedTime));
        }

        return html;
    }

    function buildTimeModule() {
        var d1 = document.createElement("div"),
            d2 = d1.cloneNode(),
            icon = document.createElement("span"),
            title = document.createElement("h3"),
            content = d1.cloneNode(),
            list = document.createElement("dl"),
            linkOuter = d1.cloneNode(),
            link = document.createElement("a")
        ;

        d1.classList.add("window-module", "tt-time-log-section");
        d2.classList.add("window-module-title",
                         "window-module-title-no-divider");
        d1.appendChild(d2);

        icon.classList.add("window-module-title-icon", "icon-lg",
                           "icon-clock");
        d2.appendChild(icon);

        title.appendChild(document.createTextNode("Time log"));
        d2.appendChild(title);

        content.classList.add("u-gutter");
        content.appendChild(list);
        d1.appendChild(content);

        link.setAttribute("href","#");
        link.setAttribute("id", "tt-sync");
        link.classList.add("quiet");
        link.textContent = "sync";
        linkOuter.appendChild(link);
        content.appendChild(linkOuter);

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
