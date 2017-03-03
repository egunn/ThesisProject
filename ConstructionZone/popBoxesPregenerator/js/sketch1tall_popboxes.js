//double check data for the two Congos - seems to be wrong 
//also, think about spacing
//update color for urban areas - can't be gray; too confusing.
//align population boxes using pop growth, if larger than current pop


//set some margins and record width and height of window
var margin = {t:25,r:40,b:25,l:40};
var trackPos = {x:300,y:100};
var column = 1;
var icon;

var width1 = document.getElementById('plot').clientWidth - margin.r - margin.l,  
    height1 = document.getElementById('plot').clientHeight - margin.t - margin.b;

//for now, not linked to actual data - later, set max according to numbers stored in data object. 
var radiusScale = d3.scale.sqrt().domain([0,20000]).range([10,50]);

 
var landAreaScale = d3.scale.sqrt().domain([0,17000000]).range([0,650]);

var popScale = d3.scale.sqrt().domain([0,1750000000]).range([0,250]);
var popLineScale = d3.scale.linear().domain([0,1750000000]).range([0,1525]);

//need d3-grid.js file linked in the HTML for this to work    
var peopleGrid = d3.layout.grid()
   .points()
   .size([360, 360]);


//select the HTML plot element by class
var canvas = d3.select(".plot");

