//code adapted from https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

var margin = {top: 20, right: 20, bottom: 110, left: 40};
var margin2 = {top: 370, right: 20, bottom: 30, left: 40};

var width = document.getElementById('vis').clientWidth - margin.left - margin.right;
var height = document.getElementById('vis').clientHeight - margin.top - margin.bottom;
var height2 = document.getElementById('vis').clientHeight - margin2.top - margin2.bottom;

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

    focus.append("path")
        .datum(data)
        .attr("class", "area-upper")
        .attr("d", areaUpper)
        .style('fill','gray')
        .attr('fill-opacity',.5)
        .style('clip-path', 'url(#clip)');

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
        .call(brush.move, x.range());

    eventColors =  d3.scaleOrdinal().domain(["weather","culture","technology","agriculture","context","deaths"]).range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"]);

    var lineGroup = focus.selectAll('.line-group')
        .append('g')
        .attr('class','line-group')
        .data(events)
        .enter()
        .append('line')
        .attr('class','event-line')
        .attr('x1',function(d){return x(+d.year); })
        .attr('x2',function(d){return x(+d.year); })
        .attr('y1', y(0))
        .attr('y2',y(d3.max(data, function(d) { return +d.total_Lower; })))
        .attr('stroke', function(d){
            return eventColors(d.type);
        })
        .attr('stroke-opacity',function(d){
            if(d.priority == 1){
                return .5;
            }
            else{
                return .1;//'gray'
            }
        });


/*  //in the example, this rectangle allows dragging of the main chart; found it confusing, and distracted from lower controller bar
    //leave it out for now.
    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //moved in from css for now - remove to style sheet later!
        .style('cursor','move')
        .style('fill','none')
        .style('pointer-events', 'all')
        .call(zoom);*/

}


function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    y2.domain(s.map(y2.invert, y2));
    focus.select(".area").attr("d", area);
    focus.select(".area-upper").attr("d", areaUpper);
    focus.selectAll(".event-line")
        .attr('x1',function(d){return x(+d.year); })
        .attr('x2',function(d){return x(+d.year); });
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