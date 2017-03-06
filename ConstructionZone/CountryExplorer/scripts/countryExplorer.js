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

tracker = {country:{l:"US",r:"CN"}, init:true, year:1975, view:"overview",mode:"sbs",varType:"population"};
importedData = [];
balanceData =[];
pcLandUse=[];
dropdownValues = []; //global used to populate the dropdown selections

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

addDropdown();

function addDropdown(){

    //append select element (will populate later with d3)
    //http://stackoverflow.com/questions/4814512/how-to-create-dropdown-list-dynamically-using-jquery
    var s = $('<select/>'); //class=""
    s.appendTo('#navbar-container').addClass('type-list form-control countryDropdown').attr('id',function(){
        if (tracker.init == true){
            return "left-dropdown";
        }
        else{
            return "right-dropdown";
        }
    });


    if (tracker.init == true){
        //add default option to dropdown menu (otherwise, won't show US as first selection)
        d3.select("#left-dropdown") //class in the html file
            .append("option") //it has to be called this name
            .html("United States") //what is going to be written in the text
            .attr("value", "US");

        //set up change function for dropdown
        d3.select("#left-dropdown").on("change", function () {
            console.log(this.value);
            countryDispatch.call("changeCountry", this, this.value,"left");
        });
    }
    else{
        //add default option to dropdown menu (otherwise, won't show US as first selection)
        d3.select("#right-dropdown") //class in the html file
            .append("option") //it has to be called this name
            .html("United States") //what is going to be written in the text
            .attr("value", "US");

        //set up change function for dropdown
        d3.select("#right-dropdown").on("change", function () {
            console.log(this.value);
            countryDispatch.call("changeCountry", this, this.value,"right");
        });
    }


//set up dispatcher for the dropdown
    countryDispatch = d3.dispatch('changeCountry');

//dispatch function updates the selected country and calls the update function when dropdown item is selected
    countryDispatch.on("changeCountry", function (countrySelected, whichDropdown) { //country is the value of the option selected in the dropdown

        if(whichDropdown == "left"){
            tracker.country.l = countrySelected;
        }
        else if (whichDropdown == "right"){
            tracker.country.r = countrySelected;
        }

        updateData();
    });

}


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

    var countryPop = byCountry.filterExact(tracker.country.l).top(Infinity);

    //get data for Argentina in 2010
    //console.log(byCountry.filterExact(tracker.country).top(Infinity).filter(function(d){return d.year == '2010';}));
    var countryYear = byCountry.filterExact(tracker.country.l).top(Infinity).filter(function(d){return d.year == tracker.year;});

    var pcRegionYear = pcByRegion.filterExact(tracker.region).top(Infinity).filter(function(d){return d.year == tracker.year;});

    var data2010 = byYear.filterExact("2010").top(Infinity);  //return an array with all countries with objects from 2015
    var databyCountry = byCountry.filter(function(d) {
        return d;
    });

    countryArray = databyCountry.top(Infinity).slice();

    dropdownValues = countryArray.sort(function(a,b){
        //needs a case-insensitive alphabetical sort
        return a.country.toLowerCase().localeCompare(b.country.toLowerCase());
    });


    //parse country list for dropdown
    dropdownValues.forEach(function (n) {
        d3.select("#left-dropdown") //class in the html file
            .append("option") //it has to be called this name
            .html(n.FULLNAME) //what is going to be written in the text
            .attr("value", n.NAME); //what is going to be written in value
            //.style('background','blue'); //change background color (useful for styling multiple levels of aggregation)
    });



    //console.log(testSort.slice(0,4));

    //balanceData.max(function(d){return })

    //Math.max(balanceData.map(function(o){return o.total;}))

    countryBalance = balanceData.filter(function(d){return d.countryCode == tracker.country.l && d.year == tracker.year});

    console.log(tracker.view);

    if (tracker.init == true){
        if (tracker.view == "overview"){
            drawPopBars(countryYear);
            drawLandSquares(countryYear[0]);
            drawCrowdingSquares(countryYear[0]);
            drawFoodBars(countryBalance);
            drawCalories(pcRegionYear);
            //drawLandReqts
        }
        else if (tracker.view == "compare"){
            svg.selectAll('*').remove();

            console.log(tracker.mode, tracker.varType);
            if(tracker.mode == "sbs"){
                if(tracker.varType == "population"){
                    console.log(countryYear);
                    drawPopBars(countryYear);
                    drawCrowdingSquares(countryYear[0]);
                }
                else if(tracker.varType == "food"){
                    drawFoodBars(countryBalance);
                    drawCalories(pcRegionYear);
                    //drawLandReqts
                }
                else if(tracker.varType == "land"){
                    drawLandSquares(countryYear[0]);
                }
            }
            else if(tracker.mode == "rank"){
                if(tracker.varType == "population"){

                }
                else if(tracker.varType == "food"){

                }
                else if(tracker.varType == "land"){

                }
            }


        }

        tracker.init = false;
    }

    else {

        updatePopBars(countryYear);
        updateLandSquares(countryYear);
        updateCrowdingSquares(countryYear);
        updateFoodBars(countryBalance);
        updateCalories(pcRegionYear);
        //updateLandReqts()

    }


}

