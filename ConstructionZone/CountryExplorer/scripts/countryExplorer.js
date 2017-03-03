//setup resize event listener on window (resizeView defined in view js file, since it contains d3 updates)
window.addEventListener('resize', resizeView, false);


//set some margins and record width and height of window
margin = {t: 35, r: 0, b: 25, l: 50};

var width = document.getElementById('vis').clientWidth- margin.r - margin.l;
var height = document.getElementById('vis').clientHeight- margin.t - margin.b;

//grab svg from template
var svg = d3.selectAll('#vis');

//make global for resize listener
var mapData;

var x, y;

barGroup = svg.append('g')
    .attr('class','bar-group')
    .attr('transform','translate('+ ((width/2)+70) +',' + margin.t + ')');

landBarGroup = svg.append('g')
    .attr('class','land-bar-group')
    .attr('transform','translate(75,' + margin.t + ')');

foodBarGroup = svg.append('g')
    .attr('class','food-bar-group')
    .attr('transform','translate('+ ((width/2)+70) + ',' + (-height/4 + margin.t) +')');

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

tracker = {country:"US", region:"Northern America",year:1975};
importedData = [];
balanceData =[];
pcLandUse=[];

/*
 var forestSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var agricSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var arableSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var urbanSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var otherSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 */

landAreaScale = d3.scaleSqrt().domain([0, 17000000]).range([0, width / 4]); //650

popScale = d3.scaleSqrt().domain([0, 1750000000]).range([0, 250]);
calorieScale = d3.scaleSqrt().domain([0, 3500]).range([0, 30]);
popLineScale = d3.scaleLinear().domain([0, 1750000000]).range([0, 1525]);
foodBalanceScale = d3.scaleLinear().domain([0, 1520000000]).range([0, 150]);  //scaled by hand, to give reasonable output - need to automate


//set up scale factors
x = d3.scaleBand().rangeRound([0, ((width/2)-50)]).padding(0.1);
y = d3.scaleLinear().rangeRound([height, height/2]);

foodX = d3.scaleBand().rangeRound([0, ((width/2)-50)]).padding(0.1); //offsets added to keep bars from exiting SVG
foodY = d3.scaleLinear().rangeRound([height/4, height/2]);//[height/4+30, height/2]);
foodNeg = d3.scaleLinear().rangeRound([height/2, 3*height/4-30]);//[height/2, 3*height/4-30]);


//set up navigation buttons and dropdown in top navbar
var b1 = $('<button />', {
    type  : 'button',
    value : 'overview',
    id    : 'overview-button',
    html: 'Overview',
    on    : {
        click: function(){
            overviewClicked();
        }
    }
});

b1.appendTo('#navbar-container').addClass('nav-button selected');

var b2 = $('<button />', {
    type  : 'button',
    value : 'compare',
    id    : 'compare-button',
    html: 'Compare Countries',
    on    : {
        click: function(){
            compareClicked();
        }
    }
});

b2.appendTo('#navbar-container').addClass('nav-button');

//append select element (will populate later with d3)
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

//auto-hide bottom navbar to open up screen space
d3.select('.to-collapse').attr('class','to-collapse out');
d3.select('.collapse-button').html('Show Nav');


//used to be dataManager.js

/*d3.csv('./data/soilData_allyrs1019.csv', dataLoaded); //soilDataMapNames_mergingkeys_2_cut.csv', dataLoaded);

 function dataLoaded(soilData) {
 console.log(soilData);


 }*/


queue()
    .defer(d3.csv, "./data/soilData_allyrs1019.csv")
    .defer(d3.csv, './data/balanceSheetData.csv')
    .defer(d3.json,'./data/perCapitaLandUseRequirements.json')
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, soilData, balanceDataIn, pcLandUseIn) {

        //balanceData.filter(function(d){return d.countryName == tracker.country});
        importedData = soilData;
        balanceData = balanceDataIn;
        pcLandUse = pcLandUseIn;

        updateData();
    });


