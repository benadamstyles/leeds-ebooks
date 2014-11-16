The last thing I had to do to make Yellowtime ready for the big time was an introductory tour/tutorial for new users. I’ve tried hard to make the app intuitive and simple but the worst thing you can do to a new user of your app is to leave them feeling lost. Lacking the time to write my own implementation, I found 3 possible open source libraries: Hopscotch (by LinkedIn), Intro.js and Shepherd.js by HubSpot. Looks good out of the box, very flexible, fairly trivial to add to a complex codebase. However, a couple of major flaws, especially on mobile. Here’s how to fix them:

## `classList` error

Add the following conditions to the hasClass method:

## Unnecessary 3D transforms

Comment out the following line:

## Scroll jank / poor performance

I noticed that the more steps I added to my tour, the more any scrollable divs I had would flicker and jump when scrolled. It took me a while to track down the source: a frankly baffling `"scroll"` event listener ticker function that uses a `setTimeout` of 16ms (why they haven’t used `requestAnimationFrame()` if it’s available is beyond me). Needless to say, I got rid of that and all my troubles went away. Fortunately it’s in there as a self-calling function and doesn’t seem to have any dependent functions so you can simply comment it out (if you’re using it in a page where scrolling isn’t an issue – for example, you may have problems with the software keyboard on iOS forcing a resize so you may need to rewrite the function to use `requestAnimationFrame()` rather than just getting rid of it altogether). Find these lines and comment them out, or delete them, or rewrite them, as you need: