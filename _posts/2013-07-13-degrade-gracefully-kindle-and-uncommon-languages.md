---
title: 'Degrade Gracefully: Kindle and Uncommon Languages'
author: Ben
layout: post
permalink: /2013/07/13/degrade-gracefully-kindle-and-uncommon-languages/
categories:
  - eBook Design
  - Tutorials
tags:
  - font-face
  - amazon
  - app
  - css
  - degrade
  - embed
  - font
  - foreign
  - hide
  - html
  - ipad
  - KF8
  - kindle
  - language
  - mobi
  - script
  - uncommon
  - unusual
---
Without debating the political implications of the word &#8220;uncommon&#8221;, it is a fact that the vast majority of Kindle ebooks are written in Latin script. The reasons for this could fill a thesis, but one basic and practical reason is that the default Kindle fonts do not support the more obscure regions of the <a target="_blank" href="https://en.wikipedia.org/wiki/Unicode">Unicode</a> character map. For those languages that fall within such regions, the only option is to embed a custom font and force the Kindle device or app to render the text in that font. This is assuming your ebook can get past <a href="http://www.guardian.co.uk/books/2013/apr/15/ebooks-amazon-diglot-kindle-language" title="Guardian: Amazon, Kindle and the case for Cornish" target="_blank">Amazon&#8217;s seemingly arbitrary language limitation</a> in the first place.

Amazon&#8217;s newish Kindle ebook format, KF8, allows font embedding (as per the international ePub specifications), but the older MOBI format doesn&#8217;t. As I noted in my <a href="http://leeds-ebooks.co.uk/blog/2013/07/09/kindle-devices-supporting-kf8/" title="Kindle Devices supporting KF8" target="_blank">list of Kindle devices and apps that support KF8</a>, one (I assume) commonly used app, Kindle for iPhone/iPad, is still handicapped with the older format, and therefore does not support embedded fonts.

Today, I completed the ebook design and conversion of <a href="http://www.arcpublications.co.uk/books/cheran-in-a-time-of-burning-488" target="_blank">a bilingual collection of poems by the Sri Lankan poet Cheran</a>, who writes in Tamil. When opened in the Kindle App for iPad, it simply displayed a mess of random characters in place of all the Tamil script. So, true to <a target="_blank" href="http://leeds-ebooks.co.uk/blog/2013/06/26/oh-hello-typography/">Laura Brady&#8217;s tenet</a>, &#8220;degrade gracefully&#8221;, the only solution was to make the MOBI version of the ebook, which would be read by iPads, iPhones and Kindle 2s, acceptably free of mess, by rendering it on those devices as a monolingual, English-only text. The steps I took to do this are below, including how to embed a font in the first place (the following steps assume you are creating a &#8220;.mobi&#8221; ebook file from scratch, or a &#8220;.epub&#8221; file for automatic conversion to &#8220;.mobi&#8221;, and can edit the HTML and CSS):

1.  In the root folder of your extracted/uncompressed ebook, create a folder named &#8220;Fonts&#8221;. In it, place all the font files you would like embedded.
2.  For each of the fonts that you wish to embed, and for each font *style*, you need a separate CSS rule, as follows:
{% highlight css %}
@font-face {
  font-family: /*[the name of your font as used elsewhere in your CSS eg:]*/ Army;
  font-style: normal /*or*/ italic;
  font-weight: normal /*or*/ bold /*or*/ /*some other value*/;
  src: url("../Fonts//*[your font's filename eg:]*/ Army.ttf");
}
{% endhighlight %}
3.  In the &#8220;content.opf&#8221; file in your ebook&#8217;s root folder, type an entry for each of your embedded fonts within the `<manifest>` section as follows:  
    `<item href="Fonts/Army.ttf" id="Army.ttf" media-type="application/x-font-ttf" />`  
    where the &#8220;`id`&#8221; equals the font&#8217;s filename, and the &#8220;`media-type`&#8221; refers to your font&#8217;s file format according to the following table:</p> 
    > ttf as &#8220;application/x-font-ttf&#8221; or &#8220;application/x-font-truetype&#8221;  
    > otf as &#8220;application/x-font-opentype&#8221;  
    > woff as &#8220;application/x-font-woff&#8221;  
    > eot as &#8220;application/vnd.ms-fontobject&#8221;

Hey presto, your font has been embedded. Now, to make your foreign text disappear in the MOBI format. We&#8217;ll use the &#8220;`display : none`&#8221; CSS property, as follows:

1.  Create a new <a href="http://www.w3schools.com/css/css_mediatypes.asp" title="CSS Media Queries" target="_blank">media query</a> rule **at the bottom of your CSS stylesheet** (this is important due to the cascading nature of CSS &#8211; <a href="http://en.wikipedia.org/wiki/Cascading_Style_Sheets#CSS_Priority_scheme_.28highest_to_lowest.29" title="CSS Priority Scheme" target="_blank">later rules override earlier rules</a>):  
    `@media amzn-mobi {<br />
}`
2.  Copy the selector for each paragraph you want to hide in the MOBI version of your ebook, and paste it between the curly brackets in the new media query. Then add the CSS property &#8220;`display : none`&#8221; within that pasted selector&#8217;s own curly brackets.

For example, this:
{% highlight css %}
p.tamil {
  font-family : "My Tamil Font", sans-serif;
  font-weight : normal;
  font-style : normal;
  font-size : 0.8em;
  text-decoration : none;
  font-variant : normal;
  line-height : 1;
  text-align : left;
  color : #000000;
  text-indent : -1.2em;
  margin : 0px 0px 0px 1.2em;
}
{% endhighlight %}

becomes this:
{% highlight css %}
p.tamil {
  font-family : "My Tamil Font", sans-serif;
  font-weight : normal;
  font-style : normal;
  font-size : 0.8em;
  text-decoration : none;
  font-variant : normal;
  line-height : 1;
  text-align : left;
  color : #000000;
  text-indent : -1.2em;
  margin : 0px 0px 0px 1.2em;
}
@media amzn-mobi {
  p.tamil {
    display: none;
  }
}
{% endhighlight %}

That&#8217;s pretty much it. You can stack as many selectors within your media query as you need. Make sure to test your ebook carefully &#8211; for any text dispersed within the foreign-language sections that *isn&#8217;t* using an embedded font, and will therefore not be hidden by the above CSS adjustments. **One final note**: I wouldn&#8217;t recommend applying these changes to an EPUB ebook that&#8217;s going to remain as an EPUB ebook. I can&#8217;t vouch for the media query &#8220;`@media amzn-mobi`&#8221; being ignored by all EPUB readers &#8211; there have been <a href="http://www.pigsgourdsandwikis.com/2012/01/media-queries-for-formatting-poetry-on.html" title="Pigs, Gourds and Wikis" target="_blank">conflicts noted with the Nook</a>. Make the above changes only to a &#8220;.mobi&#8221; ebook file, or to a &#8220;.epub&#8221; that you&#8217;re planning on using only to convert automatically to a &#8220;.mobi&#8221; using Amazon&#8217;s upload conversion tool.

_____

*Thanks to William Ockham (!) for suggesting the improvements to the above code.*