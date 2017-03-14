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

//store template text for re-building side panel later
var bodyText = d3.selectAll('#body-text').html();

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

countryTracker = {country:{l:"US",r:"CN"}, init:true, year:{l:2003,r:1975}, view:"overview",mode:"sbs",varType:"population",sort:"alph",sortVar:"bal_importQuantity"};
importedData = [];
balanceData =[];
pcLandUse=[];
dropdownValues = []; //global used to populate the dropdown selections
sortData = []; //used to store country-only objects for the rank page sorting

//check that sliders and labels agree with countryTracker default values (can remove when slider built in script rather than HTML)
d3.selectAll('#slider-left').property("value",countryTracker.year.l).property('innerHTML',countryTracker.year.l);
d3.selectAll('#slider-right').property("value",countryTracker.year.r).property('innerHTML',countryTracker.year.r);
d3.selectAll('#slider-left-label').property('innerHTML',countryTracker.year.l);
d3.selectAll('#slider-right-label').property('innerHTML',countryTracker.year.r);

centerScaleX = d3.scaleLinear().domain([0, 1]).range([0, width]);
centerScaleY = d3.scaleLinear().domain([0, 1]).range([0, height]);

/*
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
*/

//controls transform/translate properties of each subdrawing
centerCoords = {
    overview: {
        popBars: [.06, .11],
        landSquares: [.4, .9],
        degradedSquares: [.7, .9],  //note: these values are based on the default 450 px svg height; for the overview page, expands to 550 px
        crowdingSquares: [.06, .3],
        foodBar1: [.06, .9],
        foodBar2: [.16, .9],
        calories: [.4, .29],
        perCapita: [.7, .3]
    },
    overviewLabels: {
        popBars: [.06, .08],
        landSquares: [.4, .85],
        degradedSquares: [.7, .85],
        crowdingSquares: [.06, .23],
        foodBar1: [.06, .85],
        foodBar2: [.16, .85],
        calories: [.4, .23],
        perCapita: [.7, .23]
    },
    sbs: {
        l:{
            popBars: [.06, .1],
            landSquares: [.06, .1],
            degradedSquares: [.33, .1],
            crowdingSquares: [.06, .2],
            foodBar1: [.06, .1],
            foodBar2: [.15, .1],
            calories: [.3, .1],
            perCapita: [.6, .1]
        },
        r:{
            popBars: [.56, .1],
            landSquares: [.56, .1],
            degradedSquares: [.83, .1],
            crowdingSquares: [.56, .2],
            foodBar1: [.56, .1],
            foodBar2: [.65, .1],
            calories: [.8, .1],
            perCapita: [.56, .1]
        }},
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

/*
 centerCoords = {
 overview: {
 popBars: [.06, .11],
 landSquares: [.2, .55],
 degradedSquares: [.4, .3],
 crowdingSquares: [.7, .3],
 foodBar1: [.06, .9],
 foodBar2: [.16, .9],
 calories: [.4, .9],
 perCapita: [.7, .9]
 },
 overviewLabels: {
 popBars: [.06, .08],
 landSquares: [.06, .23],
 degradedSquares: [.4, .23],
 crowdingSquares: [.7, .23],
 foodBar1: [.06, .85],
 foodBar2: [.16, .85],
 calories: [.4, .85],
 perCapita: [.7, .85]
 },
 sbs: {
 l:{
 popBars: [.06, .1],
 landSquares: [.2, .3],
 degradedSquares: [.4, .3],
 crowdingSquares: [.13, .4],
 foodBar1: [.06, .1],
 foodBar2: [.16, .1],
 calories: [.35, .2],
 perCapita: [.6, .1]
 },
 r:{
 popBars: [.56, .1],
 landSquares: [.75, .3],
 degradedSquares: [.95, .3],
 crowdingSquares: [.63, .4],
 foodBar1: [.56, .1],
 foodBar2: [.66, .1],
 calories: [.85, .2],
 perCapita: [.56, .1]
 }},
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



*/

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


//more scale factors for ranking page bar charts

var rankMargin = {top: 8, right: 20, bottom: 110, left: 100};
var rankMargin2 = {top: 370, right: 20, bottom: 30, left: 100};

var rankWidth = document.getElementById('vis').clientWidth - rankMargin.left - rankMargin.right;
var rankHeight = document.getElementById('vis').clientHeight - rankMargin.top - rankMargin.bottom;
var rankHeight2 = document.getElementById('vis').clientHeight - rankMargin2.top - rankMargin2.bottom;

//Set up scales and axes, brushes, and area generators
var rankX = d3.scaleBand().rangeRound([0, rankWidth]).padding(0.1),
    rankX2 = d3.scaleBand().rangeRound([0, rankWidth]).padding(0.1),

    //.invert needed for brush doesn't work on a non-continuous scale; make a shadow scale instead
    contrankX2 = d3.scaleLinear().range([0, rankWidth]),
    rankY = d3.scaleLinear().range([rankHeight, 0]),
    rankY2 = d3.scaleLinear().range([rankHeight2, 0]);

var rankXAxis = d3.axisBottom(rankX);
var rankXAxis2 = d3.axisBottom(rankX2);
var rankYAxis = d3.axisLeft(rankY);

var brush,
    focus,
    context;











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
        if (countryTracker.init == true){
            return "left-dropdown";
        }
        else{
            return "right-dropdown";
        }
    });


    if (countryTracker.init == true){
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
            .html("China") //what is going to be written in the text
            .attr("value", "CN");

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
            countryTracker.country.l = countrySelected;
        }
        else if (whichDropdown == "right"){
            countryTracker.country.r = countrySelected;
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
    //.defer(d3.csv, "./data/soilData_allyrs1019.csv")
    //.defer(d3.csv, './data/balanceSheetData.csv')
    .defer(d3.json,'./data/perCapitaLandUseRequirements.json')
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, pcLandUseIn) {//soilData, balanceDataIn, pcLandUseIn) {

        //balanceData.filter(function(d){return d.countryName == countryTracker.country});
        //importedData = soilData;
        //balanceData = balanceDataIn;
        pcLandUse = pcLandUseIn;

        updateData();
    });


