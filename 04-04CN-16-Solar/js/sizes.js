function compareSize(data) {
  //Titolo
  d3.select("svg").append("text")
    .attr("x", svgBounds.left+100)
    .attr("y", svgBounds.bottom-10)
    .attr("class", "homeTitle")
    .attr("id", "secondLine")
    .text("Let's compare Diameters <")
    .style("font-size", "35px")
    .attr("fill", "orange")
    .style("opacity", "0");
  d3.select(".homeTitle").transition()
    .duration(750)
    .style("opacity", "1");

  d3.select("#size").style("background-color", "#492b05");
  var radiusEarth;
  var radiusSun;
  var radiusScale = d3.scaleLinear()
      .domain([0, maxr])
      .range([svgWidth/100, svgWidth/10]);

  var min = svgWidth/100;
  var max = svgWidth/10;

  var quantospuntailsole = parseInt(scaleDim(data, min, max, maxr)*(-9)) + parseInt(scaleDim(data, min, max, maxr)*(10));
  var startX = (0)*80+quantospuntailsole+50; //Mercury
  var stopX = (8)*80+parseInt(earth)+quantospuntailsole+50;  //Neptune

  //Modifico dimensioni sole
  d3.select("#Sun")
  .attr("r", scaleDim(data, min, max, maxr)*10)
  .attr("cx", scaleDim(data, min, max, maxr)*(-9))
  .attr("cy", yInit);

  //Modifico dimensioni pianeti
  d3.select("#planets").selectAll("circle")
  .transition()
  .filter(function(d){if(d.key=="Sun") radiusSun = d.radius; else return d.key!="Sun"})
  .attr("r", function(d) {if(d.key=="Earth") radiusEarth=d.radius; return radiusScale(d.radius);})
  .attr("cy", function(d){return yInit+(radiusScale(maxr)-radiusScale(d.radius));})
  .attr("cx", function(d,i){return i*80+parseInt(earth)+quantospuntailsole+50;})
  .style("opacity", "0.5");

  //Testo a comparsa
  function mouseoverSize(d){
    d3.select("#"+d.key).style("opacity", "1");
    d3.select("#"+d.key+"Line").style("opacity", "1");
    d3.select("#planets").append("text")
      .text(d.key)
      .attr("class", "infoDist")
      .attr("x", stopX+10)
      .attr("y", d3.select("#"+d.key).attr("cy")-radiusScale(d.radius))
      .attr("fill", "orange")
      .style("font-size", "18px")
      .style("font-weight", "bolder");
    d3.select("#planets").append("text")
      .text("Diameter of")
      .attr("class", "infoDist")
      .attr("x", stopX+10)
      .attr("y", d3.select("#"+d.key).attr("cy")-radiusScale(d.radius)+20)
      .attr("fill", "orange");
    d3.select("#planets").append("text")
      .text(parseInt(d.radius*2)+" Km")
      .attr("class", "infoDist")
      .attr("x", stopX+10)
      .attr("y", d3.select("#"+d.key).attr("cy")-radiusScale(d.radius)+40)
      .attr("fill", "orange");
    d3.select("#planets").append("text")
      .text((Math.round((d.radius/radiusEarth) * 100) / 100)+"x Earth")
      .attr("class", "infoDist")
      .attr("x", stopX+10)
      .attr("y", d3.select("#"+d.key).attr("cy")-radiusScale(d.radius)+60)
      .attr("fill", "orange");
  }

  function mouseoutSize(d){
    d3.select("#"+d.key).style("opacity", "0.5");
    d3.select("#"+d.key+"Line").style("opacity", "0.5");
    d3.selectAll(".infoDist").remove();
  }

  d3.select("#planets").selectAll("circle")
    .filter(function(d){return d.key!="Sun"})
    .on("mouseover", function(d) {return mouseoverSize(d);})
    .on("mouseout", function(d) {return mouseoutSize(d);});

  d3.selectAll(".labels")
    .on("mouseover", function(d) {return mouseoverSize(d);})
    .on("mouseout", function(d) {return mouseoutSize(d);});

  //Creazione righe
  d3.select("#planets").selectAll("path")
  .data(data).enter()
  .filter(function(d){return d.key!="Sun"})
  .append("path")
  .attr("id", function(d){return d.key+"Line";})
  .attr("d", function(d,i){
      x = i*80+parseInt(earth)+quantospuntailsole+50;
      y = yInit+(radiusScale(maxr)-radiusScale(d.radius)) - radiusScale(d.radius);
      var string = "M "+x+" "+y+" L "+stopX+" "+y;
      return string;
    })
  .style("stroke-width", "2px")
  .attr("fill", "none")
  .style("stroke", function(d) {return planetColors[d.key];})
  .style("opacity", "0.3");

  var linePath = "M "+startX+" "+(yInit+radiusScale(maxr))+" L "+stopX+" "+(yInit+radiusScale(maxr))+" L "+stopX+" "+(yInit-radiusScale(maxr));

  //Asse Y
  d3.select("#planets")
  .append("path")
  .attr("d", linePath)
  .style("stroke-width", "2px")
  .attr("fill", "none")
  .style("stroke", "white");

  d3.selectAll(".labels")
  .transition()
  .attr("y", yInit+radiusScale(maxr)+20)
  .attr("x", function(d,i){return i*80+parseInt(earth)+quantospuntailsole+50-d.key.length*4;});

  var sunline = "M " + d3.select("#Sun").attr("cx") + " " + ( +d3.select("#Sun").attr("cy")-500 ) + " L " + svgWidth/7 + " " + ( +d3.select("#Sun").attr("cy")+svgHeight/3 ) + " L " + svgWidth/6 + " " + ( +d3.select("#Sun").attr("cy")+svgHeight/3 );
  d3.select("svg").append("path")
  .attr("class", "infoSun")
  .attr("d", sunline)
  .style("stroke", "orange")
  .attr("fill", "none")
  .style("stroke-width", "1px")
  .style("opacity", "1")

  d3.select("svg").append("text")
  .attr("class", "infoSun")
  .text("Sun's diameter: "+radiusSun*2+" Km")
  .attr("x", (svgWidth/6)+20)
  .attr("y", ( +d3.select("#Sun").attr("cy")+svgHeight/3 ))
  .attr("fill", "orange")
  .style("font-size", "15px")
  .style("font-weight", "bolder");
  d3.select("svg").append("text")
  .attr("class", "infoSun")
  .text((Math.round((radiusSun/radiusEarth) * 100) / 100)+"x Earth")
  .attr("x", (svgWidth/6)+20)
  .attr("y", ( +d3.select("#Sun").attr("cy")+svgHeight/3 )+20)
  .attr("fill", "orange")
  .style("font-size", "15px")
  .style("font-weight", "bolder");
}