centerScaleX = d3.scaleLinear().domain([0, 1]).range([0, width]);
centerScaleY = d3.scaleLinear().domain([0, 1]).range([0, height]);

//array for drawing positioning dots
centers = [
    {name:"popBars", x:.06, y:.1},
    {name:"landSquares", x:.2, y:.4},
    {name:"degradedSquares", x:.4, y:.4},
    {name:"crowdingSquares", x:.6, y:.4},
    {name:"foodBar1", x:.06, y:.7},
    {name:"foodBar2", x:.16, y:.7},
    {name:"calories", x:.4, y:.8},
    {name:"perCapita",x:.6,y:.8}
];

//controls transform/translate properties of each subdrawing
centerCoords = {
    overview: {
        popBars: [.06, .1],
        landSquares: [.2, .4],
        degradedSquares: [.4, .4],
        crowdingSquares: [.6, .4],
        foodBar1: [.06, .7],
        foodBar2: [.16, .7],
        calories: [.4, .8],
        perCapita: [.6, .8]
    },
    sbs: {
        popBars: [.06, .1],
        landSquares: [.2, .4],
        degradedSquares: [.4, .4],
        crowdingSquares: [.13, .4],
        foodBar1: [.06, .1],
        foodBar2: [.16, .1],
        calories: [.4, .2],
        perCapita: [.6, .1]
    },
    rank: {
        popBars: [.06, .1],
        landSquares: [.2, .4],
        degradedSquares: [.4, .4],
        crowdingSquares: [.6, .4],
        foodBar1: [.06, .7],
        foodBar2: [.16, .7],
        calories: [.4, .8],
        perCapita: [.6, .8]
    }
};

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

    var translateX;
    var translateY;

    if (tracker.view == "overview"){
        translateX = centerScaleX(centerCoords.overview.popBars[0]);
        translateY = centerScaleY(centerCoords.overview.popBars[1]);
    }
    else if (tracker.view == "compare"){
        if (tracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs.popBars[0]);
            translateY = centerScaleY(centerCoords.sbs.popBars[1]);
        }
        else if(tracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.popBars[0]);
            translateY = centerScaleY(centerCoords.rank.popBars[1]);
        }
    }


    var popBars = svg.append('g')
        .attr('class','pop-bars')
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
        .data(dataIn);

    popBars
        .append('rect')
        .attr('class','total-pop-bar')
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
        .attr('class','urban-pop-bar')
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
        .attr('class','pop-2050-bar')
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

    var translateX;
    var translateY;
    var translateXdeg;
    var translateYdeg;

    if (tracker.view == "overview"){
        console.log("overview");
        translateX = centerScaleX(centerCoords.overview.landSquares[0]);
        translateY = centerScaleY(centerCoords.overview.landSquares[1]);
        translateXdeg = centerScaleX(centerCoords.overview.degradedSquares[0]);
        translateYdeg = centerScaleY(centerCoords.overview.degradedSquares[1]);
    }
    else if (tracker.view == "compare"){
        console.log("compare");
        if (tracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs.landSquares[0]);
            translateY = centerScaleY(centerCoords.sbs.landSquares[1]);
            translateXdeg = centerScaleX(centerCoords.sbs.degradedSquares[0]);
            translateYdeg = centerScaleY(centerCoords.sbs.degradedSquares[1]);
        }
        else if(tracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.landSquares[0]);
            translateY = centerScaleY(centerCoords.rank.landSquares[1]);
            translateXdeg = centerScaleX(centerCoords.rank.degradedSquares[0]);
            translateYdeg = centerScaleY(centerCoords.rank.degradedSquares[1]);
        }
    }

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
        .attr('transform', 'translate(' + translateX + ',' + translateY + ')');

    var degradedSquareGroup = svg.selectAll('.degradedSquares-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'degraded-squares-group')
        .attr('transform', 'translate(' + translateXdeg + ',' + translateYdeg + ')');

    var statsGroup = svg.selectAll('.stats-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'stats-group')
        .attr('transform', 'translate(' + (margin.l + .70*width) + ',' + margin.t + ')');

   /*
    statsGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', 24)
        .attr('class','country-name')
        .attr('fill',typeCol);
    /*.text(function (d) {
     console.log('here');
     return d.FULLNAME + ', ' + d.year
     });

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

    */

    landSquaresGroup
        .append('rect')
         .attr('class','urban2050-square')
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
        .attr('class','forest-square')
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
        .attr('class','agriculture-square')
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
        .attr('class','arable-square')
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
        .attr('class','other-square')
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
        .attr('class','urban-square')
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

    var translateX;
    var translateY;

    if (tracker.view == "overview"){
        console.log("overview");
        translateX = centerScaleX(centerCoords.overview.crowdingSquares[0]);
        translateY = centerScaleY(centerCoords.overview.crowdingSquares[1]);
    }
    else if (tracker.view == "compare"){
        console.log("compare");
        if (tracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs.crowdingSquares[0]);
            translateY = centerScaleY(centerCoords.sbs.crowdingSquares[1]);
        }
        else if(tracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.crowdingSquares[0]);
            translateY = centerScaleY(centerCoords.rank.crowdingSquares[1]);
        }
    }

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
        .attr("xlink:href", function(d){ return './images/'+ Math.floor(countryCrowding.peoplePerKm) +'.png'});  //replace with link text built using countryCrowding, when imgs avail

    svg.append('rect')
        .attr('class','crowding-fill')
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
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
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
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
        .attr('fill', 'none')
        .attr('stroke-width',1)
        .attr('stroke','gray');


}

