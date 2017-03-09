//code adapted from https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

var margin = {top: 20, right: 20, bottom: 110, left: 90};
var margin2 = {top: 20, right: 20, bottom: 30, left: 20};


//grab svg from template
var svg = d3.selectAll('#vis')
    .style('min-height',2000);

var widthContext = 50; //variable for calculating margins and plot heights

var width = document.getElementById('vis').clientWidth - margin.left - margin.right - widthContext;
var width2 = document.getElementById('vis').clientWidth - margin2.left - margin2.right;
var height = document.getElementById('vis').clientHeight - margin.top - margin.bottom;


var globalData;
var modeTracker = "alph";
var varTracker = "bal_importQuantity";


//Set up scales and axes, brushes, and area generators
var y = d3.scaleBand().rangeRound([0, height]).padding(0.1),
    y2 = d3.scaleBand().rangeRound([0, height]).padding(0.1),

    //.invert needed for brush doesn't work on a non-continuous scale; make a shadow scale instead
    conty2 = d3.scaleLinear().range([0, height]),
    x = d3.scaleLinear().range([0, width]),
    x2 = d3.scaleLinear().range([0, widthContext]);

var yAxis = d3.axisLeft(y);
var yAxis2 = d3.axisLeft(y2);
var xAxis = d3.axisTop(x);


/*
var brush = d3.brushX() //replace with d3.brush() to add in y-axis brushing
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);
*/

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

/*
//temporary buttons for development
svg.append('circle')
    .attr('cx',10)
    .attr('cy',10)
    .attr('r',5)
    .attr('fill','green')
    .on('click',function(){reshuffle('sort')});

svg.append('circle')
    .attr('cx',10)
    .attr('cy',50)
    .attr('r',5)
    .attr('fill','blue')
    .on('click',changeVariable);
    */

//import data from GeoJSON and csv files. Use parseData function to load the csv (not necessary for JSONs)
queue()
    .defer(d3.json, './data/perCapitaLandUseRequirements.json')
    //.defer(d3.json, "./nodes.json")
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, data) {

        var pc = crossfilter(data);

        var pcByYear = pc.dimension(function (d) {
            return +d.year;
        });

        var pcByCountry = pc.dimension(function (d) {
            return d.countryCode;
        });

        //return only country data (not region/world), for a particular year
        var pcYearL = pcByCountry.top(Infinity).filter(function(d){return d.dataType == "country" && d.year == "2000";});

        dataLoaded(pcYearL);

    });

function dataLoaded(data) {

    var sorted = data.sort(function(a,b){return a.year-b.year});
    console.log(sorted);

    sorted = data.sort(function(a,b){
        //needs a case-insensitive alphabetical sort
        return a.fullname.toLowerCase().localeCompare(b.fullname.toLowerCase());
    });

    globalData = sorted;

    //map axes onto data
    y.domain(sorted.map(function (d) {
        return d.countryCode;
    }));

    //assign a continuous domain for brushing and zooming (not used for data).
    //Make one step for each array entry in dataset, to link brushing to categorical x axis
    conty2.domain([0,sorted.length]);

    x.domain([0,d3.max(sorted, function (d) {
        return +d.bal_importQuantity;
    })]);
    y2.domain(y.domain());
    x2.domain(x.domain());

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(yAxis);

    context.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + margin2.left + "," + margin.top + ")")
        .call(yAxis2);


    /*
    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, contx2.range());
*/
    //draw bars for the context menu (small)
    barGroup = context.selectAll(".context-bar")
        .data(sorted)
        .enter()
        .append('g')
        .attr('class','context-bargroup');

    //draw bars for the context menu (small)
    barGroup
        .append("rect")
        .attr("class", "context-bar")
        .attr("transform", "translate(" + margin2.left + "," + margin.top + ")")
        .attr("x", x2(0))
        .attr("y",function (d) {
            return y2(d.countryCode);
        })
        .attr("width", function (d) {
            return x2(d.bal_importQuantity);
        })
        .attr("height", y2.bandwidth())
        .attr('fill', '#74a063');


    //draw main bars
    barGroup = focus.selectAll(".focus-bar")
        .data(sorted)
        .enter()
        .append('g')
        .attr('class','focus-bargroup');

    barGroup
        .append("rect")
        .attr("class", "focus-bar")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("x", x(0)/*function (d) {
            return x(d.countryCode);
        }*/)
        .attr("y", function (d) {
            return y(d.countryCode);//y(d.bal_importQuantity);
        })
        .attr("width", function (d) {
            return x(d.bal_importQuantity);
        })
        .attr("height", y.bandwidth())
        .attr('fill', 'purple')
        .on('mouseover',function(d){
            focus.append('text')
                .attr('class','bar-label-text')
                .attr('x', width-20)
                .attr('y', 50)
                .attr('text-anchor', 'end')
                .text(d.fullname);
        })
        .on('mouseout',function(d){
            d3.selectAll('.bar-label-text').remove();
        })
        .on('click',function(){
            var bar = d3.select(this);
            if (bar.attr('fill') == "purple"){
                bar.attr('fill','orange');
            }
            else if (bar.attr('fill') == "orange"){
                bar.attr('fill','purple');
            }

        });


}


