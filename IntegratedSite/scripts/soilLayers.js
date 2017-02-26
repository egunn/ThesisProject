//setup page and global variables
//set some margins and record width and height of window
margin = {t: 25, r: 0, b: 25, l: 10};

width = document.getElementById('vis').clientWidth - margin.r - margin.l;
height = document.getElementById('vis').clientHeight - margin.t - margin.b;
heightNM = document.getElementById('vis').clientHeight;

illustratorAR = 0.66;

var svg = d3.select("#vis");

var canvas = d3.select("#vis-canvas")
    .attr('width',width)
    .attr('height', height)
    .style('width','100%')
    .style('height','450px');

var layerData = [
    {name:"Humus", displayName:"Humus", link:"./images/compaction.png",
        coords:{relX:.174,relY:.228,relW:.269,relH:0.021},
        textCoords:{relX:.48,relY:.228,width:200},
        text:"Humus comes mostly from discarded plant leaves and bark."},
    {name:"Topsoil", displayName:"Topsoil", link:"./images/erosion.png",
        coords:{relX:.174,relY:.248,relW:.269,relH:0.137},
        textCoords:{relX:.48,relY:.248,width:200},
        text:"Topsoil contains a large quantity of humus, mixed with mineral components, and is where most plant growth occurs."},
    {name:"Eluviation", displayName:"Eluviation Layer", link:"./images/overfarming.png",
        coords:{relX:.174,relY:.386,relW:.269,relH:0.085},
        textCoords:{relX:.48,relY:.386,width:200},
        text:"The eluviation layer is a lighter color because water has leached most of its mineral content away, leaving only sand and silt behind."},
    {name:"Subsoil", displayName:"Subsoil", link:"./images/sealing.png",
        coords:{relX:.174,relY:.471,relW:.269,relH:0.185},
        textCoords:{relX:.48, relY:.471,width:200},
        text:"Subsoil is a dense, mineral-rich layer where silt and mineral nutrients washed out of the eluviation layer tend to accumulate."},
    {name:"Regolith", displayName:"Regolith", link:"./images/urbanization.png",
        coords:{relX:.174,relY:.656,relW:.269,relH:0.125},
        textCoords:{relX:.48,relY:.656,width:200},
        text:"The regolith separates the upper soil layers from the rock below. It is mostly made up of rocks and gravel, and contains almost no organic material. Plant roots do not grow into this layer."},
    {name:"Bedrock", displayName:"Bedrock", link:"./images/urbanization.png",
        coords:{relX:.174,relY:.781,relW:.269,relH:0.164},
        textCoords:{relX:.48,relY:.781,width:200},
        text:"The bedrock layer is made up of rock in the earth's crust, and forms the foundation for all soil."}
];


//http://jsfiddle.net/J8sp3/4/

var roots = d3.xml("./images/soil horizons-01.svg").mimeType("image/svg+xml").get(function(error, loadedSVG) {
    if (error) throw error;

    var svgNode = loadedSVG
        .getElementsByTagName("svg")[0];

    main_chart_svg = d3.select('#vis');

    main_chart_svg.node().appendChild(svgNode);

    //original SVG dimensions: 832/552: scale to current window
    var innerSVG = main_chart_svg.select("svg")
        .attr('transform','scale(' + height/552 + ')');

});

//because the loaded SVG insists on showing up on top, turn off all pointer events for it (looks like it's applied globally until turned back on below)
d3.selectAll('*').attr('pointer-events','none');
d3.selectAll('.page-nav').attr('pointer-events','all');

var radius = 50;
var padding = 10;

heightScale = 552/heightNM;
var illustratorOffset = width/2 - .5*heightNM*(1/illustratorAR);
illustratorOffsetY = .04*heightNM; //circles don't start at edge of illustrator diagram - off by 22 px, of 552.
illustratorScaledRadius =  .077*heightNM; // radius is 42.5/552 px in illustrator, or 7.%%

console.log(heightScale);

var layerNodes = svg.selectAll('.layers')
	.data(layerData, function(d){return d.name})
	.enter()
	.append('g')
    .attr('class','drawing-group')
    .attr('transform','translate(' + illustratorOffset + ',' + 0 + ')')
    .attr('pointer-events','all');  //turn mouse events back on for hidden selection rectangles

/*

var pattern = layerNodes.append("defs")
    .append("pattern")
    .attr('id',function(d){ return 'pattern-' + d.id;})
    .attr("width", "100%")
    .attr("height", "100%")
    .attr('patternContentUnits',"objectBoundingBox")
    .attr('viewBox',"0 0 1 1")
    .attr('preserveAspectRatio',"xMidYMid slice")
    .append('image')
    .attr("height", 1)
    .attr("width", 1)
    .attr('preserveAspectRatio',"xMidYMid slice")
    .attr("xlink:href", function(d){ return d.link});
    */

var introText = svg.append('text')
    .attr('class','init-text')
    .attr('x', .55*heightNM*(1/illustratorAR))
    .attr('y',.26*heightNM)
    .style('text-anchor','begin')
    .attr('font-size',12)
    .attr('font-family','WorkSansExtraLight')
    .attr('fill','gray')
    .text(null);

introText.transition()
    .on('end',function(){

        wrap(d3.select('.init-text').text('test'),'Soil is a complicated substance made up of several layers. Hover over each layer to learn more about it.', 200);

    });


