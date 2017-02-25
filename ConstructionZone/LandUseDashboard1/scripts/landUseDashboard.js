//used to be pageSetup

//set some margins and record width and height of window
margin = {t: 25, r: 40, b: 25, l: 40};

width = document.getElementById('vis').clientWidth - margin.r - margin.l;
height = document.getElementById('vis').clientHeight - margin.t - margin.b;

mainPlot = d3.select("#vis");

barGroup = mainPlot.append('g')
    .attr('class','bar-group')
    .attr('transform','translate('+ ((width/2)+70) +',0)');

landBarGroup = mainPlot.append('g')
    .attr('class','land-bar-group')
    .attr('transform','translate(75,0)');

//console.log(width, height);

//set colors
forestCol = '#42934e';//'rgba(0,100,0,.7)';
agricCol = '#e4e5d0';//'rgba(100,100,40,.2)';
arableCol = '#c6b48f';//'rgba(100,100,40,.5)';
urbanCol = '#79737a';//'rgba(50,50, 50,.7)';
otherCol = '#c2b3ce';//'rgba(175, 145, 183, 1)';//rgba(200,200, 200,1)';
degradCol = '#a3312f';//'rgba(100,0,0,.7)';
typeCol = 'gray';//'#ecd9c6';
mapCol = '#b2a394';
mapHighlightCol = '#e8e1da';/*'#e0cebc';*/

tracker = {country:"USA", year:1975};
importedData = [];

/*
 var forestSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var agricSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var arableSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var urbanSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var otherSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 */

landAreaScale = d3.scaleSqrt().domain([0, 17000000]).range([0, width / 4]); //650

popScale = d3.scaleSqrt().domain([0, 1750000000]).range([0, 250]);
popLineScale = d3.scaleLinear().domain([0, 1750000000]).range([0, 1525]);


//set up scale factors
x = d3.scaleBand().rangeRound([0, ((width/2)-50)]).padding(0.1);
y = d3.scaleLinear().rangeRound([height, height/2]);


//append selection (will populate later with d3)
//http://stackoverflow.com/questions/4814512/how-to-create-dropdown-list-dynamically-using-jquery
var s = $('<select/>'); //class=""
s.appendTo('.navbar-header').addClass('type-list form-control countryDropdown');

//set up change function for dropdown
d3.select(".countryDropdown").on("change", function () {
    countryDispatch.call("changeCountry", this, this.value);
});

//set up dispatcher for the dropdown
countryDispatch = d3.dispatch('changeCountry');

//dispatch function updates the selected country and calls the update function when dropdown item is selected
countryDispatch.on("changeCountry", function (countrySelected, i) { //country is the value of the option selected in the dropdown

    console.log(countrySelected);
    tracker.country = countrySelected;
    updateData();
});

//used to be dataManager.js

d3.csv('./data/soilData_allyrs1019.csv', dataLoaded); //soilDataMapNames_mergingkeys_2_cut.csv', dataLoaded);

function dataLoaded(soilData) {
    console.log(soilData);

    importedData = soilData;
    updateData();
}

function updateData() {

    //.reduce()
    //.groupAll()
    /*var byContinent = cf.dimension(function (d) {
     return d.continent;
     });*/

    /*
     var byYear = cf.dimension(function(d){
     return +d.year;
     });
     var data2013 = byYear.filterExact("2013").top(Infinity);
     */

    console.log(tracker.year, tracker.country);

    //set up initial crossfilter
    var cf = crossfilter(importedData);

    //add a dimension using the year value
    var byYear = cf.dimension(function (d) {
        return +d.year;
    });

    //add another dimension that groups by country
    var byCountry = cf.dimension(function (d) {
        //console.log(d);
        return d.country;
    });

    //console.log(byCountry.top(Infinity));  //returns the entire original array of objects
    //console.log(byCountry.group().top(Infinity));  //returns an array of 197 countries, with counts for each (no objects)
    //console.log(byCountry.filter(function(d){return d}).group().top(Infinity));  //same as above
    //console.log(byCountry.filterExact("Argentina").top(Infinity));  //returns all years for Argentina, as objects

    var countryPop = byCountry.filterExact(tracker.country).top(Infinity);

    //get data for Argentina in 2010
    //console.log(byCountry.filterExact(tracker.country).top(Infinity).filter(function(d){return d.year == '2010';}));
    var countryYear = byCountry.filterExact(tracker.country).top(Infinity).filter(function(d){return d.year == tracker.year;});

    var data2010 = byYear.filterExact("2010").top(Infinity);  //return an array with all countries with objects from 2015
    var databyCountry = byCountry.filter(function(d) {
        return d;
    });

    countryArray = databyCountry.top(Infinity);

    var testSort = countryArray.sort(function(b,a){
        return +a.totalPop - +b.totalPop;
    });

    //parse country list for dropdown
    testSort.forEach(function (n) {
        d3.select(".countryDropdown") //class in the html file
            .append("option") //it has to be called this name
            .html(n.FULLNAME) //what is going to be written in the text
            .attr("value", n.country); //what is going to be written in value
    });

    //console.log(testSort.slice(0,4));

    /*var byPop2013 = byYear.filter(function(d){ //filter the same dimension again, with a population condition
     //console.log(d);
     return +d.totalPop;
     });*/
    //console.log(byPop2013.top(Infinity));

    //var test = byYear.filterExact("totalPop").top(Infinity);

    //console.log(test);

    //var groupByContinent = byContinent.group();
    //console.log(groupByContinent.top(2));

    //sort the entire array by the totalPop column (need to convert to number; otherwise, reads as string)
    /*var byPopulation = cf.dimension(function (d) {
     return +d.totalPop;
     });
     */

    //console.log(testSort.slice(0));  //this gives an array of 200 objects!

    drawSquares(countryYear[0]);
    drawLandBars(countryPop);
    drawBars(countryPop,'totalPop');
}