plot = canvas.append('svg')
    .attr('width',width1+margin.r+margin.l)
    .attr('height',height1 + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//load data, then call parse function.
//d3.json("./twitter_data2.json", function(error, data) {
//d3.csv("./soilData_cut.csv", function(error, data) {
/*d3.csv("./WorldSoilData.csv", function(error, data) {
        parse(data);
})*/

var columnHeight = 1650;
var clickTracker = 1;

fakeData = [{peoplePerKm:clickTracker, peoplePerKmUrban:clickTracker, column:1, baseX:50, baseY:150}];

console.log(fakeData);

var countryRectGroups = plot.selectAll('.rect-group')
    .data(fakeData)
    .enter();

drawPopBoxes();

//add click listener to svg to update clickTracker value
d3.selectAll('svg')
    .on('click',function(){
        clickTracker ++;
        fakeData = [{peoplePerKm:clickTracker, peoplePerKmUrban:clickTracker, column:1, baseX:50, baseY:150}];
        console.log(fakeData[0].peoplePerKm);
        d3.selectAll('.pop-box-g').remove('*');
        d3.selectAll('.rect-group').remove();
        countryRectGroups = plot.selectAll('.rect-group')
            .data(fakeData)
            .enter();
        drawPopBoxes();
    });


function drawPopBoxes(){

    shiftPopBox1 = 50;

    var popBox = countryRectGroups.append('g').attr('class','pop-box-g')
        .attr('transform', function(d){
            if (d.column == 1){
                return 'translate('+(d.baseX-50 + shiftPopBox1)+','+ (d.baseY-100)+ ')';
            }

        });



    popBox
        .append('rect')
        .attr('grid', function(d,i){
            //var parentGroup = d;
            //console.log(parentGroup);
            var peopleArray = [];

            //make an array of ones of length = # of people/km
            for(var i=0; i < d.peoplePerKm; i++){
                console.log(d);
                if (i<d.peoplePerKmUrban){
                    peopleArray.push({type:0});
                }
                else {
                    peopleArray.push({type:1});
                }
            }

            d.peopleArray  = peopleArray;
        })
        .attr('x', 0 )//function(d,i){return d.baseX-50 + 700; })
        .attr('y', 0)//function(d,i){return d.baseY-100;})
        .attr('width', 300) //function(d){ return landAreaScale(d.forestArea);})
        .attr('height', 300)//function(d){ return landAreaScale(d.forestArea); })
        .style('fill','none')
        .style('stroke','gray')
        .style('stroke-weight','3px')
        .attr('class','pop-box');

    popBox.selectAll('pop-circs')
        .data(function(d){return d.peopleArray})
        .enter()
        .append('circle')
        .attr('cx',function(d){
            var pos = Math.random()*300;
            if (pos > 290){
                pos =- 7
            }
            if (pos < 12){
                pos =+ 9
            }
            return pos;
        })
        .attr('cy',function(d){
            var pos = Math.random()*300;
            if (pos > 290){
                pos -= 7
            }
            if (pos < 12){
                pos += 9
            }
            return pos;
        })
        .attr('r',6)
        .style('fill',function(d){
            if(d.type == 0){
                return 'rgb(50,50, 50)';

            }
            else {return 'rgb(200,200, 200)';}
        });

}

function parse(rows){

    var data = rows; 

    //based on http://bl.ocks.org/bollwyvl/4f0f3a4cf3e960f0e2a9
    //and http://jsfiddle.net/christopheviau/XnG6r/
    d3.xml("./human_trimmed.svg", "image/svg+xml", function (xml) {
         var node = xml.getElementsByTagName("g")[0]; //document.importNode(xml.documentElement, true);
         icon = function () {
             return node.cloneNode(true);
         }
         doneNow();
    });
    
    function doneNow(){
       //drawUsers(data);
    } 

}


function drawUsers(data) {

    console.log(data);
    
    var countryRectGroups = plot.selectAll('.rect-group')
        .data(data)
        .enter()
        .append('g')
        .attr('class',"rect-group");
    
    var labels = plot.append('g')
        .attr('class', 'labels');
    
    countryLabels = plot.selectAll('.labels').append('g')
        .attr('class', 'country-names');
    
    //var countryNameGroup = countryLabels.append('g')
    //    .attr('class','country-name');
    
    countryNameLabels = countryLabels.selectAll('.country-names')
        .data(data)
        .enter();
    
    countryDegrading = plot.selectAll('.labels').append('g')
        .attr('class', 'country-degrading'); 
    
    countryDegradingLabels = countryDegrading.selectAll('.country-degrading')
        .data(data)
        .enter();
    
    countryForests = plot.selectAll('.labels').append('g')
        .attr('class', 'country-forest');
    
    countryForestLabels = countryForests.selectAll('.country-forest')
        .data(data)
        .enter();
    
    countryAgricultural = plot.selectAll('.labels').append('g')
        .attr('class', 'country-agricultural');
    
    countryAgriculturalLabels = countryAgricultural.selectAll('.country-agricultural')
        .data(data)
        .enter();
    
    countryOther = plot.selectAll('.labels').append('g')
        .attr('class', 'country-other');
    
    countryOtherLabels = countryOther.selectAll('.country-other')
        .data(data)
        .enter();
    
    countryPeoplePer = plot.selectAll('.labels').append('g')
        .attr('class', 'country-peoplePer');
    
    countryPeoplePerLabels = countryPeoplePer.selectAll('.country-peoplePer')
        .data(data)
        .enter();
    
    countryTotalArea = plot.selectAll('.labels').append('g')
        .attr('class', 'country-totalArea');
    
    countryTotalAreaLabels = countryTotalArea.selectAll('.country-totalArea')
        .data(data)
        .enter();
    
    countryTotalPop = plot.selectAll('.labels').append('g')
        .attr('class', 'country-totalPop');
    
    countryTotalPopLabels = countryTotalPop.selectAll('.country-totalPop')
        .data(data)
        .enter();
    
    //negative shift (name and sep line start)
    var shiftCountryLabel1 = -515;
    var shiftCountryLabel2 = -365;
    var shiftCountryLabel3 = -340;
    var shiftCountryLabel4 = -320;
    var shiftCountryLabel5 = -270;
    var shiftCountryLabel6 = -270;
    var shiftCountryLabel7 = -270;
    
    //end sep line
    var shiftEndLine1 = 975;
    var shiftEndLine2 = 590;
    var shiftEndLine3 = 440;
    var shiftEndLine4 = 335;
    var shiftEndLine5 = 260;
    var shiftEndLine6 = 260;
    var shiftEndLine7 = 260;
    
    //shift baseX/Y (and therefore entire column)
    var columnShift = 200;
    var shiftCol1 = 250;
    var shiftCol2 = 1695;//shiftEndLine1 - shiftCountryLabel1 + columnShift;//
    var shiftCol3 = 2715;//shiftEndLine2 - shiftCountryLabel2 + columnShift;//
    var shiftCol4 = 3575;//shiftEndLine3 - shiftCountryLabel3 + columnShift;//
    var shiftCol5 = 4275;//shiftEndLine4 - shiftCountryLabel4 + columnShift;//
    var shiftCol6 = 4900;//shiftEndLine5 - shiftCountryLabel5 + columnShift;//
    var shiftCol7 = 5530;//shiftEndLine6 - shiftCountryLabel6 + columnShift;//
    var shiftCol8 = 6145;
    
    //center degrading area square
    var shiftDegr1 = 640; 
    var shiftDegr2 = 335; 
    var shiftDegr3 = 200;
    var shiftDegr4 = 150;
    var shiftDegr5 = 100;
    var shiftDegr6 = 75;
    var shiftDegr7 = 75;
    
    //pop bars and people grids
    var shiftPop1 = -515; 
    var shiftPop2 = -365;
    var shiftPop3 = -340;
    var shiftPop4 = -320;
    var shiftPop5 = -270;
    
    //
    var shiftPopBox1 = 900;
    var shiftPopBox2 = 525;
    var shiftPopBox3 = 375;
    var shiftPopBox4 = 275;
    var shiftPopBox5 = 200;
    var shiftPopBox6 = 200;
    var shiftPopBox7 = 200;
    
    var columnLength = 5725;
    var sizePopBox = 100;
    var topPadding = 45;
    var bottomPadding = 25;
    var trackPosYDefault = 100;
    var popBarYShift = 20;

    
    //****************
    // Land area rectangles
    //****************
    
    //Agricultural area
    countryRectGroups
        .append('rect')
        .attr('y', function(d,i){
            
            //check whether the population bar will run into the land area squares. If not, move them up.
        
               /* if ((sizePopBox) > (landAreaScale(Math.max(d.agriculturalLand, d.forestArea, d.degradingArea)))) {
                    
                    d.baseY = trackPos.y + sizePopBox;
                    trackPos.y = trackPos.y + sizePopBox + topPadding + landAreaScale(Math.max(d.otherLand, d.urbanLand, d.urbanLand2050))
                        + bottomPadding;
                }*/
                //else {
                    d.baseY = trackPos.y + Math.max(landAreaScale(Math.max(d.agriculturalLand, d.forestArea,d.degradingArea)),sizePopBox);
                    trackPos.y = trackPos.y + Math.max(landAreaScale(Math.max(d.agriculturalLand, d.forestArea,d.degradingArea)),sizePopBox)
                        + landAreaScale(Math.max(d.otherLand, d.urbanLand, d.urbanLand2050)) + topPadding + bottomPadding; 
                //}

        
            if (column == 1){
                d.column = column;

                if(trackPos.y >= columnLength){
                    column = 2;
                    trackPos.y =trackPosYDefault;
                }
                
                return d.baseY - landAreaScale(d.agriculturalLand);
                
            }
            
            if (column == 2){
                d.column = column;
            
                if(trackPos.y >= columnLength){
                    column = 3;
                    trackPos.y =trackPosYDefault;
                }
                
                return d.baseY - landAreaScale(d.agriculturalLand);
                
            }
            
            if (column == 3){
                d.column = column;

                if(trackPos.y >= columnLength){
                    column = 4;
                    trackPos.y =trackPosYDefault;
                }

                return d.baseY - landAreaScale(d.agriculturalLand);
                
            }
        
            if (column == 4){
                d.column = column;

                if(trackPos.y >= columnLength){
                    column = 5;
                    trackPos.y =trackPosYDefault;
                }

                return d.baseY - landAreaScale(d.agriculturalLand);
                
            }

            if (column == 5){
                d.column = column;

                if(trackPos.y >= columnLength){
                    column = 6;
                    trackPos.y =trackPosYDefault;
                }

                return d.baseY - landAreaScale(d.agriculturalLand);
                
            }
        
            if (column == 6){
                d.column = column;

                if(trackPos.y >= columnLength){
                    column = 7;
                    trackPos.y =trackPosYDefault;
                }

                return d.baseY - landAreaScale(d.agriculturalLand);
                
            }
        
            if (column == 7){
                d.column = column;

                if(trackPos.y >= columnLength){
                    column = 8;
                    trackPos.y =trackPosYDefault;
                }

                return d.baseY - landAreaScale(d.agriculturalLand);
                
            }

            if (column == 8){
                d.column = column;

                if(trackPos.y >= columnLength){
                    column = 9;
                    trackPos.y =trackPosYDefault;
                }

                return d.baseY - landAreaScale(d.agriculturalLand);
                
            }
            
        })
        .attr('x', function(d,i){
            if (d.column == 1){
                d.baseX = trackPos.x + shiftCol1;
            }
            else if (d.column == 2){
                d.baseX = trackPos.x + shiftCol2;
            }
            else if (d.column == 3){
                d.baseX = trackPos.x + shiftCol3;
            }
            else if (d.column == 4){
                d.baseX = trackPos.x + shiftCol4;
            }
            else if (d.column == 5){
                d.baseX = trackPos.x + shiftCol5;
            }
            else if (d.column == 6){
                d.baseX = trackPos.x + shiftCol6;
            }
            else if (d.column == 7){
                d.baseX = trackPos.x + shiftCol7;
            }
            else if (d.column == 8){
                d.baseX = trackPos.x + shiftCol8;
            }
            return d.baseX - landAreaScale(d.agriculturalLand);
        })
        .attr('width', function(d){
            return landAreaScale(d.agriculturalLand);
        })
        .attr('height', function(d){
            return landAreaScale(d.agriculturalLand);
        })
        .style('fill','rgb(100,100,40)')
        .style('fill-opacity', '.2')
        .attr('class','agric-area');
    
    
    //label agricultural area
    countryAgriculturalLabels
        .append('text')
        .attr('x',function(d,i){
            return d.baseX - landAreaScale(d.agriculturalLand)/2 
        })
        .attr('y',function(d,i){
            return d.baseY - landAreaScale(d.agriculturalLand) - 10;            
        })
        .style('font-size',24)
        .style('text-anchor','middle')
        .style('fill','gray')
        .text(function(d){
            if(d.agriculturalLand/d.landArea*100 < 1){return Math.round(d.agriculturalLand/d.landArea*100*10)/10 + '%';}
            else if (d.agriculturalLand/d.landArea*100 >= 1){return Math.round(d.agriculturalLand/d.landArea*100) + '%';};
        });
    
    
    
  
    //label country name
    countryNameLabels
        .append('text')
        .attr('x',function(d,i){
            if(d.column == 1){ 
                return d.baseX + shiftCountryLabel1;
            }
            else if(d.column == 2){ 
                return d.baseX + shiftCountryLabel2;
            }
            else if(d.column == 3){ 
                return d.baseX + shiftCountryLabel3;
            }
            else if(d.column == 4){ 
                return d.baseX + shiftCountryLabel4;
            }
            else if(d.column == 5){ 
                return d.baseX + shiftCountryLabel5;
            }
            else if(d.column == 6){ 
                return d.baseX + shiftCountryLabel6;
            }
            else {
                return d.baseX + shiftCountryLabel7;
            }

        })
        .attr('y',function(d,i){
            return d.baseY - Math.max(landAreaScale(Math.max(d.agriculturalLand, d.forestArea,d.degradingArea)), sizePopBox) + 18;
            //draw name differently, depending on whether pop bar will run into land area squares
            /*if (popLineScale(Math.max(d.totalPop, d.totalPop2050)) < ( 275 - landAreaScale(d.agriculturalLand))){
                return d.baseY - landAreaScale(Math.max(d.agriculturalLand, d.forestArea)) + 20;
            } 
        
            else{
                return d.baseY - landAreaScale(Math.max(d.agriculturalLand, d.forestArea)) -14;
            }*/
            
        })
        .style('font-size',24)
        .style('fill','gray')
        .text(function(d){return d.country;});
    
    
    //label total area
    countryTotalAreaLabels
        .append('text')
        .attr('x',function(d,i){
            if(d.column == 1){ 
                return d.baseX + shiftCountryLabel1;
            }
            else if(d.column == 2){ 
                return d.baseX + shiftCountryLabel2;
            }
            else if(d.column == 3){ 
                return d.baseX + shiftCountryLabel3;
            }
            else if(d.column == 4){ 
                return d.baseX + shiftCountryLabel4;
            }
            else if(d.column == 5){ 
                return d.baseX + shiftCountryLabel5;
            }
            else if(d.column == 6){ 
                return d.baseX + shiftCountryLabel6;
            }
            else {
                return d.baseX + shiftCountryLabel7;
            } 
        })
        .attr('y',function(d,i){
            return d.baseY + landAreaScale(d.otherLand);            
        })
        .style('font-size',24)
        .style('fill','gray')
        .text(function(d){
            return (1*d.landArea).toLocaleString() + ' sq. km';
        });
    
    //label total population
    countryTotalPopLabels
        .append('text')
        .attr('x',function(d,i){
            if(d.column == 1){ 
                return d.baseX + shiftCountryLabel1;
            }
            else if(d.column == 2){ 
                return d.baseX + shiftCountryLabel2;
            }
            else if(d.column == 3){ 
                return d.baseX + shiftCountryLabel3;
            }
            else if(d.column == 4){ 
                return d.baseX + shiftCountryLabel4;
            }
            else if(d.column == 5){ 
                return d.baseX + shiftCountryLabel5;
            }
            else if(d.column == 6){ 
                return d.baseX + shiftCountryLabel6;
            }
            else {
                return d.baseX + shiftCountryLabel7;
            } 
        })
        .attr('y',function(d,i){
            return d.baseY + landAreaScale(d.otherLand) - 35;            
        })
        .style('font-size',24)
        .style('fill','gray')
        .text(function(d){
            return (1*d.totalPop).toLocaleString() + ' people';
        });
    
    
    //separator line
    countryRectGroups
        .append('line')
        .attr('x1',function(d,i){
           if(d.column == 1){ 
                return d.baseX + shiftCountryLabel1;
            }
            else if(d.column == 2){ 
                return d.baseX + shiftCountryLabel2;
            }
            else if(d.column == 3){ 
                return d.baseX + shiftCountryLabel3;
            }
            else if(d.column == 4){ 
                return d.baseX + shiftCountryLabel4;
            }
            else if(d.column == 5){ 
                return d.baseX + shiftCountryLabel5;
            }
            else if(d.column == 6){ 
                return d.baseX + shiftCountryLabel6;
            }
            else {
                return d.baseX + shiftCountryLabel7;
            }
            
        })
        .attr('y1',function(d,i){
            return d.baseY - Math.max(landAreaScale(Math.max(d.agriculturalLand, d.forestArea,d.degradingArea)),(sizePopBox))
                - topPadding;
            
        })
        .attr('x2',function(d,i){
        
            if(d.column == 1){ 
                return d.baseX  + shiftEndLine1;
            }
            else if(d.column == 2){ 
                return d.baseX + shiftEndLine2;
            }
            else if(d.column == 3){ 
                return d.baseX + shiftEndLine3;
            }
            else if(d.column == 4){ 
                return d.baseX + shiftEndLine4;
            }
            else if(d.column == 5){ 
                return d.baseX + shiftEndLine5;
            }
            else if(d.column == 6){ 
                return d.baseX + shiftEndLine6;
            }
            else {
                return d.baseX + shiftEndLine7;
            }
            
        })
        .attr('y2',function(d,i){
            return d.baseY - Math.max(landAreaScale(Math.max(d.agriculturalLand, d.forestArea,d.degradingArea)), (sizePopBox)) -topPadding; 
        })
        .style('stroke-weight','1px')
        .style('stroke','gray');
 
     //forest area 
     countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            return d.baseX;
        })
        .attr('y', function(d,i){
            return d.baseY - landAreaScale(d.forestArea);
        })
        .attr('width', function(d){
            return landAreaScale(d.forestArea);
        })
        .attr('height', function(d){
            return landAreaScale(d.forestArea);
        })
        .style('fill','rgb(0,100,0)')
        .style('fill-opacity','.7')
        .attr('class','land-area');
    
    
    //label forest area
    countryForestLabels
        .append('text')
        .attr('x',function(d,i){
            return d.baseX + landAreaScale(d.forestArea)/2 
        })
        .attr('y',function(d,i){
            return d.baseY - landAreaScale(d.forestArea) - 10;            
        })
        .style('font-size',24)
        .style('text-anchor','middle')
        .style('fill','gray')
        .text(function(d){
            if(d.forestArea/d.landArea*100 < 1){return Math.round(d.forestArea/d.landArea*100*10)/10 + '%';}
            else if (d.forestArea/d.landArea*100 >= 1){return Math.round(d.forestArea/d.landArea*100) + '%';};
        });

    
     //arable land
     countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            return d.baseX -landAreaScale(d.arableLand) ;
        })
        .attr('y', function(d){return d.baseY -landAreaScale(d.arableLand)})
        .attr('width', function(d){
            return landAreaScale(d.arableLand);
        })
        .attr('height', function(d){
            return landAreaScale(d.arableLand);
        })
        .attr('fill','rgb(100,100,40)')
        .style('fill-opacity','.5')
        .attr('class','land-area');
    
     //urban land
     countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            return d.baseX;
        })
        .attr('y', function(d){return d.baseY})
        .attr('width', function(d){
            return landAreaScale(d.urbanLand);
        })
        .attr('height', function(d){
            return landAreaScale(d.urbanLand);
        })
        .attr('fill','rgb(50,50, 50)')
        .style('fill-opacity','.7')
        .attr('class','land-area');

     //urban 2050
     countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            return d.baseX ;
        })
        .attr('y', function(d){return d.baseY })
        .attr('width', function(d){
            return landAreaScale(d.urbanLand2050);
        })
        .attr('height', function(d){
            return landAreaScale(d.urbanLand2050);
        })
        .attr('fill','none')
        .style('stroke-dasharray', ("1.5,1.5"))
        .style('stroke-width', ".5px")
        .attr('stroke','rgb(50,50, 50)')
        .style('fill-opacity','1')
        .attr('class','land-area');
    
    
      //other land
      countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            if(d.otherLand <= 0 ){
                return d.baseX;
            }
            else if(d.otherLand > 0 ){
                return d.baseX - landAreaScale(d.otherLand);
            }
        })
        .attr('y', function(d){return d.baseY})
        .attr('width', function(d){
            if(d.otherLand <= 0 ){
                return 0;
            }
            else if(d.otherLand > 0 ){
                return landAreaScale(d.otherLand);
            }
        })
        .attr('height', function(d){
            if(d.otherLand <= 0 ){
                return 0;
            }
            else if(d.otherLand > 0 ){
                return landAreaScale(d.otherLand);
            }
        })
        .attr('fill','rgb(25, 0, 75)') //'none')
        .style('fill-opacity','.3')
        .style('stroke-width', ".5px")
        //.attr('stroke','rgba(200,200, 200,1)')
        .attr('class','land-area');
    
    
    //label agricultural area
    countryOtherLabels
        .append('text')
        .attr('x',function(d,i){
            return d.baseX - landAreaScale(d.otherLand)/2 
        })
        .attr('y',function(d,i){
            return d.baseY + (landAreaScale(d.otherLand) - 12);            
        })
        .style('font-size',24)
        .style('text-anchor','middle')
        .style('fill','gray')
        .text(function(d){
            if(d.otherLand/d.landArea*100 < 1){return Math.round(d.otherLand/d.landArea*100*10)/10 + '%';}
            else if (d.otherLand/d.landArea*100 >= 1){return Math.round(d.otherLand/d.landArea*100) + '%';};
        });
    
    
    //degrading area
    countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            //console.log(d.baseX);
            if(d.column == 1){ 
                return d.baseX + shiftDegr1 - landAreaScale(d.degradingArea)/2;
            }
            else if (d.column ==2) {
                return d.baseX + shiftDegr2 - landAreaScale(d.degradingArea)/2;
            }
            else if (d.column ==3) {
                return d.baseX + shiftDegr3 - landAreaScale(d.degradingArea)/2;
            }
            else if (d.column ==4) {
                return d.baseX + shiftDegr4 - landAreaScale(d.degradingArea)/2;
            }
            else if (d.column ==5) {
                return d.baseX + shiftDegr5 - landAreaScale(d.degradingArea)/2;
            }
            else if (d.column ==6) {
                return d.baseX + shiftDegr6 - landAreaScale(d.degradingArea)/2;
            }
            else {
                return d.baseX + shiftDegr7 - landAreaScale(d.degradingArea)/2;
            }
            
        })
        .attr('y', function(d,i){
            return d.baseY - landAreaScale(d.degradingArea);
        })
        .attr('width', function(d){
            return landAreaScale(d.degradingArea);
        })
        .attr('height', function(d){
            return landAreaScale(d.degradingArea);
        })
        .style('fill','rgb(100,0,0)')
        .style('fill-opacity','.7')
        .attr('class','land-area');
    
    
    
    //label country name
    countryDegradingLabels
        .append('text')
        .attr('x',function(d,i){
            if(d.column == 1){ 
                return d.baseX + shiftDegr1;
            }
            else if (d.column ==2) {
                return d.baseX + shiftDegr2;
            }
            else if (d.column ==3) {
                return d.baseX + shiftDegr3;
            }
            else if (d.column ==4) {
                return d.baseX + shiftDegr4;
            }
            else if (d.column ==5) {
                return d.baseX + shiftDegr5;
            }
            else if (d.column ==6) {
                return d.baseX + shiftDegr6;
            }
            else {
                return d.baseX + shiftDegr7;
            }
        })
        .attr('y',function(d,i){
            return d.baseY - landAreaScale(d.degradingArea) - 10;            
        })
        .style('font-size',24)
        .style('fill','gray')
        .style("text-anchor", "middle")
        .text(function(d){
            if(d.degradingArea/d.landArea*100 == 0){ return 'n/a';}
            else if(d.degradingArea/d.landArea*100 < 1){return Math.round(d.degradingArea/d.landArea*100*10)/10 + '%';}
            else if (d.degradingArea/d.landArea*100 >= 1){return Math.round(d.degradingArea/d.landArea*100) + '%';};
        });
    
    
    
    
    
    
    
    
    //****************************
    // Population bars
    //****************************
    
    countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            if(d.column == 1){ 
                return d.baseX + shiftPop1;
            }
            else if(d.column == 2){ 
                return d.baseX + shiftPop2;
            }
            else if(d.column == 3){ 
                return d.baseX + shiftPop3;
            }
            else if(d.column == 4){ 
                return d.baseX + shiftPop4;
            }
            else {
                return d.baseX +shiftPop5;
            }
        })
        .attr('y', function(d,i){
        
            return d.baseY - Math.max(landAreaScale(Math.max(d.agriculturalLand, d.forestArea,d.degradingArea)),sizePopBox)
                -topPadding+ popBarYShift;       
            
        })
        .attr('width', function(d){
            return popLineScale(d.totalPop);
        })
        .attr('height', function(d){
            return 8;//popScale(d.totalPop);
        })
        .attr('fill','rgb(200,200, 200)')
        .style('fill-opacity','1')
        .style('stroke-width', ".5px")
        .attr('stroke','rgba(200,200, 200,1)');
    
     countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            if(d.column == 1){ 
                return d.baseX + shiftPop1;
            }
            else if(d.column == 2){ 
                return d.baseX + shiftPop2;
            }
            else if(d.column == 3){ 
                return d.baseX + shiftPop3;
            }
            else if(d.column == 4){ 
                return d.baseX + shiftPop4;
            }
            else {
                return d.baseX +shiftPop5;
            }
        })
        .attr('y', function(d){
            return d.baseY - Math.max(landAreaScale(Math.max(d.agriculturalLand, d.forestArea,d.degradingArea)),sizePopBox) 
                -topPadding+ popBarYShift;  
     
        }) //+ popScale(d.totalPop)-popScale(d.urbanPop)})
        .attr('width', function(d){
            return popLineScale(d.urbanPop);
        })
        .attr('height', function(d){
            return 8;//popScale(d.urbanPop);
        })
        .attr('fill','rgba(50,50, 50,.7)')
        .style('stroke-width', ".5px")
        .attr('stroke','rgb(200,200, 200)')
        .style('fill-opacity','1')
        .attr('class','land-area');
    
    countryRectGroups
        .append('rect')
        .attr('x', function(d,i){
            if(d.column == 1){ 
                return d.baseX + shiftPop1;
            }
            else if(d.column == 2){ 
                return d.baseX + shiftPop2;
            }
            else if(d.column == 3){ 
                return d.baseX + shiftPop3;
            }
            else if(d.column == 4){ 
                return d.baseX + shiftPop4;
            }
            else {
                return d.baseX +shiftPop5;
            }
        })
        .attr('y', function(d){
            return d.baseY - Math.max(landAreaScale(Math.max(d.agriculturalLand, d.forestArea,d.degradingArea)),sizePopBox)
                -topPadding + popBarYShift;
    
        })// + popScale(d.totalPop)-popScale(d.totalPop2050)})
        .attr('width', function(d){
            return popLineScale(d.totalPop2050);
        })
        .attr('height', function(d){
            return 8;//popScale(d.totalPop2050);
        })
        .attr('fill','none')
        //.style('stroke-dasharray', ("1.5,2.5"))
        .style('stroke-width', "0.5px")
        .attr('stroke','gray')
        .attr('class','land-area');
    
    
     //*******************************
     // Add people
     //*******************************
    
    //label people per km
    countryPeoplePerLabels
        .append('text')
        .attr('x',function(d,i){
                if (d.column == 1){
                    return d.baseX + shiftPopBox1;
                }
                else if (d.column == 2){
                    return d.baseX + shiftPopBox2;
                }
                else if (d.column == 3){
                    return d.baseX + shiftPopBox3;
                }
                else if (d.column == 4){
                    return d.baseX + shiftPopBox4;
                }
                else if (d.column == 5){
                    return d.baseX + shiftPopBox5;
                }
                else if (d.column == 6){
                    return d.baseX + shiftPopBox6;
                }
                else {
                    return d.baseX + shiftPopBox7;
                }
        })
        .attr('y',function(d,i){
            return d.baseY - 100 - 10;            
        })
        .style('font-size',24)
        .style('text-anchor','middle')
        .style('fill','gray')
        .text(function(d){
            return d.peoplePerKm;
        });

    
    
    /*
   var peopleGroup = countryRectGroups
        .append('g')
        .attr('class','little-people')
        .attr('grid', function(d,i){
            //var parentGroup = d;
            //console.log(parentGroup);
            var peopleArray = [];
        
            //make an array of ones of length = # of people/km
            for(var i=0; i < d.peoplePerKm; i++){
                if (i<d.peoplePerKmUrban){
                    peopleArray.push({type:0});
                }
                else {
                    peopleArray.push({type:1});
                }
            }
            
            d.peopleArray  = peopleArray;
        })
        .attr('transform', function(d){ 
                if (d.column == 1){
                    return 'translate(' + (d.baseX +shiftPop1) + ','+ (d.baseY - 
                    landAreaScale(Math.max(d.agriculturalLand, d.forestArea, d.degradingArea)) +25) + ')'
                }
                else if (d.column ==2) {
                    return 'translate(' + (d.baseX +shiftPop2) + ','+ (d.baseY - 
                    landAreaScale(Math.max(d.agriculturalLand, d.forestArea, d.degradingArea)) +25) + ')'
                }
                else if (d.column ==3) {
                    return 'translate(' + (d.baseX +shiftPop3) + ','+ (d.baseY - 
                    landAreaScale(Math.max(d.agriculturalLand, d.forestArea, d.degradingArea)) +25) + ')'
                }
                else if (d.column ==4) {
                    return 'translate(' + (d.baseX +shiftPop4) + ','+ (d.baseY - 
                    landAreaScale(Math.max(d.agriculturalLand, d.forestArea, d.degradingArea)) +25) + ')'
                }
                else {
                    return 'translate(' + (d.baseX +shiftPop5) + ','+ (d.baseY - 
                    landAreaScale(Math.max(d.agriculturalLand, d.forestArea, d.degradingArea)) +25) + ')'
                }
        });
    
        
        //make a grid layout using the array
        peopleGroup.selectAll('.testing')
            .data(function(d){
                var localGrid = d3.layout.grid()
                   .bands()
                   //.size([550, 50])
                    .cols([50])
                   .nodeSize([10,10])
                   .padding([1,0]);
                return localGrid(d.peopleArray);
            })
            
                //return peopleGrid(d.peopleArray)})//data, function (d){
                //console.log(peopleGrid(d.peopleArray));
                //return peopleGrid[1,1,1,1]})//(d.peopleArray)})
            .enter()
            .append('circle')
            .attr("class", "person")
            .attr('r',20)
            .style('fill', function(d){
                if(d.type == 0){
                    return 'rgb(50,50, 50)';
                        
                }
                else {return 'rgb(200,200, 200)';}
            })
            .style('fill-opacity', function(d){ 
                if(d.type == 0){
                    return '.7';
                        
                }
                else {return '1';}
            })
            .attr('transform', function (d,i) {
                return 'translate('+ d.x + ','+ d.y + ')' + 'scale(0.12)' //+ d.baseX + ','+ d.baseY + ')' + 'scale(0.15)'
            });
 
    
        function tx_ty(d){
            var scale = Math.min.apply(null,
                peopleGrid.nodeSize().map(function(d){return d/iconSize;}));
        
        }

    drawPopBoxes();*/
    

    
}