function drawFoodBars(countryFoodBalance){


    var translateX1;
    var translateY1;
    var translateX2;
    var translateY2;

    if (tracker.view == "overview"){
        console.log("overview");
        translateX1 = centerScaleX(centerCoords.overview.foodBar1[0]);
        translateY1 = centerScaleY(centerCoords.overview.foodBar1[1]);
        translateX2 = centerScaleX(centerCoords.overview.foodBar2[0]);
        translateY2 = centerScaleY(centerCoords.overview.foodBar2[1]);
    }
    else if (tracker.view == "compare"){
        console.log("compare");
        if (tracker.mode == "sbs"){
            translateX1 = centerScaleX(centerCoords.sbs.foodBar1[0]);
            translateY1 = centerScaleY(centerCoords.sbs.foodBar1[1]);
            translateX2 = centerScaleX(centerCoords.sbs.foodBar2[0]);
            translateY2 = centerScaleY(centerCoords.sbs.foodBar2[1]);
        }
        else if(tracker.mode == "rank"){
            translateX1 = centerScaleX(centerCoords.rank.foodBar1[0]);
            translateY1 = centerScaleY(centerCoords.rank.foodBar1[1]);
            translateX2 = centerScaleX(centerCoords.rank.foodBar2[0]);
            translateY2 = centerScaleY(centerCoords.rank.foodBar2[1]);;
        }
    }

    svg.append('rect')
        .attr('class','imports-bar')
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
        .attr('transform','translate(' + translateX1 + ',' + translateY1 + ')')
        .attr('fill','teal')
        .attr('fill-opacity',.3);


    svg.append('rect')
        .attr('class','produced-bar')
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
        .attr('transform','translate(' + translateX1 + ',' + translateY1 + ')')
        .attr('fill','purple')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('class','exports-bar')
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
        .attr('transform','translate(' + translateX2 + ',' + translateY2 + ')')
        .attr('fill','green')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('class','used-food-bar')
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
        .attr('transform','translate(' + translateX2 + ',' + translateY2 + ')')
        .attr('fill','magenta')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('class','used-nonfood-bar')
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
        .attr('transform','translate(' + translateX2 + ',' + translateY2 + ')')
        .attr('fill','blue')
        .attr('fill-opacity',.3);


    svg.append('rect')
        .attr('class','waste-bar')
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
        .attr('transform','translate(' + translateX2 + ',' + translateY2 + ')')
        .attr('fill','orange    ')
        .attr('fill-opacity',.3);
}