function updateData() {

    //set up initial crossfilter
    var cf = crossfilter(importedData);

    var pc = crossfilter(pcLandUse);

    //add a dimension using the year value
    var byYear = cf.dimension(function (d) {
        return +d.year;
    });

    var pcByYear = pc.dimension(function (d) {
        return +d.year;
    });

    //add another dimension that groups by country
    var byCountry = cf.dimension(function (d) {
        //console.log(d);
        return d.NAME;
    });

    var pcByRegion = pc.dimension(function (d) {
        return d.region;
    });

    //console.log(byCountry.top(Infinity));  //returns the entire original array of objects
    //console.log(byCountry.group().top(Infinity));  //returns an array of 197 countries, with counts for each (no objects)
    //console.log(byCountry.filter(function(d){return d}).group().top(Infinity));  //same as above
    //console.log(byCountry.filterExact("Argentina").top(Infinity));  //returns all years for Argentina, as objects

    var countryPop = byCountry.filterExact(tracker.country).top(Infinity);

    //get data for Argentina in 2010
    //console.log(byCountry.filterExact(tracker.country).top(Infinity).filter(function(d){return d.year == '2010';}));
    var countryYear = byCountry.filterExact(tracker.country).top(Infinity).filter(function(d){return d.year == tracker.year;});

    var pcRegionYear = pcByRegion.filterExact(tracker.region).top(Infinity).filter(function(d){return d.year == tracker.year;});

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

    //console.log(testSort.slice(0,4));

    countryBalance = balanceData.filter(function(d){return d.countryCode == tracker.country && d.year == tracker.year});
    //console.log(countryBalance);

    //drawLandBars(countryPop);
    //drawBars(countryPop,'totalPop')
    drawPopBars(countryYear);
    drawLandSquares(countryYear[0]);
    drawCrowdingSquares(countryYear[0]);
    drawFoodBars(countryBalance);
    drawCalories(pcRegionYear);



}

centerScaleX = d3.scaleLinear().domain([0, 1]).range([0, width]);
centerScaleY = d3.scaleLinear().domain([0, 1]).range([0, height]);

centers = [
    {name:"popBars", x:.06, y:.1},
    {name:"landSquares", x:.2, y:.4},
    {name:"degradedSquares", x:.4, y:.4},
    {name:"crowdingSquares", x:.6, y:.4},
    {name:"foodBar1", x:.06, y:.7},
    {name:"foodBar2", x:.16, y:.7},
    {name:"calories", x:.4, y:.8}
];

svg.selectAll('.center-dots')
    .data(centers)
    .enter()
    .append('circle')
    .attr('cx',function(d){
        return centerScaleX(d.x)
    })
    .attr('cy',function(d){
        return centerScaleY(d.y)
    })
    .attr('r',5)
    .attr('fill','gray');



function drawPopBars(dataIn){

    var popBars = svg.append('g')
        .attr('class','pop-bars')
        .attr('transform','translate(' + centerScaleX(.06) + ',' + centerScaleY(.1) + ')');

    popBars.data(dataIn);

    /*
    svg.append('rect')
        .attr('x',function(d){
            return centerScaleX(.06)
        })
        .attr('y',function(d){
            return centerScaleY(.1)
        })
        .attr('width',function(d){
            return centerScaleX(.8)
        })
        .attr('height',function(d){
            return 10
        })
        .attr('fill', 'gainsboro');
    */

    popBars
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', function(d){
            return popLineScale(d.totalPop);
        })
        .attr('height', function(d){
            return 5;//popScale(d.totalPop);
        })
        .attr('fill','rgb(200,200, 200)')
        .style('fill-opacity','1')
        .style('stroke-width', ".5px")
        .attr('stroke','rgba(200,200, 200,1)');

    popBars
        .append('rect')
        .attr('x', 0)
        .attr('y', 0) //+ popScale(d.totalPop)-popScale(d.urbanPop)})
        .attr('width', function(d){
            return popLineScale(d.urbanPop);
        })
        .attr('height', function(d){
            return 5;//popScale(d.urbanPop);
        })
        .attr('fill','rgba(50,50, 50,.7)')
        .style('stroke-width', ".5px")
        .attr('stroke','rgb(200,200, 200)')
        .style('fill-opacity','1')
        .attr('class','land-area');

    popBars
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)// + popScale(d.totalPop)-popScale(d.totalPop2050)})
        .attr('width', function(d){
            return popLineScale(d.totalPop2050);
        })
        .attr('height', function(d){
            return 5;//popScale(d.totalPop2050);
        })
        .attr('fill','none')
        .style('stroke-dasharray', ("1.5,2.5"))
        .style('stroke-width', ".5px")
        .attr('stroke','gray')
        .attr('class','land-area');



}