function updateData() {

    //set up initial crossfilter
    //var cf = crossfilter(importedData);

    var pc = crossfilter(pcLandUse);


    //add a dimension using the year value
    // var byYear = cf.dimension(function (d) {
    //     return +d.year;
    // });


    var pcByYear = pc.dimension(function (d) {
        return +d.year;
    });

    //pcLandUse.forEach(function(d){console.log(d.fullname)});


    var pcByCountry = pc.dimension(function (d) {
        return d.countryCode;
    });

    /*
    //add another dimension that groups by country
    var byCountry = cf.dimension(function (d) {
        //console.log(d);
        return d.NAME;
    });
    */

    //console.log(byCountry.top(Infinity));  //returns the entire original array of objects
    //console.log(byCountry.group().top(Infinity));  //returns an array of 197 countries, with counts for each (no objects)
    //console.log(byCountry.filter(function(d){return d}).group().top(Infinity));  //same as above
    //console.log(byCountry.filterExact("Argentina").top(Infinity));  //returns all years for Argentina, as objects

    //var countryPop = byCountry.filterExact(countryTracker.country.l).top(Infinity);

    //get data for Argentina in 2010
    //console.log(byCountry.filterExact(countryTracker.country).top(Infinity).filter(function(d){return d.year == '2010';}));
    //var countryYear = byCountry.filterExact(countryTracker.country.l).top(Infinity).filter(function(d){return d.year == countryTracker.year;});

    var pcYearL = pcByCountry.top(Infinity).filter(function(d){return d.year == countryTracker.year.l;});
    var pcCountryYearL = pcByCountry.filterExact(countryTracker.country.l).top(Infinity).filter(function(d){return d.year == countryTracker.year.l;});

    var pcCountryYearR;

    if (countryTracker.mode == "sbs"){
        pcCountryYearR = pcByCountry.filterExact(countryTracker.country.r).top(Infinity).filter(function(d){return d.year == countryTracker.year.r;});
    }
    if (countryTracker.mode == "rank"){
        //store all country objects in an array for rank page sorting
        sortData = pcYearL.filter(function(d){return d.dataType == "country";});
    }


    //console.log(pcByCountry.filterExact('US').top(Infinity));

    //console.log(countryTracker.country.l, countryTracker.year);
    console.log(pcCountryYearL);

    //var data2010 = byYear.filterExact("2010").top(Infinity);  //return an array with all countries with objects from 2015
    //var databyCountry = byCountry.filter(function(d) {
    //    return d;
    //});


    //countryArray = pcCountryYear.top(Infinity).slice();

    //console.log(pcCountryYear);

    dropdownValues = pcYearL.sort(function(a,b){
        //needs a case-insensitive alphabetical sort
        return a.fullname.toLowerCase().localeCompare(b.fullname.toLowerCase());
    });


    //parse country list for dropdown
    dropdownValues.forEach(function (n) {
        d3.select("#left-dropdown") //class in the html file
            .append("option") //it has to be called this name
            .html(n.fullname) //what is going to be written in the text
            .attr("value", n.countryCode) //what is going to be written in value
            .style('background',function(){
                if(n.dataType == 'country'){
                    return 'none';
                }
                else{
                    return 'gray';
                }
            }); //change background color (useful for styling multiple levels of aggregation)
    });

//**********sortData =


    //console.log(testSort.slice(0,4));

    //balanceData.max(function(d){return })

    //Math.max(balanceData.map(function(o){return o.total;}))

    //countryBalance = balanceData.filter(function(d){return d.countryCode == countryTracker.country.l && d.year == countryTracker.year});

    //console.log(countryTracker.view);

    //drawPopBars(pcCountryYearL);

    console.log(countryTracker.init, countryTracker.mode, countryTracker.varType);


    if (countryTracker.init == true){
        if (countryTracker.view == "overview"){

            d3.selectAll('#vis').style('height',550);

            //slider view can be turned on/off using, but better to move construction/removal to jQuery to use common template
            //d3.selectAll('.anim-div').style('display','none');
            //d3.selectAll('.anim-div').style('display','block');

            //reset scaling functions to match data (scale to just a single country)
            landAreaScale.range([0,width*.18]).domain([0, Math.max(pcCountryYearL[0].lu_landArea,pcCountryYearL[0].pc_totalLandReq)]);
            popLineScale.range([0,width*.5]).domain([0, pcCountryYearL[0].lu_totalPop]);
            foodBalanceScale.range([0,height*.4])
                .domain(
                    [0,
                        Math.max(
                            (pcCountryYearL[0].bal_importQuantity + pcCountryYearL[0].bal_produced),
                            (pcCountryYearL[0].bal_exportQuantity + pcCountryYearL[0].bal_usedFood + pcCountryYearL[0].bal_usedNonFood + pcCountryYearL[0].bal_waste)
                        )]);

            drawPopBars(pcCountryYearL, 'l');
            drawLandSquares(pcCountryYearL, 'l');
            drawCrowdingSquares(pcCountryYearL, 'l');
            drawFoodBars(pcCountryYearL, 'l');
            drawCalories(pcCountryYearL, 'l');
            drawPCLandUse(pcCountryYearL, 'l');
        }
        else if (countryTracker.view == "compare"){
            svg.selectAll('*').remove();

            console.log(countryTracker.mode, countryTracker.varType);
            if(countryTracker.mode == "sbs"){
                //reset scale factors using max of two countries selected
                landAreaScale.range([0,width*.18]).domain([0, Math.max(pcCountryYearL[0].lu_landArea,pcCountryYearL[0].pc_totalLandReq,pcCountryYearR[0].lu_landArea,pcCountryYearR[0].pc_totalLandReq)]);
                popLineScale.range([0,width*.4]).domain([0, Math.max(pcCountryYearL[0].lu_totalPop,pcCountryYearR[0].lu_totalPop)]);
                foodBalanceScale.range([0,height*.4])
                    .domain(
                        [0,
                            Math.max(
                                (pcCountryYearL[0].bal_importQuantity + pcCountryYearL[0].bal_produced),
                                (pcCountryYearL[0].bal_exportQuantity + pcCountryYearL[0].bal_usedFood + pcCountryYearL[0].bal_usedNonFood + pcCountryYearL[0].bal_waste),
                                (pcCountryYearR[0].bal_importQuantity + pcCountryYearR[0].bal_produced),
                                (pcCountryYearR[0].bal_exportQuantity + pcCountryYearR[0].bal_usedFood + pcCountryYearR[0].bal_usedNonFood + pcCountryYearR[0].bal_waste)
                            )]);


                if(countryTracker.varType == "population"){
                    drawPopBars(pcCountryYearL,'l');
                    drawCrowdingSquares(pcCountryYearL, 'l');

                    drawPopBars(pcCountryYearR,'r');
                    drawCrowdingSquares(pcCountryYearR, 'r');
                }
                else if(countryTracker.varType == "food"){
                    drawFoodBars(pcCountryYearL, 'l');
                    drawCalories(pcCountryYearL, 'l');

                    drawFoodBars(pcCountryYearR, 'r');
                    drawCalories(pcCountryYearR, 'r');
                    //drawLandReqts
                }
                else if(countryTracker.varType == "land"){
                    console.log('compare land')
                    drawLandSquares(pcCountryYearL,'l');
                    drawLandSquares(pcCountryYearR,'r');
                }


                if (d3.select('#slider-left').node() == null){
                    makeSlider('left');
                }
                if (d3.select('#slider-right').node() == null) {
                    makeSlider('right');
                }
            }
            else if(countryTracker.mode == "rank"){
                drawRank(sortData);
                d3.select('#slider-right').remove();
                d3.select('#slider-right-label').remove();
            }


        }

        countryTracker.init = false;
    }

    else {


        if(countryTracker.mode == "rank"){
            updateRank(sortData);
        }

        else {

            if (countryTracker.view == "overview"){

                //reset scaling functions to match data (scale to just a single country)
                landAreaScale.range([0,width*.18]).domain([0, Math.max(pcCountryYearL[0].lu_landArea,pcCountryYearL[0].pc_totalLandReq)]);
                popLineScale.range([0,width*.5]).domain([0, pcCountryYearL[0].lu_totalPop]);
                foodBalanceScale.range([0,height*.4])
                    .domain(
                        [0,
                            Math.max(
                                (pcCountryYearL[0].bal_importQuantity + pcCountryYearL[0].bal_produced),
                                (pcCountryYearL[0].bal_exportQuantity + pcCountryYearL[0].bal_usedFood + pcCountryYearL[0].bal_usedNonFood + pcCountryYearL[0].bal_waste)
                            )]);
            }

            updatePopBars(pcCountryYearL,'l');
            updateCrowdingSquares(pcCountryYearL, 'l');

            updateLandSquares(pcCountryYearL,'l');
            updateFoodBars(pcCountryYearL,'l');
            updateCalories(pcCountryYearL,'l');
            updateLandReqts(pcCountryYearL,'l');


            //if side-by-side mode is on, update the right hand side, too
            if (countryTracker.view == "compare" && countryTracker.mode == "sbs"){

                //reset scale factors using max of two countries selected
                landAreaScale.range([0,width*.18]).domain([0, Math.max(pcCountryYearL[0].lu_landArea,pcCountryYearL[0].pc_totalLandReq,pcCountryYearR[0].lu_landArea,pcCountryYearR[0].pc_totalLandReq)]);
                popLineScale.range([0,width*.4]).domain([0, Math.max(pcCountryYearL[0].lu_totalPop,pcCountryYearR[0].lu_totalPop)]);
                foodBalanceScale.range([0,height*.4])
                    .domain(
                        [0,
                            Math.max(
                                (pcCountryYearL[0].bal_importQuantity + pcCountryYearL[0].bal_produced),
                                (pcCountryYearL[0].bal_exportQuantity + pcCountryYearL[0].bal_usedFood + pcCountryYearL[0].bal_usedNonFood + pcCountryYearL[0].bal_waste),
                                (pcCountryYearR[0].bal_importQuantity + pcCountryYearR[0].bal_produced),
                                (pcCountryYearR[0].bal_exportQuantity + pcCountryYearR[0].bal_usedFood + pcCountryYearR[0].bal_usedNonFood + pcCountryYearR[0].bal_waste)
                            )]);

                updatePopBars(pcCountryYearR,'r');
                updateCrowdingSquares(pcCountryYearR, 'r');

                updateLandSquares(pcCountryYearR,'r');
                updateFoodBars(pcCountryYearR,'r');
                updateCalories(pcCountryYearR,'r');
                updateLandReqts(pcCountryYearR,'r')
            }
        }

    }


}