function drawCalories(countryCalories){
    console.log(countryCalories)

    var translateX;
    var translateY;

    if (tracker.view == "overview"){
        console.log("overview");
        translateX = centerScaleX(centerCoords.overview.calories[0]);
        translateY = centerScaleY(centerCoords.overview.calories[1]);
    }
    else if (tracker.view == "compare"){
        console.log("compare");
        if (tracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs.calories[0]);
            translateY = centerScaleY(centerCoords.sbs.calories[1]);
        }
        else if(tracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.calories[0]);
            translateY = centerScaleY(centerCoords.rank.calories[1]);
        }
    }


    svg.append('circle')
        .attr('class','calories-circ')
        .attr('cx',0)
        .attr('cy',0)
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
        .attr('r',calorieScale(countryCalories[0].total.avgPerCapFoodSupply))
        .attr('fill','orange')

}

function drawPCLandUse(){

}



//********************************************************
//  UPDATE functions
//********************************************************

function updateLandSquares(countryYearUpdate){
    svg.selectAll('.squares-group').data(countryYearUpdate);
    svg.selectAll('.degradedSquares-group').data(countryYearUpdate);
    svg.selectAll('.stats-group').data(countryYearUpdate);


    d3.selectAll ('.agriculture-square')
        .data(countryYearUpdate)
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
        });

    d3.selectAll('.forest-square')
        .data(countryYearUpdate)
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
        });

    d3.selectAll('.urban2050-square')
        .data(countryYearUpdate)
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
        });

    d3.selectAll('.arable-square')
        .data(countryYearUpdate)
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
        });

    d3.selectAll('.other-square')
        .data(countryYearUpdate)
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
        });

    d3.selectAll('.urban-square')
        .data(countryYearUpdate)
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
        });

}
function updatePopBars(countryYearUpdate){
    svg.selectAll('.pop-bars').data(countryYearUpdate);

    d3.selectAll('.total-pop-bar')
        .data(countryYearUpdate)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', function(d){
            return popLineScale(d.totalPop);
        })
        .attr('height', function(d){
            return 5;//popScale(d.totalPop);
        });

    d3.selectAll('.urban-pop-bar')
        .data(countryYearUpdate)
        .attr('x', 0)
        .attr('y', 0) //+ popScale(d.totalPop)-popScale(d.urbanPop)})
        .attr('width', function(d){
            return popLineScale(d.urbanPop);
        })
        .attr('height', function(d){
            return 5;//popScale(d.urbanPop);
        });

    d3.selectAll('.pop-2050-bar')
        .data(countryYearUpdate)
        .attr('x', 0)
        .attr('y', 0)// + popScale(d.totalPop)-popScale(d.totalPop2050)})
        .attr('width', function(d){
            return popLineScale(d.totalPop2050);
        })
        .attr('height', function(d){
            return 5;//popScale(d.totalPop2050);
        });

}

