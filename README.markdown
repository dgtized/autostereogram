# Autostereogram using Javascript Canvas

I wrote this last summer as a quick hack to play around with javascript, specifically the new canvas and in browser uploading features.  Basically it generates a "Magic Eye" image out of a black and white depthmap and a pattern to replicate.

Without further ado: http://dgtized.github.com/autostereogram/

Using the radio buttons at the base of the page you can select which depthmap you want to render, and with which pattern to embed the stereogram in the tiling.  The neat thing about the file upload buttons is they aren't actually uploading to the server, just loading the image you select into the page.  This is why reloading the page ditches any patterns or depthmaps you "uploaded".  Note that some of the depthmaps are encoding max depth as 0 instead of 255, so if it looks like the image is inside out, just use the invert depthmap checkbox.  Clicking on the canvas will display the depthmap.

## Warnings and Sources

My javascript was pretty rough when I wrote it, and I'm a bit embarrassed by some of the code, but we all have to learn sometime.  I copied liberally from tutorials on [local file upload](http://www.html5rocks.com/tutorials/file/dndfiles/), [canvas](http://diveintohtml5.org/canvas.html) and this description on how to [create autostereograms](http://www.techmind.org/stereo/stech.html).  My implementation is a very close translation of his C into javascript as my previous implementation of the algorithm left much to be desired in terms of image clarity.

## Crossbrowser

As this was a proof of concept hack, I didn't really focus much on
cross-browser testing.  I know it at least renders the autostereogram in:

 * Chrome
 * Firefox 4.0
 * Android (not sure on the file upload, but the autostereogram renders on my Nexus One)

## Known Issues

 * Sometimes when uploading a pattern or depthmap it is added more then once.
 * Apparently the Canvas and File API's have security problems if they aren't being hosted off of a webserver.  `static.ru` is a Rack file for using thin to run a temporary server on localhost:3000.  Just install thin, and execute:

    $ thin -R static.ru start

Browse to localhost:3000 and everything should be happy.

## License

Copyright 2010-2016 by Charles L.G. Comstock (dgtized@gmail.com), released under MIT License

