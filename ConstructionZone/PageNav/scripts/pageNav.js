//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

//set some margins and record width and height of window
margin = {t: 15, r: 20, b: 0, l: 20};

var width = document.getElementById('nav').clientWidth- margin.r - margin.l;
var height = document.getElementById('nav').clientHeight- margin.t - margin.b;

chartLoc = {xwidth:width-30, xheight:5*height/6, ytop:margin.t};

//grab svg from template
var svg = d3.selectAll('#nav');

//make global for resize listener
var mapData;

d3.json('./data/navNodes.json', dataLoaded);

function dataLoaded(data){
    console.log(data[0]);

    drawNav(data[0]);
}

var navHistory = {visited:["Soil","Species","GlobalC"],current:"Soil Degradation", selectedNarrative:"soil"};

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
            if (d.data.name == navHistory.current){
                return 13;
            }
            else{
                return 6;
            }
        })
        .style("fill", function(d){

            var found = navHistory.visited.find(function(e){return e === d.data.name});
            if (typeof found != "undefined"){
                if (d.data.narrative == "population"){
                    return "orange";
                }
                if (d.data.narrative == "food"){
                    return "royalblue";
                }
                if (d.data.narrative == "soil" || d.data.narrative == "environmental" ){
                    return "limegreen";
                }
                else{
                    return "gainsboro";
                }
            }
            else {
                return "white";
            }
        })
        .attr('stroke',function(d){
            if (d.data.narrative == "population"){
                return "orange";
            }
            if (d.data.narrative == "food"){
                return "royalblue";
            }
            if (d.data.narrative == "soil" || d.data.narrative == "environmental" ){
                return "limegreen";
            }
            else{
                return "gainsboro";
            }
        })
        .attr('stroke-width',2.5)
        .attr('fill-opacity',function(d){
            if (navHistory.selectedNarrative == d.data.narrative){
                return 1;
            }
            else {
                return .5;
            }
        })
        .attr('stroke-opacity',function(d){
            if (navHistory.selectedNarrative == d.data.narrative){
                return 1;
            }
            else {
                return .5;
            }
        })
        .on('click',function(d){console.log(d.data.name)});


    // Update the links...
    var link = navGroup.selectAll('path.link')
        .data(links);

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
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
        .attr('stroke','blue');

    // Store the old positions for transition.
    nodes.forEach(function(d){
        d.x0 = d.x;
        d.y0 = d.y;
    });

    //manually add the additional parent-child connections that cross categories
    //based as http://bl.ocks.org/robschmuecker/6afc2ecb05b191359862
    manualPairs = [
        {parent: "Food Supply", child:"Soil Degradation"},
        {parent: "Land per Person", child:"Food Supply"},
        {parent: "Food Flow", child:"Soil Degradation"}
    ];

    manualLinks =[];

    manualPairs.forEach(function(d){
        manualLinks.push(findNode(d));
    });

    manualLinks.forEach(function(manualLink){

        navGroup.append('path')
            .attr('class','manual-link')
            .attr('fill','none')
            .attr('stroke','blue')
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

        return {parent:parentNode, child:childNode};
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