function updateCrowdingSquares(countryYearUpdate){
    //not sure why, but patterns don't appear to be updated on resetting xlink values and re-assigning fill parameters.
    //Instead, have to remove the pattern altogether and start over.
    d3.selectAll('defs').remove();

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
        .attr("xlink:href", function(d){ return './images/'+ Math.floor(countryYearUpdate[0].peoplePerKm) +'.png'});  //replace with link text built using countryCrowding, when imgs avail

    d3.selectAll('.crowding-fill')
        .attr('fill', 'url(#test-pattern)');


}
function updateFoodBars(balanceUpdate){


    d3.selectAll('.imports-bar')
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
            return foodBalanceScale(balanceUpdate[0].importQuantity);
        })

    d3.selectAll('.produced-bar')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(balanceUpdate[0].importQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            console.log(balanceUpdate[0].importQuantity);
            return foodBalanceScale(balanceUpdate[0].produced);
        })

    d3.selectAll('.exports-bar')
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
            return foodBalanceScale(balanceUpdate[0].exportQuantity);
        })

    d3.selectAll('.used-food-bar')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(balanceUpdate[0].exportQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(balanceUpdate[0].usedFood);
        })

    d3.selectAll('.used-nonfood-bar')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(balanceUpdate[0].usedFood) + foodBalanceScale(balanceUpdate[0].exportQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(balanceUpdate[0].usedNonFood);
        })

    d3.selectAll('.waste-bar')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(balanceUpdate[0].usedFood) + foodBalanceScale(balanceUpdate[0].exportQuantity) +foodBalanceScale(balanceUpdate[0].usedNonFood);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(balanceUpdate[0].waste);
        })

}
function updateCalories(pcLandUpdate){

    d3.selectAll('.calories-circ')
        .attr('r',calorieScale(pcLandUpdate[0].total.avgPerCapFoodSupply));

}
function updateLandReqts(){

}


//********************************************************
// Click events
//********************************************************


function overviewClicked(){
    console.log('overview clicked');

    d3.selectAll('#overview-button').classed('selected', true);
    d3.selectAll('#compare-button').classed('selected', false);
    d3.selectAll('#right-dropdown').remove();

    tracker.init = true;
    tracker.view = "overview";
}


function compareClicked(){
    console.log('compare clicked');

    if (tracker.view == "overview"){

        d3.selectAll('#compare-button').classed('selected', true);
        d3.selectAll('#overview-button').classed('selected', false);


        addDropdown();

        //parse country list for dropdown
        dropdownValues.forEach(function (n) {
            d3.select("#right-dropdown") //class in the html file
                .append("option") //it has to be called this name
                .html(n.FULLNAME) //what is going to be written in the text
                .attr("value", n.NAME); //what is going to be written in value
            //.style('background','blue'); //change background color (useful for styling multiple levels of aggregation)
        });

        console.log(d3.selectAll('.radio'));

        //if (d3.selectAll('.radio'))

        $('<br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"sbs-radio", name:"mode"}).appendTo('#body-text').attr('checked',true);
        $('<label />', { 'for': "sbs-radio", text: "Side-by-side comparison" }).appendTo('#body-text');

        $('<br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"rank-radio", name:"mode"}).appendTo('#body-text').attr('checked',false);
        $('<label />', { 'for': "rank-radio", text: "All countries (ranking)" }).appendTo('#body-text');

        $('<br><br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"pop-radio", name:"varType"}).appendTo('#body-text').attr('checked',true);
        $('<label />', { 'for': "pop-radio", text: "Population and crowding" }).appendTo('#body-text');

        $('<br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"land-radio", name:"varType"}).appendTo('#body-text').attr('checked',false);
        $('<label />', { 'for': "land-radio", text: "Land usage and degradation" }).appendTo('#body-text');

        $('<br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"food-radio", name:"varType"}).appendTo('#body-text').attr('checked',false);
        $('<label />', { 'for': "food-radio", text: "Food consumption and land use" }).appendTo('#body-text');

        //add event listener to radio buttons
        $(".radio").change(function () {

            console.log(this, d3.select(this).attr('id'));

            if ($("#pop-radio").attr("checked")) {
                $("#land-radio").attr("checked",false);
                $("#food-radio").attr("checked",false);
                $('#pop-radioedit:input').removeAttr('disabled');
            }
            else {
                $('#pop-radioedit:input').attr('disabled', 'disabled');
            }

            if (d3.select(this).attr('id') == "land-radio"){
                tracker.varType = "land";
                updateData();
            }
            else if (d3.select(this).attr('id') == "food-radio"){
                tracker.varType = "food";
                updateData();
            }
            else if (d3.select(this).attr('id') == "pop-radio"){
                tracker.varType = "population";
                updateData();
            }


        });

    }

    tracker.init = true;
    tracker.view = "compare";

    updateData();

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