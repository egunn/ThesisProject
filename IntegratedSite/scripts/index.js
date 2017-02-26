//setup resize event listener on window
window.addEventListener('resize', resizeView, false);

//****************************************************************************
// Communicating with next page via PHP
//****************************************************************************

//create a JSON object for passing between webpages via PHP (to record user choices and prev. history)
var tracker = [{"narrative":"none", "prevNode":"none","visitedNodes":[],"currentNode":"M"}];
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


var width = document.getElementById('index-svg').clientWidth;
var height = document.getElementById('index-svg').clientHeight;

//set global colors
var soilEcoColor = '#9643b2'; //purple
var popColor = '#02a6cc';//blue
var foodColor = '#efb804';//orange

//change buttons to match
d3.select('#ecosystemButton').style('background',soilEcoColor).style('border', '1px solid ' + soilEcoColor);
d3.select('#populationButton').style('background',popColor).style('border', '1px solid ' + popColor);
d3.select('#foodButton').style('background',foodColor).style('border', '1px solid ' + foodColor);

var nodeSize = d3.scaleLinear().domain([1,3]).range([40,20]);

//http://jsfiddle.net/J8sp3/4/
var roots = d3.xml("./index_roots.svg").mimeType("image/svg+xml").get(function(error, loadedSVG) {
    if (error) throw error;

    var svgNode = loadedSVG
        .getElementsByTagName("svg")[0];

    main_chart_svg = d3.select('.roots-svg');

    main_chart_svg.node().appendChild(svgNode);

    var innerSVG = main_chart_svg.select("svg");

    innerSVG.selectAll('path')
        .attr('transform','translate(-70,-550)scale(1.5,1.3)')
        .attr('fill-opacity',.3);

});


var svg = d3.select('.index-svg')
    .append('g')
    .attr('class','index-g')
    .attr('transform','translate(-75,75)');

var simulation;

//Pattern injection from http://bl.ocks.org/hugolpz/98cef20c4d7cb05c7b26
//adapted using http://fiddle.jshell.net/xhh7a/1/
//http://jsfiddle.net/7DgUh/
//http://stackoverflow.com/questions/14610954/can-an-svg-pattern-be-implemented-in-d3
//https://jsfiddle.net/duhaime/q51ok9jc/

/*var pattern = svg.append("defs")
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
    */