//used to be d.js

function drawSquares(countryObject) {

    console.log(countryObject);

    //can't bind to an object - need to put it in an array first
    var testArray = [];
    testArray.push(countryObject);

    console.log(testArray);
    //console.log(width,height);
    d3.selectAll('.squares-group').remove();
    d3.selectAll('.stats-group').remove();


    var squaresGroup = mainPlot.selectAll('.squares-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'squares-group')
        .attr('transform', 'translate(' + width / 4 + ',' + height / 3 + ')');

    var statsGroup = mainPlot.selectAll('.stats-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'stats-group')
        .attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

    statsGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', 24)
        .attr('class','country-name')
        .attr('fill',typeCol)
    /*.text(function (d) {
     console.log('here');
     return d.FULLNAME + ', ' + d.year
     })*/;

    d3.selectAll('.country-name')
        .text(function(d){
            console.log(d)
            return d.FULLNAME});// + ', ' + d.year });

    statsGroup.append('text')
        .attr('x', 0)
        .attr('y', 30)
        .style('font-size', 14)
        .attr('fill',typeCol)
        .text(function (d) {
            return "Population: " + Number(d.totalPop).toLocaleString()
        });

    statsGroup.append('text')
        .attr('x', 0)
        .attr('y', 50)
        .style('font-size', 14)
        .attr('fill',typeCol)
        .text(function (d) {
            return "Total Land Area: " + Number(d.landArea).toLocaleString()
        });
    /*
     squaresGroup
     .append('rect')
     .attr('x', function (d) {
     return -1;
     })
     .attr('y', function (d) {
     return -.5;
     })
     .attr('width', function (d) {
     return landAreaScale(d.urbanLand2050)
     })
     .attr('height', function (d) {
     return landAreaScale(d.urbanLand2050)
     })
     .attr('fill', 'none')
     .attr('stroke', 'grey')
     .attr('stroke-dasharray', '4,4');

     squaresGroup
     .append('rect')
     .attr('x', function (d) {
     return 0;
     })
     .attr('y', function (d) {
     return -landAreaScale(d.forestArea)
     })
     .attr('width', function (d) {
     return landAreaScale(d.forestArea)
     })
     .attr('height', function (d) {
     return landAreaScale(d.forestArea)
     })
     .attr('fill', forestCol);

     squaresGroup
     .append('rect')
     .attr('x', function (d) {
     return -landAreaScale(d.agriculturalLand)
     })
     .attr('y', function (d) {
     return -landAreaScale(d.agriculturalLand)
     })
     .attr('width', function (d) {
     return landAreaScale(d.agriculturalLand)
     })
     .attr('height', function (d) {
     return landAreaScale(d.agriculturalLand)
     })
     .attr('fill', agricCol);

     squaresGroup
     .append('rect')
     .attr('x', function (d) {
     return -landAreaScale(d.arableLand)
     })
     .attr('y', function (d) {
     return -landAreaScale(d.arableLand)
     })
     .attr('width', function (d) {
     return landAreaScale(d.arableLand)
     })
     .attr('height', function (d) {
     return landAreaScale(d.arableLand)
     })
     .attr('fill', arableCol);

     squaresGroup
     .append('rect')
     .attr('x', function (d) {
     return -landAreaScale(d.otherLand)
     })
     .attr('y', function (d) {
     return 0;
     })
     .attr('width', function (d) {
     return landAreaScale(d.otherLand)
     })
     .attr('height', function (d) {
     return landAreaScale(d.otherLand)
     })
     .attr('fill', otherCol);

     squaresGroup
     .append('rect')
     .attr('x', function (d) {
     return 0;
     })
     .attr('y', function (d) {
     return 0;
     })
     .attr('width', function (d) {
     return landAreaScale(d.urbanLand)
     })
     .attr('height', function (d) {
     return landAreaScale(d.urbanLand)
     })
     .attr('fill', urbanCol);

     squaresGroup
     .append('rect')
     .attr('x', function (d) {
     return landAreaScale(d.degradingArea/2) + 100;
     })
     .attr('y', function (d) {
     return landAreaScale(d.degradingArea/2);
     })
     .attr('width', function (d) {
     return 10;
     //return landAreaScale(d.degradingArea)
     })
     .attr('height', function (d) {
     return 10;//landAreaScale(d.degradingArea)
     })
     .attr('fill', degradCol);
     */

}



//used to be bar.js
function drawBars(data, variable) {

    data.sort(function(b,a){return b.year-a.year;});

    /*console.log(d3.max(data, function (d) {
     return +d.totalPop;
     }));*/

    //map axes onto data
    x.domain(data.map(function (d) {
        return +d.year;
    }));
    y.domain([0, d3.max(data, function (d) {
        return +d[variable];
    })]);

    //add axes and titles
    var xAxis = barGroup.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickValues([1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015])); //come back and rebuild this!

    xAxis
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr('dx','-2em')
        .attr("dy", ".35em")
        .attr('font-size','8px')
        .attr("transform", "rotate(-90)")
        .attr('fill',typeCol)
        .style("text-anchor", "end");

    var yAxis = barGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d3.formatPrefix(",.0", 1e6)));

    yAxis.selectAll('text')
        .attr('fill',typeCol);

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
        .attr('x', 150)
        .attr('y', height/2)
        .style('font-size', 12)
        .attr('fill',typeCol)
        .style('text-anchor', 'middle')
        .text('Population Growth Over Time');

    barGroup.append('text')
        .attr('class', 'bar-label')
        .attr('fill',typeCol)
        .style('font-size', 12);

    //draw bars
    barGroup.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d[variable]);
        })
        .attr("width", x.bandwidth())
        .attr("height", 2/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', '#ed9f23');//'#3b5c91');

}


