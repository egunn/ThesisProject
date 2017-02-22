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
    {name:"Leaf litter and humus", link:"./images/compaction.png",
        coords:{relX:.174,relY:.238,relW:.269,relH:0.011},
        textCoords:{relX:.435,relY:.322,width:300},
        text:"Humus comes mostly from discarded plant leaves and bark."},
    {name:"Topsoil", link:"./images/erosion.png",
        coords:{relX:.174,relY:.248,relW:.269,relH:0.137},
        textCoords:{relX:.085,relY:.795,width:225},
        text:"Topsoil contains a large quantity of humus, mixed with mineral components, and is the fertile soil where most plant growth occurs."},
    {name:"Eluviation Layer", link:"./images/overfarming.png",
        coords:{relX:.174,relY:.386,relW:.269,relH:0.085},
        textCoords:{relX:.82,relY:.583,width:180},
        text:"The eluviation layer is a lighter color because most of its mineral content has leached away, leaving only sand and silt behind."},
    {name:"Subsoil", link:"./images/sealing.png",
        coords:{relX:.174,relY:.471,relW:.269,relH:0.185},
        textCoords:{relX:.04,relY:.493,width:130},
        text:"Subsoil is a dense, mineral-rich layer where silt and mineral nutrients washed out of the eluviation layer tend to accumulate."},
    {name:"Regolith", link:"./images/urbanization.png",
        coords:{relX:.174,relY:.656,relW:.269,relH:0.125},
        textCoords:{relX:.020,relY:.145,width:225},
        text:"The regolith separates the upper soil layers from the rock below. It is mostly made up of rocks and gravel, and contains almost no organic material. Plant roots do not grow into this layer."},
    {name:"Bedrock", link:"./images/urbanization.png",
        coords:{relX:.174,relY:.781,relW:.269,relH:0.164},
        textCoords:{relX:.020,relY:.145,width:225},
        text:"The bedrock layer is made up of soil rock in the earth's crust, and forms the foundation for all soil."}
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

var radius = 50;
var padding = 10;

heightScale = 552/heightNM;
var illustratorOffset = width/2 - .5*heightNM*(1/illustratorAR);
illustratorOffsetY = .04*heightNM; //circles don't start at edge of illustrator diagram - off by 22 px, of 552.
illustratorScaledRadius =  .077*heightNM; // radius is 42.5/552 px in illustrator, or 7.%%

console.log(heightScale);

var layerNodes = svg.selectAll('.layers')
	.data(layerData)
	.enter()
	.append('g')
    .attr('transform','translate(' + illustratorOffset + ',' + 0 + ')');

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

layerNodes.append('text')
	.attr('x',function(d,i){
	    return d.coords.relX*heightNM*(1/illustratorAR);
        /*if(i<3){
            return 70 + radius + padding;
        }
        else{
            return width/2+50 + radius + padding; //+ 150*Math.sin((i+1)*Math.PI/3);
        }*/
    })
	.attr('y',function(d,i){
        return heightNM*d.coords.relY - illustratorScaledRadius -6;
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
	.style('text-anchor','middle')
	.attr('fill','gray')
	.text(function(d){return d.name;});

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
        return heightNM*d.textCoords.relY ;
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
    .style("fill", 'blue')
    .on('mouseover',function(d){
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

