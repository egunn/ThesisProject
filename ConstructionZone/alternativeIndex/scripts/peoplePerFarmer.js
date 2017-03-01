//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

//set some margins and record width and height of window
margin = {t: 100, r: 0, b: 25, l: 50};

var width = document.getElementById('vis').clientWidth- margin.r - margin.l;
var height = document.getElementById('vis').clientHeight- margin.t - margin.b;

chartLoc = {xwidth:width-30, xheight:5*height/6, ytop:margin.t};

//grab svg from template
var svg = d3.selectAll('#vis');

//make global for resize listener
var mapData;

d3.csv('./data/peoplePerFarmer.csv', dataLoaded);  //removed GLSGEOID 2086 from original data file (background square)

function dataLoaded(data){
    console.log(data);

    drawBars(data)
}


function drawBars(data){

    //group to plot bars in
    barGroup = svg.append('g')
        .attr('class','bar-group')
        .attr('transform','translate('+ margin.l + ','+ (40+margin.t) + ')');

    var x = d3.scaleBand().rangeRound([0, ((chartLoc.xwidth))]).padding(.5).domain(data.map(function (d) {
        return d.year;
    }));

//************************note: something is odd about the y axis here; height not calculating correctly based on svg height and margins.
    var y = d3.scaleLinear().rangeRound([chartLoc.ytop, chartLoc.xheight]).domain([d3.max(data, function (d) {
        return d.peoplePerFarmer;
    }),0]);

//add axes and titles
    var xAxis = barGroup.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + chartLoc.xheight + ")")
        .call(d3.axisBottom(x));

    xAxis
        .selectAll("text")
        .attr("dy", ".8em")
        .attr('font-size','12px')
        .attr('fill','gray')
        .style("text-anchor", "middle");

    /*
     var yAxis = barGroup.append("g")
     .attr("class", "axis axis--y")
     .call(d3.axisLeft(y)
     .ticks(5));
     //.tickFormat(d3.formatPrefix(",.0", 1e6)));

     yAxis.selectAll('text')
     .attr('fill',"gray");
     */
    /*
     barGroup.append('text')
     .attr('x', width/2-15)
     .attr('y', -10)
     .style('font-size', 14)
     .attr('fill',"gray")
     .style('text-anchor', 'middle')
     .text('Distribution of carbon in the soil');
     */


    var bars = barGroup
        .selectAll('bar')
        .data(data)
        .enter();

    bars
        .append("rect")
        .attr("class", "bar")
        /*.attr('id', function(d){
            return d.year
        })*/
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function(d){
            return y(d.peoplePerFarmer);
        })
        .attr("width", x.bandwidth())
        .attr("height", function(d){
            return chartLoc.xheight - y(d.peoplePerFarmer);
        })
        .attr('fill', '#74a063');

    bars.append('text')
        .attr('class', 'bar-label')
        .attr('id',function(d){
            return "label-" + d.peoplePerFarmer
        })
        .attr('fill',"gray")
        .style('font-size', 12)
        .style('text-anchor','middle')
        .attr("x", function (d) {
            return (x(d.year)) + (x.bandwidth()/2);
        })
        .attr("y",  function(d){
            return (y(d.peoplePerFarmer)-4);
        })
        .text(function(d){return d.peoplePerFarmer});

}



//group to plot bars in
barGroup = svg.append('g')
    .attr('class','bar-group')
    .attr('transform','translate('+ margin.l + ','+ (40+margin.t) + ')');



//runs on window resize, calls scale update and draw functions
function resizeView() {

    width = document.getElementById('vis').clientWidth;
    height = document.getElementById('vis').clientHeight;

}