layerNodes.append('text')
	.attr('x',function(d,i){
	    return d.textCoords.relX*heightNM*(1/illustratorAR) - 220;
        /*if(i<3){
            return 70 + radius + padding;
        }
        else{
            return width/2+50 + radius + padding; //+ 150*Math.sin((i+1)*Math.PI/3);
        }*/
    })
	.attr('y',function(d,i){
	    if (d.name =="Humus"){
            return heightNM*d.textCoords.relY + 8;
        }
        else if (d.name == "Topsoil"){
            return heightNM*d.textCoords.relY + heightNM*d.coords.relH/2;
        }
        else if (d.name == "Eluviation"){
            return heightNM*d.textCoords.relY + 12;
        }
        else{
            return heightNM*d.textCoords.relY + heightNM*d.coords.relH/2;
        }

        /*if(i==0 || i==4){
            return 70 - radius/2 - 15;
        }
        else if(i==1 || i==5){
            return 220 - radius/2 - 15;
        }
        else{
            return 370 - radius/2 - 15; //+ 150*Math.sin((i+1)*Math.PI/3);
        }*/
        // + 150*Math.cos((i+1)*Math.PI/3);
    })
	.style('text-transform','uppercase')
	.style('letter-spacing','.15em')
	.style('text-anchor','end')
	.attr('fill','gray')
	.text(function(d){
	    //append second line for eluviation (can't insert a linebreak)
	    if (d.name == "Eluviation"){
	        console.log( d3.select(this));
            d3.select(this.parentNode).append("text")
                .attr("y", function(d,i){return heightNM*d.textCoords.relY + 28;})
                .attr("x",function(d,i){
                    return d.textCoords.relX*heightNM*(1/illustratorAR) - 220;})
                .style('text-transform','uppercase')
                .style('letter-spacing','.15em')
                .style('text-anchor','end')
                .attr('fill','gray')
                .text("Layer");
        }
	    return d.name;});

var text = layerNodes.append('text')
    .attr('class','to-wrap')
    .attr('x',function(d,i){
        return d.textCoords.relX*heightNM*(1/illustratorAR);
        /*
        if(i<3){
            return 70 + radius + padding;
        }
        else{
            return width/2+50 + radius + padding; //+ 150*Math.sin((i+1)*Math.PI/3);
        }*/
    })
    .attr('y',function(d,i){
        if (d.name =="Humus"){
            return heightNM*d.textCoords.relY + 8;
        }
        else {
            return heightNM*d.textCoords.relY + 8;//heightNM*d.coords.relH/2;
        }

        /*
        if(i==0 || i==4){
            return 70 - radius/2 + 2;
        }
        else if(i==1 || i==5){
            return 220 - radius/2 + 2;
        }
        else{
            return 370 - radius/2 + 2; //+ 150*Math.sin((i+1)*Math.PI/3);
        }*/
        // + 150*Math.cos((i+1)*Math.PI/3);
    })
    .attr('id',function(d){
        return d.name;
    })
    .style('text-anchor','begin')
    .attr('font-size',12)
    .attr('fill','gray')
    .attr('background','white')
    .text(null);

layerNodes.append('rect')
    .attr('x',function(d,i){
        return d.coords.relX*heightNM*(1/illustratorAR);
        /*if(i<3){
            return 70;
        }
        else{
            return width/2+50; //+ 150*Math.sin((i+1)*Math.PI/3);
        }*/
    })
    .attr('y',function(d,i){
        return heightNM*d.coords.relY;
        /*if(i==0 || i==4){
            return 70;
        }
        else if(i==1 || i==5){
            return 220;
        }
        else{
            return 370; //+ 150*Math.sin((i+1)*Math.PI/3);
        }*/
        // + 150*Math.cos((i+1)*Math.PI/3);
    })
    .attr('width', function(d,i){
        return 250;//d.coords.relW*heightNM*(1/illustratorAR);
    })
    .attr('height', function(d,i){
        return heightNM*d.coords.relH;
    })
    .style("fill", 'transparent')//'blue'
    .attr('fill-opacity',.2)
    .on('mouseover',function(d){

        d3.selectAll('.init-text').remove();

        if (d.name == "Compaction"){

            //d3.select(this.parentNode)
            svg
                .append('rect')
                .attr('id','compaction-box')
                .attr('x',function(e){
                    return d.textCoords.relX*heightNM*(1/illustratorAR) - 3 + illustratorOffset;
                })
                .attr('y',function(e){
                    return heightNM*d.textCoords.relY - 11;
                })
                .attr('width',260)
                .attr('height',70)
                .attr('fill-opacity',.85)
                .attr('fill','white');

            svg
                .append('text')
                .attr('id','compaction-text')
                .attr('x',function(e){
                    return d.textCoords.relX*heightNM*(1/illustratorAR)+ illustratorOffset;
                })
                .attr('y',function(e){
                    return heightNM*d.textCoords.relY;
                })
                .style('text-anchor','begin')
                .attr('font-size',12)
                .attr('fill','gray')
                .attr('background','white')
                .text(null);

            wrap(d3.select('#compaction-text').text('test'), d.text, d.textCoords.width);
        }
        else{
            wrap(d3.select('#'+ d.name).text('test'), d.text, d.textCoords.width);
        }

    })
    .on('mouseout',function(d){
        d3.select('#'+ d.name).text(null);

        d3.select('#compaction-box').remove();
        d3.select('#compaction-text').remove();
    });



/*

text
	.transition()
	.on('start',function(d){
        var text = d3.select(this);

    });
*/

//from http://stackoverflow.com/questions/24784302/wrapping-text-in-d3
function wrap(text, wordList, width) {
    text.each(function () {
        var text = d3.select(this),
            words = wordList.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.15, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}

