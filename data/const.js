const TRACK_BUTTON_TEXT         = " Track time";
const TRACK_BUTTON_ACTIVE_CLASS = "tt-active";
const CLOCK_ICON_CLASS          = "icon-clock";
const DUE_DATE_ICON_CLASS       = "icon-calendar";
const CHECKLIST_ICON_CLASS      = "icon-checklist";
const COMPLETE_CLASS            = "is-complete";
const DUE_NOW_CLASS             = "is-due-now";
const DUE_PAST_CLASS            = "is-due-past";
const CARD_COMPLETE_CLASS       = "tt-card-complete";
const LIST_TOTAL_CLASS          = "tt-list-total";
const HIDE_CLASS                = "tt-hide";
const TIME_BADGE_CLASS          = "timer-badge";

// window/board related
const OVERLAY_SELECTOR          = ".window-overlay";
const BOARD_SELECTOR            = "#content";
const DND_SELECTOR              = "body > .list-card";
const WINDOW_SELECTOR           = ".window-wrapper";
const CARD_LIST_SELECTOR        = ".list";
const CARD_SELECTOR             = ".list-card-details";
const CARD_URL_SELECTOR         = ".list-card-title";
const BADGES_SELECTOR           = ".badges";
const BADGE_TEXT_SELECTOR       = ".badge-text";
const TIMER_BADGE_SELECTOR      = "." + TIME_BADGE_CLASS;
const DESC_ICON_SELECTOR        = ".icon-description";
const COMMENT_ICON_SELECTOR     = ".icon-comment";
const CLOCK_ICON_SELECTOR       = "." + CLOCK_ICON_CLASS;
const CHECKLIST_ICON_SELECTOR   = "." + CHECKLIST_ICON_CLASS;
const DUE_DATE_ICON_SELECTOR    = "." + DUE_DATE_ICON_CLASS;
const HEADER_ICON_SELECTOR      = ".list-header .icon-dropdown-menu";
const LIST_TOTAL_SELECTOR       = "." + LIST_TOTAL_CLASS;

// open card related
const CARD_WINDOW_SELECTOR      = ".card-detail-window";
const SIDEBAR_SELECTOR          = ".window-wrapper .window-sidebar";
const CLOSE_CARD_SELECTOR       = ".window-wrapper .dialog-close-button";
const ACTIONS_SELECTOR          = ".other-actions .u-clearfix";
const COMMENT_BUTTON_SELECTOR   = ".new-comment .confirm";
const COMMENT_AREA_SELECTOR     = ".comment-box-input";

const CLOCK_ICON = (function() {
    var icon = document.createElement("span");
    icon.classList.add("icon-sm", CLOCK_ICON_CLASS);
    return icon;
})();
const BADGE = (function() {
    var b = document.createElement("div");
    b.classList.add("badge", "timer-badge");
    b.setAttribute("title", "time");
    var icon = document.createElement("span");
    icon.classList.add("badge-icon", "icon-sm", CLOCK_ICON_CLASS);
    b.appendChild(icon);
    var t = document.createElement("span");
    t.classList.add("badge-text");
    b.appendChild(t);
    return b;
})();
