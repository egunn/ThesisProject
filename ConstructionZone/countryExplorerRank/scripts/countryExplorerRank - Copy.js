//code adapted from https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

function drawRank(rankData){

var rankMargin = {top: 8, right: 20, bottom: 110, left: 100};
var rankMargin2 = {top: 370, right: 20, bottom: 30, left: 100};

var rankWidth = document.getElementById('vis').clientWidth - rankMargin.left - rankMargin.right;
var rankHeight = document.getElementById('vis').clientHeight - rankMargin.top - rankMargin.bottom;
var rankHeight2 = document.getElementById('vis').clientHeight - rankMargin2.top - rankMargin2.bottom;

//Set up scales and axes, brushes, and area generators
var rankx = d3.scaleBand().rangeRound([0, rankWidth]).padding(0.1),
    rankx2 = d3.scaleBand().rangeRound([0, rankWidth]).padding(0.1),

    //.invert needed for brush doesn't work on a non-continuous scale; make a shadow scale instead
    contrankx2 = d3.scaleLinear().range([0, rankWidth]),
    rankY = d3.scaleLinear().range([rankHeight, 0]),
    rankY2 = d3.scaleLinear().range([rankHeight2, 0]);

var rankxAxis = d3.axisBottom(rankx);
var rankxAxis2 = d3.axisBottom(rankx2);
var rankYAxis = d3.axisLeft(rankY);


var brush = d3.brushX() //replace with d3.brush() to add in y-axis brushing
    .extent([[0, 0], [rankWidth, rankHeight2]])
    .on("brush end", brushed);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + rankMargin.left + "," + rankMargin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + rankMargin2.left + "," + rankMargin2.top + ")");

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


    var sorted = rankData.sort(function(a,b){return a.year-b.year});

    sorted = rankData.sort(function(a,b){
        //needs a case-insensitive alphabetical sort
        return a.fullname.toLowerCase().localeCompare(b.fullname.toLowerCase());
    });

    sortData = sorted;

    //map axes onto rankData
    rankx.domain(sorted.map(function (d) {
        return d.countryCode;
    }));

    //assign a continuous domain for brushing and zooming (not used for data).
    //Make one step for each array entry in dataset, to link brushing to categorical x axis
    contrankx2.domain([0,sorted.length]);

    rankY.domain([0,d3.max(sorted, function (d) {
        return +d.bal_importQuantity;
    })]);
    rankx2.domain(rankx.domain());
    rankY2.domain(rankY.domain());


    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + rankHeight + ")")
        .call(rankxAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(rankYAxis);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + rankHeight2 + ")")
        .call(rankXAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, contrankX2.range());

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
            return rankX2(d.countryCode);
        })
        .attr("y", function (d) {
            return  rankY2(d.bal_importQuantity);
        })
        .attr("width", rankX2.bandwidth())
        .attr("height", function (d) {
            return rankHeight2 - rankY2(d.bal_importQuantity);
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
            return rankX(d.countryCode);
        })
        .attr("y", function (d) {
            return rankY(d.bal_importQuantity);
        })
        .attr("width", rankX.bandwidth())
        .attr("height", function (d) {
            return rankHeight - rankY(d.bal_importQuantity);
        })
        .attr('fill', 'purple')
        .on('mouseover',function(d){
            focus.append('text')
                .attr('class','bar-label-text')
                .attr('x', rankWidth-20)
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

    /*
    barGroup.append('text')
        .attr('class','bar-label-text')
        .attr("x", function (d) {
            return x(d.countryCode);
        })
        .attr("y", function (d) {
            return y(d.bal_importQuantity);
        })
        .attr('text-anchor', 'begin')
        .text(function(d){return d.fullname});
        */

}





function reshuffle(calledBy){
    console.log('reshuffle', tracker.sort, calledBy);

    //if called by the sort button, toggle tracker.sort value
    if (calledBy == "sort") {
        if (tracker.sort == "alph") {
            tracker.sort = "rank";
        }
        else if (tracker.sort == "rank") {
            tracker.sort = "alph";
        }
    }

    //otherwise, sort the data array, using either the selected variable or the alphabetical listing
    if (tracker.sort == "alph"){
        sortData = sortData.sort(function(a,b){
            //needs a case-insensitive alphabetical sort
            return a.fullname.toLowerCase().localeCompare(b.fullname.toLowerCase());
        });

    }

    else if (tracker.sort == "rank"){
        sortData = sortData.sort(function(a,b){
            //needs a case-insensitive alphabetical sort
            return b[tracker.sortVar] - a[tracker.sortVar];
        });
    }

    //reset the domain values for the focus bar chart, using the trimmed selection
    rankX.domain(sortData.map(function (d) {
        return d.countryCode;
    }));

    //reset the axis to match the new values
    focus.select(".axis--x").call(xAxis);

    //move the bars to their new positions
    d3.selectAll(".focus-bar")
        .transition()
        .attr("x", function (d) {
            //because the range does not include all values in the array, some bars will return undefined. Push them off the screen
            if (typeof rankX(d.countryCode) == "undefined"){
                return -200;
            }
            //give the values within the range a coordinate on the axis
            else{
                return rankX(d.countryCode);
            }

        })
        .attr("y", function (d) {
            return rankY(d[tracker.sortVar]);
        })
        .attr("width", rankX.bandwidth())
        .attr("height", function (d) {
            return rankHeight - rankY(d[tracker.sortVar]);
        });

}


function changeVariable(){
    if (tracker.sortVar == "bal_importQuantity"){
        tracker.sortVar = "lu_totalPop";
    }
    else if (tracker.sortVar == "lu_totalPop"){
        tracker.sortVar = "bal_importQuantity";
    }
    reshuffle('varChange');
}


