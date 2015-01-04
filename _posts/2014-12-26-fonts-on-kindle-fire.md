---
title: Setting custom fonts on Kindle Fire
author: Ben
layout: post
categories:
  - eBook Design
  - Resources
tags:
  - font
  - sans-serif
  - Kindle Fire
  - Kindle Previewer
  - Amazon
  - CSS
  - typeface
  - typography
---
Prescribing specific fonts in ebooks can be controversial, but there’s no doubt that it can be important to be able to make some typographic choices without having to embed a font in the ebook file, with the necessary font license, and all the other caveats that brings (such as getting this to work in Apple’s iBooks). One example I use again and again is setting headings and titles to be in a (i.e. *any available*) sans-serif font. This is a small design decision that can go a long way towards adding a professional touch to an ebook.

However, one problem I have always encountered is that the **Kindle Fire** mode in [Kindle Previewer](http://www.amazon.com/gp/feature.html?docId=1000765261) has never honoured the following CSS:

```
.heading {
  font-family: sans-serif;
}
```

This week, I discovered why, thanks to [this discussion](http://www.mobileread.com/forums/showthread.php?t=228868). For whatever reason (i.e. ignorance of standards), Kindle Fire mode (not having a Kindle Fire myself, I have no idea if this is true for the real device too) requires a specific typeface to be referenced first, thus:

```
.heading {
  font-family: "Arial", sans-serif;
}
```

Hey presto, it works. It shouldn’t, but it does. Given that the Kindle Fire only ships with 8 fonts (unless things have changed recently), it’s probably best to choose one of those in your CSS; I experimented with `"Trebuchet"`, which is supposed to be one of the 8 and looks a lot nicer than Arial, but it didn't work at all, simply rendering as a serif font, as before.
