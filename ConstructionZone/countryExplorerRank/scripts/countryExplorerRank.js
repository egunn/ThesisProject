//code adapted from https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

var margin = {top: 8, right: 20, bottom: 110, left: 100};
var margin2 = {top: 370, right: 20, bottom: 30, left: 100};

var width = document.getElementById('vis').clientWidth - margin.left - margin.right;
var height = document.getElementById('vis').clientHeight - margin.top - margin.bottom;
var height2 = document.getElementById('vis').clientHeight - margin2.top - margin2.bottom;

var extentX;
var shiftMultiplier = 40;

console.log(width, height, height2);

//grab svg from template
var svg = d3.selectAll('#vis');

//set up scale factors
//x = d3.scaleBand().rangeRound([0, ((width/2)-50)]).padding(0.1);
//y = d3.scaleLinear().rangeRound([height, height/2]);

//Set up scales and axes, brushes, and area generators
var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    x2 = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x);//.tickFormat(d3.format("d")),
var xAxis2 = d3.axisBottom(x2); //.tickFormat(d3.format("d")),
var yAxis = d3.axisLeft(y);


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
    .x(function(d) { return x(d.countryCode); })
    .y0(height)
    .y1(function(d) { return y(+d.bal_importQuantity); });


var areaUpper = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.countryCode); })
    .y0(height2)
    .y1(function(d) { return y2(+d.bal_importQuantity); });

/*
var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(+d.year); })
    .y0(height2)
    .y1(function(d) { return y2(+d.total_Lower); });
    */

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
    .defer(d3.json, './data/perCapitaLandUseRequirements.json')
    //.defer(d3.json, "./nodes.json")
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, data) {

        console.log(data);

        var pc = crossfilter(data);

        var pcByYear = pc.dimension(function (d) {
            return +d.year;
        });

        var pcByCountry = pc.dimension(function (d) {
            return d.countryCode;
        });

        var pcYearL = pcByCountry.top(Infinity).filter(function(d){return d.year == "2000";});

        dataLoaded(pcYearL);

    });

function dataLoaded(data) {
    console.log(data);



    extentX = d3.extent(data, function(d) { return d.countryCode; })[0];

    var sorted = data.sort(function(a,b){return a.year-b.year});
    console.log(sorted);

    sorted = data.sort(function(a,b){
        //needs a case-insensitive alphabetical sort
        return a.fullname.toLowerCase().localeCompare(b.fullname.toLowerCase());
    });

    //data.sort(function(b,a){return b.year-a.year;});

    /*console.log(d3.max(data, function (d) {
     return +d.totalPop;
     }));

     console.log(2*d3.max(sorted, function (d) {
     return +d.exportQuantity;
     }))*/



    //map axes onto data
    x.domain(sorted.map(function (d) {
        return d.countryCode;
    }));
    y.domain([0,d3.max(sorted, function (d) {
        return +d.bal_importQuantity;
    })]);
    x2.domain(x.domain());
    y2.domain(y.domain());


    /*x.domain(d3.extent(data, function(d) { return +d.year; }));
    y.domain([0, d3.max(data, function(d) { return +d.total_Lower; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());*/

    /*
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
*/

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    /*context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);*/

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    //draw bars for the context menu (small)
    barGroup = context.selectAll(".context-bar")
        .data(sorted)
        .enter()
        .append('g')
        .attr('class','context-bargroup');

    barGroup
        .append("rect")
        .attr("class", "context-bar")
        .attr("x", function (d) {
            return x(d.countryCode);
        })
        .attr("y", function (d) {
            return  y2(d.bal_importQuantity);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height2 - y2(d.bal_importQuantity);
        })
        .attr('fill', '#74a063');


    //draw bars for the context menu (small)
    barGroup = focus.selectAll(".focus-bar")
        .data(sorted)
        .enter()
        .append('g')
        .attr('class','focus-bargroup');

    barGroup
        .append("rect")
        .attr("class", "focus-bar")
        .attr("x", function (d) {
            return x(d.countryCode);
        })
        .attr("y", function (d) {
            return y(d.bal_importQuantity);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.bal_importQuantity);
        })
        .attr('fill', 'purple');


    //eventColors =  d3.scaleOrdinal().domain(["weather","culture","technology","agriculture","context","deaths"]).range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"]);


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


function brushed(data) {

    console.log(x2.range);

    console.log('brushed', x2.range(), x2.invert);

    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

    var s = d3.event.selection || x2.range();
    //x.domain(s.map(x2.invert, x2));

    /*
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
    /*focus.selectAll('.data-rect')
        .attr('x',x(1950))
        .attr('width',(x(2017)-x(1950)));*/
/*    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
*/
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