/*
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
*/

function drawPopBars(dataIn,graph){

    var translateX;
    var translateY;

    if (countryTracker.view == "overview"){
        translateX = centerScaleX(centerCoords.overview.popBars[0]);
        translateY = centerScaleY(centerCoords.overview.popBars[1]);
    }
    else if (countryTracker.view == "compare"){
        if (countryTracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs[graph].popBars[0]);
            translateY = centerScaleY(centerCoords.sbs[graph].popBars[1]);
        }
        else if(countryTracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.popBars[0]);
            translateY = centerScaleY(centerCoords.rank.popBars[1]);
        }
    }


    var popBars = svg.append('g')
        .attr('class','pop-bars-' + graph)
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
        .data(dataIn);

    if (countryTracker.view == "overview"){
        svg.append('text')
            .attr('x', width*centerCoords.overviewLabels.popBars[0])
            .attr('y', height*centerCoords.overviewLabels.popBars[1])
            .style('font-size', 16)
            .attr('class','pop-label')
            .attr('fill',typeCol)
            .text('Population');
    }


    console.log(dataIn);

    popBars
        .append('rect')
        .attr('class','total-pop-bar-' + graph)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', function(d){
            return popLineScale(d.lu_totalPop);
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
        .attr('class','urban-pop-bar-' + graph)
        .attr('x', 0)
        .attr('y', 0) //+ popScale(d.totalPop)-popScale(d.urbanPop)})
        .attr('width', function(d){
            return popLineScale(d.lu_urbanPop);
        })
        .attr('height', function(d){
            return 5;//popScale(d.urbanPop);
        })
        .attr('fill','rgba(50,50, 50,.7)')
        .style('stroke-width', ".5px")
        .attr('stroke','rgb(200,200, 200)')
        .style('fill-opacity','1');

    /*
    popBars
        .append('rect')
        .attr('class','pop-2050-bar')
        .attr('x', 0)
        .attr('y', 0)// + popScale(d.totalPop)-popScale(d.totalPop2050)})
        .attr('width', function(d){
            return popLineScale(d.lu_totalPop2050);
        })
        .attr('height', function(d){
            return 5;//popScale(d.totalPop2050);
        })
        .attr('fill','none')
        .style('stroke-dasharray', ("1.5,2.5"))
        .style('stroke-width', ".5px")
        .attr('stroke','gray');
    */

}