var div = d3.select(".bg-image").append("div")
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
        linkList = linkList.slice(0,linkList.length);
        nodeList = nodeList.slice(0,nodeList.length);

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
    var forceCenter = d3.forceCenter(width / 3, height / 2);
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
        .attr('class',function(d){return 'link ' + d.narrative + '-link'})
        .attr('stroke',function(d){
            if (d.narrative == "population"){
                return popColor;
            }
            if (d.narrative == "food"){
                return foodColor;
            }
            if (d.narrative == "soil"){
                return soilEcoColor;
            }
            else{
                return "gainsboro";
            }
        })
        .attr("stroke-width", function(d) {return +d.weight ; });


    var nodeGroup = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodeList)
        .enter()
        .append("g");

    var pattern = nodeGroup.append("defs")
        .append("pattern")
        .attr('id',function(d){ return 'pattern-' + d.id;})
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
        .attr("xlink:href", function(d){ return d.photo});//icon});

    node = nodeGroup
        .append("circle")
        .attr('class',function(d){return 'node-circ ' + 'node'+d.id})
        //static layout - set positions here, do not update in tick
        //.attr("x", function(d) { return width*d.setX; })   //set the initial x and y coordinates using the stored JSON data
        //.attr("y", function(d) { return height*d.setY; })
        .attr("r", function(d){nodeSize(d.foodPriority)})
        .attr('stroke',function(d){
            if (d.avail == "y"){
                if (d.topic == "soil"){
                    return soilEcoColor;
                }
                else if(d.topic == "population"){
                    return popColor;
                }
                else if (d.topic == "food"){
                    return foodColor;
                }
            }

            else {
                return 'gainsboro'
            }
        })
        .attr('stroke-width', 2)
        .style("fill", function(d){ return 'url(#pattern-' + d.id + ')'})
        .on('mouseover',function(d){


            //console.log(d3.select('#' + d.id +'-text-rect').style('fill'));
            //console.log(d3.select('#' + d.id +'-text-rect').attr('fill'));

            //d3.selectAll('.div-image').remove();


            d3.select(this)
                .transition()
                .attr('r',75)
                //.style("background-image", "url('./" + d.photo + "')")
                .on('end', function(){
                    d3.select('#' + d.id +'-text-label').attr('fill-opacity',1);

                    //d3.select('#' + d.id +'-text-rect').style('fill',"red").attr('fill','red').attr('fill-opacity',.3);//.attr("clip-path", "url(#node-clip)");

                    var textRects = d3.select(this.parentNode).append("rect")
                        .attr('x',function(d){
                            //console.log(d3.select(this.parentNode).data()[0].x);
                            return d3.select(this.parentNode).data()[0].x - 75})
                        .attr('y',function(d){
                            return d3.select(this.parentNode).data()[0].y - 13})
                        .attr('width',150)
                        .attr('height', 18)
                        .attr('class','text-labels')
                        .attr('id', function(d){return d.id +'-text-rect'})
                        .style('pointer-events','none')
                        .style('fill','white')
                        .attr('fill-opacity',1);
                    //.attr("clip-path", "url(#node-clip)");


                    var textLabels = d3.select(this.parentNode).append("text")
                        .attr('x',function(d){
                            //console.log(d3.select(this.parentNode).data()[0].x);
                            return d3.select(this.parentNode).data()[0].x})
                        .attr('y',function(d){
                            return d3.select(this.parentNode).data()[0].y})
                        .attr('class','text-labels')
                        .attr('id', function(d){return d.id +'-text-label'})
                        .attr('font-size',11)
                        .attr('text-anchor','middle')
                        .style('letter-spacing','.15em')
                        .style('pointer-events','none')
                        .style('text-transform','uppercase')
                        .style('fill','gray')
                        .attr('fill-opacity',1)
                        .text(function(d) { return d.name; });

                    //totally hack this because clipping paths can't be updated, for some silly reason in Chrome
                    //almost-working example and bug descriipts here: https://www.smashingmagazine.com/2015/05/creating-responsive-shapes-with-clip-path/
                    //http://bl.ocks.org/couchand/6399221
                    var textLabels = d3.select(this.parentNode).append("circle")
                        .attr('class','fake-node')
                        .attr("cx", d.x)
                        .attr("cy", d.y)
                        .attr("r", 75)
                        .attr('stroke',function(d){
                            if (d.avail == "y"){
                                if (d.topic == "soil"){
                                    return soilEcoColor;
                                }
                                else if(d.topic == "population"){
                                    return popColor;
                                }
                                else if (d.topic == "food"){
                                    return foodColor;
                                }
                            }
                            else {
                                return 'gainsboro'
                            }
                        })
                        .attr('fill','none')
                        .attr('pointer-events','none')
                        .attr('stroke-width', 2);

                });

            //console.log(d3.select('#' + d.id +'-text-rect').style('fill'));



           /* div.transition()
                .duration(200)
                .style("opacity", .9);




            div.style("left", (nodeSize(d.foodPriority) + +d3.select(this).attr('cx')) + "px")//d3.event.pageX + "px")
                .style("top", d3.select(this).attr('cy') + "px");


            divImg
                .style("background-image", "url('./" + d.photo + "')")
                .style("background-repeat", "no-repeat")
                .style("background-position", "center center")
                .style('opacity', .9);
            */

            /*
                .attr('src',d.photo);*/

            tooltip.html(d.text)
                .style("opacity", .9);

        })
        .on('mouseout',function(d){

            d3.select(this)
                .transition()
                .attr('r',nodeSize(d.foodPriority));

            div.style('opacity', 0);
            tooltip.style('opacity', 0);
            divImg.style('opacity',0);

            d3.select('#' + d.id +'-text-label').remove();
            d3.select('#' + d.id +'-text-rect').remove();
            d3.select('.fake-node').remove();

            /*div.style("left", 0 + "px")//d3.event.pageX + "px")
                .style("top", 0 + "px");*/
        })
        .on('click',function(d){
            //when a user clicks on a node, update the node and previous node values in the tracker variable,
            //then call the page reload function.
            if (tracker[0].prevNode){
                tracker[0].prevNode = tracker[0].node;
            }
            else {
                tracker[0].prevNode = "none";
            }

            tracker[0].node = d.id;
            tracker[0].currentNode = d.id;
            tracker[0].visitedNodes.push(d.id);
            sendData();
        });
        //.call(d3.drag()
            //.on("start", dragstarted)
            //.on("drag", dragged)
            //.on("end", dragended));


    // define the clipPath
    clipPaths = nodeGroup.append("clipPath")
        .attr("id", "node-clip")
        .append("circle")
        .attr("cx", function(d){
            return d3.select(this.parentNode).data()[0].x +.5})
        .attr("cy", function(d){
            return d3.select(this.parentNode).data()[0].y})
        .attr("r", 74);





    //update to use a minimal collide function, with gravities at desired locations!
    function ticked() {

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
            .attr('r',function(d){
                if (d3.select(this).attr('r') == null){
                    return nodeSize(d.foodPriority)
                }
                else{
                        return d3.select(this).attr('r');
                }
            });




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

    tracker[0].prevNode = "none";

    tracker[0].node = "M";
    tracker[0].currentNode = "M";
    tracker[0].visitedNodes.push("M");
}

function populationClicked() {

    tracker[0].narrative = "population";
    console.log('population clicked');

    tracker[0].prevNode = "none";

    tracker[0].node = "M";
    tracker[0].currentNode = "M";
    tracker[0].visitedNodes.push("M");
    sendData();

}

function buttonHover(value){
    d3.selectAll('.link').attr('stroke-width',2);
    d3.selectAll('.' + value + '-link').attr('stroke-width',7);
}

function buttonLeave(){
    d3.selectAll('.link').attr('stroke-width',2);
}

function ecosystemClicked() {
    tracker[0].narrative = "soil";
    console.log('soil clicked');

    tracker[0].prevNode = "none";

    tracker[0].node = "M";
    tracker[0].currentNode = "M";
    tracker[0].visitedNodes.push("M");
    sendData();
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