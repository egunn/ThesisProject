


//add a new button for map updating
//var testDrag = $('<input/>', { type: "button", class:"draggable ui-widget-content", value: "drag me"});
//$("#button-column").append(testDrag);

// listen for new divs added with class draggable, make these new elements draggable
$("body").on("DOMNodeInserted", ".draggable", makeDraggable);

//apply the draggable function, turn off the button click behavior (otherwise won't drag)
function makeDraggable() {
    $(this).draggable({cancel:false});
}

$( function() {
    //left over from original sample - duplicated above, for new structure (with dynamic add)
    //$( ".draggable" ).draggable({
    //    cancel: false  //from http://jsfiddle.net/SirDerpington/wzaJH/; turn off default button click behav so it doesn't interfere w/ draggable

    //});
    //sets the behavior for the droppable box (the div under the SVG)
    $( "#droppable" ).droppable({
        cancel: false,
        drop: function( event, ui ) {
            $( this )
                .addClass( "ui-state-highlight" )
                //.find( ".draggable" )
                //.html( "Dropped!" );
        }
    });
} );


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

foodBarGroup = mainPlot.append('g')
    .attr('class','food-bar-group')
    .attr('transform','translate('+ ((width/2)+70) + ',' + -height/4 +')');

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

tracker = {country:"US", year:1975};
importedData = [];
balanceData =[];

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

foodX = d3.scaleBand().rangeRound([0, ((width/2)-50)]).padding(0.1); //offsets added to keep bars from exiting SVG
foodY = d3.scaleLinear().rangeRound([height/4, height/2])//[height/4+30, height/2]);
foodNeg = d3.scaleLinear().rangeRound([height/2, 3*height/4-30]);//[height/2, 3*height/4-30]);

//append selection (will populate later with d3)
//http://stackoverflow.com/questions/4814512/how-to-create-dropdown-list-dynamically-using-jquery
var s = $('<select/>'); //class=""
s.appendTo('#navbar-container').addClass('type-list form-control countryDropdown');

//set up change function for dropdown
d3.select(".countryDropdown").on("change", function () {
    console.log(this.value);
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

/*d3.csv('./data/soilData_allyrs1019.csv', dataLoaded); //soilDataMapNames_mergingkeys_2_cut.csv', dataLoaded);

function dataLoaded(soilData) {
    console.log(soilData);


}*/


queue()
    .defer(d3.csv, "./data/soilData_allyrs1019.csv")
    .defer(d3.csv, './data/balanceSheetData.csv')
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, soilData, balanceDataIn) {

        //balanceData.filter(function(d){return d.countryName == tracker.country});
        importedData = soilData;
        balanceData = balanceDataIn;

        updateData();
    });


function updateData() {

    //set up initial crossfilter
    var cf = crossfilter(importedData);

    //add a dimension using the year value
    var byYear = cf.dimension(function (d) {
        return +d.year;
    });

    //add another dimension that groups by country
    var byCountry = cf.dimension(function (d) {
        //console.log(d);
        return d.NAME;
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
            .attr("value", n.NAME); //what is going to be written in value
    });

    //for each element in the sorted array
    testSort.forEach(function(n){
        //add a new button for map updating
        var testDrag = $('<input/>', { type: "button", class:"draggable ui-widget-content", value: n.NAME});

        //add event listener to each button to tell when it is dropped
        testDrag.on( "dragstop", function( event, ui ) {
            //use jQuery to extract the value and print it to the console.
            console.log($(this).val());
        } );

        //add the new button element to the button column
        $("#button-column").append(testDrag);
    });


    //console.log(testSort.slice(0,4));

    countryBalance = balanceData.filter(function(d){return d.countryCode == tracker.country});
    //console.log(countryBalance);

    drawLandBars(countryPop);
    drawBars(countryPop,'totalPop');
    drawSquares(countryYear[0]);
    drawFoodBars(countryBalance);

}


function drawFoodBars(){

    foodBarGroup.selectAll('*').remove();

    var sorted = countryBalance.sort(function(a,b){return a.year-b.year});
    console.log(sorted);


    //data.sort(function(b,a){return b.year-a.year;});

    /*console.log(d3.max(data, function (d) {
     return +d.totalPop;
     }));*/

    console.log(2*d3.max(sorted, function (d) {
            return +d.exportQuantity;
        }))

    //map axes onto data
    foodX.domain(sorted.map(function (d) {
        return d.year;
    }));
    foodY.domain([d3.max(sorted, function (d) {
        return +d.importQuantity;
    }),0]);
    foodNeg.domain([0,2*d3.max(sorted, function (d) {
        return +d.exportQuantity;
    })]);


    //add axes and titles
    var xAxis = foodBarGroup.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height/2 + ")")
        .call(d3.axisBottom(foodX).tickValues([1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010]));
    //.tickValues([1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015])); //come back and rebuild this!

    xAxis
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr('dx','-2em')
        .attr("dy", ".35em")
        .attr('font-size','12px')
        .attr("transform", "translate(0,"+ 0 + ")rotate(-90)")
        .attr('fill','gray')
        .style("text-anchor", "end");

    var yAxis = foodBarGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(foodY)
            .ticks(5));
    //.tickFormat(d3.formatPrefix(",.0", 1e6)));

    var yAxisNeg = foodBarGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(foodNeg)
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

    foodBarGroup.append('text')
        .attr('x', width/2-15)
        .attr('y', 0)
        .style('font-size', 14)
        .attr('fill',"gray")
        .style('text-anchor', 'middle')
        .text('Distribution of carbon in the soil');

    foodBarGroup.append('text')
        .attr('class', 'bar-label')
        .attr('fill',"gray")
        .style('font-size', 12);

    //draw bars
    stackGroup = foodBarGroup.selectAll(".abovebar")
        .data(sorted)
        .enter()
        .append('g')
        .attr('class','stackgroup');

    stackGroup
        .append("rect")
        .attr("class", "abovebar")
        .attr("x", function (d) {
            return foodX(d.year);
        })
        .attr("y", function (d) {
            return  foodY(d.importQuantity);
        })
        .attr("width", foodX.bandwidth())
        .attr("height", function (d) {
            return height/2 - foodY(d.importQuantity);
        })
        .attr('fill', '#74a063');


    //draw bars
    stackGroup//.selectAll(".topsoilbar")
    //.data(data)
    //.enter()
        .append("rect")
        .attr("class", "topsoilbar")
        .attr("x", function (d) {
            return foodX(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  height/2;//foodNeg(d.subsoil);
        })
        .attr("width", foodX.bandwidth())
        .attr("height", function (d) {
            //console.log(yNeg(d.topsoil));
            return foodNeg(d.exportQuantity) - (height/2);
        })
        .attr('fill', '#77664c');//'#3b5c91');

/*
    //draw bars
    stackGroup//.selectAll(".subsoilbar")
    //.data(data)
    //.enter()
        .append("rect")
        .attr("class", "subsoilbar")
        .attr("x", function (d) {
            return foodX(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  height - foodNeg(d.exportQuantity); //sets pos'n of tops of bars (close to y axis)
        })
        .attr("width", foodX.bandwidth())
        .attr("height", function (d) {
            //console.log(d.topsoil, d.subsoil);
            //console.log(yNeg(d.topsoil),yNeg(d.subsoil));
            return foodNeg(d.exportQuantity) - height/2;
        })
        .attr('fill', '#a38961');//'#3b5c91');

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




}


//used to be d.js

function drawSquares(countryObject) {

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

    barGroup.selectAll('*').remove();

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

    landBarGroup.selectAll('*').remove();

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