function drawLandSquares(countryObject, graph){



    console.log(countryObject, graph);

    var translateX;
    var translateY;
    var translateXdeg;
    var translateYdeg;

    if (countryTracker.view == "overview"){
        console.log("overview");
        translateX = centerScaleX(centerCoords.overview.landSquares[0]);
        translateY = centerScaleY(centerCoords.overview.landSquares[1]);
        translateXdeg = centerScaleX(centerCoords.overview.degradedSquares[0]);
        translateYdeg = centerScaleY(centerCoords.overview.degradedSquares[1]);
    }
    else if (countryTracker.view == "compare"){
        console.log("compare");
        if (countryTracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs[graph].landSquares[0]);
            translateY = centerScaleY(centerCoords.sbs[graph].landSquares[1]);
            translateXdeg = centerScaleX(centerCoords.sbs[graph].degradedSquares[0]);
            translateYdeg = centerScaleY(centerCoords.sbs[graph].degradedSquares[1]);
        }
        else if(countryTracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.landSquares[0]);
            translateY = centerScaleY(centerCoords.rank.landSquares[1]);
            translateXdeg = centerScaleX(centerCoords.rank.degradedSquares[0]);
            translateYdeg = centerScaleY(centerCoords.rank.degradedSquares[1]);
        }
    }



    //console.log(width,height);
    d3.selectAll('.squares-group').remove();
    d3.selectAll('.stats-group').remove();

    var squareCentersX = landAreaScale(Math.max(countryObject[0].lu_agriculturalLand, countryObject[0].lu_otherLand, countryObject[0].lu_urbanLand));
    var squareCentersY = landAreaScale(Math.max(countryObject[0].lu_agriculturalLand, countryObject[0].lu_urbanLand, countryObject[0].lu_forestArea));

    var landSquaresGroup = svg.selectAll('.squares-group-' + graph)
        .data(countryObject)
        .enter()
        .append('g')
        .attr('class', 'squares-group-' + graph)
        .attr('transform', 'translate(' + (translateX) + ',' + (translateY) + ')');


    var degradedSquareGroup = svg.selectAll('.degradedSquares-group-' + graph)
        .data(countryObject)
        .enter()
        .append('g')
        .attr('class', 'degraded-squares-group-' + graph)
        .attr('transform', 'translate(' + translateXdeg + ',' + translateYdeg + ')');


    if (countryTracker.view == "overview"){
        svg.append('text')
            .attr('x', width*centerCoords.overviewLabels.landSquares[0])
            .attr('y', height*centerCoords.overviewLabels.landSquares[1])
            .style('font-size', 16)
            .attr('class','land-use-label')
            .attr('fill',typeCol)
            .text('How land is used');

        svg.append('text')
            .attr('x', width*centerCoords.overviewLabels.degradedSquares[0])
            .attr('y', height*centerCoords.overviewLabels.degradedSquares[1])
            .style('font-size', 16)
            .attr('class','degraded-label')
            .attr('fill',typeCol)
            .text('Degraded Land');
    }



    /*var statsGroup = svg.selectAll('.stats-group-' + graph)
        .data(countryObject)
        .enter()
        .append('g')
        .attr('class', 'stats-group-' + graph)
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
         .attr('class','urban2050-square-' + graph)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_urbanLand2050);
        })
        .attr('y', function (d) {
            return 0;
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_urbanLand2050)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_urbanLand2050)
        })
         .attr('fill', 'none')
         .attr('stroke', 'grey')
         .attr('stroke-dasharray', '4,4');

    landSquaresGroup
        .append('rect')
        .attr('class','forest-square-' + graph)
        .attr('x', function (d) {
            return squareCentersX;
        })
        .attr('y', function (d) {
            return squareCentersY-landAreaScale(d.lu_forestArea)
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_forestArea)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_forestArea)
        })
        .attr('fill', forestCol);

    landSquaresGroup
        .append('rect')
        .attr('class','agriculture-square-' + graph)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_agriculturalLand)
        })
        .attr('y', function (d) {
            return squareCentersY-landAreaScale(d.lu_agriculturalLand)
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_agriculturalLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_agriculturalLand)
        })
        .attr('fill', agricCol);

    landSquaresGroup
        .append('rect')
        .attr('class','arable-square-' + graph)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_arableLand)
        })
        .attr('y', function (d) {
            return squareCentersY-landAreaScale(d.lu_arableLand)
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_arableLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_arableLand)
        })
        .attr('fill', arableCol);

    landSquaresGroup
        .append('rect')
        .attr('class','other-square-' + graph)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_otherLand)
        })
        .attr('y', function (d) {
            return squareCentersY;
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_otherLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_otherLand)
        })
        .attr('fill', otherCol);

    landSquaresGroup
        .append('rect')
        .attr('class','urban-square-' + graph)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_urbanLand);
        })
        .attr('y', function (d) {
            return squareCentersY;
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_urbanLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_urbanLand)
        })
        .attr('fill', urbanCol);


     degradedSquareGroup
         .append('rect')
             .attr('class','degrading-square-' + graph)
         .attr('x', function (d) {
            return 0;//landAreaScale(d.lu_degradingArea)/2 - landAreaScale(d.lu_degradingArea);
         })
         .attr('y', function (d) {
            return 0;//landAreaScale(d.lu_degradingArea)/2 - landAreaScale(d.lu_degradingArea);
         })
         .attr('width', function (d) {
            return landAreaScale(d.lu_degradingArea)
         })
         .attr('height', function (d) {
            return landAreaScale(d.lu_degradingArea)
         })
         .attr('fill', degradCol);

}

function drawCrowdingSquares(countryCrowding, graph){

    console.log('crowd sq', graph);

    var translateX;
    var translateY;

    if (countryTracker.view == "overview"){
        console.log("overview");
        translateX = centerScaleX(centerCoords.overview.crowdingSquares[0]);
        translateY = centerScaleY(centerCoords.overview.crowdingSquares[1]);
    }
    else if (countryTracker.view == "compare"){
        console.log("compare");
        if (countryTracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs[graph].crowdingSquares[0]);
            translateY = centerScaleY(centerCoords.sbs[graph].crowdingSquares[1]);
        }
        else if(countryTracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.crowdingSquares[0]);
            translateY = centerScaleY(centerCoords.rank.crowdingSquares[1]);
        }
    }


    if (countryTracker.view == "overview"){
        svg.append('text')
            .attr('x', width*centerCoords.overviewLabels.crowdingSquares[0])
            .attr('y', height*centerCoords.overviewLabels.crowdingSquares[1])
            .style('font-size', 16)
            .attr('class','crowding-label')
            .attr('fill',typeCol)
            .text('Crowding (people per sq. km)');
    }



    var pattern = svg.append("defs")
        .append("pattern")
        .attr('class','patt-'+ graph)
        .attr('id',function(d){ return 'test-pattern-' + graph;})
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('patternContentUnits',"objectBoundingBox")
        .attr('viewBox',"0 0 1 1")
        .attr('preserveAspectRatio',"xMidYMid slice")
        .append('image')
        .attr("height", 1)
        .attr("width", 1)
        .attr('preserveAspectRatio',"xMidYMid slice")
        .attr("xlink:href", function(d){ return './images/'+ Math.floor(countryCrowding[0].lu_peoplePerSqKm) +'.png'});  //replace with link text built using countryCrowding, when imgs avail

    svg.append('rect')
        .attr('class','crowding-fill-' + graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return 0
        })
        .attr('width',function(d){
            return 100
        })
        .attr('height',function(d){
            return 100
        })
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
        .attr('fill', 'url(#test-pattern-'+ graph+ ')');

    svg.append('rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return 0
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

function drawFoodBars(countryFoodBalance, graph){


    var translateX1;
    var translateY1;
    var translateX2;
    var translateY2;

    if (countryTracker.view == "overview"){
        console.log("overview");
        translateX1 = centerScaleX(centerCoords.overview.foodBar1[0]);
        translateY1 = centerScaleY(centerCoords.overview.foodBar1[1]);
        translateX2 = centerScaleX(centerCoords.overview.foodBar2[0]);
        translateY2 = centerScaleY(centerCoords.overview.foodBar2[1]);
    }
    else if (countryTracker.view == "compare"){
        console.log("compare", graph);
        if (countryTracker.mode == "sbs"){
            translateX1 = centerScaleX(centerCoords.sbs[graph].foodBar1[0]);
            translateY1 = centerScaleY(centerCoords.sbs[graph].foodBar1[1]);
            translateX2 = centerScaleX(centerCoords.sbs[graph].foodBar2[0]);
            translateY2 = centerScaleY(centerCoords.sbs[graph].foodBar2[1]);
        }
        else if(countryTracker.mode == "rank"){
            translateX1 = centerScaleX(centerCoords.rank.foodBar1[0]);
            translateY1 = centerScaleY(centerCoords.rank.foodBar1[1]);
            translateX2 = centerScaleX(centerCoords.rank.foodBar2[0]);
            translateY2 = centerScaleY(centerCoords.rank.foodBar2[1]);
        }
    }

    if (countryTracker.view == "overview"){
        svg.append('text')
            .attr('x', width*centerCoords.overviewLabels.foodBar1[0])
            .attr('y', height*centerCoords.overviewLabels.foodBar1[1])
            .style('font-size', 16)
            .attr('class','food-bars-label')
            .attr('fill',typeCol)
            .text('Food Balance');
    }


    svg.append('rect')
        .attr('class','imports-bar-' + graph)
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
            return foodBalanceScale(countryFoodBalance[0].bal_importQuantity);
        })
        .attr('transform','translate(' + translateX1 + ',' + translateY1 + ')')
        .attr('fill','teal')
        .attr('fill-opacity',.3);


    svg.append('rect')
        .attr('class','produced-bar-'+ graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(countryFoodBalance[0].bal_importQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(countryFoodBalance[0].bal_produced);
        })
        .attr('transform','translate(' + translateX1 + ',' + translateY1 + ')')
        .attr('fill','purple')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('class','exports-bar-' + graph)
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
            return foodBalanceScale(countryFoodBalance[0].bal_exportQuantity);
        })
        .attr('transform','translate(' + translateX2 + ',' + translateY2 + ')')
        .attr('fill','green')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('class','used-food-bar-' + graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(countryFoodBalance[0].bal_exportQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(countryFoodBalance[0].bal_usedFood);
        })
        .attr('transform','translate(' + translateX2 + ',' + translateY2 + ')')
        .attr('fill','magenta')
        .attr('fill-opacity',.3);

    svg.append('rect')
        .attr('class','used-nonfood-bar-' + graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(countryFoodBalance[0].bal_usedFood) + foodBalanceScale(countryFoodBalance[0].bal_exportQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(countryFoodBalance[0].bal_usedNonFood);
        })
        .attr('transform','translate(' + translateX2 + ',' + translateY2 + ')')
        .attr('fill','blue')
        .attr('fill-opacity',.3);


    svg.append('rect')
        .attr('class','waste-bar-' + graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(countryFoodBalance[0].bal_usedFood) + foodBalanceScale(countryFoodBalance[0].bal_exportQuantity) +foodBalanceScale(countryFoodBalance[0].bal_usedNonFood);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(countryFoodBalance[0].bal_waste);
        })
        .attr('transform','translate(' + translateX2 + ',' + translateY2 + ')')
        .attr('fill','orange    ')
        .attr('fill-opacity',.3);
}

function drawCalories(countryCalories, graph){

    var translateX;
    var translateY;

    if (countryTracker.view == "overview"){
        console.log("overview");
        translateX = centerScaleX(centerCoords.overview.calories[0]);
        translateY = centerScaleY(centerCoords.overview.calories[1]);
    }
    else if (countryTracker.view == "compare"){
        console.log("compare");
        if (countryTracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs[graph].calories[0]);
            translateY = centerScaleY(centerCoords.sbs[graph].calories[1]);
        }
        else if(countryTracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.calories[0]);
            translateY = centerScaleY(centerCoords.rank.calories[1]);
        }
    }


    if (countryTracker.view == "overview"){
        svg.append('text')
            .attr('x', width*centerCoords.overviewLabels.calories[0])
            .attr('y', height*centerCoords.overviewLabels.calories[1])
            .style('font-size', 16)
            .attr('class','calories-label')
            .attr('fill',typeCol)
            .text('Calories per person');
    }


    svg.append('circle')
        .attr('class','calories-circ-' + graph)
        .attr('cx',calorieScale(countryCalories[0].pc_avgPerCapFoodSupply))
        .attr('cy',calorieScale(countryCalories[0].pc_avgPerCapFoodSupply))
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
        .attr('r',calorieScale(countryCalories[0].pc_avgPerCapFoodSupply))
        .attr('fill','orange')

}

function drawPCLandUse(landReqts){

    var translateX;
    var translateY;

    if (countryTracker.view == "overview"){
        console.log("overview");
        translateX = centerScaleX(centerCoords.overview.perCapita[0]);
        translateY = centerScaleY(centerCoords.overview.perCapita[1]);
    }
    else if (countryTracker.view == "compare"){
        console.log("compare");
        if (countryTracker.mode == "sbs"){
            translateX = centerScaleX(centerCoords.sbs.perCapita[0]);
            translateY = centerScaleY(centerCoords.sbs.perCapita[1]);
        }
        else if(countryTracker.mode == "rank"){
            translateX = centerScaleX(centerCoords.rank.perCapita[0]);
            translateY = centerScaleY(centerCoords.rank.perCapita[1]);
        }
    }

    var cornerPos = 0;//-landAreaScale(Math.max(landReqts[0].lu_landArea, landReqts[0].pc_perCapLandReq))/2;

    if (countryTracker.view == "overview"){
        svg.append('text')
            .attr('x', width*centerCoords.overviewLabels.perCapita[0])
            .attr('y', height*centerCoords.overviewLabels.perCapita[1])
            .style('font-size', 16)
            .attr('class','calories-label')
            .attr('fill',typeCol)
            .text('Land needed to grow food');
    }


    svg.append('rect')
        .attr('class','pc-land-rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return 0
        })
        .attr('width',function(d){
            return landAreaScale(landReqts[0].pc_totalLandReq)
        })
        .attr('height',function(d){
            return landAreaScale(landReqts[0].pc_totalLandReq)
        })
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
        .attr('fill', 'none')
        .attr('stroke-width',1)
        .attr('stroke-dasharray',function(){
            if (landAreaScale(landReqts[0].pc_totalLandReq) < 20){
                return 0;
            }
            else{
                return 4;
            }
        })
        .attr('stroke','orange');

    svg.append('rect')
        .attr('class','total-land-rect')
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return 0
        })
        .attr('width',function(d){
            return landAreaScale(landReqts[0].lu_landArea)
        })
        .attr('height',function(d){
            return landAreaScale(landReqts[0].lu_landArea)
        })
        .attr('transform','translate(' + translateX + ',' + translateY + ')')
        .attr('fill', 'none')
        .attr('stroke-width',1)
        .attr('stroke','gainsboro');

}


















function drawRank(rankData){

    console.log(rankData);

    brush = d3.brushX() //replace with d3.brush() to add in y-axis brushing
        .extent([[0, 0], [rankWidth,rankHeight2]])  //sets the range of values over which selection can occur ([[minX, miny],[maxX,maxy]])
        .on("brush end", brushed);

    focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + rankMargin.left + "," + rankMargin.top + ")");

    context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + rankMargin2.left + "," + rankMargin2.top + ")");


    var sorted = rankData.sort(function(a,b){return a.year-b.year});

    sorted = rankData.sort(function(a,b){
        //needs a case-insensitive alphabetical sort
        return a.fullname.toLowerCase().localeCompare(b.fullname.toLowerCase());
    });

    sortData = sorted;

    //map axes onto rankData
    rankX.domain(sorted.map(function (d) {
        return d.countryCode;
    }));

    //assign a continuous domain for brushing and zooming (not used for data).
    //Make one step for each array entry in dataset, to link brushing to categorical x axis
    contrankX2.domain([0,sorted.length]);

    rankY.domain([0,d3.max(sorted, function (d) {
        return +d.bal_importQuantity;
    })]);
    rankX2.domain(rankX.domain());
    rankY2.domain(rankY.domain());


    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + rankHeight + ")")
        .call(rankXAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(rankYAxis);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + rankHeight2 + ")")
        .call(rankXAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        //change this line to change the width of the original brushed area: (currently set to the entire range of values)
        .call(brush.move, contrankX2.range()); // [0,100]);

    //draw bars for the context menu (small)
    barGroup = context.selectAll(".context-bar")
        .data(sorted)
        .enter()
        .append('g')
        .attr('class','context-bargroup');

    barGroup
        .append("rect")
        .attr("class", "context-bar")
        .attr("x", function (d) {
            return rankX2(d.countryCode);
        })
        .attr("y", function (d) {
            return  rankY2(d.bal_importQuantity);
        })
        .attr("width", rankX2.bandwidth())
        .attr("height", function (d) {
            return rankHeight2 - rankY2(d.bal_importQuantity);
        })
        .attr('fill', '#74a063');


    //draw bars for the context menu (small)
    barGroup = focus.selectAll(".focus-bar")
        .data(sorted)
        .enter()
        .append('g')
        .attr('class','focus-bargroup');

    barGroup
        .append("rect")
        .attr("class", "focus-bar")
        .attr("x", function (d) {
            return rankX(d.countryCode);
        })
        .attr("y", function (d) {
            return rankY(d.bal_importQuantity);
        })
        .attr("width", rankX.bandwidth())
        .attr("height", function (d) {
            return rankHeight - rankY(d.bal_importQuantity);
        })
        .attr('fill', 'purple')
        .on('mouseover',function(d){
            focus.append('text')
                .attr('class','bar-label-text')
                .attr('x', rankWidth-20)
                .attr('y', 50)
                .attr('text-anchor', 'end')
                .text(d.fullname);
        })
        .on('mouseout',function(d){
            d3.selectAll('.bar-label-text').remove();
        })
        .on('click',function(){
            var bar = d3.select(this);
            if (bar.attr('fill') == "purple"){
                bar.attr('fill','orange');
            }
            else if (bar.attr('fill') == "orange"){
                bar.attr('fill','purple');
            }

        });

    /*
     barGroup.append('text')
     .attr('class','bar-label-text')
     .attr("x", function (d) {
     return x(d.countryCode);
     })
     .attr("y", function (d) {
     return y(d.bal_importQuantity);
     })
     .attr('text-anchor', 'begin')
     .text(function(d){return d.fullname});
     */

}






























