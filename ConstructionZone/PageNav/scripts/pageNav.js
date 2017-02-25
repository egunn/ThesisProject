//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

//set some margins and record width and height of window
margin = {t: 15, r: 20, b: 0, l: 20};

var width = document.getElementById('nav').clientWidth- margin.r - margin.l;
var height = document.getElementById('nav').clientHeight- margin.t - margin.b;

chartLoc = {xwidth:width-30, xheight:5*height/6, ytop:margin.t};

//set global colors
var soilEcoColor = '#9643b2'; //purple
var popColor = '#02a6cc';//blue
var foodColor = '#efb804';//orange

var nodeRadius = 6;
var nodeHighlightedRadius = 18;
var nodeCurrentRadius = 10;

//grab svg from template
var svg = d3.selectAll('#nav');

//make global for resize listener
var mapData;

//mock up the tracker variable passed in by php (note:renamed node to currentNode)
var tracker = [{"narrative":"soil","prevNode":"none","visitedNodes":["M","N","W","H"],"currentNode":"W"}];

//var navHistory = {visited:["Soil","Species","GlobalC"],current:"Soil Degradation", selectedNarrative:"soil"};

d3.json('./data/navNodes.json', dataLoaded);

function dataLoaded(data){
    console.log(data[0]);

    drawNav(data[0]);
}

/*
var table = d3.csv('./data/test.csv',csvTest);
function csvTest(table){

    table = table.slice();

    console.log(table);

    var root = d3.stratify()
        .id(function(d) { return d.name; })
        .parentId(function(d) { return d.parent; })
        (table);

    console.log(root);

}
*/


