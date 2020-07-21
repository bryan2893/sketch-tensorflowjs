(async () => {

    'use strict';
    const clearButton = document.querySelector('#clearButton');
    const canvas = window._canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = '#efefef';
    canvas.isDrawingMode = 1;
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 10;
    canvas.renderAll();

    clearButton.onclick = () => {
        canvas.clear();
        canvas.backgroundColor = '#efefef';
    }

    const loadModel = async() => {
        
    }


})();