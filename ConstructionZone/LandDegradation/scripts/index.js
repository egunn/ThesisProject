//setup resize event listener on window
window.addEventListener('resize', resizeView, false);

//****************************************************************************
// Communicating with next page via PHP
//****************************************************************************

//create a JSON object for passing between webpages via PHP (to record user choices and prev. history)
var tracker = [{"narrative":"none"}];
console.log(tracker);
//JS function to preprocess and send the data to the server
function sendData()
{
    //convert the JSON object to a string using JS
    packed = JSON.stringify(tracker);
    document.phpForm.tracker.value = packed;
    document.phpForm.submit();
}

//****************************************************************************


var width = document.getElementById('nav-div').clientWidth;
var height = document.getElementById('nav-div').clientHeight;

var nodeSize = d3.scaleLinear().domain([1,3]).range([40,20]);

var svg = d3.select('#index-nav');
var simulation;

//Pattern injection from http://bl.ocks.org/hugolpz/98cef20c4d7cb05c7b26
//adapted using http://fiddle.jshell.net/xhh7a/1/
//http://jsfiddle.net/7DgUh/
//http://stackoverflow.com/questions/14610954/can-an-svg-pattern-be-implemented-in-d3
//https://jsfiddle.net/duhaime/q51ok9jc/
/*var pattern = svg.append("defs")
    .append("pattern")
        .attr('id','testPattern')
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", 1)
        .attr("height", 1)
        //.attr('patternContentUnits',"objectBoundingBox")
        //.attr('viewbox',"0 0 1 1")
        .attr('preserveAspectRatio',"xMidYMid slice")
    .append('image')
        //.attr("x", "0")
        //.attr("y", "0")
        .attr("height", "70px")
       // .attr("width", "70px")
        .attr('preserveAspectRatio',"xMidYMid slice")
        .attr("xlink:href", "./tree.png"); */


var pattern = svg.append("defs")
    .append("pattern")
    .attr('id','testPattern')
    //.attr("x", "0")
    //.attr("y", "0")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr('patternContentUnits',"objectBoundingBox")
    .attr('viewBox',"0 0 1 1")
    .attr('preserveAspectRatio',"xMidYMid slice")
    .append('image')
    //.attr("x", "0")
    //.attr("y", "0")
    .attr("height", 1)
    .attr("width", 1)
    .attr('preserveAspectRatio',"xMidYMid slice")
    .attr("xlink:href", "./tree.png");




var div = d3.select("#nav-div").append("div")
    .attr("class", "tooltip")
    .style('position','absolute');

var divImg = d3.select('.tooltip')
    .append('div')//'img')
    .attr('class','tooltip-image');

var tooltip = d3.select('.tooltip')
    .append('div')
    //.style('pointer-events','none') //this makes the div mouse-transparent; apply in css instead.
    .attr('class','tooltip-text')
    .style("opacity", 0);

//import data from GeoJSON and csv files. Use parseData function to load the csv (not necessary for JSONs)
queue()
    .defer(d3.csv, "./data/linkList.csv")
    .defer(d3.csv, "./data/nodeList.csv")
    //.defer(d3.json, "./nodes.json")
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, linkList, nodeList) {

        //chop off extra columns element added by new d3.csv
        linkList = linkList.slice(0,linkList.length-1);
        nodeList = nodeList.slice(0,nodeList.length-1);

        drawNetwork(linkList, nodeList);

    });


