/**
 * Touch-based remote controller for your presentation courtesy
 * of the folks at http://remotes.io
 */
!function(e){var n=function(){return"ontouchstart"in e||e.DocumentTouch&&document instanceof DocumentTouch}(),o=function(){return e.RevealNotes&&!(self==top)}();n||o||(head.ready("remotes.ne.min.js",function(){new Remotes("preview").on("swipe-left",function(){Reveal.right()}).on("swipe-right",function(){Reveal.left()}).on("swipe-up",function(){Reveal.down()}).on("swipe-down",function(){Reveal.up()}).on("tap",function(){Reveal.next()}).on("zoom-out",function(){Reveal.toggleOverview(!0)}).on("zoom-in",function(){Reveal.toggleOverview(!1)})}),head.js("https://hakim-static.s3.amazonaws.com/reveal-js/remotes.ne.min.js"))}(window);
