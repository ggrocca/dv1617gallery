
function compareDist(data) {
  //Titolo
  d3.select("svg").append("text")
    .attr("x", svgBounds.left+100)
    .attr("y", svgBounds.bottom-10)
    .attr("class", "homeTitle")
    .attr("id", "secondLine")
    .text("Distances < From the sun")
    .style("font-size", "35px")
    .attr("fill", "orange")
    .style("opacity", "0");
  d3.select(".homeTitle").transition()
    .duration(750)
    .style("opacity", "1");

  d3.select("#dist").style("background-color", "#492b05");

  var planets = d3.select("#planets").selectAll("circle").data(data);
  var names = d3.select("#planets").selectAll(".labels");

  var scaleDist = d3.scaleLinear()
      .domain([d3.min(data, function(d){return d.dist;}), d3.max(data, function(d){return d.dist;})])
      .range([0, svgWidth-500]);

  var scaleRadius = d3.scaleLinear()
      .domain([d3.min(data, function(d){return d.radius;}), d3.max(data, function(d){return d.radius;})])
      .range([5, 300]);

  //Sposto il sole
  d3.select("#Sun")
  .attr("r", function(d) {return scaleRadius(d.radius);})
  .attr("cx", function(d) {return scaleRadius(d.radius)*(-0.75);});

  var sun = d3.select("#Sun");
  var posPrev = 0;
  var distPrev = 0;
  var radiusPrev = parseInt(sun.attr("cx")) + parseInt(sun.attr("r"));

  //Sposto i pianetini
  planets.transition()
  .filter(function(d){return d.key!="Sun"})
  .attr("r", function(d){return scaleRadius(d.radius);})
  .attr("cx", function(d){
    posPrev = posPrev + (scaleDist(d.dist) - distPrev) + scaleRadius(d.radius) + radiusPrev;
    radiusPrev = scaleRadius(d.radius);
    distPrev = scaleDist(d.dist);
    return posPrev;})
  .attr("cy", yInit)
  .style("opacity", "0.6");

  d3.select("#Sun").style("opacity", "1");

  var line = "M " + d3.select("#Sun").attr("cx") + " " + d3.select("#Sun").attr("cy") + " L " + posPrev + " " + d3.select("#Sun").attr("cy");

  //Linea in mezzo ai pianetini
  d3.select("#planets").append("path")
  .attr("d", line)
  .style("stroke", "white")
  .style("stroke-width", "1px")
  .style("opacity", "0.5");

  //Mouseover su pianetini e labels
  function mouseoverDist(d){
    x = d3.select("#"+d.key).attr("cx");
    y = d3.select("#"+d.key).attr("cy");
    r = d3.select("#"+d.key).attr("r");
    newY = parseInt(y) + parseInt(r) + parseInt(50);
    var path = "M " + x + " " + y + " L " + x + " " + newY + " L " + 0 + " " + newY;

    d3.select("#"+d.key)
    .style("opacity", "1");

    d3.select("#planets").append("path")
    .attr("d", path)
    .attr("class", "infoLine")
    .style("stroke", "orange")
    .style("stroke-width", "2px")
    .style("fill", "none");

    d3.select("#planets").append("text")
    .text(d.key)
    .attr("class", "distancesKM")
    .attr("x", x)
    .attr("y", newY+20)
    .style("fill", "orange")
    .style("font-size", "16px")
    .style("font-weight", "bold");
    d3.select("#planets").append("text")
    .text(d.dist+"M Km from the Sun")
    .attr("class", "distancesKM")
    .attr("x", x)
    .attr("y", newY+40)
    .style("fill", "orange")
    .style("font-size", "13px");

    d3.select("#"+d.key+"Button")
    .style("background-color", "#492b05");
  };

  //Mouseout su pianetini e labels
  function mouseoutDist(d){
    d3.selectAll(".infoLine").remove();
    planets.style("opacity", "0.6");
    d3.select("#Sun").style("opacity", "1");
    d3.selectAll(".distancesKM").remove();
    d3.selectAll(".nominiButton").style("background-color", "black");
  }

  planets.on("mouseover", mouseoverDist)
  .on("mouseout", mouseoutDist);

  //Sposto labels
  names.transition()
  .attr("x", function(d,i){return i*(svgWidth/10)+50;})
  .attr("y", yInit*2)
  .style("visibility", "hidden");

  submenu = d3.select("body").append("div")
    .attr("id", "submenu")
    .attr("class", "nominiButton");

  names.each(function(d){
    submenu.append("button")
    .attr("class", "nominiButton")
    .attr("id", d.key+"Button")
    .text(d.key)
    .on("mouseover", function(){ mouseoverDist(d);})
    .on("mouseout", function(){mouseoutDist(d);});
  })

}
