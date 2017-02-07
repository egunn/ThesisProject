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
    nodes.forEach(function(d){ d.y = d.depth * width/6});

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
        .attr('r', 10)
        .style("fill", 'white')
        .attr('stroke',function(d){
            console.log(d);
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
        .attr('stroke-width',2)
        .on('click',function(d){console.log(d.data.name)});


    // Update the links...
    var link = navGroup.selectAll('path.link')
        .data(links);

    console.log(links);

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


}


// Creates a curved (diagonal) path from parent to the child nodes
function diagonal(s, d) {

    //console.log(s,d);
    console.log(s.y, s.x,(+s.y +d.y)/2, s.x , (+s.y +d.y)/2, d.x, d.y, d.x);

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