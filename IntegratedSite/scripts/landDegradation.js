//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

var width = document.getElementById('vis').clientWidth;
var height = document.getElementById('vis').clientHeight;

//grab svg from template
var svg = d3.selectAll('#vis');


var canvas = d3.select("#vis-canvas");

//need to set attr and styles with d3 if selection is with d3 (compare to JS-only version in Food Flow)
canvas
    .attr('width',width)
    .attr('height', height)
    .style('width','100%')
    .style('height','450px');

var context = canvas.node().getContext("2d");

//make global for resize listener
var mapData;

var projection = d3.geoEquirectangular();

var path = d3.geoPath()
    .projection(projection)
    .context(context);

var worldMap = svg.append('g')
    .attr('class', 'worldmap');

d3.json('./data/Glasod_mapshaper.topojson', dataLoaded);  //removed GLSGEOID 2086 from original data file (background square)

function dataLoaded(data){
    console.log(data);

    mapData = topojson.feature(data, data.objects.Glasod).features;

    console.log(mapData);

    projection
        .fitSize([width, height], topojson.feature(data, data.objects.Glasod));//topojson.feature(data, data.objects.Glasod.geometries));//data, data.features));

    //var mapJson = topojson.feature(data, data.objects.worldcountries);

    //console.log(mapJson);

    //var projection = d3.geoMercator()
    //	.fitSize([600, 400], topojson.feature(data, data.objects.worldcountries));


    var colorSet = d3.scaleOrdinal().domain([4,3,2,1,0]).range(['#E82320','#E49922','#FCAA13','#ffecaf','#c59c6d']);
    //very high red #E82320, high brown #E49922, medium yellow #FCAA13, low beige #ffecaf, stable tan #c59c6d


    legendItems = [{name:'Very high',color:'#E82320'},{name:'High',color:'#E49922'},{name:'Medium',color:'#FCAA13'},{name:'Low',color:'#ffecaf'},{name:'Stable land, icecap, or unused wasteland',color:'#c59c6d'}];

    var legend = worldMap
        .append('g')
        .attr('transform','translate(' + (0) + ','+ (height - 110) + ')');

    legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .text('Depletion level:');

    legendBoxes = legend.selectAll('.legend-box')
        .data(legendItems)
        .enter();

    legendBoxes
        .append('rect')
        .attr('x', 0)
        .attr('y', function (d,i){
            return i*18;
        })
        .attr('width', 8)
        .attr('height', 8)
        .attr('fill', function(d){
            return d.color;
        });


    legendBoxes
        .append('text')
        .attr('x', 15)
        .attr('y', function (d,i){
            return i*18 + 9;
        })
        .text(function(d){
            return d.name;
        });





//map context coloring from http://bl.ocks.org/rveciana/f46df2272b289a9ce4e7
    mapData.forEach(function (d, i) {

        context.fillStyle = colorSet(d.properties.SEVERITY);//"\"" + ecoColors(d.properties.G200_BIOME) + "\"";
        context.beginPath();
        path(d);
        context.fill();

        //}

    });
    /*

     var mapObjects = worldMap
     .selectAll("path")
     .data(mapData.features)
     .enter();


     mapObjects
     .append("path")
     .attr('class', function(d){
     //console.log(d);
     return 'level    '+ d.properties.RATE;
     })
     .attr('strokeWidth',1)
     .attr('stroke','none')
     .attr('fill',function(d){return colorSet(d.properties.SEVERITY)})
     .attr("d", path);//function(d){path(d.geometry.coordinates);});
     */
}


function changeMap() {
    console.log('clicked');

    var extendedColorSet = d3.scaleOrdinal().domain([4,3,2,1,0]).range(['#E82320','#E49922','#FCAA13','#ffecaf','#c59c6d']);

    var mapObjects = svg.selectAll("path")
        .attr("d", path);

}


//runs on window resize, calls scale update and draw functions
function resizeView() {

    width = document.getElementById('vis').clientWidth;
    height = document.getElementById('vis').clientHeight;

    projection
        .fitSize([width, height], mapData);

    var mapObjects = svg.selectAll("path")
        .attr("d", path);
}