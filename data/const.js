// window/board related
const OVERLAY_SELECTOR          = ".window-overlay";
const BOARD_SELECTOR            = "#content";
const WINDOW_SELECTOR           = ".window-wrapper";
const CARDS_SELECTOR            = ".list-cards";
const BADGES_SELECTOR           = ".badges";
const BADGE_TEXT_SELECTOR       = ".badge-text";
const HEADER_ICON_SELECTOR      = ".list-header .icon-dropdown-menu";

// card related
const CARD_WINDOW_SELECTOR      = ".card-detail-window";
const SIDEBAR_SELECTOR          = ".window-wrapper .window-sidebar";
const CLOSE_CARD_SELECTOR       = ".window-wrapper .dialog-close-button";
const ACTIONS_SELECTOR          = ".other-actions .u-clearfix";
const DUE_DATE_ICON_SELECTOR    = ".window-sidebar .icon-clock";
const COMMENT_BUTTON_SELECTOR   = ".new-comment .confirm";
const COMMENT_AREA_SELECTOR     = ".comment-box-input";

const TRACK_BUTTON_TEXT = " Track time";
const TRACK_BUTTON_ACTIVE_CLASS = "tt-active";
const CLOCK_ICON = (function() {
    var icon = document.createElement("span");
    icon.classList.add("icon-sm", "icon-clock");
    return icon;
})();
const BADGE = (function() {
    var b = document.createElement("div");
    b.classList.add("badge");
    b.setAttribute("title", "time");
    var icon = document.createElement("span");
    icon.classList.add("badge-icon", "icon-sm", "icon-clock");
    b.appendChild(icon);
    var t = document.createElement("span");
    t.classList.add("badge-text");
    b.appendChild(t);
    return b;
})();
