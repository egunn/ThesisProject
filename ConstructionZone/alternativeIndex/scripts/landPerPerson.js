//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

var width = document.getElementById('vis').clientWidth;
var height = document.getElementById('vis').clientHeight;

yearSelected = 2007;

//grab svg from template
var svg = d3.selectAll('#vis');

//make global for resize listener
var mapData;

var projection = d3.geoEquirectangular();

var path = d3.geoPath()
    .projection(projection);

var worldMap = svg.append('g')
    .attr('class', 'worldmap');

//import data from GeoJSON and csv files.
queue()
    .defer(d3.json, './data/worldcountries_fromWorking_noAntartc.topojson')  //removed GLSGEOID 2086 from original data file (background square)
    .defer(d3.json, './data/perCapitaLandUseRequirements.json')
    //.defer(d3.json, "./nodes.json")
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, map, data) {

        dataLoaded(map, data);

    });



function dataLoaded(map, data){
    console.log(data);

    var toPlot = data.filter(function(d){return d.year == yearSelected});

    console.log(toPlot);

    mapData = topojson.feature(map, map.objects.worldcountries);

    projection
        .fitSize([width, height], mapData);//topojson.feature(data, data.objects.Glasod.geometries));//data, data.features));

    //var mapJson = topojson.feature(data, data.objects.worldcountries);

    //console.log(mapJson);

    //var projection = d3.geoMercator()
    //	.fitSize([600, 400], topojson.feature(data, data.objects.worldcountries));


    var mapObjects = worldMap
        .selectAll("path")
        .data(mapData.features)
        .enter();

    var colorSet = d3.scaleOrdinal().domain([4,3,2,1,0]).range(['#E82320','#E49922','#FCAA13','#ffecaf','#c59c6d']);
    //very high red #E82320, high brown #E49922, medium yellow #FCAA13, low beige #ffecaf, stable tan #c59c6d

    mapObjects
        .append("path")
        .attr('class', function(d){
            //console.log(d);
            return d.id;
        })
        .attr('strokeWidth',1)
        .attr('stroke','none')
        .attr('fill',function(d){
            return "gray";
            //colorSet(d.properties.SEVERITY)
        })
        .attr("d", path);//function(d){path(d.geometry.coordinates);});

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