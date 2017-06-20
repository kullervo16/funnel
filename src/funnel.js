
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
                         { "x": (sequence+1) * getPhaseWidth(),   "y": getCenter() - getPhaseHeight(currentPhase)},  // right top
                         { "x": (sequence+1) * getPhaseWidth(),  "y": getCenter() + getPhaseHeight(currentPhase)},    // right below
                         { "x": sequence * getPhaseWidth(),   "y": getCenter() + startHeight} // and back to the start
                        ];
        
        svgContainer.append("path")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", "blue")
                    .attr("stroke-width", 2)
                    .attr("fill", "blue");
             
        // add the name of the phase as a title above
        svgContainer.append("text").attr("x", sequence * getPhaseWidth() + centerText(getPhaseWidth(), 40, currentPhase.name.length))
                                    .attr("y", headerBuffer - 10)
                                    .text(currentPhase.name)
                                    .attr("font-family", "sans-serif")
                                    .attr("font-size", "50px")
                                    .attr("fill", "black");
        // all done ... now recurse to the following element
        mapPhase(tail(phases), getPhaseHeight(currentPhase), sequence + 1);
    }
    
            
    // start with the the complete list, the size of the first element and position 0
    mapPhase(funnelData, getPhaseHeight(head(funnelData)), 0);
    
    
    
}

/**
 * This function calculates where to position a text in a box based on the size and the length of the text.
 * When using a font with variable width, the position will be an approximation since a 'I' or 'l' does not take
 * the same amount of space as a 'W'... but in general, it will do
 */
function centerText(boxSize, textSize, textLength) {
    return (boxSize / 2) - (textLength * textSize / 2);
}

function head(arr) {
    return arr[0];
}

function tail(arr) {
    return arr.slice(1);
}