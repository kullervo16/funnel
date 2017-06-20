
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
        return height / 2;
    }
    
    function mapPhase(phases, startHeight, position) {
        if(phases === undefined || phases.length === 0) {
            return; // I've done my job... stop the recursion
        }
        var first = head(phases);
        console.log("Rendering "+first.name);
        var lineData = [ { "x": position * getPhaseWidth(),   "y": getCenter() + startHeight},  // left below
                         { "x": position * getPhaseWidth(),  "y": getCenter() - startHeight},   // left top
                         { "x": (position+1) * getPhaseWidth(),   "y": getCenter() - getPhaseHeight(first)},  // right top
                         { "x": (position+1) * getPhaseWidth(),  "y": getCenter() + getPhaseHeight(first)},    // right below
                         { "x": position * getPhaseWidth(),   "y": getCenter() + startHeight} // and back to the start
                        ];
        
        var lineGraph = svgContainer.append("path")
                            .attr("d", lineFunction(lineData))
                            .attr("stroke", "blue")
                            .attr("stroke-width", 2)
                            .attr("fill", "blue");
        // now recurse to the following element
        mapPhase(tail(phases), getPhaseHeight(first), position + 1);
    }
    
            
    // start with the the complete list, the size of the first element and position 0
    mapPhase(funnelData, getPhaseHeight(head(funnelData)), 0);
    
    
    
}




function head(arr) {
    return arr[0];
}

function tail(arr) {
    return arr.slice(1);
}