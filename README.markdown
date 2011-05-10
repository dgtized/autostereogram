### Autostereogram using Javascript Canvas

I wrote this last summer as a quick hack to play around with javascript, specifically the new canvas and in browser uploading features.

Without further ado: http://dgtized.github.com/autostereogram/

Using the radio buttons at the base of the page you can select which depthmap you want to render, and with which pattern to embed the stereogram in the tiling.  The neat thing about the file upload buttons is they aren't actually uploading to the server, just loading the image you select into the page.  This is why reloading the page ditches any patterns or depthmaps you "uploaded".

### Warnings and Sources

My javascript was pretty rough at that point, and I'm a bit embarrassed by some of the code, but we all have to learn sometime.  I copied liberally from tutorials on [local file upload](http://www.html5rocks.com/tutorials/file/dndfiles/), [canvas](http://diveintohtml5.org/canvas.html) and this description on how to [create autostereograms](http://www.techmind.org/stereo/stech.html).  My implementation is a very close translation of his C into javascript as my previous implementation of the algorithm left much to be desired in terms of image clarity.

### Crossbrowser

As this was a proof of concept hack, I didn't really focus much on
cross-browser testing.  I know it at least renders the autostereogram in:

 * Chrome
 * Firefox 4.0
 * Android (not sure on the file upload, but the autostereogram renders on my Nexus One)

### Known Issues

 * Sometimes when uploading a pattern or depthmap it is added more then once.