function drawLandSquares(countryObject){

    console.log(countryObject);

    //can't bind to an object - need to put it in an array first
    var testArray = [];
    testArray.push(countryObject);

    //console.log(width,height);
    d3.selectAll('.squares-group').remove();
    d3.selectAll('.stats-group').remove();


    var landSquaresGroup = svg.selectAll('.squares-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'squares-group')
        .attr('transform', 'translate(' + centerScaleX(.2) + ',' + centerScaleY(.4) + ')');

    var degradedSquareGroup = svg.selectAll('.degradedSquares-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'degraded-squares-group')
        .attr('transform', 'translate(' + centerScaleX(.4) + ',' + centerScaleY(.4) + ')');

    var statsGroup = svg.selectAll('.stats-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'stats-group')
        .attr('transform', 'translate(' + (margin.l + .70*width) + ',' + margin.t + ')');

    statsGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', 24)
        .attr('class','country-name')
        .attr('fill',typeCol);
    /*.text(function (d) {
     console.log('here');
     return d.FULLNAME + ', ' + d.year
     });*/

    d3.selectAll('.country-name')
        .text(function(d){
            return d.FULLNAME + ', ' + d.year});// + ', ' + d.year });


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



     landSquaresGroup
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

    landSquaresGroup
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

    landSquaresGroup
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

    landSquaresGroup
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

    landSquaresGroup
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

    landSquaresGroup
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


     degradedSquareGroup
     .append('rect')
     .attr('x', function (d) {
     return landAreaScale(d.degradingArea/2) - d.degradingArea;
     })
     .attr('y', function (d) {
     return landAreaScale(d.degradingArea/2) - d.degradingArea;
     })
     .attr('width', function (d) {
     return d.degradingArea;
     //return landAreaScale(d.degradingArea)
     })
     .attr('height', function (d) {
     return d.degradingArea;//landAreaScale(d.degradingArea)
     })
     .attr('fill', degradCol);

}

function drawCrowdingSquares(countryCrowding){

    console.log(Math.floor(countryCrowding.peoplePerKm));

    var pattern = svg.append("defs")
        .append("pattern")
        .attr('id',function(d){ return 'test-pattern';})
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('patternContentUnits',"objectBoundingBox")
        .attr('viewBox',"0 0 1 1")
        .attr('preserveAspectRatio',"xMidYMid slice")
        .append('image')
        .attr("height", 1)
        .attr("width", 1)
        .attr('preserveAspectRatio',"xMidYMid slice")
        .attr("xlink:href", function(d){ return './images/test.png'});  //replace with link text built using countryCrowding, when imgs avail

    svg.append('rect')
        .attr('x',function(d){
            return -50
        })
        .attr('y',function(d){
            return -50
        })
        .attr('width',function(d){
            return 100
        })
        .attr('height',function(d){
            return 100
        })
        .attr('transform','translate(' + centerScaleX(.6) + ',' + centerScaleY(.4) + ')')
        .attr('fill', 'url(#test-pattern)');

    svg.append('rect')
        .attr('x',function(d){
            return -50
        })
        .attr('y',function(d){
            return -50
        })
        .attr('width',function(d){
            return 100
        })
        .attr('height',function(d){
            return 100
        })
        .attr('transform','translate(' + centerScaleX(.6) + ',' + centerScaleY(.4) + ')')
        .attr('fill', 'none')
        .attr('stroke-width',1)
        .attr('stroke','gray');


}

function drawFoodBars(countryFoodBalance){

    console.log(countryFoodBalance);
    svg.append('rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return 0
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            console.log(foodBalanceScale(countryFoodBalance[0].importQuantity));
            return foodBalanceScale(countryFoodBalance[0].importQuantity);
        })
        .attr('transform','translate(' + centerScaleX(.06) + ',' + centerScaleY(.7) + ')')
        .attr('fill','teal')
        .attr('fill-opacity',.3);


    svg.append('rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(countryFoodBalance[0].importQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            console.log(countryFoodBalance[0].importQuantity);
            return foodBalanceScale(countryFoodBalance[0].produced);
        })
        .attr('transform','translate(' + centerScaleX(.06) + ',' + centerScaleY(.7) + ')')
        .attr('fill','purple')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return 0
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(countryFoodBalance[0].exportQuantity);
        })
        .attr('transform','translate(' + centerScaleX(.16) + ',' + centerScaleY(.7) + ')')
        .attr('fill','green')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(countryFoodBalance[0].exportQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(countryFoodBalance[0].usedFood);
        })
        .attr('transform','translate(' + centerScaleX(.16) + ',' + centerScaleY(.7) + ')')
        .attr('fill','magenta')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(countryFoodBalance[0].usedFood) + foodBalanceScale(countryFoodBalance[0].exportQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(countryFoodBalance[0].usedNonFood);
        })
        .attr('transform','translate(' + centerScaleX(.16) + ',' + centerScaleY(.7) + ')')
        .attr('fill','blue')
        .attr('fill-opacity',.3);


    svg.append('rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(countryFoodBalance[0].usedFood) + foodBalanceScale(countryFoodBalance[0].exportQuantity) +foodBalanceScale(countryFoodBalance[0].usedNonFood);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(countryFoodBalance[0].waste);
        })
        .attr('transform','translate(' + centerScaleX(.16) + ',' + centerScaleY(.7) + ')')
        .attr('fill','orange    ')
        .attr('fill-opacity',.3);
}