//********************************************************
//  UPDATE functions
//********************************************************

function updateLandSquares(countryYearUpdate, graph){
    svg.selectAll('.squares-group-' + graph).data(countryYearUpdate);
    svg.selectAll('.degradedSquares-group-' + graph).data(countryYearUpdate);
    svg.selectAll('.stats-group-' + graph).data(countryYearUpdate);

    var squareCentersX = landAreaScale(Math.max(countryYearUpdate[0].lu_agriculturalLand, countryYearUpdate[0].lu_otherLand, countryYearUpdate[0].lu_urbanLand));
    var squareCentersY = landAreaScale(Math.max(countryYearUpdate[0].lu_agriculturalLand, countryYearUpdate[0].lu_urbanLand, countryYearUpdate[0].lu_forestArea));

    d3.selectAll('.squares-group').attr('transform', 'translate(' + (squareCentersX) + ',' + (squareCentersY) + ')');



    d3.selectAll ('.agriculture-square-' + graph)
        .data(countryYearUpdate)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_agriculturalLand)
        })
        .attr('y', function (d) {
            return squareCentersY-landAreaScale(d.lu_agriculturalLand)
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_agriculturalLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_agriculturalLand)
        });

    d3.selectAll('.forest-square-' + graph)
        .data(countryYearUpdate)
        .attr('x', function (d) {
            return squareCentersX;
        })
        .attr('y', function (d) {
            return squareCentersY-landAreaScale(d.lu_forestArea)
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_forestArea)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_forestArea)
        });

    d3.selectAll('.urban2050-square-' + graph)
        .data(countryYearUpdate)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_urbanLand2050);
        })
        .attr('y', function (d) {
            return 0;
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_urbanLand2050)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_urbanLand2050)
        });

    d3.selectAll('.arable-square-' + graph)
        .data(countryYearUpdate)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_arableLand)
        })
        .attr('y', function (d) {
            return squareCentersY-landAreaScale(d.lu_arableLand)
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_arableLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_arableLand)
        });

    d3.selectAll('.other-square-' + graph)
        .data(countryYearUpdate)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_otherLand)
        })
        .attr('y', function (d) {
            return squareCentersY;
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_otherLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_otherLand)
        });

    d3.selectAll('.urban-square-' + graph)
        .data(countryYearUpdate)
        .attr('x', function (d) {
            return squareCentersX-landAreaScale(d.lu_urbanLand);
        })
        .attr('y', function (d) {
            return squareCentersY;
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_urbanLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_urbanLand)
        });


    d3.selectAll('.degrading-square-' + graph)
        .data(countryYearUpdate)
        .attr('x', function (d) {
            return 0;//landAreaScale(d.lu_degradingArea)/2 - landAreaScale(d.lu_degradingArea);
        })
        .attr('y', function (d) {
            return 0;//landAreaScale(d.lu_degradingArea)/2 - landAreaScale(d.lu_degradingArea);
        })
        .attr('width', function (d) {
            return landAreaScale(d.lu_degradingArea)
        })
        .attr('height', function (d) {
            return landAreaScale(d.lu_degradingArea)
        });



}


