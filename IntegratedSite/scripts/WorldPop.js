//code adapted from https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

var margin = {top: 8, right: 20, bottom: 110, left: 40};
var margin2 = {top: 370, right: 20, bottom: 30, left: 40};

var width = document.getElementById('vis').clientWidth - margin.left - margin.right;
var height = document.getElementById('vis').clientHeight - margin.top - margin.bottom;
var height2 = document.getElementById('vis').clientHeight - margin2.top - margin2.bottom;

var extentX;
var shiftMultiplier = 40;

console.log(width, height, height2);

//grab svg from template
var svg = d3.selectAll('#vis');

//Set up scales and axes, brushes, and area generators
var x = d3.scaleLinear().range([0, width]),
    x2 = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x).tickFormat(d3.format("d")),
    xAxis2 = d3.axisBottom(x2).tickFormat(d3.format("d")),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX() //replace with d3.brush() to add in y-axis brushing
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(+d.year); })
    .y0(height)
    .y1(function(d) { return y(+d.total_Lower); });

var areaUpper = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(+d.year); })
    .y0(height)
    .y1(function(d) { return y(+d.total_Upper); });

var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(+d.year); })
    .y0(height2)
    .y1(function(d) { return y2(+d.total_Lower); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");



//import data from GeoJSON and csv files. Use parseData function to load the csv (not necessary for JSONs)
queue()
    .defer(d3.csv, './data/histworldpopCensus.csv')
    .defer(d3.csv, './data/timelineEvents.csv')
    //.defer(d3.json, "./nodes.json")
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, data, events) {

        //chop off extra columns element added by new d3.csv
        data = data.slice(0,data.length-1);
        events = events.slice(0,events.length-1);

        dataLoaded(data, events);

    });

