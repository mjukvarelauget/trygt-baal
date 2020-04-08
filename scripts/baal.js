'use strict';
// Prefixing the public methods to avoid polluting the namespace
let baal_rerender;

// TODO: consider using a class for this, or a ES6 module.
// The closure based approach is a little weird
{
    const canvasContextLineWidth = 3;
    const campfireCenter = {x: 250, y: 250}; // pixels
    const defaultCampfireRadius = 0.50;	//meters

    const personRadius = 0.2; // meters

    const largeCanvasWidth = 500; // pixels
    const largeCanvasHeight = 500; // pixels

    // TODO: make canvas size and app layout responsive
    const mobileCanvasWidth = 300; // pixels
    const mobileCanvasHeight = 500; // pixels

    const defaultSocialDistance = 1; // meters
    const defaultStickRange = 2; // meters
    const defaultZoomFactor = 100; // pixels per meter

    // Internal state
    let socialDistance = defaultSocialDistance; // meters
    let stickRange = defaultStickRange; // meters
    let zoomFactor = defaultZoomFactor; // pixelsPerMeter
    let pointList = []; // rectangular coordinates in meters
    let canvasWidth = largeCanvasWidth; // pixels
    let canvasHeight = largeCanvasHeight; // pixels
    let campfireRadius = defaultCampfireRadius;

    // Result values
    let numParticipants = NaN;
    let resultDistance = NaN;

    // Handles
    // Inputs
    let canvasContext = undefined;
    let campfireRadiusElementHandle = undefined;
    let stickRangeElementHandle = undefined;
    let socialDistanceElementHandle = undefined;
    let zoomElementHandle = undefined;

    // Outputs
    let errorReporterElementHandle = undefined;
    let numParticipantsElementHandle = undefined;
    let resultDistanceElementHandle = undefined;

    // Public API initialisation
    baal_rerender = () => {
        render();
    };

    // Setup on window load
    window.onload = (e) => {
        initialSetup();
        updateState();
        render();
    };

    //*** Unit conversions ***
    function metersToPixels(numMeters)
    {
        return numMeters * zoomFactor;
    }

    function pixelsToMeters(numPixels)
    {
        return Math.ceil(numMeters / zoomFactor);
    }

    //*** Setup methods ***
    function initialSetup()
    {
        setupCanvas();
        setupInputElements();
        setupOutputElements();
    }

    function setupInputElements()
    {
        setupInputElementHandles();
        initInputElements();
    }

    function setupOutputElements()
    {
        setupOutputElementHandles();
    }

    function initInputElements()
    {
        console.log(stickRangeElementHandle);
        campfireRadiusElementHandle.addEventListener("input", campfireRadiusUpdateHandler);
        stickRangeElementHandle.addEventListener("input", stickRangeUpdateHandler);
        socialDistanceElementHandle.addEventListener("input", socialDistanceUpdateHandler);
        zoomElementHandle.addEventListener("input", zoomUpdateHandler);

        campfireRadiusElementHandle.value = 0.5;
        stickRangeElementHandle.value = 1.5;
        socialDistanceElementHandle.value = 1;
        zoomElementHandle.value = 100;
    }

    function setupInputElementHandles()
    {
    	campfireRadiusElementHandle = document.querySelector("#radius_selector");
    	if(campfireRadiusElementHandle == undefined)
		{
			console.log("Campfire radius element not found");
			displayError("Campfire radius element not found");
		}

        stickRangeElementHandle = document.querySelector("#range_selector");
        if (stickRangeElementHandle == undefined)
        {
            console.log("Stick range element not found");
            displayError("Stick range element not found");
        }

        socialDistanceElementHandle = document.querySelector("#social_distance_selector");
        if (socialDistanceElementHandle == undefined)
        {
            console.log("Social distance element not found");
            displayError("Social distance element not found");
        }

        zoomElementHandle = document.querySelector("#zoom_selector");
        if (zoomElementHandle == undefined)
        {
            console.log("Zoom element not found");
            displayError("Zoom element not found");
        }
    }


    function setupOutputElementHandles()
    {
        errorReporterElementHandle = document.querySelector("#error_reporter");
        numParticipantsElementHandle = document.querySelector("#maximum_people_display");
        resultDistanceElementHandle = document.querySelector("#result_distance_display");

        if (errorReporterElementHandle == undefined)
        {
            console.log("Error element not found");
        }
        if (numParticipantsElementHandle == undefined)
        {
            console.log("Max participant element not found");
        }
        if (resultDistanceElementHandle == undefined)
        {
            console.log("Social distance element not found");
        }
    }

    function setupCanvas()
    {
        let canvasElement = document.querySelector("#main_canvas");
        if (canvasElement == undefined)
        {
            console.log("Canvas element not found");
            displayError("Canvas element not found");
            return;
        }

        canvasElement.width = canvasWidth;
        canvasElement.height = canvasHeight;

        canvasContext = canvasElement.getContext("2d");
        canvasContext.lineWidth = canvasContextLineWidth;
    }

    //*** Event handlers ***
	function campfireRadiusUpdateHandler(e)
	{
		updateState();
		render();
	}

    function stickRangeUpdateHandler(e)
    {
        updateState();
        render();
    }

    function socialDistanceUpdateHandler(e)
    {
        updateState();
        render();
    }

    function zoomUpdateHandler(e)
    {
        updateState();
        render();
    }

    //*** State update***
    function updateState()
    {
        clearErrors();
        updateInputValues();

        let newNumParticipants, newResultDistance;
        [newNumParticipants, newResultDistance] = generatePoints();

        updateOutputValues(newNumParticipants, newResultDistance);
    }

    // TODO: fix input validation
    // TODO: decide upon how values are submitted
    // TODO: make this function update different elements individually,
    //       for instance by taking a parameter. Could also make indiv. objects
    function updateInputValues()
    {
    	campfireRadius = Number(campfireRadiusElementHandle.value);
    	if(isNaN(campfireRadius) || campfireRadius < 0)
		{
			campfireRadius = defaultCampfireRadius;
			campfireRadiusElementHandle.value = String(defaultCampfireRadius);
		}

        stickRange = Number(stickRangeElementHandle.value);
        if (isNaN(stickRange) || stickRange < 0)
        {
            stickRange = defaultStickRange;
            stickRangeElementHandle.value = String(defaultStickRange);
        }

        socialDistance = Number(socialDistanceElementHandle.value);
        if (isNaN(socialDistance) || socialDistance < 0)
        {
            socialDistance = defaultSocialDistance;
            socialDistanceElementHandle.value = String(defaultSocialDistance);
        }

        zoomFactor = Number(zoomElementHandle.value);
        if (isNaN(zoomFactor) || zoomFactor < 0)
        {
            zoomFactor = defaultZoomFactor;
            zoomElementHandle.value = String(defaultZoomFactor);
        }
    }

    function generatePoints()
    {
        let totalRadius = stickRange + campfireRadius; // Can be extened to include the campfire radius
        let totalSocialDistance = socialDistance; // Can be extended to include person radius
        console.log(
            `Distance is ${totalRadius} meters, and sticks are ${socialDistance} meters`
        );
        let [maxAngle, numPeople] = findMaximumAngle(totalSocialDistance, totalRadius);
        console.log(
            `The max angle is ${maxAngle} radians, and with it, the campfire can fit ` +
            `${numPeople} people`
        );

        // Silently fail. This is BAD, but should be handled in input validation
        // TODO: Fix input validation to avoid this check
        if (numPeople === Infinity)
        {
            return
        }

        // We now need to generate all the points
        pointList = []; // clear the old points
        for (let i = 0; i < numPeople; i++)
        {
            let currentAngle = i * maxAngle;
            pointList.push(
                {
                    x: (campfireCenter.x -
                        metersToPixels(totalRadius * Math.cos(currentAngle))),
                    y: (campfireCenter.y -
                        metersToPixels(totalRadius * Math.sin(currentAngle)))
                }
            );
        }

        // Then we calculate what the average distance between people will be
        let avgDistance =
            totalRadius * Math.sqrt((1 - Math.cos(maxAngle)) ** 2 + Math.sin(maxAngle) ** 2);

        // Then we return the output values
        return [numPeople, avgDistance];
    }

    function updateOutputValues(newNumParticipants, newResultDistance)
    {
        if (isNaN(newResultDistance) || newNumParticipants === Infinity)
        {
            displayError("Invalid results. Maybe one of the inputs were set to 0?");
            return
        }

        numParticipants = newNumParticipants;
        socialDistance = newResultDistance;

        numParticipantsElementHandle.innerHTML = String(numParticipants);
        resultDistanceElementHandle.innerHTML = String(socialDistance.toFixed(3));
    }

    //*** Quick maths ***
    function findMaximumAngle(distance, radius)
    {
        let minimumAngle = Math.acos(1 - 0.5 * (distance / radius) ** 2);
        let numberOfPeople = Math.floor((2 * Math.PI) / minimumAngle);
        let maximumAngle = (2 * Math.PI) / numberOfPeople;

        return [maximumAngle, numberOfPeople];
    }

    //*** Rendering methods ***
    function render()
    {
        renderMainCanvas();
    }

    function renderMainCanvas()
    {
        clearCanvas();

        // First the campfire in the center
        canvasContext.strokeStyle = "#FF0000";
        canvasContext.beginPath();
        canvasContext.arc(
            campfireCenter.x,
            campfireCenter.y,
            metersToPixels(campfireRadius), 0, 2 * Math.PI);
        canvasContext.closePath();
        canvasContext.stroke();
        canvasContext.strokeStyle = "#000000";

        // Point coordinates are allready adjusted for the center and in pixels
        for (let i = 0; i < pointList.length; i++)
        {
            canvasContext.beginPath();
            canvasContext.arc(
                pointList[i].x,
                pointList[i].y,
                metersToPixels(personRadius),
                0, 2 * Math.PI);
            canvasContext.closePath();
            canvasContext.stroke();
        }
    }

    function clearCanvas()
    {
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    //Draws a triangle for every consecutive triplet of points in pointList
    //Excess ponts are discarded. Currently not in use, just an example
    function drawTriangles(pointList, canvasContext)
    {
        let numTriangles = (pointList.length - (pointList.length % 3)) / 3;
        let tripletIndex = 0;
        for (let i = 0; i < numTriangles; i++)
        {
            console.log(`drawing triangle number ${i}`);
            tripletIndex = i * 3;

            canvasContext.beginPath();
            canvasContext.moveTo(pointList[tripletIndex].x, pointList[tripletIndex].y);
            canvasContext.lineTo(pointList[tripletIndex + 1].x, pointList[tripletIndex + 1].y);
            canvasContext.lineTo(pointList[tripletIndex + 2].x, pointList[tripletIndex + 2].y);
            canvasContext.closePath();
            canvasContext.stroke();
        }
    }

    // If this is going to be usefull, it needs some way of displaying or
    // prioritising error messages
    function displayError(errorMessage)
    {
        errorReporterElementHandle.innerHTML = "Error: " + errorMessage;
    }

    function clearErrors()
    {
        errorReporterElementHandle.innerHTML = "";
    }
}