function drawCalories(countryCalories){
    console.log(countryCalories)

    svg.append('circle')
        .attr('cx',0)
        .attr('cy',0)
        .attr('transform','translate(' + centerScaleX(.4) + ',' + centerScaleY(.8) + ')')
        .attr('r',calorieScale(countryCalories[0].total.avgPerCapFoodSupply))
        .attr('fill','orange')

}

function drawPCLandUse(){

}



function overviewClicked(){
    console.log('overview clicked');

    d3.selectAll('#overview-button').classed('selected', true);
    d3.selectAll('#compare-button').classed('selected', false);
}


function compareClicked(){
    console.log('compare clicked');

    d3.selectAll('#compare-button').classed('selected', true);
    d3.selectAll('#overview-button').classed('selected', false);
}


//Play button modified from https://jsfiddle.net/bfbun6cc/4/
//Run the update function when the slider is changed
d3.select('#slider').on('input', function() {
        console.log(this.value);
        tracker.year = this.value;
        updateData();
});

function playClicked(){
    console.log('play clicked');
}

function stopClicked(){
    console.log('stop clicked');
}
/*
var myTimer;
d3.select("#playButton").on("click", function() {


    /*
    clearInterval (myTimer);
    myTimer = setInterval (function() {
        var b= d3.select("#slider");
        var t = (+b.property("value") + 1) % (+b.property("max") + 1);
        if (t == 0) { t = +b.property("min"); }
        b.property("value", t);
        if (t<18){
            update (t, t-1);
            lastValue ++;
        }
        else {
            update (18, 17);
            clearInterval (myTimer);
            //reset()
        }
    }, 800);

});

d3.select("#stopButton").on("click", function() {

    console.log('stop clicked');
    /*
    clearInterval (myTimer);

});
*/

//runs on window resize, calls scale update and draw functions
function resizeView() {

    width = document.getElementById('vis').clientWidth;
    height = document.getElementById('vis').clientHeight;

}