function dataLoaded(data, events) {
    console.log(data);
    console.log(events);

    //run the events array through the line spacing function
    events = placeLines(events);

    //customize the axis label formatting to properly handle AD and BC dates
    xAxis.tickFormat(dateLabels);
    xAxis2.tickFormat(dateLabels);

    function dateLabels(d){
        if (d < 0){
            return Math.abs(d) + " BCE";
        }
        else {
            return d + " AD";
        }
    }

    extentX = d3.extent(data, function(d) { return +d.year; })[0];

    x.domain(d3.extent(data, function(d) { return +d.year; }));
    y.domain([0, d3.max(data, function(d) { return +d.total_Lower; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    console.log(y(2000));

    focus.append('rect')
        .attr('class','data-rect')
        .attr('x',x(1950))
        .attr('y',y(d3.max(data, function(d) { return +d.total_Lower; })))
        .attr('width',(x(2017)-x(1950)))
        .attr('height',(y(0)-y(d3.max(data, function(d) { return +d.total_Lower; }))))
        .attr('stroke','none')
        .attr('fill','gray')
        .attr('fill-opacity',.4);

    focus.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
        .style('fill','gray')
        .style('clip-path', 'url(#clip)');

    /*
    focus.append("path")
        .datum(data)
        .attr("class", "area-upper")
        .attr("d", areaUpper)
        .style('fill','gray')
        .attr('fill-opacity',.5)
        .style('clip-path', 'url(#clip)');*/

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [x(0),x(2050)]);//x.range()  //determine width of initial brush selection

    eventColors =  d3.scaleOrdinal().domain(["weather","culture","technology","agriculture","context","deaths"]).range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"]);


    var lineGroup = focus.selectAll('.line-group')
        .append('g')
        .attr('class','line-group')
        .data(events)
        .enter()
        .append('line')
        .attr('class','event-line')
        .attr('x1',function(d) {
            //check for the lines that fall off the end of the graph
            if (x(+d.year_Actual + d.shift * shiftMultiplier) < x(extentX)) {
                return x(+d.year_Actual + 2* Math.abs(d.shift) * shiftMultiplier);
            }
            else {
                return x(+d.year_Actual + d.shift * shiftMultiplier);
            }
        })
        .attr('x2',function(d){
            //check for the lines that fall off the end of the graph
            if (x(+d.year_Actual + d.shift * shiftMultiplier) <= x(extentX)) {
                return x(+d.year_Actual + 2* Math.abs(d.shift) * shiftMultiplier);
            }
            else {
                return x(+d.year_Actual + d.shift * shiftMultiplier);
            }
        })
        .attr('y1', y(0))
        .attr('y2',y(d3.max(data, function(d) { return +d.total_Lower; })))
        .attr('stroke', function(d){
            return eventColors(d.type);
        })
        .attr('stroke-width',1.5)
        .attr('stroke-opacity',function(d){
            if(d.priority == 1){
                return .5;
            }
            else{
                return .1;//'gray'
            }
        })
        .on('mouseover',function(d){
            //console.log(x(d.year_Actual));

            /*var infoBox = focus.append('rect')
                .attr('id','focus-box')
                .attr('x',x(d.year_Actual) - 5)
                .attr('y',y(0)/3 - 18)
                .attr('width',176)
                .attr('height',112)
                .attr('fill-opacity',.85)
                .attr('pointer-events','none')
                .attr('fill','white');*/

            d3.selectAll('.info-text').remove();
            d3.selectAll('.info-box').remove();

            var labelX;
            if(d3.mouse(this)[0] < width-100){
                labelX = d3.mouse(this)[0] + 2;
            }
            else{
                labelX = d3.mouse(this)[0]-150;
            }

            var infoText = focus.append('text')
                .attr('class','info-text')
                .attr('x', labelX)
                .attr('y',y(0)/3)
                .style('text-anchor','begin')
                .attr('font-size',12)
                .attr('font-family','WorkSansExtraLight')
                .attr('fill','gray')
                .text(null);


            infoText.transition()
                .on('end',function(){
                    if (d.year_Actual < 0){
                        date = Math.abs(d.year_Actual) + " B.C.: "
                    }
                    else{
                        date = d.year_Actual + " A.D.: "
                    }

                    wrap(d3.select('.info-text'), date + d.event, 150);
                });


        })
        .on('mouseout',function(d){


        });

}


function brushed(data) {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));

    //reset shift ratio to scale line spacing with zoom
    //ratio to compare width of current brush (s[1]-s[0]) with width of entire axis: x.range()[1]
    shiftMultiplier = 40 * ((s[1]-s[0])/x.range()[1]);

    //give it a minimum value
    if (shiftMultiplier < 5){
        shiftMultiplier = 5;
    }

    y2.domain(s.map(y2.invert, y2));
    focus.select(".area").attr("d", area);
    focus.select(".area-upper").attr("d", areaUpper);
    focus.selectAll(".event-line")
        .attr('x1',function(d){
            //check for the lines that fall off the end of the graph
            if (x(+d.year_Actual + d.shift * shiftMultiplier) < x(extentX)) {
                return x(+d.year_Actual + 2* Math.abs(d.shift) * shiftMultiplier);
            }
            else {
                return x(+d.year_Actual + d.shift * shiftMultiplier);
            }
        })
        .attr('x2',function(d){
            //check for the lines that fall off the end of the graph
            if (x(+d.year_Actual + d.shift * shiftMultiplier) < x(extentX)) {
                return x(+d.year_Actual + 2* Math.abs(d.shift) * shiftMultiplier);
            }
            else {
                return x(+d.year_Actual + d.shift * shiftMultiplier);
            }});
    focus.selectAll('.data-rect')
        .attr('x',x(1950))
        .attr('width',(x(2017)-x(1950)));
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    //y.domain(t.rescaleY(y2).domain());
    focus.select(".area").attr("d", area);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    //context.select(".brush").call(brush.move, y2.range().map(t.invertY, t));
}

//runs on window resize, calls scale update and draw functions
function resizeView() {

    width = document.getElementById('vis').clientWidth;
    height = document.getElementById('vis').clientHeight;

}

function placeLines(lines) {

    var numLines = 1;
    var shiftCounter = 0;
    var shiftValue = 0;

    //create a "shift" variable to be used with a multiplier and added to line x position, depending on zoom level
    lines.forEach(function(d){

        //check whether shiftCounter has been reset
        //take the year value and filter the original array to see how many lines there are for that year
        if (shiftCounter == 0){
            numLines = lines.filter(function(e){ return e.year_Actual == d.year_Actual}).length;
            console.log('first shift');
        }

        //calculate and store the initial shift offset

        //if there's only one line, set its shift to zero and move on
        if (numLines == 1){
            d.shift = 0;
        }

        //if there's more than one line
        else {

            //check whether this is the first line
            if (shiftCounter == 0){
                //find the group center based on the length of the filter array (center on length/2)
                //if numlines==even, add a half step to center shifts around zero
                if (Math.floor(numLines/2) == numLines/2){
                    shiftValue = -numLines/2 + 0.5
                }
                else {
                    shiftValue = -Math.floor(numLines/2);
                }

                //store the shift value in the current object
                d.shift = shiftValue;

                //increment the shiftCounter and shiftValue
                shiftCounter++;
                shiftValue++;
            }
            //if it isn't the first line
            else {
                //check whether it's the last line
                if (shiftCounter == numLines-1){

                    //set the shift value for the current line
                    d.shift = shiftValue;

                    //reset the values of tracker variables
                    numLines = 1;
                    shiftCounter = 0;
                    shiftValue = 0;
                }
                //if it's not the last line
                else {
                    //set the shift value
                    d.shift = shiftValue;

                    //increment the shiftCounter and shiftValue
                    shiftCounter++;
                    shiftValue++;
                }
            }


        }

    });

    return lines;
}

//from http://stackoverflow.com/questions/24784302/wrapping-text-in-d3
function wrap(text, wordList, width) {
    text.each(function () {
        var text = d3.select(this),
            words = wordList.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.15, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}