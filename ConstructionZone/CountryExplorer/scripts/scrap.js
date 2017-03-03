
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


    var squaresGroup = svg.selectAll('.squares-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'squares-group')
        .attr('transform', 'translate(' + width / 4 + ',' + height / 3 + ')');

    var statsGroup = svg.selectAll('.stats-group')
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
