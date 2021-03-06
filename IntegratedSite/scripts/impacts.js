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

var impactData = [
    {name:"Chemicals", link:"./images/chemicals.png",
        coords:{relX:.686,relY:.249},
        textCoords:{relX:.755,relY:.190,width:200},
        text:"Chemical threats can come from accidental spills, salt water invasion of fertile land, residue from pesticides and chemical fertilizers, or from heavy metals leached from mines and landfills."
    },
    {name:"Compaction", link:"./images/compaction.png",
        coords:{relX:.515,relY:.577},
        textCoords:{relX:.435,relY:.322,width:300},
        text:"Compaction occurs when the soil becomes too hard-packed for plants to grow. This usually occurs because of heavy traffic, construction or agricultural equipment, grazing herds of animals, or excessive foot traffic in an area."},
    {name:"Erosion", link:"./images/erosion.png",
        coords:{relX:.472,relY:.854},
        textCoords:{relX:.085,relY:.795,width:225},
        text:"Erosion happens when soil is carried away by water or wind. Soil that is not held in place by plant roots is especially vulnerable to erosion from rainfall, flooding, windstorms, and other natural events."},
    {name:"Overfarming", link:"./images/overfarming.png",
        coords:{relX:.751,relY:.636},
        textCoords:{relX:.82,relY:.583,width:180},
        text:"Overfarming damages the soil structure through compaction and erosion from repeated tilling, loss of soil nutrients, and buildup of chemical fertilizers in the soil."},
    {name:"Sealing", link:"./images/sealing.png",
        coords:{relX:.298,relY:.554},
        textCoords:{relX:.04,relY:.493,width:130},
        text:"Sealing is any process that covers soil with permanent structures that plant roots and rain cannot penetrate. Buildings, paved roads and parking lots are primary sources of sealing. Soil that is sealed cannot absorb rainfall, and often leads to flooding and erosion nearby."},
    {name:"Urbanization", link:"./images/urbanization.png",
        coords:{relX:.422,relY:.196},
        textCoords:{relX:.020,relY:.145,width:225},
        text:"As cities grow, they take up more land. Heavy traffic and land development often leads to compaction and sealing of surrounding soil, and can promote flooding as well. Cities also require large amounts of food and roads for transportation, and may have a large footprint outside of the city limits."}
];


//http://jsfiddle.net/J8sp3/4/

var roots = d3.xml("./images/impacts connectors-04.svg").mimeType("image/svg+xml").get(function(error, loadedSVG) {
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

var impactNodes = svg.selectAll('.impacts')
	.data(impactData)
	.enter()
	.append('g')
    .attr('transform','translate(' + illustratorOffset + ',' + 0 + ')');



var pattern = impactNodes.append("defs")
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

impactNodes.append('text')
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

var text = impactNodes.append('text')
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

impactNodes.append('circle')
    .attr('cx',function(d,i){
        return d.coords.relX*heightNM*(1/illustratorAR);
        /*if(i<3){
            return 70;
        }
        else{
            return width/2+50; //+ 150*Math.sin((i+1)*Math.PI/3);
        }*/
    })
    .attr('cy',function(d,i){
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
    .attr('r',illustratorScaledRadius)
    .style("fill", function(d){ return 'url(#pattern-' + d.id + ')'})
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