function brushed(data) {

    //stores pixel values of beginning and end of brushing box
    var selection = d3.event.selection;

    //use the continuous shadow axis to invert the pixel values to scaled axis values
    //Because the continuous axis is set using the length of the original data array, its values vary between 0 and the length of the array
    //The invert function therefore gives a decimal value for the bar number
    boxCoords = [contx2.invert(selection[0]), contx2.invert(selection[1])];

       //use the inverted selection values to chop out a section of the original data to use as the new domain values
    var cutData = globalData.slice(Math.floor(contx2.invert(selection[0])), Math.floor(contx2.invert(selection[1])));

    //reset the domain values for the focus bar chart, using the trimmed selection
    x.domain(cutData.map(function (d) {
        return d.countryCode;
    }));

    //reset the axis to match the new values
    focus.select(".axis--x").call(xAxis);

    //move the bars to their new positions
    d3.selectAll(".focus-bar")
        .attr("x", function (d) {
            //because the range does not include all values in the array, some bars will return undefined. Push them off the screen
            if (typeof x(d.countryCode) == "undefined"){
                return -200;
            }
            //give the values within the range a coordinate on the axis
            else{
                return x(d.countryCode);
            }

        })
        .attr("y", function (d) {
            return y(d.bal_importQuantity);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.bal_importQuantity);
        });

/*
    //console.log('brushed', x2.range(), contx2.invert);

    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

    var s = d3.event.selection || x2.range();
    x.domain(s.map(contx2.invert, contx2));


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


function reshuffle(calledBy){
    console.log('reshuffle', modeTracker, calledBy);

    //if called by the sort button, toggle the modeTracker
    if (calledBy == "sort") {
        if (modeTracker == "alph") {
            modeTracker = "rank";
        }
        else if (modeTracker == "rank") {
            modeTracker = "alph";
        }
    }

    //otherwise, sort the data array, using either the selected variable or the alphabetical listing
    if (modeTracker == "alph"){
        globalData = globalData.sort(function(a,b){
            //needs a case-insensitive alphabetical sort
            return a.fullname.toLowerCase().localeCompare(b.fullname.toLowerCase());
        });

    }

    else if (modeTracker == "rank"){
        globalData = globalData.sort(function(a,b){
            //needs a case-insensitive alphabetical sort
            return b[varTracker] - a[varTracker];
        });
    }


    //reset the view
    //reset the domain values for the focus bar chart, using the trimmed selection
    x.domain(globalData.map(function (d) {
        return d.countryCode;
    }));

    //reset the axis to match the new values
    focus.select(".axis--x").call(xAxis);

    //move the bars to their new positions
    d3.selectAll(".focus-bar")
        .transition()
        .attr("x", function (d) {
            //because the range does not include all values in the array, some bars will return undefined. Push them off the screen
            if (typeof x(d.countryCode) == "undefined"){
                return -200;
            }
            //give the values within the range a coordinate on the axis
            else{
                return x(d.countryCode);
            }

        })
        .attr("y", function (d) {
            return y(d[varTracker]);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d[varTracker]);
        });

}


function changeVariable(){
    if (varTracker == "bal_importQuantity"){
        varTracker = "lu_totalPop";
    }
    else if (varTracker == "lu_totalPop"){
        varTracker = "bal_importQuantity";
    }
    reshuffle('varChange');
}

//runs on window resize, calls scale update and draw functions
function resizeView() {

    width = document.getElementById('vis').clientWidth;
    height = document.getElementById('vis').clientHeight;

}

