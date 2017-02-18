//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);


//set some margins and record width and height of window
margin = {t: 15, r: 0, b: 25, l: 50};

var width = document.getElementById('vis').clientWidth- margin.r - margin.l;
var height = document.getElementById('vis').clientHeight- margin.t - margin.b;

chartLoc = {xwidth:width-30, xheight:5*height/6, ytop:margin.t};

//grab svg from template
var svg = d3.selectAll('#vis');

//make global for resize listener
var mapData;

var x, y;

data = [
    {id:"living",class:"Living",value:650, percent:"1%"},
    {id:"atmosphere",class:"Atmosphere",value:780, percent:"2%"},
    {id:"soil",class:"Soil",value:2730, percent:"6%"},
    {id:"oil",class:"Coal, Oil, Gas",value:4130,percent:"9%"},
    {id:"oceans", class:"Oceans",value:38153,percent:"82%"}
];

pieData = [
    {id:"SOC",slice:"soil organic carbon",value:1550},
    {id:"Carbonate",slice:"minerals",value:950},
    {id:"leaf",slice:"leaf litter",value:80},
    {id:"peat",slice:"peat",value:150}
];

drawBars(data);
//drawPie();


function drawBars(data){

    //group to plot bars in
    barGroup = svg.append('g')
        .attr('class','bar-group')
        .attr('transform','translate('+ margin.l + ','+ (40+margin.t) + ')');

    x = d3.scaleBand().rangeRound([0, ((chartLoc.xwidth))]).padding(.5).domain(data.map(function (d) {
        return d.class;
    }));

//************************note: something is odd about the y axis here; height not calculating correctly based on svg height and margins.
    y = d3.scaleLinear().rangeRound([chartLoc.ytop, chartLoc.xheight]).domain([d3.max(data, function (d) {
        return d.value;
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


    barGroup.append('text')
        .attr('fill','gray')
        .style('font-size',12)
        .attr('transform','rotate(-90)')
        .attr("x", -chartLoc.xheight + 2)
        .attr("y", -5)
        .text('Trillion kg Carbon Dioxide');



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
            return x(d.class);
        })
        .attr("y", function(d){
            return y(d.value);
        })
        .attr("width", x.bandwidth())
        .attr("height", function(d){
            return chartLoc.xheight - y(d.value);
        })
        .attr('fill',  '#74a063'/*function(d){
            if (d.class == "Soil"){
                return "#7a533b";
            }
            else{
                return '#74a063'
            }

        }*/);

    bars.append('text')
        .attr('class', 'bar-label')
        .attr('id',function(d){
            return "label-" + d.value
        })
        .attr('fill',"gray")
        .style('font-size', 12)
        .style('text-anchor','middle')
        .attr("x", function (d) {
            return (x(d.class)) + (x.bandwidth()/2);
        })
        .attr("y",  function(d){
            return (y(d.value)-4);
        })
        .text(function(d){return d.value + " (" + d.percent + ")"});

    livingLabel = barGroup.append('g')
        .attr('class','living-label')
        .attr('transform','translate('+ (x('Living')+ (x.bandwidth()/2) ) + ',' + (height/2 + 38) + ')');

    arrow = livingLabel.append('line')
        .attr('x1',0)
        .attr('x2',0)
        .attr('y1', 25)
        .attr('y2', 60)
        .attr('stroke','gray')
        .attr('stroke-weight', 1);

    livingLabel.append("path")
        .attr('transform','translate(0,' + 55 + ')')
        .attr("d", "M-4,0L0,10,L4,0")
        .attr("class","arrowHead")
        .attr('fill','gray');

    livingLabel
        //.attr('transform','translate()')
        .append('text')
        .attr('fill','gray')
        .style('font-size',12)
        .attr("x",0)
        .attr("y", 0)
        .style('text-anchor','middle')
        .transition()
        .on('start',function(d){
            var text = d3.select(this);
            wrap(text, 'All plant and animal life on earth' ,125);
        });



    soilLabel = barGroup.append('g')
        .attr('class','soil-label')
        .attr('transform','translate('+ (x('Soil')+ (x.bandwidth()/2) ) + ',' + (height/2 +20) + ')');

    arrow = soilLabel.append('line')
        .attr('x1',0)
        .attr('x2',0)
        .attr('y1', 25)
        .attr('y2', 60)
        .attr('stroke','gray')
        .attr('stroke-weight', 1);

    soilLabel.append("path")
        .attr('transform','translate(0,' + 55+ ')')
        .attr("d", "M-4,0L0,10,L4,0")
        .attr("class","arrowHead")
        .attr('fill','gray');

    soilLabel.append('text')
        .attr('fill','gray')
        .style('font-size',12)
        .attr("x", 0)
        .attr("y", 15)
        .style('text-anchor','middle')
        .text('Carbon stored in soil');


}



//group to plot bars in
barGroup = svg.append('g')
    .attr('class','bar-group')
    .attr('transform','translate('+ margin.l + ','+ (40+margin.t) + ')');



//from https://bl.ocks.org/mbostock/3887235
function drawPie(){

    pieChart = svg.append('g')
        .attr('class','pie-group')
        .attr('transform','translate(' + (x('Soil')+ (x.bandwidth()/2) + 50) + ',' + (height/2 +margin.t) + ')');

    arrow = svg.append('line')
        .attr('x1',(x('Soil')+ (x.bandwidth()/2) + 50))
        .attr('x2',(x('Soil')+ (x.bandwidth()/2) + 50))
        .attr('y1', height/2 + margin.t + 75)
        .attr('y2', height - 60)
        .attr('stroke','gray')
        .attr('stroke-weight', 1);

    svg.append("path")
        .attr('transform','translate(' + (x('Soil')+ (x.bandwidth()/2) + 50) + ',' + (height/2 + margin.t + 75) + ')')
        .attr("d", "M0,0L-4,10L4,10")
        .attr("class","arrowHead")
        .attr('fill','gray');

    var color = d3.scaleOrdinal(d3.schemeCategory10).domain(pieData.map(function (d) {
        return d.id;
    }));

    var arc = d3.arc()
        .outerRadius(70)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(90)
        .innerRadius(70);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    var g = pieChart.selectAll(".arc")
        .data(pie(pieData))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .style("fill", function(d) {return color(d.data.id); })
        .transition()
        .duration(1000)
        .attr("d", arc);
    //.attr("d", arc);

    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dx", function(d){
            if(d.data.slice == "peat"){
                return '.25em';
            }
            else if (d.startAngle > Math.PI){
                return '-.5em';
            }
            else{
                return '.5em';
            }
        })
        .attr('dy', function(d){
            if (d.data.slice == 'peat'){
                return '-.5em';
            }
        })
        .style('text-anchor', function(d){
            if (d.startAngle > Math.PI){
                return 'end';
            }
            else{
                return 'start';
            }
        })
        .attr('fill','gray')
        .text(function(d) {return d.data.slice; });

    //from http://bl.ocks.org/mbostock/4341574
    /*function tweenPie(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) { return arc(i(t)); };
    }*/


}




//runs on window resize, calls scale update and draw functions
function resizeView() {

    width = document.getElementById('vis').clientWidth;
    height = document.getElementById('vis').clientHeight;

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