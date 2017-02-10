//setup page and global variables
//set some margins and record width and height of window
margin = {t: 25, r: 0, b: 25, l: 10};

width = document.getElementById('vis').clientWidth - margin.r - margin.l;
height = document.getElementById('vis').clientHeight - margin.t - margin.b;

ecoPlot = d3.select("#vis");

var svg = d3.select("#vis");

var canvas = d3.select("#vis-canvas")
    .attr('width',width)
    .attr('height', height)
    .style('width','100%')
    .style('height','450px');

var organismData = [
	{name:"Arthropods", link:"./images/arthropods.png",
		text:"Soil arthropods include spiders, mites, millipedes, centipedes, and ants. The smaller species shred and eat plant matter. Larger arthropods often prey on smaller species, and other soil organisms."
	},
    {name:"Bacteria", link:"./images/bacteria.png",
		text:"Soil bacteria play a number of roles in the soil ecosystem. Most bacteria decompose plant material or minerals, making nutrients available for plants and other organisms. Some bacteria convert nitrogen into a form that is useful for plants. Others are pathogens and cause disease."},
    {name:"Fungi", link:"./images/fungi.png",
		text:"Soil fungi grow in long threads called hyphae, and make mushrooms to release spores. Microscopic hyphae hold soil particles together, improving soil structure. Fungae decompose wood and other materials that bacteria cannot, and extract phosphorus, nitrogen, and other nutrients from soil."},
    {name:"Invertebrates", link:"./images/invertebrates.png",
		text:"Earthworms and nematodes are common soil invertebrates. Nematodes are microscopic worms that eat plant roots, bacteria and fungi, or each other. Earthworms are large worms that eat soil, playing a vital role in breaking plant matter down. Their tunnels also help to aerate the soil."},
    {name:"Plants", link:"./images/plants.png",
		text:"Plants constantly communicate with their environment by giving off chemical signals and hormones that encourage soil organisms to colonize their roots. Understanding the details of this interaction will help to improve plant and soil health, and increase food production."},
    {name:"Protozoa", link:"./images/protozoa.png",
		text:"Protozoa are small, single-celled organisms, usually ten to a hundred times larger than bacteria. They feed primarily on soil bacteria, but can also eat fungi and soil organic matter as well. When protozoa feed on bacteria, they release nitrogen into the soil, which plants use to grow."}
];

var radius = 60;
var padding = 10;

var organismNodes = svg.selectAll('.organisms')
	.data(organismData)
	.enter()
	.append('g');


var pattern = organismNodes.append("defs")
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



organismNodes.append('circle')
	.attr('cx',function(d,i){
		if(i<3){
			return 70;
		}
		else{
            return width/2+50; //+ 150*Math.sin((i+1)*Math.PI/3);
		}
	})
	.attr('cy',function(d,i){
        if(i==0 || i==4){
            return 70;
        }
        else if(i==1 || i==5){
            return 220;
		}
        else{
            return 370; //+ 150*Math.sin((i+1)*Math.PI/3);
        }
     // + 150*Math.cos((i+1)*Math.PI/3);
    })
	.attr('r',radius)
    .style("fill", function(d){ return 'url(#pattern-' + d.id + ')'});

organismNodes.append('text')
	.attr('x',function(d,i){
        if(i<3){
            return 70 + radius + padding;
        }
        else{
            return width/2+50 + radius + padding; //+ 150*Math.sin((i+1)*Math.PI/3);
        }
    })
	.attr('y',function(d,i){
        if(i==0 || i==4){
            return 70 - radius/2 - 15;
        }
        else if(i==1 || i==5){
            return 220 - radius/2 - 15;
        }
        else{
            return 370 - radius/2 - 15; //+ 150*Math.sin((i+1)*Math.PI/3);
        }
        // + 150*Math.cos((i+1)*Math.PI/3);
    })
	.style('text-transform','uppercase')
	.style('letter-spacing','.15em')
	.style('text-anchor','begin')
	.attr('fill','gray')
	.text(function(d){return d.name;});


var text = organismNodes.append('text')
	.attr('class','to-wrap')
    .attr('x',function(d,i){
        if(i<3){
            return 70 + radius + padding;
        }
        else{
            return width/2+50 + radius + padding; //+ 150*Math.sin((i+1)*Math.PI/3);
        }
    })
    .attr('y',function(d,i){
        if(i==0 || i==4){
            return 70 - radius/2 + 2;
        }
        else if(i==1 || i==5){
            return 220 - radius/2 + 2;
        }
        else{
            return 370 - radius/2 + 2; //+ 150*Math.sin((i+1)*Math.PI/3);
        }
        // + 150*Math.cos((i+1)*Math.PI/3);
    })
    .style('text-anchor','begin')
	.attr('font-size',12)
    .attr('fill','gray')
	.text(null);

text
	.transition()
	.on('start',function(d){
        var text = d3.select(this);
        wrap(text, d.text ,225);
    });


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