function drawNetwork(linkList, nodeList){

    console.log(linkList, nodeList);

    //define custom forces
    var forceX = d3.forceX()
        .x(function(d){return width*d.setX})   //sets the coordinate that the nodes will be attracted to
        .strength(.1);
    var forceY = d3.forceY()
        .y(function(d){return height*d.setY})
        .strength(.1);
    var forceCollide = d3.forceCollide(nodeSize(1))  //value in parentheses gives default node size for collision fxn
        .radius(function(d){return d.r + 5}).iterations(10).strength(1);
    var forceLink = d3.forceLink()
        .links(linkList).id(function(d) {return d.id; }).strength(.01);  //this strength easily overwhelms the rest of the layout!
    var forceCenter = d3.forceCenter(width / 2, height / 2);
    var forceManyBody = d3.forceManyBody().strength(-150).distanceMin(70);  //repulsive force with min distance req't

    //set up simulation, with forces defined above
    simulation = d3.forceSimulation()
        .nodes(nodeList)
        .force("link", forceLink)
        .force("charge", forceManyBody)
        .force("center", forceCenter)
        .force('positionX', forceX)
        .force('positionY', forceY)
        //.force('collide', forceCollide)
        //.restart()  //calls the simulation _after_ node positions are set, so that the entrance isn't animated.
        .on("tick", ticked);

    // simulation.force("link")
    //     ;   //tell the simulation which links to use
    // .distance(10);

    // var forceStrength=300;
    // function charge(d) {
    //     return -150;//-forceStrength * Math.pow(d.radius, 2.0);
    // }

    for (var i = 0; i < 100; ++i) simulation.tick();  //minimize the tick function over 100 iterations before drawing (fewer --> more animation)

    var link = svg.append("g")
        .attr("class", "link-group")
        .selectAll("line")
        .data(linkList)
        .enter().append("line")
        //.attr('class',function(d){return d.edgeName})
        //.attr("x1", function(d) {return d.source.x; })
        //.attr("y1", function(d) { return d.source.y; })
        //.attr("x2", function(d) { return d.target.x; })
        //.attr("y2", function(d) { return d.target.y; })
        .attr('class','link')
        .attr('stroke','gainsboro')
        .attr("stroke-width", function(d) {return +d.weight *2 ; });


    var nodeGroup = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodeList)
        .enter()
        .append("g");

    node = nodeGroup
        .append("circle")
        .attr('class',function(d){return 'node-circ ' + 'node'+d.id})
        //static layout - set positions here, do not update in tick
        //.attr("x", function(d) { return width*d.setX; })   //set the initial x and y coordinates using the stored JSON data
        //.attr("y", function(d) { return height*d.setY; })
        .attr("r", 15)
        .attr('stroke','gray')
        .style("fill", 'url(#testPattern)')
        .on('mouseover',function(d){

            //d3.selectAll('.div-image').remove();

            div.transition()
                .duration(200)
                .style("opacity", .9);


            div.style("left", (nodeSize(d.foodPriority) + +d3.select(this).attr('cx')) + "px")//d3.event.pageX + "px")
                .style("top", d3.select(this).attr('cy') + "px");

            console.log("url('./" + d.photo + "')");

            divImg
                .style("background-image", "url('./" + d.photo + "')")
                .style("background-repeat", "no-repeat")
                .style("background-position", "center center")
                .style('opacity', .9);

            /*
                .attr('src',d.photo);*/

            tooltip.html(d.text)
                .style("opacity", .9);

        })
        .on('mouseout',function(d){

            div.style('opacity', 0);
            tooltip.style('opacity', 0);
            divImg.style('opacity',0);

            /*div.style("left", 0 + "px")//d3.event.pageX + "px")
                .style("top", 0 + "px");*/
        });
        //.call(d3.drag()
            //.on("start", dragstarted)
            //.on("drag", dragged)
            //.on("end", dragended));


    /*
    var textLabels = nodeGroup.append("text")
        .attr('x',function(d){
            //console.log(d3.select(this.parentNode).data()[0].x);
            return 0})
        .attr('y',0)
        .attr('class','text-labels')
        .attr('text-align','center')
        .style('pointer-events','none')
        .style('fill','black')
        .text(function(d) { return d.id; });*/




    //update to use a minimal collide function, with gravities at desired locations!
    function ticked() {
        console.log('here');

        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        var nodeX = [];
        var nodeY = [];

        node
            .attr("cx", function(d) {return d.x})//nodeX.push(width*d.cx-5); return width*d.cx; })
            .attr("cy", function(d) {return d.y})//nodeY.push(height*d.cy+3); return height*d.cy; })
            .attr('r',function(d){return nodeSize(d.foodPriority)});


        //textLabels
        //    .attr('transform',function(d,i){return 'translate('+ nodeX[i] + ',' + nodeY[i] + ')'})
    }

    /*
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    */


}












//buttons for choosing narrative preference
function foodClicked() {

    tracker[0].narrative = "food";
    console.log('food clicked');
}

function populationClicked() {
    tracker[0].narrative = "population";
    console.log('population clicked');
}

function ecosystemClicked() {
    tracker[0].narrative = "ecosystem";
    console.log('ecosystem clicked');
}




//from http://stackoverflow.com/questions/24784302/wrapping-text-in-d3
function wrap(text, wordList, width) {

    //sample call:
    /*.on("end",function(){
        var text = d3.select(this);
        wrap(text, 'Increasing soil organic carbon (humus) is the best way to improve soil carbon storage', width/2);
        d3.selectAll('#soil').attr('fill','brown');
        drawPie();
    })*/


    text.each(function () {
        var text = d3.select(this),
            words = wordList.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.3, // ems
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




//runs on window resize, calls scale update and draw functions
function resizeView(){

    width = document.getElementById('nav-div').clientWidth;
    height = document.getElementById('nav-div').clientHeight;

    var forceX = d3.forceX()
        .x(function(d){return width*d.setX});
    var forceY = d3.forceY()
        .y(function(d){return height*d.setY});
    var forceCenter = d3.forceCenter(width / 2, height / 2);

    simulation
        .force('positionX', forceX)
        .force('positionY', forceY)
        .force('center',forceCenter)
        .alpha(1)  //reset the alpha value to start (can also change target value with alphaTarget - default is 0.
        .restart();

    /*
    d3.selectAll('.link')
        .transition()
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    var nodeX = [];
    var nodeY = [];

    d3.selectAll('.node-circ')
        .transition()
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr('r',function(d){return nodeSize(d.foodPriority)});*/

    // d3.selectAll('.text-labels')
    //     .transition()
    //     .attr('transform',function(d,i){return 'translate('+ nodeX[i] + ',' + nodeY[i] + ')'});

    /*
    //width = window.innerWidth;
    //height = window.innerHeight;

    width = document.getElementById('map-div').clientWidth;//canvas.clientWidth;
    height = document.getElementById('map-div').clientHeight;//canvas.clientHeight;


    timelineWidth = document.getElementById('timeline').clientWidth;

    console.log(width, height);

    //canvas.clientWidth = width;
    //canvas.clientHeight = height;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    d3.select('#fpsvgbkgrd').attr('width',width).attr('height',height);
    d3.select('#fpbkgrd').attr('width',width).attr('height',height);
    //svg.clientWidth = width;
    //svg.clientHeight = height;*/

    resetScales();

}

function resetScales(){

//    update(selectedCountry, 'Exports', selectedYear);

}