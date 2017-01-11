//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);

var width = document.getElementById('vis').clientWidth;
var height = document.getElementById('vis').clientHeight;

//grab svg from template
var svg = d3.selectAll('#vis');

//make global for resize listener
var mapData;

var projection = d3.geoEquirectangular();

var path = d3.geoPath()
    .projection(projection);

var worldMap = svg.append('g')
    .attr('class', 'worldmap');

d3.json('./data/Glasod_mapshaper.topojson', dataLoaded);  //removed GLSGEOID 2086 from original data file (background square)

function dataLoaded(data){
    console.log(data);

    mapData = topojson.feature(data, data.objects.Glasod);

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
            return 'level    '+ d.properties.RATE;
        })
        .attr('strokeWidth',1)
        .attr('stroke','none')
        .attr('fill',function(d){return colorSet(d.properties.SEVERITY)})
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