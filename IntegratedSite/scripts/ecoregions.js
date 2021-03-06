//setup page and global variables
//set some margins and record width and height of window
margin = {t: 25, r: 0, b: 25, l: 10};

width = document.getElementById('vis').clientWidth - margin.r - margin.l;
height = document.getElementById('vis').clientHeight - margin.t - margin.b;

ecoWidth = width/3;
ecoHeight = height;

landWidth = 2*width/3;
landHeight = height;

ecoPlot = d3.select("#vis")
    .attr('width',width)
    .attr('height', height)
    .style('width','100%')
    .style('height','450px');

countryListPlot = d3.select("#vis");

ecoCanvas = d3.select("#vis-canvas")
    .attr('width',width)
    .attr('height', height)
    .style('width','100%')
    .style('height','450px');


//set up scale factors
var x = d3.scaleBand().rangeRound([0, ((ecoWidth-30))]).round(true).padding(0.2); //offsets added to keep bars from exiting SVG
var y = d3.scaleLinear().rangeRound([ecoHeight/4+30, ecoHeight/2]);
var yNeg = d3.scaleLinear().rangeRound([ecoHeight/2, ecoHeight-30]);
//var ecoColors = d3.scaleOrdinal(d3.schemeCategory10);
var ecoColors = d3.scaleOrdinal().domain([1,2,3,4,5,6,7,8,9,10,11,12,13,14,99]).range(["#a5f221","#179ca8","#1fc4d3","#e2d0ea","#ba8f6a","#f7cebb","#c6efa7","#917b1b","#c7e2ed","#f9a9cd","#db970f","#93c1ba","#edf0f2","#216d3e","#5fba59"]);

var projection = d3.geoEquirectangular();

//group to plot ecoregion bars in
barGroup = ecoPlot.append('g')
	.attr('class','bar-group')
	.attr('transform','translate('+ 20 + ',30)');

wwfCategories = [];

console.log(tracker);

var localTracker = {biomes:[1,3,4,5,9,10],countries:[],mouseover:false, init:true};

//code from http://jsfiddle.net/8L247yac/
//found through SO post: http://stackoverflow.com/questions/20671015/d3-js-sophisticated-world-map-brush-thumbnail

//import data from GeoJSON and csv files. Use parseData function to load the csv (not necessary for JSONs)
queue()
	.defer(d3.json, './data/worldcountries_fromWorking_noAntartc.topojson')
	.defer(d3.json, './data/teow_2.5p_noAntarct.topojson')
	.defer(d3.csv, "./data/abovebelowC_reconciling.csv")
	//.defer(d3.csv, "./data/forestData2.csv")
	//wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
	.await(function (err, mapData, ecomap, carbon) {

        projection
			.fitSize([landWidth, landHeight], topojson.feature(ecomap, ecomap.objects.wwf_terr_ecos))
            .translate([ecoWidth+landWidth/2-margin.l, landHeight/2]);

		ecoregions(carbon,ecomap);
		drawMap2(mapData);
		drawEcoMap(ecomap);
		//countryList(forests, tracker.countries);

	});


