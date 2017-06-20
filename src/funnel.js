
/**
 * Create a graphical funnel representation
 * 
 * @param {string} divId the id of the DIV in which we will create our SVG graphic
 * @param {int} width the width in pixels of the SVG to create
 * @param {int} height the width in pixels of the SVG to create
 * @param {type} funnelData the data of the funnel
 * @returns {undefined}
 */
function createFunnel(divId, width, height, funnelData) {
    
    
    var svgContainer = d3.select("#"+divId).append("svg").attr("width",width).attr("height",width);
    var lineFunction = d3.svg.line()
                        .x(function(d) { return d.x; })
                         .y(function(d) { return d.y; })
                        .interpolate("linear");
    var headerBuffer = 100;
        
    function getPhaseWidth() {
        return width / funnelData.length ;
    }
    
    function getPhaseHeight(phase) {
        if(phase.entries.length === 1) {
            return 100;
        } else if(phase.entries.length < 4) {
            return 200;
        } else if(phase.entries.length < 8) {
            return 400;
        } return 600;
    }
    
    function getCenter() {
        return headerBuffer + (height / 2);
    }
    
    function addText(x, y,size, txt) {
        svgContainer.append("text").attr("x", x)
                                    .attr("y", y)
                                    .text(txt)
                                    .attr("font-family", "sans-serif")
                                    .attr("font-size", size+"px")
                                    .attr("fill", "black");
    }
    
    /**
     * This function will put an entry in a phase. It positions the first, then recurses.
     * @param {type} entries the entries still to be treated
     * @param {type} sequence the sequence in the phase (needed to calculate where to draw it)
     * @returns {undefined}
     */
    function addEntriesToPhase(entries, phaseHeight,xBase, sequence) {
        if(entries === undefined || entries.length === 0) {
            return; // I've done my job... stop the recursion
        }
        var currentEntry = head(entries);
        
        var entryX = xBase + randomText(getPhaseWidth(), 20, currentEntry.name.length);
        var entryY = getCenter() + getYPositionForSequence(sequence, phaseHeight);
        
        addText(entryX, entryY, 20, currentEntry.name);
        
        addEntriesToPhase(tail(entries), phaseHeight, xBase, sequence +1);
    }
    
    /**
     * The main function that will draw a phase. It takes some data from the previous phases,
     * does its thing and recurses onto the next phase.
     * 
     * @param {type} phases the phases still to be drawn
     * @param {type} startHeight the height of the previous phase to properly align
     * @param {type} sequence the sequence in the list... needed to know where to drow ourselves
     * @returns {undefined}
     */
    function mapPhase(phases, startHeight, sequence) {
        if(phases === undefined || phases.length === 0) {
            return; // I've done my job... stop the recursion
        }
        var currentPhase = head(phases);
        console.log("Rendering "+currentPhase.name);
        var lineData = [ { "x": sequence * getPhaseWidth(),   "y": getCenter() + startHeight},  // left below
                         { "x": sequence * getPhaseWidth(),  "y": getCenter() - startHeight},   // left top
                         { "x": (sequence+0.25) * getPhaseWidth(),   "y": getCenter() - getPhaseHeight(currentPhase)},  // center top                         
                         { "x": (sequence+1) * getPhaseWidth(),   "y": getCenter() - getPhaseHeight(currentPhase)},  // right top                         
                         { "x": (sequence+1) * getPhaseWidth(),  "y": getCenter() + getPhaseHeight(currentPhase)},    // right below
                         { "x": (sequence+0.25) * getPhaseWidth(),  "y": getCenter() + getPhaseHeight(currentPhase)},   // center below
                         { "x": sequence * getPhaseWidth(),   "y": getCenter() + startHeight} // and back to the start
                        ];
        
        svgContainer.append("path")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", "blue")
                    .attr("stroke-width", 2)
                    .attr("fill", "blue");
             
        // add the name of the phase as a title above
        var titleX = sequence * getPhaseWidth() + centerText(getPhaseWidth(), 40, currentPhase.name.length);
        var titleY = headerBuffer - 10;
        addText(titleX, titleY, 50, currentPhase.name);
        
        // now add the entries to the phase
        addEntriesToPhase(currentPhase.entries, getPhaseHeight(currentPhase), sequence * getPhaseWidth(), 0);
                           
        // all done ... now recurse to the following element
        mapPhase(tail(phases), getPhaseHeight(currentPhase), sequence + 1);
    }
    
            
    // start with the the complete list, the size of the first element and position 0
    mapPhase(funnelData, getPhaseHeight(head(funnelData)), 0);
    
    
    
}

/**
 * This function calculates where to position a text in the center of a box based on the size and the length of the text.
 * When using a font with variable width, the position will be an approximation since a 'I' or 'l' does not take
 * the same amount of space as a 'W'... but in general, it will do
 */
function centerText(boxSize, textSize, textLength) {
    var calc = (boxSize / 2) - (textLength * textSize / 2);
    if( calc > 0 ) {
        return calc;
    }
    return 0; // prevent large texts creeping into the left side
}

/**
 * This function calculates where to position a text somewhere in a box based on the size and the length of the text.
 * When using a font with variable width, the position will be an approximation since a 'I' or 'l' does not take
 * the same amount of space as a 'W'... but in general, it will do. Instead of always centering, it will use Math.random to
 * pull it more to the left or to the rigt to get a richer distribution...
 */
function randomText(boxSize, textSize, textLength) {
    var calc = (boxSize * Math.random()) - (textLength * textSize / 2);
    if( calc < 0) {
        return 0;
    }
    return calc; // prevent large texts creeping into the left side
}

/**
 * This function calculates the position for a sequence. The first element will be in the middle, the next in the middle of the middle, ...
 */
function getYPositionForSequence(sequence, height) {
    var fraction = Math.log2(sequence+2);
    var offset =  height / (fraction * 2);
    
    if(sequence === 0) {
        return 0; // first one, dead center
    } else if(sequence === 1) {
        return offset;
    } else if(sequence === 2) {
        return -offset;
    }
    return 0;
    
}

function head(arr) {
    return arr[0];
}

function tail(arr) {
    return arr.slice(1);
}
