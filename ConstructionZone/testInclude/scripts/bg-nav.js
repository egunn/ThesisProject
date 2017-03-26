var bgSVG = d3.selectAll('.bg-svg');

var fgWidth = document.getElementById('vis').clientWidth;

bgSVG.append('circle')
    .attr('cx',fgWidth/2)
    .attr('cy',275)
    .attr('r',fgWidth/2)
    .attr('fill','purple')
    .attr('fill-opacity',.1);


bgSVG.append('circle')
    .attr('cx',(fgWidth/2)+675*Math.sin(24*Math.PI/48))
    .attr('cy',275+675*Math.cos(6*Math.PI/12))
    .attr('r',10)
    .attr('fill','purple')
    .attr('fill-opacity',.5);

bgSVG.append('circle')
    .attr('cx',(fgWidth/2)+675*Math.sin(23*Math.PI/48))
    .attr('cy',275+675*Math.cos(23*Math.PI/48))
    .attr('r',10)
    .attr('fill','purple')
    .attr('fill-opacity',.5);

bgSVG.append('circle')
    .attr('cx',(fgWidth/2)+675*Math.sin(25*Math.PI/48))
    .attr('cy',275+675*Math.cos(25*Math.PI/48))
    .attr('r',10)
    .attr('fill','purple')
    .attr('fill-opacity',.5);