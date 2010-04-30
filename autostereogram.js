function Autostereogram() {
    this.invert = false;
    this.setXdpi = function(xdpi) {
	this.eyeSep = xdpi * 2.5;
	this.obsDist = xdpi * 12;
	this.maxdepth = xdpi * 12;
	this.maxsep = Math.floor((this.eyeSep * this.maxdepth)/
				 (this.maxdepth + this.obsDist));
	this.sepfactor = 0.55;
	this.mindepth=(this.sepfactor*this.maxdepth*this.obsDist)/
	    ((1-this.sepfactor)*this.maxdepth+this.obsDist);
    }

    this.getSeparation = function (idx, depthData) {
	var z = (depthData.data[idx + 0] + depthData.data[idx + 1] +
		 depthData.data[idx + 2]) / 3;
	if(this.invert) { z = 256 - z; }
	var zdepth = this.maxdepth - z * (this.maxdepth - this.mindepth)/256;

	return Math.round((this.eyeSep * zdepth) / (zdepth + this.obsDist));
    }

    this.calculateLinksForRow = function (width, y, depthData, lookL, lookR) {
	for(var x = 0; x < width; x++) {
	    lookL[x] = x;
	    lookR[x] = x;
	}

	for(var x = 0; x < width; x++) {
	    var separation = this.getSeparation(index(x, y, width), depthData);
	    var left = Math.floor(x - separation/2);
	    var right = left + separation;
	    var visible = true;
	    if((left >= 0) && (right < width)) {
		if (lookL[right]!=right) // right pt already linked
		{
		    if (lookL[right]<left) // deeper than current
		    {
			lookR[lookL[right]]=lookL[right]; // break old links
			lookL[right]=right;
		    } else { visible = false; }
		}

		if (lookR[left]!=left) // left pt already linked
		{
		    if (lookR[left]>right) // deeper than current
		    {
			lookL[lookR[left]]=lookR[left]; // break old links
			lookR[left]=left;
		    } else { visible = false; }
		}
		if (visible) { // make link
		    lookL[right]=left;
		    lookR[left]=right;
		}
	    }
	}
    }

    this.generate = function(canvas, pattern, depthmap) {
	var ctx = canvas.getContext('2d');

	var pData =
	    pattern.getContext('2d').getImageData(0, 0, pattern.width, pattern.height);
	var depthData =
	    depthmap.getContext('2d').getImageData(0, 0, depthmap.width, depthmap.height);
	var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	var width = depthmap.width;
	for(var y = 0; y < depthmap.height; y++) {
	    // Initialize linked pixels for row
	    var lookL = new Array(width);
	    var lookR = new Array(width);
	    this.calculateLinksForRow(width, y, depthData, lookL, lookR);

	    var lastlinked = 0;
	    var color = new Array(width);
	    for(var x = 0; x < width; x++) {
		if(lookL[x] == x) {
		    if(lastlinked == x-1) {
			color[x] = color[x-1]
		    } else {
			color[x] = x % this.maxsep;
		    }
		} else {
		    color[x] = color[lookL[x]];
		    lastlinked = x;
		}
		copy_idx(index(color[x], y % pData.height, pData.width), pData,
	     		 index(x, y, canvas.width), canvasData);
	    }
	}
	ctx.putImageData(canvasData, 0, 0);
    }
    this.setXdpi(200);
}

function run() {
    var pattern = load_canvas_from_image('pattern');
    var depthmap = load_canvas_from_image('depthmap');
    var canvas = document.getElementById('magiceye');

    var invert = document.getElementById("invert");
    var width = document.getElementById("width").value;
    var height = document.getElementById("height").value;
    canvas.width = width;
    canvas.height = height;

    depthmap = scale_canvas(depthmap, width / depthmap.width, height / depthmap.height);

    var autostereogram = new Autostereogram();
    autostereogram.invert = invert.checked;
    autostereogram.generate(canvas, pattern, depthmap);

    canvas.onclick = function() {
	canvas.getContext('2d').drawImage(depthmap, 0, 0);
	canvas.onclick = function() {
	    run();
	}
    }
}

function index(x,y,width) {
    return (x + y * width) * 4;
}

function copy_idx(src_idx, src, dst_idx, dst) {
    dst.data[dst_idx + 0] = src.data[src_idx + 0];
    dst.data[dst_idx + 1] = src.data[src_idx + 1];
    dst.data[dst_idx + 2] = src.data[src_idx + 2];
    dst.data[dst_idx + 3] = src.data[src_idx + 3];
}

function load_canvas_from_image(id) {
    var img = document.getElementById(id);
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    return canvas;
}

function scale_canvas(canvas, xscale, yscale) {
    var ctx = canvas.getContext('2d');
    ctx.scale(xscale,yscale);
    var scaled = document.createElement('canvas');
    scaled.width = canvas.width * xscale;
    scaled.height = canvas.height * yscale;
    scaled.getContext('2d').drawImage(canvas, 0, 0, scaled.width, scaled.height);
    return scaled;
}
