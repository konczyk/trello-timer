var counter = 0;
var waitLimit = 100;

var wait = setInterval(function() {
    if (document && document.getElementById("content")) {
        clearInterval(wait);
        counter = 0;
        self.port.emit("listsChange");
    }
    counter++;
    if (counter >= waitLimit) {
        clearInterval(wait);
    }
}, 1);
