var counter = 0;
var waitLimit = 100;

var wait = setInterval(function() {
    if (document && document.querySelector(".list")) {
        clearInterval(wait);
        counter = 0;
        self.port.emit("contentLoaded");
    }
    counter++;
    if (counter >= waitLimit) {
        clearInterval(wait);
    }
}, 5);