function updatePopBars(countryYearUpdate, graph){
    svg.selectAll('.pop-bars-' + graph).data(countryYearUpdate);

    d3.selectAll('.total-pop-bar-' + graph)
        .data(countryYearUpdate)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', function(d){
            return popLineScale(d.lu_totalPop);
        })
        .attr('height', function(d){
            return 5;//popScale(d.totalPop);
        });

    d3.selectAll('.urban-pop-bar-' + graph)
        .data(countryYearUpdate)
        .attr('x', 0)
        .attr('y', 0) //+ popScale(d.totalPop)-popScale(d.urbanPop)})
        .attr('width', function(d){
            return popLineScale(d.lu_urbanPop);
        })
        .attr('height', function(d){
            return 5;//popScale(d.urbanPop);
        });

    d3.selectAll('.pop-2050-bar-' + graph)
        .data(countryYearUpdate)
        .attr('x', 0)
        .attr('y', 0)// + popScale(d.totalPop)-popScale(d.totalPop2050)})
        .attr('width', function(d){
            return popLineScale(d.lu_totalPop2050);
        })
        .attr('height', function(d){
            return 5;//popScale(d.totalPop2050);
        });

}

function updateCrowdingSquares(countryYearUpdate, graph){
    //not sure why, but patterns don't appear to be updated on resetting xlink values and re-assigning fill parameters.
    //Instead, have to remove the pattern altogether and start over.
    d3.selectAll('defs').selectAll('.patt-'+ graph).remove();

    console.log(graph);

    var pattern = svg.append("defs")
        .append("pattern")
        .attr('class','patt-' + graph)
        .attr('id',function(d){ return 'test-pattern-' + graph;})
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('patternContentUnits',"objectBoundingBox")
        .attr('viewBox',"0 0 1 1")
        .attr('preserveAspectRatio',"xMidYMid slice")
        .append('image')
        .attr("height", 1)
        .attr("width", 1)
        .attr('preserveAspectRatio',"xMidYMid slice")
        .attr("xlink:href", function(d){ return './images/'+ Math.floor(countryYearUpdate[0].lu_peoplePerSqKm) +'.png'});  //replace with link text built using countryCrowding, when imgs avail

    d3.selectAll('.crowding-fill-' + graph)
        .attr('fill', 'url(#test-pattern-'+ graph+ ')');


}
function updateFoodBars(balanceUpdate, graph){

    d3.selectAll('.imports-bar-' + graph)
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
            return foodBalanceScale(balanceUpdate[0].bal_importQuantity);
        })

    d3.selectAll('.produced-bar-' + graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(balanceUpdate[0].bal_importQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            console.log(balanceUpdate[0].bal_importQuantity);
            return foodBalanceScale(balanceUpdate[0].bal_produced);
        });

    d3.selectAll('.exports-bar-' + graph)
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
            return foodBalanceScale(balanceUpdate[0].bal_exportQuantity);
        });

    d3.selectAll('.used-food-bar-' + graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(balanceUpdate[0].bal_exportQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(balanceUpdate[0].bal_usedFood);
        });

    d3.selectAll('.used-nonfood-bar-' + graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(balanceUpdate[0].bal_usedFood) + foodBalanceScale(balanceUpdate[0].bal_exportQuantity);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(balanceUpdate[0].bal_usedNonFood);
        });

    d3.selectAll('.waste-bar-' + graph)
        .attr('x',function(d){
            return 0
        })
        .attr('y',function(d){
            return foodBalanceScale(balanceUpdate[0].bal_usedFood) + foodBalanceScale(balanceUpdate[0].bal_exportQuantity) +foodBalanceScale(balanceUpdate[0].bal_usedNonFood);
        })
        .attr('width',function(d){
            return 25
        })
        .attr('height',function(d){
            return foodBalanceScale(balanceUpdate[0].bal_waste);
        })

}
function updateCalories(pcLandUpdate, graph){

    d3.selectAll('.calories-circ-' + graph)
        .attr('r',calorieScale(pcLandUpdate[0].pc_avgPerCapFoodSupply));

}
function updateLandReqts(landReqts){

    console.log(landReqts[0].pc_avgPerCapFoodSupply, landReqts[0].pc_perCapLandReq, landAreaScale(landReqts[0].pc_perCapLandReq))
    var cornerPos = 0;//-landAreaScale(Math.max(landReqts[0].lu_landArea, landReqts[0].pc_perCapLandReq))/2;

    d3.selectAll('.pc-land-rect')
        .attr('x',function(d){
            return cornerPos
        })
        .attr('y',function(d){
            return cornerPos
        })
        .attr('width',function(d){
            return landAreaScale(landReqts[0].pc_totalLandReq)
        })
        .attr('height',function(d){
            return landAreaScale(landReqts[0].pc_totalLandReq)
        });

    d3.selectAll('.total-land-rect')
        .attr('x',function(d){
            return cornerPos
        })
        .attr('y',function(d){
            return cornerPos
        })
        .attr('width',function(d){
            return landAreaScale(landReqts[0].lu_landArea)
        })
        .attr('height',function(d){
            return landAreaScale(landReqts[0].lu_landArea)
        });

}




