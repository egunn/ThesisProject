//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);


//set some margins and record width and height of window
margin = {t: 20, r: 0, b: 25, l: 50};

var width = document.getElementById('vis').clientWidth- margin.r - margin.l;
var height = document.getElementById('vis').clientHeight- margin.t - margin.b;

chartLoc = {xwidth:width-30, xheight:5*height/6, ytop:margin.t};

//grab svg from template
var svg = d3.selectAll('#vis');

//make global for resize listener
var mapData;

d3.csv('./data/worldFood.csv', dataLoaded);  //removed GLSGEOID 2086 from original data file (background square)

function dataLoaded(data){
    console.log(data);

    drawBars(data)
}


function drawBars(data){

    //group to plot bars in
    plotGroup = svg.append('g')
        .attr('class','plot-group')
        .attr('transform','translate('+ margin.l + ','+ (40+margin.t) + ')');

    var x = d3.scaleLinear().range([0, ((chartLoc.xwidth))]).domain([+data[0].year, +data[data.length - 1].year]);


//************************note: something is odd about the y axis here; height not calculating correctly based on svg height and margins.
    var y = d3.scaleLinear().range([chartLoc.xheight,chartLoc.ytop]).domain([0,Math.max(
        d3.max(data, function (d) {return +d.food;}),
        d3.max(data, function (d) {return +d.nonFood;})
    )]);

//add axes and titles
    var xAxis = plotGroup.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + chartLoc.xheight + ")")
        .call(d3.axisBottom(x).tickSizeOuter([0])
            .tickFormat(d3.format("d")));

    xAxis
        .selectAll("text")
        .attr("dy", ".8em")
        .attr('font-size','12px')
        .attr('fill','gray')
        .style("text-anchor", "middle");

    var yAxis = plotGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).tickSizeOuter([0]));


//define line generator functions
    var foodLine = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return x(+d.year);
        })
        .y(function (d) {
            return y(+d.food);
        });


    var nonFoodLine = d3.line()
        .x(function (d) {
            return x(+d.year);
        })
        .y(function (d) {
            return y(+d.nonFood);
        });

    plotGroup.append('path')
        .datum(data)
        .attr('class', 'food-line')
        .attr('d', foodLine)
        .attr('stroke', "orange")
        .attr('stroke-width',1.5)
        .attr('fill','none')
        .style('fill-opacity', .1);


    plotGroup.append('path')
        .datum(data)
        .attr('class', 'nonFood-line')
        .attr('d', nonFoodLine)
        .attr('stroke', "gray")
        .attr('stroke-width',1.5)
        .attr('fill','none')
        .style('fill-opacity', .1);

    plotGroup.append('text')
        .attr('class', 'food-line-label')
        .attr('x', x(1995))
        .attr('y', y(15))
        .attr('fill', "orange")
        .text('agricultural products used for food');

    plotGroup.append('text')
        .attr('class', 'nonFood-line-label')
        .attr('x', x(1995))
        .attr('y', y(15)+20)
        .attr('fill', "gray")
        .text('used for non-food purposes');

    plotGroup.append('text')
        .attr('class', 'y-label')
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', "gray")
        .attr('transform', 'translate(-35,' + y(65) + ')rotate(-90)')
        .attr('text-anchor','middle')
        .text('agricultural production index');

}





//runs on window resize, calls scale update and draw functions
function resizeView() {

    width = document.getElementById('vis').clientWidth;
    height = document.getElementById('vis').clientHeight;

}