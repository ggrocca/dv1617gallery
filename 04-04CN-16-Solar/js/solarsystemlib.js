var svgBounds = d3.select("body").node().getBoundingClientRect();
var svgHeight = svgBounds.bottom - svgBounds.top;
var svgWidth = svgBounds.right - svgBounds.left;
var planetColors = {Sun: "orange", Mercury: "gray", Venus: "#d6bb87", Earth: "#677188", Mars: "#7c5541", Jupiter: "#a36a3e", Saturn: "#e9ba85", Uranus: "#73cbf0", Neptune: "#6383d1"}
var chemColors = {Sun: "#68f442", Mercury: "gray", Venus: "#4272ed", Earth: "#fcecc9", Mars: "#f77d2c", Jupiter: "#6ddcf2", Saturn: "#58418e", Uranus: "orange", Neptune: "#f4ea53"}
var yInit;
var maxr;
var earth;

function onLoadCreate(id){
  d3.json("data/solarsystem.json", function(data) {
    clearSS();

    maxr = d3.max(data, function (d) {
        if(d.key!="Sun")
          return d.radius;
    });

    if(id=="home")
      create(data);
    else if(id=="temp")
      compareTemp(data);
    else if(id=="dist")
      compareDist(data);
    else if(id=="size")
      compareSize(data);
    else
      chemicalComp(data);
    });
}

function clearSS() {
  d3.select("#planets").selectAll("circle")
    .style("opacity", 1)
    .on("mouseover", null)
    .on("mouseout", null);

  d3.selectAll(".labels")
    .on("mouseover", null)
    .on("mouseout", null)
    .style("visibility", "visible");

  d3.selectAll("path").remove();
  d3.select("#planets").selectAll("g").remove();
  d3.selectAll(".infoDist").remove();

  d3.selectAll(".infoText").remove();
  d3.selectAll(".infoSun").remove();
  d3.selectAll(".nominiButton").remove();
  d3.selectAll(".menubutton").style("background-color", "black");

  d3.selectAll(".homeTitle").remove();
  d3.selectAll(".homeLines").remove();
  d3.select("#triangle").remove();
}

function scaleDim(data, min, max, rad){
  var radiusScale = d3.scaleLinear()
      .domain([0, maxr])
      .range([min, max]);

  return radiusScale(rad);
}

var labelPosition = function(d) {
  cy = d3.select("#"+d.key).attr("cy");
  r = d3.select("#"+d.key).attr("r");
  return parseInt(cy)+parseInt(r)+20;
}