function drawEcoMap(ecoMap) {

    var context = ecoCanvas.node().getContext("2d");

	var path = d3.geoPath()
		.projection(projection)
		.context(context);

	ecoRegions = topojson.feature(ecoMap, ecoMap.objects.wwf_terr_ecos).features;

	console.log(ecoRegions);


    //var highlight2 = ecoRegions.filter(function(d){return d.properties.BIOME == 6});

    toHighlight = [];

    localTracker.biomes.forEach(function(d){
        toHighlight.push(ecoRegions.filter(function(e){return e.properties.BIOME == d}));
	});

	console.log(toHighlight);

	if (toHighlight.length != 0){

		//map context coloring from http://bl.ocks.org/rveciana/f46df2272b289a9ce4e7
		toHighlight.forEach(function(array,index){

			console.log(index);

			array.forEach(function (d, i) {

				/*if (tracker.biomes.length == 0){

					//console.log(d.properties.G200_BIOME);
					if (index == 0){
						var tempColor = "orange";//ecoColors(d.properties.BIOME); //"\"" + ecoColors(d.properties.G200_BIOME) + "\"";
					}
					else{
						var tempColor = "purple";//ecoColors(d.properties.BIOME); //"\"" + ecoColors(d.properties.G200_BIOME) + "\"";
					}
					context.fillStyle = tempColor;//"\"" + ecoColors(d.properties.G200_BIOME) + "\"";
                    context.strokeStyle = "white";
					context.beginPath();
					path(d);
					context.fill();
				}

				else {*/
					var check = localTracker.biomes.find(function(f){
						//console.log(f,d.properties.BIOME);
						return f == d.properties.BIOME;
					});


					//console.log(d.properties.BIOME);

					if (check){
						if (localTracker.init == true){
                            //if (d.properties.BIOME == 1 ){
                            if (d.properties.BIOME == 1 || d.properties.BIOME == 3 ){
                                tempColor = 'green';//'#74a063';
                            }
                            //else if (d.properties.BIOME == 6 ){
                            else if (d.properties.BIOME == 4 || d.properties.BIOME == 5 || d.properties.BIOME == 9 || d.properties.BIOME == 10 ){
                               // console.log(d);
                            	tempColor = 'darkorange';
                            }
                            else{
                                tempColor = 'gainsboro';
                            }
						}
						else {
                            tempColor = 'gainsboro';//"#ea822c";//ecoColors(d.properties.BIOME); //"\"" + ecoColors(d.properties.G200_BIOME) + "\"";
                        }
					}
					else {
						tempColor = "white";
					}

					context.fillStyle = tempColor;//"\"" + ecoColors(d.properties.G200_BIOME) + "\"";
                    context.strokeStyle = "white";
					context.beginPath();
					path(d);
					context.fill();

				/*}*/

			});
		});
    }
    else {
		context.clearRect(0,0,width,height)
	}
}


function drawMap2 (data){

	var mapJson = topojson.feature(data, data.objects.worldcountries);

	console.log(mapJson);

	//var projection = d3.geoMercator()
	//	.fitSize([600, 400], topojson.feature(data, data.objects.worldcountries));

	var path = d3.geoPath()
		.projection(projection);

	/*var svg = d3.selectAll('#ecoPlot')
		//.append('svg')
		.attr('width',800)
		.attr('height',400)
		.attr('class', 'majormap');*/

	var worldMap = ecoPlot.append('g')
		.attr('class', 'worldmap');

	var mapObjects = worldMap
		.selectAll("path")
		.data(mapJson.features)
		.enter();

	mapObjects
		.append("path")
		.attr('class', function(d){
			return 'country '+ d.id;
		})
		.attr('strokeWidth',0.5)
		.attr('stroke','gray')
		.attr('fill','none')
		.attr("d", path)
		.attr('transform','translate(10,35)');

	/*
	var legendY = d3.scaleBand().rangeRound([155,355]).domain([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]).padding(4);


	var climateTypes = [
		{name: "Tropical/subtropical moist broadleaf", biome: 1},
		{name: "Tropical/subtropical dry broadleaf",biome: 2},
		{name: "Tropical/subtropical coniferous",biome: 3},
		{name: "Temperate broadleaf and mixed",biome: 4},
		{name: "Temperate coniferous",biome: 5},
		{name: "Boreal forests/taiga",biome: 6},
		{name: "Tropical/subtropical grasslands",biome: 7},
		{name: "Temperate grasslands",biome: 8},
		{name: "Flooded grasslands",biome: 9},
		{name: "Montane grasslands",biome: 10},
		{name: "Tundra",biome: 11},
		{name: "Mediterranean forests",biome: 12},
		{name: "Deserts and xeric shrublands",biome: 13},
		{name: "Mangroves", biome: 14},
		{name: "Not classified", biome: 99}
	];


	//append a legend for the canvas map (do it here in the SVG because it only gets called once)
	var legend = ecoPlot.selectAll('.legend')
		.data(climateTypes)
		.enter()
		.append('g')
		.attr('transform','translate(' + ecoWidth + ','+ (ecoHeight-legendY(8)+ 48) +')')
		.attr('class','legend');


	legend.append('circle')
		.attr('class','legendCirc')
		.attr('cx', function(d,i){
			if (i <= 7){
				return 5;
			}
			else{
				return landWidth/2-50;
			}
		})
		.attr('cy',function (d,i) {
            if (i <= 7){
                return legendY(i);
            }
            else{
                return legendY(i-8);
            }
		})
		.attr('r', 3)
		.attr('fill', function(d){
			//console.log(ecoColors(+d.biome),d.biome);
			return ecoColors(+d.biome);
		});

	legend.append('text')
		.attr('x', function(d,i){
            if (i <= 7){
                return -5;
            }
            else{
                return landWidth/2-50;
            }
		})
		.attr('y',function (d,i) {
            if (i <= 7){
                return legendY(i);
            }
            else{
                return legendY(i-8);
            }
		})
		.attr('dx',	17)
		.attr('dy',4)
		.attr('font-size','9.5px')
		.attr('fill','gray')
		.style("text-anchor", "start")
		.text(function(d){return d.name;});

	*/

	//console.log(mapJson.features);

	/*
	var centers = mapJson.features.map(function (d) {

		var centroid = path.centroid(d); //provides two numbers [x,y] indicating the screen coordinates of the state
		//Puerto Rico returns NaN, sends error to the console. Also, something wrong with UT data - no fill color assigned.

		return {
			id: d.id,
			x0: centroid[0],
			y0: centroid[1],
			x: centroid[0],
			y: centroid[1]
		}
	});
	*/


}