function updateRank(){

    //console.log(countryTracker.sort, countryTracker.sortVar);

    //otherwise, sort the data array, using either the selected variable or the alphabetical listing
    if (countryTracker.sort == "alph"){
        sortData = sortData.sort(function(a,b){
            //needs a case-insensitive alphabetical sort
            return a.fullname.toLowerCase().localeCompare(b.fullname.toLowerCase());
        });

    }

    else if (countryTracker.sort == "value"){
        sortData = sortData.sort(function(a,b){
            //needs a case-insensitive alphabetical sort
            return b[countryTracker.sortVar] - a[countryTracker.sortVar];
        });
    }

    //reset the domain values for the focus bar chart, using the trimmed selection
    rankX.domain(sortData.map(function (d) {
        return d.countryCode;
    }));

    //rescale y values to new dataset
    rankY.domain([0,d3.max(sortData, function (d) {
        return +d[countryTracker.sortVar];
    })]);
    rankX2.domain(rankX.domain());
    rankY2.domain(rankY.domain());

    //reset the axis to match the new values
    focus.select(".axis--x").call(rankXAxis);
    focus.select(".axis--y").call(rankYAxis);

    //move the bars to their new positions
    d3.selectAll(".focus-bar")
        .transition()
        .attr("x", function (d) {
            //because the range does not include all values in the array, some bars will return undefined. Push them off the screen
            if (typeof rankX(d.countryCode) == "undefined"){
                return -200;
            }
            //give the values within the range a coordinate on the axis
            else{
                return rankX(d.countryCode);
            }

        })
        .attr("y", function (d) {
            return rankY(d[countryTracker.sortVar]);
        })
        .attr("width", rankX.bandwidth())
        .attr("height", function (d) {
            return rankHeight - rankY(d[countryTracker.sortVar]);
        });

    //move the bars to their new positions
    d3.selectAll(".context-bar")
        .transition()
        .attr("x", function (d) {
            return rankX2(d.countryCode);
        })
        .attr("y", function (d) {
            return  rankY2(d[countryTracker.sortVar]);
        })
        .attr("width", rankX2.bandwidth())
        .attr("height", function (d) {
            return rankHeight2 - rankY2(d[countryTracker.sortVar]);
        });


}


//********************************************************
//  Helper functions
//********************************************************


function brushed(rankData) {

    //stores pixel values of beginning and end of brushing box
    var selection = d3.event.selection;

    //use the continuous shadow axis to invert the pixel values to scaled axis values
    //Because the continuous axis is set using the length of the original data array, its values vary between 0 and the length of the array
    //The invert function therefore gives a decimal value for the bar number
    boxCoords = [contrankX2.invert(selection[0]), contrankX2.invert(selection[1])];

    //use the inverted selection values to chop out a section of the original data to use as the new domain values
    var cutData = sortData.slice(Math.floor(contrankX2.invert(selection[0])), Math.floor(contrankX2.invert(selection[1])));

    //reset the domain values for the focus bar chart, using the trimmed selection
    rankX.domain(cutData.map(function (d) {
        return d.countryCode;
    }));

    //reset the axis to match the new values
    focus.select(".axis--x").call(rankXAxis);

    //move the bars to their new positions
    d3.selectAll(".focus-bar")
        .attr("x", function (d) {
            //because the range does not include all values in the array, some bars will return undefined. Push them off the screen
            if (typeof rankX(d.countryCode) == "undefined"){
                return -200;
            }
            //give the values within the range a coordinate on the axis
            else{
                return rankX(d.countryCode);
            }

        })
        .attr("y", function (d) {
            return rankY(d[countryTracker.sortVar]);
        })
        .attr("width", rankX.bandwidth())
        .attr("height", function (d) {
            return rankHeight - rankY(d[countryTracker.sortVar]);
        });


}






//********************************************************
// Click events
//********************************************************


function overviewClicked(){
    console.log('overview clicked');

    d3.selectAll('#overview-button').classed('selected', true);
    d3.selectAll('#compare-button').classed('selected', false);
    d3.selectAll('#right-dropdown').remove();

    //remove radio buttons and labels
    d3.selectAll('.radio').remove();
    d3.selectAll('.radio-label').remove();

    //re-initialize the side panel text (removes additional <br> characters added during append)
    d3.selectAll('#body-text').html(bodyText);

    //clear entire svg for re-drawing
    svg.selectAll('*').remove();

    countryTracker.init = true;
    countryTracker.view = "overview";

    d3.selectAll('#vis').style('height',550);
    d3.select('#slider-left').remove();
    d3.select('#slider-left-label').remove();
    d3.select('#slider-right').remove();
    d3.select('#slider-right-label').remove();

    updateData();

}