//based on
function drawNav(treeData){

    //group to plot bars in
    navGroup = svg.append('g')
        .attr('class','nav-group')
        .attr('transform','translate('+ margin.l + ','+ (margin.t) + ')');

    // declares a tree layout and assigns the size
    var treemap = d3.tree().size([height, width]);

    var i = 0,
        duration = 750,
        root;

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) { return d.children; });
        /*.sort(function(a,b){
            console.log(a.data.name, b.data.name);
            if (a.data.name == "Species" && tracker[0].narrative == "soil"){
                return +1;
            }
            else{
                return -1;
            }
        });*/
    root.x0 = 0;
    root.y0 = 0;

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d){d.y = d.data.position * width/11});//d.depth * width/6});

    // Update the nodes...
    var node = navGroup.selectAll('g.node')
        .data(nodes);//, function(d) {return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('cx',function(d){
            return d.x0;
        })
        .attr('cy',function(d){
            return d.y0;
        })
        .attr('r', function(d){
            if (d.data.nodeID == tracker[0].currentNode){
                return nodeCurrentRadius;
            }
            else{
                return nodeRadius;
            }
        })
        .style("fill", function(d) {

            if (tracker[0].narrative == "population" && d.data.narrative.population == true) {
                return popColor;
            }
            else if (tracker[0].narrative == "food" && d.data.narrative.food == true) {
                return foodColor;
            }
            else if (tracker[0].narrative == "soil" && d.data.narrative.soil == true) {
                return soilEcoColor;
            }
            else {
                if (d.data.narrative.population == true) {
                    return popColor;
                }
                else if (d.data.narrative.food == true) {
                    return foodColor;
                }
                else if (d.data.narrative.soil == true) {
                    return soilEcoColor;
                }
                else {
                    return "gainsboro";
                }
            }
        })
        .attr('fill-opacity',function(d){
            var found = tracker[0].visitedNodes.find(function(e){return e === d.data.nodeID});
            if (typeof found != "undefined"){
               return 1;
            }
            else {
                return .3;
            }
        })
        .on('mouseover',function(d){
            d3.select(this).transition()
                .attr('r',nodeHighlightedRadius)
                .on('end',function(){
                    d3.select('#' + d.data.nodeID + '-label').attr('fill-opacity',1);
                });
        })
        .on('mouseout',function(d){

            d3.select('#' + d.data.nodeID + '-label').attr('fill-opacity',0);

            if (d.data.nodeID == tracker[0].currentNode){
                d3.select(this).transition().attr('r', nodeCurrentRadius);
            }
            else{
                d3.select(this).transition().attr('r', nodeRadius);
            }
        })
        .on('click',function(d){console.log(d.data.name)});


    //add text labels for nodes (hidden for now, activated on mouseover node)
    nodeEnter.append('text')
        .attr('x',function(d){
            return d.data.x0;
        })
        .attr('y',function(d){
            return d.data.y0;
        })
        .attr('id',function(d){
            return d.data.nodeID + '-label';
        })
        .attr('transform','translate(0,' + -(nodeHighlightedRadius+6) + ')')
        .style('text-transform','uppercase')
        .style('letter-spacing','.15em')
        .style('text-anchor','middle')
        .attr('fill','gray')
        .attr('fill-opacity',0)
        .attr('pointer-events','none')
        .text(function(d){return d.data.name;});

    // Update the links...
    var link = navGroup.selectAll('path.link')
        .data(links);

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", function(d){return "link "})// + d.data.narrative +-"link"})
        .attr('id',function(d){return d.nodeID})
        .attr('d', function(d){
            if (d.depth != 0){
                var parento = {x: d.parent.x, y: d.parent.y};
                var o = {x: d.x, y: d.y};
                return diagonal(parento, o);
            }
            else{
                console.log(d);
                var parento = {x: root.x, y: root.y};
                var o = {x: d.x, y: d.y};
                return diagonal(o, o);
            }
        })
        .attr('fill','none')
        .attr('stroke',function(d){
            //manage manual link exceptions
            if(d.data.nodeID == "H"){
                return soilEcoColor
            }
            else if(d.data.nodeID == "E"){
                return foodColor;
            }
            else if (tracker[0].narrative == "population" && d.data.narrative.population == true){
                return popColor;
            }
            else if (tracker[0].narrative == "food" && d.data.narrative.food == true){
                return foodColor;
            }
            else if (tracker[0].narrative == "soil" && d.data.narrative.soil == true ){
                return soilEcoColor;
            }
            else{
                if (d.data.narrative.population == true){
                    return popColor;
                }
                else if (d.data.narrative.food == true){
                    return foodColor;
                }
                else if (d.data.narrative.soil == true ){
                    return soilEcoColor;
                }
                return "gainsboro";
            }
        })
        .attr('stroke-width',function(d){
            //manage manual link exceptions
            if((d.data.nodeID == "H" && tracker[0].narrative == "population") ||
                (d.data.nodeID == "H" && tracker[0].narrative == "food") ||
                (d.data.nodeID == "E" && tracker[0].narrative == "population")){
                return 1;
            }
            if(tracker[0].narrative == "soil" && d.data.narrative.soil == true){
                return 5;
            }
            else if(tracker[0].narrative == "population" && d.data.narrative.population == true){
                return 5;
            }
            if(tracker[0].narrative == "food" && d.data.narrative.food == true){
                return 5;
            }
            else {
                return 1;
            }
        })
        .attr('stroke-opacity',function(d){
            //manage manual link exceptions
            if((d.data.nodeID == "H" && tracker[0].narrative == "population") ||
                (d.data.nodeID == "H" && tracker[0].narrative == "food") ||
                (d.data.nodeID == "E" && tracker[0].narrative == "population")){
                return .2;
            }

            //check to see if the end nodes have been visited
            var foundSelf = tracker[0].visitedNodes.find(function(e){return e === d.data.nodeID});
            var foundParent = tracker[0].visitedNodes.find(function(e){return e === d.parent.data.nodeID});
            if(tracker[0].narrative == "soil" && d.data.narrative.soil == true){
                if (typeof foundSelf != "undefined" && typeof foundParent != "undefined" ){
                    return 1;
                }
                else {
                    return .5;
                }
            }
            else if(tracker[0].narrative == "population" && d.data.narrative.population == true){
                if (typeof foundSelf != "undefined" && typeof foundParent != "undefined" ){
                    return 1;
                }
                else {
                    return .5;
                }
            }
            if(tracker[0].narrative == "food" && d.data.narrative.food == true){
                if (typeof foundSelf != "undefined" && typeof foundParent != "undefined" ){
                    return 1;
                }
                else {
                    return .5;
                }
            }
            else {
                return .2;
            }
        });

    // Store the old positions for transition.
    nodes.forEach(function(d){
        d.x0 = d.x;
        d.y0 = d.y;
    });

    //manually add the additional parent-child connections that cross categories
    //based as http://bl.ocks.org/robschmuecker/6afc2ecb05b191359862
    manualPairs = [
        {parent: "Food Supply", child:"Soil Degradation",linkNarrative:"population",nodeID:"E"},
        {parent: "Land per Person", child:"Food Supply",linkNarrative:"population",nodeID:"G"},
        {parent: "Food Flow", child:"Soil Degradation",linkNarrative:"food",nodeID:"D"}
    ];

    manualLinks =[];

    manualPairs.forEach(function(d){
        manualLinks.push(findNode(d));
    });

    manualLinks.forEach(function(manualLink){
        navGroup.append('path')
            .attr('class','manual-link')
            .attr('fill','none')
            .attr('stroke',function(){
                if(manualLink.linkNarrative == "food"){
                    return foodColor;
                }
                else if(manualLink.linkNarrative == "population"){
                    return popColor
                }
                else if(manualLink.linkNarrative == "soil"){
                    return soilEcoColor
                }
                else{
                    return "gainsboro";
                }
            })
            .attr('stroke-width',function(d) {

                if(tracker[0].narrative == "food" && manualLink.linkNarrative == "food"){
                    return 5;
                }
                else if(tracker[0].narrative == "population" && manualLink.linkNarrative == "population"){
                    return 5
                }
                else if(tracker[0].narrative == "soil" && manualLink.linkNarrative == "soil"){
                    return 5
                }
                else{
                    return 1;
                }
            })
            .attr('stroke-opacity',function(){
                //check that both of the end nodes have been visited
                var foundSelf = tracker[0].visitedNodes.find(function(e){return e === manualLink.child.data.nodeID});
                var foundParent = tracker[0].visitedNodes.find(function(e){return e === manualLink.parent.data.nodeID});

                if(tracker[0].narrative == "food" && manualLink.linkNarrative == "food"){
                    if (typeof foundSelf != "undefined" && typeof foundParent != "undefined" ){
                        return 1;
                    }
                    else {
                        return .5;
                    }
                }
                else if(tracker[0].narrative == "population" && manualLink.linkNarrative == "population"){
                    if (typeof foundSelf != "undefined" && typeof foundParent != "undefined" ){
                        return 1;
                    }
                    else {
                        return .5;
                    }
                }
                else if(tracker[0].narrative == "soil" && manualLink.linkNarrative == "soil"){
                    if (typeof foundSelf != "undefined" && typeof foundParent != "undefined" ){
                        return 1;
                    }
                    else {
                        return .5;
                    }
                }
                else{
                    return .2;
                }
            })
            .attr('d',function(){
                return diagonal({x:manualLink.parent.x,y:manualLink.parent.y},{x:manualLink.child.x,y:manualLink.child.y});

            });

    });

    function findNode(manualPair){

        var parentNode = root.descendants().filter(function(d){
            return d.data.name === manualPair.parent;
        })[0];

        var childNode = root.descendants().filter(function(d){
            return d.data.name === manualPair.child;
        })[0];

        return {parent:parentNode, child:childNode, linkNarrative: manualPair.linkNarrative};
    }

}


// Creates a curved (diagonal) path from parent to the child nodes
function diagonal(s, d) {

    path = 'M ' + s.y +  ' ' + s.x + ' ' +
            'C ' + ((+s.y + d.y) / 2) +  ' ' + s.x + ', ' +
            ((+s.y + d.y) / 2) +  ' ' + d.x + ', ' +
              d.y +  ' ' + d.x;

    return path
}

//runs on window resize, calls scale update and draw functions
function resizeView() {

    width = document.getElementById('vis').clientWidth;
    height = document.getElementById('vis').clientHeight;

}