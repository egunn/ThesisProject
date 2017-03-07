//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
//window.addEventListener('resize', resizeView, false);

var margin = {t:50,r:50,b:50,l:50},
    width = document.getElementById('map').clientWidth,
    height = document.getElementById('map').clientHeight;


console.log(width, height);

var active = d3.select(null);
var zoomedTracker = false;

var map = d3.select('.canvas')
    .append('svg')
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+ width + " " + height)
    //class to make it responsive
    .classed("svg-content-responsive", true)
    .append('g').attr('class','map')
    //.attr('transform','translate('+margin.l+','+margin.t+')')
    .on("click", stopped, true);


d3.select("div#vis-div")
    .classed("svg-container", true); //container class to make it responsive


map.append("rect")
    .attr("class", "rect-background")
    .attr('width',width)
    .attr('height',height)
    //.attr('transform','translate('+margin.l+','+margin.t+')')
    .on("click", reset);

var lngLatBoston = [-71.0589,42.3601]

var path;

var zoom = d3.zoom()
// no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
// .translate([0, 0])
// .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);


map
    .call(zoom);

var g = map.append("g");

var albersProjection = d3.geoAlbersUsa() // updated for d3 v4
    .scale(900)
    .translate([width / 2, (height / 2-75)]);




//import GeoJSON data
queue()
    .defer(d3.json, "./data/us.json")
    .defer(d3.csv, "data/soilPoints.csv")
    .await(function(err, states, points){

        console.log(points);



        path = d3.geoPath() // updated for d3 v4
            .projection(albersProjection);


        g.selectAll("path")
            .data(topojson.feature(states, states.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "feature")
            .on("click", clicked);

        g.append("path")
            .datum(topojson.mesh(states, states.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "mesh")
            .attr("d", path);


/*
        //Draw states as separate <path> elements
        map.selectAll('.state')
            .data(states.features)
            .enter()
            .append('path')
            .attr("class", "feature")
            .attr('d',path)
            //.attr('transform','translate(20,250)')
            .attr('stroke','gray')
            .attr('fill','none')
            .attr('stroke-width',1)
            .on("click", clicked);

*/


        g.selectAll('.points')
            .data(points)
            .enter()
            .append('circle')
            .attr('class','points')
            .attr('cx',function(d){
                d.x = albersProjection([d.long,+d.lat])[0];
                return albersProjection([d.long,+d.lat])[0];
            })
            .attr('cy',function(d){
                d.y = albersProjection([d.long,+d.lat])[1];
                return albersProjection([d.long,+d.lat])[1];
            })
            //.attr('transform','translate(20,250)')
            .attr('r',2)
            .attr('fill-opacity',.5)
            .attr('fill','purple')
            .on('mouseover',function(d){

                if (zoomedTracker == false){

                    d3.select(this).transition().attr('fill-opacity',1).attr('r',5);

                    g.append('text')
                        .attr('x',d.x+5)
                        .attr('y',d.y)
                        .attr('font-size',12)
                        .attr('fill','gray')
                        //.attr('transform','translate(20,250)')
                        .attr('class','text-label')
                        .text(d.name);
                }
                else if (zoomedTracker == true){

                    d3.select(this).transition().attr('fill-opacity',1).attr('r',2);

                    g.append('text')
                        .attr('x',d.x+3)
                        .attr('y',d.y)
                        .attr('font-size',2)
                        .attr('fill','gray')
                        //.attr('transform','translate(20,250)')
                        .attr('class','text-label')
                        .text(d.name);
                }

            })
            .on('mouseout',function(d){
                d3.select(this).transition().attr('fill-opacity',.5).attr('r',2);
                d3.selectAll('.text-label').remove();

            });


        /*
        //Draw counties as a single <path> element
        map.append('path')
            .datum(counties)
            .attr('class','counties')
            .attr('d',path);*/


        /*function drawCircle(selection){
            selection
                .attr('cx',function(d){
                    return albersProjection(d)[0];
                })
                .attr('cy',function(d){
                    return albersProjection(d)[1];
                })
                .attr('r',5);
        }*/


    });

function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    map.transition()
        .duration(750)
        // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
        .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4
}

function reset() {

    zoomedTracker = false;
    console.log('reset');
    active.classed("active", false);
    active = d3.select(null);

    map.transition()
        .duration(750)
        // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
        .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

function zoomed() {
    zoomedTracker = true;
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    g.attr("transform", d3.event.transform); // updated for d3 v4
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

/*
//runs on window resize, calls scale update and draw functions
function resizeView() {

    console.log('resize')

    width = document.getElementById('map').clientWidth;
    height = document.getElementById('map').clientHeight;

    console.log(width, height);

    albersProjection
        .translate([width/2,height/2])
        .scale(900);

    map.selectAll('.state').attr('d',path);

    map.selectAll('circle')
        .attr('cx',function(d){
            d.x = albersProjection([d.long,+d.lat])[0];
            return albersProjection([d.long,+d.lat])[0];
        })
        .attr('cy',function(d){
            d.y = albersProjection([d.long,+d.lat])[1];
            return albersProjection([d.long,+d.lat])[1];
        });


}
    */