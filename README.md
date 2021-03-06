# Trello Timer

Firefox extension to track time for trello cards.

#### Rationale

Most of the available logging solutions require registering to yet another
service and using their integration plugin. I needed something simpler,
with full access to the raw data. With this extension one can see how much time
was spent on given cards and with proper organization, it's easier to plan
future work, by examining similar cards from the past and time they required to
complete.

## Adds a new card action button
Allows interactive time tracking, due date icon is replaced with a calendar 
one.  

![track time](img/button.png)

## Stores data in a local database
Time is logged in a local database (indexedDB), log entries are added through
comments, so it is possible to log time manually by adding a comment. Logged
date is taken from the comment itself to make it possible to edit/delete log
entries through Trello comments as well. Caution: editing a log entry does not
automatically update the database - you need to
[*sync*](#user-content-show-time-log-section) your data.
 
``log `hh:mm:ss` ``

## Displays card stats on the board
Each card has an additional badge showing "today [total]" time spent on the
card. The list heading displays time spent today on the whole list.

![card list](img/list.png)

Cards having time log entry with today date have corresponding badge marked
with a green color as to be easier to identify.

![card list](img/today.png)

Cards closed while the time log was active have corresponding badge marked
with a red color. Upon opening the card, timer will automatically restart.

![card list](img/unsaved.png)

## Available options 

### Position of time icon on the card
You can position the timer badge at the front or the end of the badge node.  
Default is *front* (left side).

### Show time log section
Displays short time log summary on the open card (before the Activity section).
Clicking *sync* overwrites database data with data taken from comments (all
comments must be visible).  
Default is *false*

![card list](img/section.png)

### Enable completed cards
Changes display options for completed cards. Completed card is a card that has
a Due Date checkbox checked. If this condition is met, the timer badge will
only show the total time spent and will get a green background. If the given
list contains completed cards only, the list header will display the total
time spent.
Default is *false*

![card list](img/complete.png)

## Installation

At the moment you can install it only manually by first building it with jpm

`jpm xpi`

And then installing the built xpi file in your firefox browser (you can simply
open the xpi file through the browser and the install process will follow).
You may need to tune `xpinstall.signatures.required` setting in `about:config`
to allow unverified extensions.
