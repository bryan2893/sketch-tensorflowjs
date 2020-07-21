(async () => {

    'use strict';

    const clearButton = document.querySelector('#clearButton');
    const canvas = window._canvas = new fabric.Canvas('canvas');
    const ctx = canvas.getContext('2d');
    const model = await tf.loadLayersModel('https://raw.githubusercontent.com/bryan2893/sketch-tensorflowjs/master/model/model.json');
    var coords = [];
    var mousePressed = false;
    canvas.backgroundColor = 'white';
    canvas.borderColor = 'grey';
    canvas.isDrawingMode = 1;
    canvas.freeDrawingBrush.color = 'black';
    canvas.freeDrawingBrush.width = 10;
    canvas.renderAll();

    canvas.on('mouse:up', () => {
        getPredictions();
        mousePressed = false
    });

    canvas.on('mouse:down', function (e) {
        mousePressed = true
    });

    canvas.on('mouse:move', function (e) {
        recordCoor(e)
    });

    clearButton.onclick = () => {
        canvas.clear();
        coords = [];
    }

    const getPredictions = () => {
        const img = getImage();
        const processedImage = preprocess(img)
        const prediction = model.predict(processedImage).dataSync();
        console.log(findIndicesOfMax(prediction, 5));
        console.log(findTopValues(prediction, 5));
    }

    const getImage = () => {
        const mbb = getMinBox()
        //get image data according to dpi 
        const dpi = window.devicePixelRatio
        const imgData = canvas.contextContainer.getImageData(mbb.min.x * dpi, mbb.min.y * dpi,
            (mbb.max.x - mbb.min.x) * dpi, (mbb.max.y - mbb.min.y) * dpi);
        return imgData
    }

    const preprocess = (imgData) => {
        return tf.tidy(() => {
            //convert to a tensor 
            let tensor = tf.browser.fromPixels(imgData, 1);

            //resize 
            const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat();

            //normalize 
            const offset = tf.scalar(255.0);
            const normalized = tf.scalar(1.0).sub(resized.div(offset));

            //We add a dimension to get a batch shape 
            const batched = normalized.expandDims(0);
            return batched;
        })
    }

    const findIndicesOfMax = (inp, count) => {
        var outp = [];
        for (var i = 0; i < inp.length; i++) {
            outp.push(i); // add index to output array
            if (outp.length > count) {
                outp.sort(function (a, b) {
                    return inp[b] - inp[a];
                }); // descending sort the output array
                outp.pop(); // remove the last index (index of smallest element in output array)
            }
        }
        return outp;
    }

    function findTopValues(inp, count) {
        var outp = [];
        let indices = findIndicesOfMax(inp, count)
        // show 5 greatest scores
        for (var i = 0; i < indices.length; i++)
            outp[i] = inp[indices[i]]
        return outp
    }

    function recordCoor(event) {
        var pointer = canvas.getPointer(event.e);
        var posX = pointer.x;
        var posY = pointer.y;

        if (posX >= 0 && posY >= 0 && mousePressed) {
            coords.push(pointer)
        }
    }

    function getMinBox() {
        //get coordinates 
        var coorX = coords.map(function (p) {
            return p.x
        });
        var coorY = coords.map(function (p) {
            return p.y
        });

        //find top left and bottom right corners 
        var min_coords = {
            x: Math.min.apply(null, coorX),
            y: Math.min.apply(null, coorY)
        }
        var max_coords = {
            x: Math.max.apply(null, coorX),
            y: Math.max.apply(null, coorY)
        }

        //return as strucut 
        return {
            min: min_coords,
            max: max_coords
        }
    }

})();