function ecoregions(data, ecoMap){

    //data.sort(function(b,a){return b.year-a.year;});

	/*console.log(d3.max(data, function (d) {
	 return +d.totalPop;
	 }));*/

    //map axes onto data
    x.domain(data.map(function (d) {
        return d.climateType;
    }));
    y.domain([d3.max(data, function (d) {
        return +d.aboveground;
    }),0]);
    yNeg.domain([0,2*d3.max(data, function (d) {
        return +d.aboveground;
    })]);
    ecoColors.domain(data.map(function (d) {
        return d.climateType;
    }));

    //add axes and titles
    var xAxis = barGroup.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + ecoHeight/2 + ")")
        .call(d3.axisBottom(x).tickSizeOuter([0]));
    //.tickValues([1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015])); //come back and rebuild this!

    //https://plnkr.co/edit/1ClBpXpAQEIBQ2rSXJ6Y?p=preview
	/*xAxis.selectAll('.domain')
        .style('stroke','orange')
		.style('stroke-width',3);*/

    barGroup.append('text')
        .attr('fill','gray')
        .style('font-size',12)
        .attr('transform','rotate(-90)')
        .attr("x", -ecoHeight/2 + 75)
        .attr("y", -11)
        .text('Trillion kg');

    xAxis
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr('dx','-2em')
        .attr("dy", ".35em")
        .attr('font-size','12px')
        .attr("transform", "translate(0,"+ -ecoHeight/2 + ")rotate(-90)")
        .attr('fill','gray')
		.style('stroke','none')
        .style("text-anchor", "end");

    var yAxis = barGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y)
            .ticks(5));
    //.tickFormat(d3.formatPrefix(",.0", 1e6)));

    var yAxisNeg = barGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(yNeg)
            .ticks(10));

    yAxis.selectAll('text')
        .attr('fill',"gray");

    yAxisNeg.selectAll('text')
        .attr('fill',"gray");

    //d3.selectAll('.axis').selectAll('ticks').attr('fill',typeCol);

	/*.append("text")
	 .style('fill', 'gray')
	 .style('font-size', '12px')
	 .attr("transform", "rotate(-90)")
	 .attr("y", 6)
	 .attr("dy", "0.71em")
	 .attr("text-anchor", "end")
	 .text("Minutes");*/

    barGroup.append('text')
        .attr('x', ecoWidth/2-15)
        .attr('y', 0)
        .style('font-size', 14)
        .attr('fill',"gray")
        .style('text-anchor', 'middle')
        .text('Carbon above and below ground');

    legendItems = [{name:'Plants',color:"#74a063"},{name:'Topsoil',color:"#77664c"},{name:'Subsoil',color:"#a38961"}];

    var legend = barGroup.selectAll('.legend-box')
		.data(legendItems)
        .enter()
		.append('g')
		.attr('transform','translate(' + (ecoWidth-18) + ','+ (ecoHeight-34) + ')');

    legend
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


    legend
        .append('text')
        .attr('x', 15)
        .attr('y', function (d,i){
            return i*18 + 9;
        })
        .attr('width', 10)
        .attr('height', 10)
        .text(function(d){
            return d.name;
        });

    //draw bars
    stackGroup = barGroup.selectAll(".abovebar")
        .data(data)
        .enter()
        .append('g')
        .attr('class','stackgroup')
        .on('mouseenter',function(d){
            //set the tracker to true when the bar is entered
            localTracker.mouseover = true;
            localTracker.init = false;
            ecoCanvas.node().getContext("2d").clearRect(0,0,width,height);

            console.log(d);

            d3.selectAll('.backgroundbar').attr('fill','gray');
            d3.select(this).select('.backgroundbar').attr('fill-opacity',0.1);
            //d3.selectAll('.ecoPlot').selectAll('.country').style('fill','blue');
            //d3.selectAll('.landuseplot').selectAll('.countryBarGroup').remove();
            //d3.selectAll('.landuseplot').selectAll('text').remove();
            //d3.selectAll('.landuseplot').selectAll('.axis').remove();
            localTracker.biomes = JSON.parse("[" + d.wwfDescript + "]");
            drawEcoMap(ecoMap);
        })
        .on('mouseleave', function(d){
            //set the tracker back to false when the mouse leaves
            localTracker.mouseover = false;

            d3.select(this).select('.backgroundbar').attr('fill-opacity',0.05);
            localTracker.biomes = [];

            setTimeout(function(){
                drawEcoMap(ecoMap);
				/*if (tracker.mouseover){
				 console.log('in a new bar');
				 d3.selectAll('.majormap').selectAll('.country').style('fill','none');
				 drawEcoMap(ecoMap);
				 }
				 else {
				 console.log('not in a new bar');
				 d3.selectAll('.majormap').selectAll('.country').style('fill','none');

				 }*/

            },100);

        });

    stackGroup
        .append("rect")
        .attr("class", "abovebar")
        .attr("x", function (d) {
            return x(d.climateType);
        })
        .attr("y", function (d) {
            return  y(d.aboveground);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return ecoHeight/2 -y(d.aboveground);
        })
        .attr('fill', '#74a063');


    //draw bars
    stackGroup//.selectAll(".topsoilbar")
    //.data(data)
    //.enter()
        .append("rect")
        .attr("class", "topsoilbar")
        .attr("x", function (d) {
            return x(d.climateType);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  ecoHeight/2;//yNeg(d.subsoil);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            //console.log(yNeg(d.topsoil));
            return ecoHeight/2 - yNeg(d.topsoil);
        })
        .attr('fill', '#77664c');//'#3b5c91');


    //draw bars
    stackGroup//.selectAll(".subsoilbar")
    //.data(data)
    //.enter()
        .append("rect")
        .attr("class", "subsoilbar")
        .attr("x", function (d) {
            return x(d.climateType);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  ecoHeight - yNeg(d.topsoil); //sets pos'n of tops of bars (close to y axis)
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            //console.log(d.topsoil, d.subsoil);
            //console.log(yNeg(d.topsoil),yNeg(d.subsoil));
            return ecoHeight/2 - yNeg(d.subsoil);
        })
        .attr('fill', '#a38961');//'#3b5c91');


    /*stackGroup.append('text')
        .attr('class', 'bar-label')
        .attr('fill',"purple")
        .style('font-size', 12)
		.text('test');*/

	/*
	 stackGroup.append('circle')
	 .attr('cx',function (d) {
	 var barWidth = x("Trop moist");  //use second category to find the bar width assigned, to use in translating circs
	 return x(d.climateType) + barWidth/2 - 3;
	 })
	 .attr('cy',5)
	 .attr('r', 4)
	 .attr('fill', function(d){
	 //console.log(ecoColors(d.climateType));
	 return ecoColors(d.climateType)
	 });
	 */

    stackGroup.append('rect')
        .attr("class", "backgroundbar")
        .attr("x", function (d) {
            return x(d.climateType);
        })
        .attr("y", 10)
        .attr("width", x.bandwidth())
        .attr("height", ecoHeight )
        .attr('fill-opacity',0.05)
        .attr('fill', function(d){
			if (d.climateType == 'Trop moist'){
                return 'green';//'#74a063';
			}
            else if (d.climateType == 'Boreal moist'){
                return 'darkorange';
            }
			else{
                return 'gray';
			}
		});



}