function drawLandBars(data) {

    data.sort(function(b,a){return b.year-a.year;});

    /*console.log(d3.max(data, function (d) {
     return +d.totalPop;
     }));*/

    //map axes onto data
    x.domain(data.map(function (d) {
        return +d.year;
    }));
    y.domain([0, d3.max(data, function (d) {
        return +d.landArea;
    })]);

    //add axes and titles
    var xAxis = landBarGroup.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickValues([1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015])); //come back and rebuild this!

    xAxis
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr('dx','-2em')
        .attr("dy", ".35em")
        .attr('font-size','8px')
        .attr("transform", "rotate(-90)")
        .attr('fill',typeCol)
        .style("text-anchor", "end");

    var yAxis = landBarGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d3.formatPrefix(",.0", 1e6)));

    yAxis.selectAll('text')
        .attr('fill',typeCol);

    //d3.selectAll('.axis').selectAll('ticks').attr('fill',typeCol);

    /*.append("text")
     .style('fill', 'gray')
     .style('font-size', '12px')
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "0.71em")
     .attr("text-anchor", "end")
     .text("Minutes");*/

    landBarGroup.append('text')
        .attr('x', 150)
        .attr('y', height/2)
        .style('font-size', 12)
        .attr('fill',typeCol)
        .style('text-anchor', 'middle')
        .text('Land Use Change Over Time');

    landBarGroup.append('text')
        .attr('class', 'bar-label')
        .attr('fill',typeCol)
        .style('font-size', 12);


    //draw bars
    landBarGroup.selectAll(".forest-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "forest-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.forestArea);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', forestCol);//'#3b5c91');

    //draw bars
    landBarGroup.selectAll(".agric-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "agric-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.agriculturalLand);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', agricCol);//'#3b5c91');


    //draw bars
    landBarGroup.selectAll(".arable-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "arable-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.arableLand);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', arableCol);//'#3b5c91');


    //draw bars
    landBarGroup.selectAll(".other-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "other-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.otherLand);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', otherCol);//'#3b5c91');

    //draw bars
    landBarGroup.selectAll(".urban-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "urban-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.urbanLand);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', urbanCol);//'#3b5c91');


}


