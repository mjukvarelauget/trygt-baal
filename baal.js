'use strict';
// Prefixing the public methods to avoid polluting the namespace
let baal_rerender;

// TODO: consider using a class for this, or a ES6 module.
// The closure based approach is a little weird
{
    const canvasContextLineWidth = 3;
    const campfireCenter = {x: 250, y: 250};

    // Internal state
    let sliderElement = undefined;
    let socialDistance = 1; //meters
    let stickRange = 2; //meters
    let pointList = []

    // Result values
    let numParticipants = NaN;
    let resultDistance = NaN;

    // Handles
    let canvasContext = undefined;
    let stickRangeElementHandle = undefined;
    let socialDistanceElementHandle = undefined;
    let errorReporterElementHandle = undefined;

    // Public API initialisation
    baal_rerender = () => {
	render();
    }
    
    // Setup on window load
    window.onload = (e) => {
	initialSetup();
	updateState();
	render();
    };

    //*** Setup methods ***
    function initialSetup() {
	setupCanvas();
	setupInputElements();
	setupOutputElements();
    }

    function setupInputElements(){
	setupInputElementHandles();
	initInputElements();
    }

    function setupOutputElements() {
	setupOutputElementHandles();
    }
    
    function initInputElements() {
	stickRangeElementHandle.onclick = stickRangeUpdateHandler;
	socialDistanceElementHandle.onclick = socialDistanceUpdateHandler;

	stickRangeElementHandle.value = 2;
	socialDistanceElementHandle.value = 1;
    }
    
    function setupInputElementHandles() {
	stickRangeElementHandle = document.querySelector("#range_selector");
	if(stickRangeElementHandle == undefined) {
	    console.log("Stick range element not found");
	    displayError("Stick range element not found");
	}

	socialDistanceElementHandle = document.querySelector("#social_distance_selector");
	if(socialDistanceElementHandle == undefined) {
	    console.log("Social distance element not found");
	    displayError("Social distance element not found");
	}
    }

        
    function setupOutputElementHandles() {
	
    }

    function setupCanvas() {
	let canvasElement = document.querySelector("#main_canvas");
	if(canvasElement == undefined) {
	    console.log("Canvas element not found");
	    displayError("Canvas element not found");
	    return;
	}
	
	canvasContext = canvasElement.getContext("2d");
	canvasContext.lineWidth = canvasContextLineWidth;
    }

    //*** Event handlers ***
    function stickRangeUpdateHandler(e) {
	stickRange = stickRangeElementHandle.valueAsNumber;
	updateState();
	render();
    }

    function socialDistanceUpdateHandler(e) {
	socialDistance = socialDistanceElementHandle.valueAsNumber;
	updateState();
	render();
    }

    //*** State update***
    function updateState(){
	generatePoints();
	updateOutputValues();
    }

    function generatePoints() {
	console.log(
	    `Distance is ${stickRange} meters, and sticks are ${socialDistance} meters`
	);
    }

    function updateOutputValues(newResultDistance, newNumParicipants) {
	
    }
    
    //*** Rendering methods ***
    function render() {
	renderOutputDisplays();
	renderMainCanvas();
    }
    
    function renderMainCanvas() {
	
    }

    function renderOutputDisplays() {

    }
    
    function drawRegularPolygon() {
	
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

    // If this is going to be usefull, it needs some way of displaying or
    // prioritising error messages
    function displayError(errorMessage) {
	errorReporterElementHandle = document.querySelector("#error_reporter");
	errorReporterElementHandle.innerHTML = "Error: " + errorMessage;
    }
}