function compareClicked(){
    console.log('compare clicked');

    if (countryTracker.view == "overview"){

        d3.selectAll('#compare-button').classed('selected', true);
        d3.selectAll('#overview-button').classed('selected', false);

        d3.selectAll('#vis').style('height',450);

        addDropdown();

        //parse country list for dropdown
        dropdownValues.forEach(function (n) {
            d3.select("#right-dropdown") //class in the html file
                .append("option") //it has to be called this name
                .html(n.fullname) //what is going to be written in the text
                .attr("value", n.countryCode); //what is going to be written in value
            //.style('background','blue'); //change background color (useful for styling multiple levels of aggregation)
        });

        console.log(d3.selectAll('.radio'));

        //if (d3.selectAll('.radio'))

        $('<br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"sbs-radio", name:"mode"}).appendTo('#body-text').attr('checked',true);
        $('<label />', { 'for': "sbs-radio", class:"radio-label", text: "Side-by-side comparison" }).appendTo('#body-text');

        $('<br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"rank-radio", name:"mode"}).appendTo('#body-text').attr('checked',false);
        $('<label />', { 'for': "rank-radio", class:"radio-label", text: "All countries (ranking)" }).appendTo('#body-text');

        $('<br><br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"pop-radio", name:"varType"}).appendTo('#body-text').attr('checked',true);
        $('<label />', { 'for': "pop-radio", class:"radio-label", id:"pop-radio-label", text: "Population and crowding" }).appendTo('#body-text');

        $('<br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"land-radio", name:"varType"}).appendTo('#body-text').attr('checked',false);
        $('<label />', { 'for': "land-radio", class:"radio-label", id:"land-radio-label", text: "Land usage and degradation" }).appendTo('#body-text');

        $('<br>').appendTo('#body-text');

        $('<input />', { type: 'radio', class:"radio", id:"food-radio", name:"varType"}).appendTo('#body-text').attr('checked',false);
        $('<label />', { 'for': "food-radio", class:"radio-label", id:"food-radio-label", text: "Food consumption and land use" }).appendTo('#body-text');

        //add event listener to radio buttons
        $(".radio").change(radioChange)
    }

    countryTracker.init = true;
    countryTracker.view = "compare";

    updateData();

}


function radioChange(){

        //console.log(this, d3.select(this).attr('id'));

        if ($("#pop-radio").attr("checked")) {
            $("#land-radio").attr("checked",false);
            $("#food-radio").attr("checked",false);
            $('#pop-radioedit:input').removeAttr('disabled');
        }
        else {
            $('#pop-radioedit:input').attr('disabled', 'disabled');
        }



        if (d3.select(this).attr('id') == "land-radio"){
            if (countryTracker.mode == "sbs"){
                countryTracker.init = true;  //re-initialize the drawing to set up the new variable

                //start on 2003, since that's the year we have degrading area for
                countryTracker.year.l = "2003";
                countryTracker.year.r = "2003";

                //update both sliders to reflect change
                d3.selectAll('#slider-right').property("value","2003").property('innerHTML','2003');
                d3.selectAll('#slider-left').property("value","2003").property('innerHTML','2003');
                d3.selectAll('#slider-left-label').property('innerHTML',countryTracker.year.l);
                d3.selectAll('#slider-right-label').property('innerHTML',countryTracker.year.r);
            }
            countryTracker.varType = "land";
            countryTracker.sortVar = "lu_landArea";
            updateData();
        }
        else if (d3.select(this).attr('id') == "food-radio"){
            if (countryTracker.mode == "sbs"){
                countryTracker.init = true;  //re-initialize the drawing to set up the new variable
            }
            countryTracker.varType = "food";
            countryTracker.sortVar = "pc_avgPerCapFoodSupply";
            updateData();
        }
        else if (d3.select(this).attr('id') == "pop-radio"){
            if (countryTracker.mode == "sbs"){
                countryTracker.init = true;  //re-initialize the drawing to set up the new variable
            }
            countryTracker.varType = "population";
            countryTracker.sortVar = "lu_totalPop";
            updateData();
        }

        //variable radio buttons only available while in ranking mode (split of prev combined groups)
        else if (d3.select(this).attr('id') == "crowding-radio"){
            countryTracker.varType = "population";
            countryTracker.sortVar = "lu_peoplePerSqKm";
            updateData();
        }
        else if (d3.select(this).attr('id') == "degradation-radio"){
            countryTracker.varType = "land";
            countryTracker.sortVar = "lu_degradingArea";

            //always set year to 2003, since only have degrading land info for that year.
            countryTracker.year.l = "2003";
            //update slider values
            d3.selectAll('#slider-left').property("value","2003").property('innerHTML','2003');
            d3.selectAll('#slider-left-label').property('innerHTML',countryTracker.year.l);

            updateData();
        }
        else if (d3.select(this).attr('id') == "land-reqt-radio"){
            countryTracker.varType = "food";
            countryTracker.sortVar = "pc_totalLandReq";
            updateData();
        }

        else if (d3.select(this).attr('id') == "alph-radio"){
            countryTracker.sort = "alph";
            updateRank();
        }
        else if (d3.select(this).attr('id') == "value-radio"){
            countryTracker.sort = "value";
            updateRank();
        }

        //back to generally-available radios
        else if (d3.select(this).attr('id') == "sbs-radio"){
            countryTracker.init = true;
            countryTracker.mode = "sbs";

            //remove radio button sort and detailed variable selectors
            d3.selectAll('.sort-radio').remove();
            d3.selectAll('.sort-radio-label').remove();
            d3.selectAll('.var-radio').remove();
            d3.selectAll('.var-radio-label').remove();

            //replace original radio button names
            d3.selectAll('#pop-radio-label').text("Population and crowding");
            d3.selectAll('#food-radio-label').text("Food consumption and land use");
            d3.selectAll('#land-radio-label').text("Land usage and degradation");

            //reset default sort selection
            countryTracker.sort = "alph";
            countryTracker.sortVar = "lu_totalPop";

            updateData();
        }
        else if (d3.select(this).attr('id') == "rank-radio"){
            countryTracker.init = true;
            countryTracker.mode = "rank";

            $('<br>').appendTo('#body-text');

            //split radio buttons into separate variables
            $('<input />', { type: 'radio', class:"radio var-radio", id:"crowding-radio", name:"varType"}).appendTo('#body-text').attr('checked',false);
            $('<label />', { 'for': "crowding-radio", class:"radio-label var-radio-label", text: "Crowding" }).appendTo('#body-text');

            $('<br>').appendTo('#body-text');

            $('<input />', { type: 'radio', class:"radio var-radio", id:"degradation-radio", name:"varType"}).appendTo('#body-text').attr('checked',false);
            $('<label />', { 'for': "degradation-radio", class:"radio-label var-radio-label", text: "Land degradation" }).appendTo('#body-text');

            $('<br>').appendTo('#body-text');

            $('<input />', { type: 'radio', class:"radio var-radio", id:"land-reqt-radio", name:"varType"}).appendTo('#body-text').attr('checked',false);
            $('<label />', { 'for': "land-reqt-radio", class:"radio-label var-radio-label", text: "Land needed to grow food" }).appendTo('#body-text');

            //rename old radio buttons
            d3.selectAll('#pop-radio-label').text('Population');
            d3.selectAll('#food-radio-label').text('Daily diet (calories)');
            d3.selectAll('#land-radio-label').text('Land area');


            //Make new radio buttons for sort selection
            $('<br>').appendTo('#body-text');
            $('<br>').appendTo('#body-text');

            $('<input />', { type: 'radio', class:"radio sort-radio", id:"alph-radio", name:"sort"}).appendTo('#body-text').attr('checked',true);
            $('<label />', { 'for': "alph-radio", class:"radio-label sort-radio-label", text: "Alphabetical" }).appendTo('#body-text');

            $('<br>').appendTo('#body-text');

            $('<input />', { type: 'radio', class:"radio sort-radio", id:"value-radio", name:"sort"}).appendTo('#body-text').attr('checked',false);
            $('<label />', { 'for': "value-radio", class:"radio-label sort-radio-label", text: "Decreasing value" }).appendTo('#body-text');

            //re-apply event listener to radio buttons
            $(".radio").change(radioChange)

            updateData();
        }


}


function makeSlider(side){

    var newDiv = $(".anim-div").append("<div></div>",{class:"slider-div"});

    if(side == "left"){
        $('<input />', { type: 'range', class:"slider", id:"slider-left", min:"1961", max:"2016", value:"2003", step:"1"}).appendTo(newDiv).attr('checked',false);
        $('<em/>', { id:"slider-left-label", style:"font-style: normal;", html:"2003"}).appendTo(newDiv);

        //Run the update function when the slider is changed
        d3.select('#slider-left').on('input', function() {
            console.log(this.value);
            countryTracker.year.l = this.value;

            document.getElementById('slider-left-label').innerHTML = this.value;
            updateData();
        });
    }
    else if(side == "right"){
        $('<input />', { type: 'range', class:"slider", id:"slider-right", min:"1961", max:"2016", value:"2003", step:"1"}).appendTo(newDiv).attr('checked',false);
        $('<em/>', { id:"slider-right-label", style:"font-style: normal;", html:"2003"}).appendTo(newDiv);

        //Run the update function when the slider is changed
        d3.select('#slider-right').on('input', function() {
            console.log(this.value);
            countryTracker.year.r = this.value;
            document.getElementById('slider-right-label').innerHTML = this.value;
            updateData();
        });
    }



}


//Play button modified from https://jsfiddle.net/bfbun6cc/4/
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