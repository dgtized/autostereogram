function Autostereogram() {
    this.invert = false;
    this.setXdpi(200, 0.55);
}

Autostereogram.prototype.setXdpi = function(xdpi, sepfactor) {
    this.eyeSep = xdpi * 2.5;
    this.obsDist = xdpi * 12;
    this.maxdepth = xdpi * 12;
    this.maxsep = Math.floor((this.eyeSep * this.maxdepth)/
                             (this.maxdepth + this.obsDist));
    this.mindepth=(sepfactor*this.maxdepth*this.obsDist)/
        ((1-sepfactor)*this.maxdepth+this.obsDist);
};

Autostereogram.prototype.getSeparation = function (idx, depthData) {
    var z = (depthData.data[idx + 0] + depthData.data[idx + 1] +
             depthData.data[idx + 2]) / 3;
    if(this.invert) { z = 256 - z; }
    var zdepth = this.maxdepth - z * (this.maxdepth - this.mindepth)/256;

    return Math.round((this.eyeSep * zdepth) / (zdepth + this.obsDist));
};

Autostereogram.prototype.calculateLinksForRow = function (width, y, depthData) {
    // Initialize linked pixels for row
    var lookL = new Array(width);
    var lookR = new Array(width);

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
            if (lookL[right]!=right) { // right pt already linked
                if (lookL[right]<left) { // deeper than current
                    lookR[lookL[right]]=lookL[right]; // break old links
                    lookL[right]=right;
                } else { visible = false; }
            }

            if (lookR[left]!=left) { // left pt already linked
                if (lookR[left]>right) { // deeper than current
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

    return { left: lookL, right: lookR };
};

Autostereogram.prototype.generate = function(canvas, pattern, depthmap) {
    var ctx = canvas.getContext('2d');

    var pData =
            pattern.getContext('2d').getImageData(0, 0, pattern.width, pattern.height);
    var depthData =
            depthmap.getContext('2d').getImageData(0, 0, depthmap.width, depthmap.height);
    var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var width = depthmap.width;
    for(var y = 0; y < depthmap.height; y++) {
        var links = this.calculateLinksForRow(width, y, depthData);
        var lookL = links.left;
        var lookR = links.right;

        var lastlinked = 0;
        var color = new Array(width);
        for(var x = 0; x < width; x++) {
            if(lookL[x] == x) {
                if(lastlinked == x-1) {
                    color[x] = color[x-1];
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
};

function selected_image(group) {
    var group_form = document.getElementById(group);

    var selector = group_form.selector;
    var index = 0;
    for(var i = 0; i < selector.length; i++) {
        if(selector[i].checked) {
            index = i;
            break;
        }
    }

    return group_form.getElementsByTagName("img")[index];
}

function run() {
    var pattern = create_canvas_from_image(selected_image('pattern_group'));
    var depthmap = create_canvas_from_image(selected_image('depthmap_group'));
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
        };
    };

    document.getElementById('depthmap_files').
        addEventListener('change',
                         function(evt) { file_selector(evt, "depthmap_group"); },
                         false);
    document.getElementById('pattern_files').
        addEventListener('change',
                         function(evt) { file_selector(evt, "pattern_group"); },
                         false);
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

function create_canvas_from_image(img) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    // real_img is a hack to get back the original image size, and not
    // the computed thumbnail size
    var real_img = new Image();
    real_img.src = (img.getAttribute ? img.getAttribute("src") : false) || img.src;
    img = real_img;

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

// modified from http://www.html5rocks.com/tutorials/file/dndfiles/#toc-selecting-files-input
function file_selector(evt, group) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
            continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                // Render thumbnail.
                var span = document.createElement('span');
                span.innerHTML = ['<input type="radio" name="selector"/>',
                                  '<img class="thumb" src="',
                                  e.target.result, '" title="', theFile.name,
                                  '"/>'].join('');
                document.getElementById(group).appendChild(span, null);
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}
