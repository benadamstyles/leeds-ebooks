---  
title: Rounding a number to 2 decimal places for currency display
author: Ben
layout: post
categories:
  - Code Snippets
  - Resources
  - JavaScript
tags:
  - currency
  - cash
  - financial
  - money
  - javascript
  - code
  - toFixed
  - round
---

A little helper function I wrote to play nicely with cash figures in JavaScript. Pass it any number `v` and it will return either:

-   If `v` is one or more cents/pennies/whatever away from a round dollar/pound/whatever: a String that is `v` rounded to 2 decimal places.
-   Otherwise: `v` as a Number rounded to the nearest dollar/pound/whatever.

{% gist Leeds-eBooks/3ac9ac9c7d63e9d49ce5 %}

So, for example:
{% highlight javascript %}
roundToCashString(23);
// returns 23

roundToCashString(23.002);
// returns 23

roundToCashString(23.005);
// returns 23.01 (as a String)

roundToCashString(23.56789);
// returns 23.57 (as a String)
{% endhighlight %}

The function can therefore return either a Number or a String. I didn't add a line to convert a return Number to a String because it was completely unnecessary for my purposes, but it would be easy enough by changing line 5 to `integer + "";`

It goes without saying but use as you wish!