
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
        .call(d3.axisBottom(x));
            //.tickValues([1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015])); //come back and rebuild this!

    xAxis
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr('dx','-2em')
        .attr("dy", ".35em")
        .attr('font-size','12px')
        .attr("transform", "translate(0,"+ -ecoHeight/2 + ")rotate(-90)")
        .attr('fill','gray')
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
        .text('Distribution of carbon in the soil');

    barGroup.append('text')
        .attr('class', 'bar-label')
        .attr('fill',"gray")
        .style('font-size', 12);

    //draw bars
    stackGroup = barGroup.selectAll(".abovebar")
        .data(data)
        .enter()
        .append('g')
        .attr('class','stackgroup')
        .on('mouseenter',function(d){
            //set the tracker to true when the bar is entered
            tracker.mouseover = true;

            d3.select(this).select('.backgroundbar').attr('fill-opacity',0.15);
            d3.selectAll('.majormap').selectAll('.country').style('fill','none');
            d3.selectAll('.landuseplot').selectAll('.countryBarGroup').remove();
            d3.selectAll('.landuseplot').selectAll('text').remove();
            d3.selectAll('.landuseplot').selectAll('.axis').remove();
            tracker.biomes = JSON.parse("[" + d.wwfDescript + "]");
            drawEcoMap(ecoMap);
        })
        .on('mouseleave', function(d){
            //set the tracker back to false when the mouse leaves
            tracker.mouseover = false;

            d3.select(this).select('.backgroundbar').attr('fill-opacity',0.05);
            tracker.biomes = [];

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

            },200);

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
        .attr('fill', 'gray')
        .attr('fill-opacity',0.05);



}