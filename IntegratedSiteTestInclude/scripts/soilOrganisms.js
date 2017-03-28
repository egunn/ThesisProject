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

var organismData = [
	{name:"Arthropods", link:"./images/arthropods.png",
        coords:{relX:.70,relY:.265},
        textCoords:{relX:.766,relY:.208,width:200},
		text:"Soil arthropods include spiders, mites, millipedes, centipedes, and ants. The smaller species shred and eat plant matter. Larger arthropods often prey on smaller species, and other soil organisms."
	},
    {name:"Bacteria", link:"./images/bacteria.png",
        coords:{relX:.426,relY:.76},
        textCoords:{relX:.369,relY:.866,width:300},
		text:"Most bacteria decompose plant material or minerals, making nutrients available for plants and other organisms. Some bacteria convert nitrogen into a form that is useful for plants. Others are pathogens and cause disease."},
    {name:"Fungi", link:"./images/fungi.png",
        coords:{relX:.485,relY:.34},
        textCoords:{relX:.428,relY:.45,width:250},
		text:"Soil fungi grow in long threads called hyphae, and make mushrooms to release spores. Microscopic hyphae hold soil particles together, improving soil structure. Fungae decompose wood and other materials that bacteria cannot, and extract phosphorus, nitrogen, and other nutrients from soil."},
    {name:"Invertebrates", link:"./images/invertebrates.png",
        coords:{relX:.70,relY:.64},
        textCoords:{relX:.761,relY:.584,width:180},
		text:"Earthworms and nematodes are common soil invertebrates. Nematodes are microscopic worms that eat plant roots, bacteria and fungi, or each other. Earthworms are large worms that eat soil, playing a vital role in breaking plant matter down. Their tunnels also help to aerate the soil."},
    {name:"Plants", link:"./images/plants.png",
        coords:{relX:.433,relY:.128},
        textCoords:{relX:.04,relY:.061,width:200},
		text:"Plants make starches and sugars during photosynthesis. Dead leaves feed bacteria and other organisms in the soil. Plants constantly communicate with their environment using chemical signals and hormones to encourage soil organisms to colonize their roots."},
    {name:"Protozoa", link:"./images/protozoa.png",
        coords:{relX:.28,relY:.46},
        textCoords:{relX:.000,relY:.404,width:170},
        text:"Protozoa are small, single-celled organisms, usually ten to a hundred times larger than bacteria. They feed primarily on soil bacteria, but can also eat fungi and soil organic matter as well. When protozoa feed on bacteria, they release nitrogen into the soil, which plants use to grow."}
];


//http://jsfiddle.net/J8sp3/4/

var roots = d3.xml("./images/soil microbiome arrows only.svg").mimeType("image/svg+xml").get(function(error, loadedSVG) {
    if (error) throw error;

    var svgNode = loadedSVG
        .getElementsByTagName("svg")[0];

    main_chart_svg = d3.select('#vis');

    main_chart_svg.node().appendChild(svgNode);

    //original SVG dimensions: 832/552: scale to current window
    var innerSVG = main_chart_svg.select("svg")
        .attr('transform','scale(' + height/552 + ')');

});

var radius = 40;
var padding = 10;

heightScale = 552/heightNM;
var illustratorOffset = width/2 - .5*heightNM*(1/illustratorAR);
illustratorOffsetY = .04*heightNM; //circles don't start at edge of illustrator diagram - off by 22 px, of 552.
illustratorScaledRadius =  .077*heightNM; // radius is 42.5/552 px in illustrator, or 7.%%

console.log(illustratorScaledRadius);

var organismNodes = svg.selectAll('.organisms')
	.data(organismData)
	.enter()
	.append('g')
    .attr('transform','translate(' + illustratorOffset + ',' + 0 + ')');


//http://stackoverflow.com/questions/33895786/image-blurry-when-using-url-fill-pattern-for-svg-circle
//http://stackoverflow.com/questions/29087113/why-is-my-svg-image-blurry-when-using-a-fill-pattern
//http://unmatchedstyle.com/news/svg-and-the-preserveaspectratio-property.php
//http://stackoverflow.com/questions/25881186/d3-fill-shape-with-image-using-pattern
//http://stackoverflow.com/questions/27449360/d3-svg-background-blurry
//http://stackoverflow.com/questions/25881186/d3-fill-shape-with-image-using-pattern
//switch to svg to avoid blurriness?
var pattern = organismNodes.append("defs")
    .append("pattern")
    .attr('id',function(d){return 'pattern-' + d.name;})
    .attr("width", "100%")
    .attr("height", "102%")
    //.attr('patternContentUnits',"objectBoundingBox")
    .attr("patternUnits", "objectBoundingBox")
    .attr('viewBox',"0 0 1 1")
    //.attr('preserveAspectRatio',"xMidYMid slice")
    .append('image')
    .attr("height", 1)  //appears to set image origin, and possibly scale?
    .attr("width", 1)
    .attr('preserveAspectRatio',"xMidYMid slice")
    .attr("xlink:href", function(d){ return  d.link});//'url'+

organismNodes.append('text')
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
        return heightNM*d.coords.relY - illustratorScaledRadius -4;
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

var text = organismNodes.append('text')
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

organismNodes.append('circle')
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
    .style("fill", function(d){ return 'url(#pattern-' + d.name + ')'})
    .on('mouseover',function(d){
        if (d.name == "Fungi"){

            //d3.select(this.parentNode)
            svg
                .append('rect')
                .attr('id','fungi-box')
                .attr('x',function(e){
                    return d.textCoords.relX*heightNM*(1/illustratorAR) - 3 + illustratorOffset;
                })
                .attr('y',function(e){
                    return heightNM*d.textCoords.relY - 11;
                })
                .attr('width',260)
                .attr('height',112)
                .attr('fill-opacity',.85)
                .attr('fill','white');

            svg
                .append('text')
                .attr('id','fungi-text')
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

            wrap(d3.select('#fungi-text').text('test'), d.text, d.textCoords.width);
        }
        else{
            wrap(d3.select('#'+ d.name).text('test'), d.text, d.textCoords.width);
        }

    })
    .on('mouseout',function(d){
        d3.select('#'+ d.name).text(null);

        d3.select('#fungi-box').remove();
        d3.select('#fungi-text').remove();
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

