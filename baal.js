'use strict';
// TODO: use modules to scope the module. This block hack is icky
{
    const frameDelay = 500;
    const canvasContextLineWidth = 3;

    const campfireCenter = {x: 250, y: 250};
    
    let sliderElement = undefined;
    let numberOfParticipants = 1;

    // Setup on windo load
    window.onload = (e) => {
	let canvasElement = document.querySelector("#main_canvas");
	if(canvasElement == undefined) {
	    console.log("Canvas element not found");
	    displayError("Canvas element not found");
	    return;
	}
	
	let canvasContext = canvasElement.getContext("2d");
	canvasContext.lineWidth = canvasContextLineWidth;
	renderMainCanvas(canvasContext);
    };
    
    function renderMainCanvas(canvasContext) {
	console.log(canvasContext);
	const pointList = [
	    {x:  5, y:  5},
	    {x:  0, y: 10},
	    {x: 10, y: 10},

	    {x: 50, y:  50},
	    {x:  0, y: 100},
	    {x: 10, y:  20}
	];

	drawTriangles(pointList, canvasContext);
    }

    //Draws a triangle for every consecutive triplet of points in pointList
    //Excess ponts are discarded
    function drawTriangles(pointList, canvasContext) {
	let numTriangles = (pointList.length - (pointList.length % 3)) / 3;
	let tripletIndex = 0;
	for(let i = 0; i < numTriangles; i++) {
	    console.log(`drawing triangle number ${i}`);
	    tripletIndex = i*3;
	    
	    canvasContext.beginPath();
	    canvasContext.moveTo(pointList[tripletIndex].x, pointList[tripletIndex].y);
	    canvasContext.lineTo(pointList[tripletIndex+1].x, pointList[tripletIndex+1].y);
	    canvasContext.lineTo(pointList[tripletIndex+2].x, pointList[tripletIndex+2].y);
	    canvasContext.closePath();
	    canvasContext.stroke();
	}
    }
    
    function displayError(errorMessage) {
	let errorReporterElement = document.querySelector("#error_reporter");
	errorReporterElement.innerHTML = "Error: " + errorMessage;
    }
}