//used to be playSlider

//runs when user presses the button
function update() {

}

function reset(){

    d3.select("#slider").value = 0;

}

//Play button modified from https://jsfiddle.net/bfbun6cc/4/
//Run the update function when the slider is changed
d3.select('#slider').on('input', function() {

    tracker.year = this.value;
    //console.log(this.value);
    updateData();

});


var myTimer;
d3.select("#play").on("click", function() {
    clearInterval (myTimer);
    myTimer = setInterval (function() {
        var b= d3.select("#slider");
        var t = (+b.property("value") + 1) % (+b.property("max") + 1);
        if (t == 0) { t = +b.property("min"); }
        b.property("value", t);
        if (t<20){
            update (t);
        }
        else {
            reset()
        }
    }, 100);
});

d3.select("#stop").on("click", function() {
    clearInterval (myTimer);
});


//used to be navigator.js
/*
//set some margins and record width and height of window
var margin = {t:25,r:40,b:25,l:40};

var widthNav = document.getElementById('navigator').clientWidth - margin.r - margin.l,
    heightNav = document.getElementById('navigator').clientHeight - margin.t - margin.b;


var map = d3.select("#navigator");

var worldMap = map.append("g")
    .attr("id", "world-map")
    .selectAll("path");

var map_data = d3.map();

var proj = d3.geoEquirectangular()
//.origin([24.7, -29.2])
//.parallels([-22.1, -34.1])
    .scale(50)
    .translate([widthNav/2+40, heightNav/2+20]);

//proj.fitExtent([[10, 10], [width2/2, height2]], mapBlocks);

var path = d3.geoPath()
    .projection(proj);

// the data came from some rolling up of info I got from iec.org.za site.
// It lists the winning party, number or registered voters and votes
// cast per local municipality.
d3.csv("./data/soilDataMapNames_mergingkeys_2_cut.csv", function (data) {
    data.forEach(function (d) {
        map_data.set(d.NAME,
            [
                d.continent,
                d.country,
                d.landArea, //0
                d.arableLand, //1
                d.agriculturalLand, //2
                d.forestArea, //3
                d.urbanLand, //4
                d.urbanLand2050, //5
                d.degradingArea, //6
                d.totalPop, //7
                d.totalPop2050,  //8
                d.urbanPop, //9
                d.otherLand, //10
                d.peoplePerKm, //11
                d.peoplePerKmUrban, //12
                d.peoplePerKm2050  //13
            ]);
    })
});

var indexToUse = 6;
var columnString = 'people per km';
//can be no zeros in the data! Need to change scale factor in cartogram.js (line 100) depending on magnitude of variable

// this loads test the topojson file and creates the map.
d3.json("./data/worldcountries_fromWorking_noAntartc.topojson", function (data) {
    //console.log(data);

    // Convert the topojson to geojson
    var topoData = topojson.feature(data, data.objects.worldcountries);

    var titleText;

    worldMap = worldMap.data(topoData.features)//topojson.feature(data.objects.worldcountries,data.objects.worldcountries.geometries)) //topojson.feature(uk, uk.objects.subunits)
        .enter()
        .append("path")
        .attr("class", function(d){ return 'country ' + map_data.get(d.id)[0].replace(' ','-'); } )
        .attr("id", function (d) {
            //console.log(d);
            return d.id;
        })
        .attr("fill", function (e) {
            return mapCol;//'#baada9';//colour_map[vote_data.get(e.properties.landArea)[0]];
        })
        .style('stroke','light-gray')
        .style('stroke-width',1)
        .attr("d", path)
        .on("mouseover", function(d){

            var continent = map_data.get(d.id)[0].replace(' ','-');
            titleText = map_data.get(d.id)[0];

            //console.log(titleText);

            //var stringCat =  '\'.' + continent + '\'';  //'&quot;' + '.' + continent + '&quot;';
            //'.' + continent
            d3.selectAll( '.' + continent ).attr('fill',mapHighlightCol);
            //d3.select(this).attr('fill','orange');
            d3.select('.title').text(titleText);

        })
        .on('mouseout',function(d){
            d3.selectAll('.country').attr('fill',mapCol);
        });

    worldMap.append("title")
        .text(function (d) {
            return d.id;
        });

    map.append("text")
        .attr('x',0)
        .attr('y',50)
        .attr('class','title')
        .style('font-size',18)
        .text(titleText);

});

*/