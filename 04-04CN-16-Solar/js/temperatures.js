function compareTemp(data){
  //Titolo
  d3.select("svg").append("text")
    .attr("x", svgBounds.left+100)
    .attr("y", svgBounds.bottom-10)
    .attr("class", "homeTitle")
    .attr("id", "secondLine")
    .text("Let's compare Temperatures <")
    .style("font-size", "35px")
    .attr("fill", "orange")
    .style("opacity", "0");
  d3.select(".homeTitle").transition()
    .duration(750)
    .style("opacity", "1");

  d3.select("#temp").style("background-color", "#492b05");

  var tempMMA = "avg";
  var height = svgHeight/2;
  var width = svgWidth;

  var min = svgWidth/100;
  var max = svgWidth/10;

  var planets = d3.select("#planets").selectAll("circle").data(data);

  //d3.select("#Sun").attr("r", "0");
  d3.select("#Sun").attr("r", scaleDim(data, min, max, maxr)*10)
  .attr("cx", scaleDim(data, min, max, maxr)*(-9.5));

  var scaleTemp = d3.scaleLinear()
      .domain([d3.min(data, function(d){return d.min_temp;}), d3.max(data, function(d){return d.max_temp;})])
      .range([height, 0]);

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var cx = [];
  var cy = [];
  var cyMin = [];
  var cyAvg = [];

  planets.transition()
   .filter(function(d) {return d.key!="Sun"})
   .attr("r", earth)
   .attr("cx", function(d,i) {
     val = i*80+parseInt(earth)+50+(height/2);
     cx.push(val);
     return val;
   })
   .attr("cy", function(d) {
     temp = scaleTemp(d.max_temp)+(height/2);
     minTemp = scaleTemp(d.min_temp)+(height/2);
     avgTemp = scaleTemp((d.min_temp+d.max_temp)/2)+(height/2);
     cy.push(temp);
     cyMin.push(minTemp);
     cyAvg.push(avgTemp);
     return avgTemp;
   });

 d3.select("#planets").selectAll(".labels")
 .attr("y", function(d) {return scaleTemp((d.min_temp+d.max_temp)/2)+parseInt(earth)+20+(height/2);})
 .attr("x", function(d,i) {return i*80+parseInt(earth)+50-d.key.length*4+(height/2);})

 var xpad = 50;
 var ypad = 50;

 var y = d3.scaleLinear().range([height+ypad, 0]);
 y.domain([d3.min(data, function(d){return d.max_temp;})-100, d3.max(data, function(d) {return d.max_temp;})+100]);

 d3.select("#planets")
 .append("g")
 .attr("transform", "translate("+(height/2)+"," +((height/2)-25)+")")
 .attr("fill", "white")
 .attr("class", "axisWhite")
 .style("stroke", "white")
 .call(d3.axisLeft(y))
 .selectAll("text")
 .style("font-size", "10px")
 .style("font-family", "'Open Sans', sans-serif");

 var maxPath = "M ";
 cx.forEach(function(d,i) {
   maxPath = maxPath + d + " " + cy[i] +" L ";
 });

 var minPath = "M ";
 cx.forEach(function(d,i){
   minPath = minPath + d + " " + cyMin[i] +" L ";
 });

 var avgPath = "M ";
 cx.forEach(function(d,i){
   avgPath = avgPath + d + " " + cyAvg[i] +" L ";
 });

 maxPath = maxPath.slice(0, -2);
 minPath = minPath.slice(0, -2);
 avgPath = avgPath.slice(0, -2);

 var lineChart = d3.select("#planets")
 .append("path")
 .attr("id", "avgTemp")
 .attr("d", avgPath)
 .style("stroke-width", "2px")
 .attr("fill", "none")
 .style("stroke", "white");

  //Funzione Pulsanti
  var gBounds = d3.select("#planets").node().getBoundingClientRect();
  jupiter = d3.select("#Jupiter");

  function changeLine(type){
    d3.select("#submenu").selectAll("button").style("background-color", "black");
    tempMMA = type;
    if(type=="min") {
      d3.select("#minButton").style("background-color", "#492b05");
      lineChart.transition()
      .attr("id", "minTemp")
      .attr("d", minPath)
      .style("stroke", "blue");

      planets.transition()
       .filter(function(d) {return d.key!="Sun"})
       .attr("cy", function(d,i){return cyMin[i];});

       d3.select("#planets").selectAll(".labels").transition()
       .attr("y", function(d,i){return cyMin[i]+parseInt(earth)+20;});
    }
    else if(type=="max"){
      d3.select("#maxButton").style("background-color", "#492b05");
      lineChart.transition()
      .attr("id", "maxTemp")
      .attr("d", maxPath)
      .style("stroke", "red");

      planets.transition()
       .filter(function(d) {return d.key!="Sun"})
       .attr("cy", function(d,i){return cy[i];});


d3.select("#planets").selectAll(".labels").transition()
       .attr("y", function(d,i){return cy[i]+parseInt(earth)+20;});
    }
    else {
      d3.select("#avgButton").style("background-color", "#492b05");
      lineChart.transition()
      .attr("id", "avgTemp")
      .attr("d", avgPath)
      .style("stroke", "white");

      planets.transition()
       .filter(function(d) {return d.key!="Sun"})
       .attr("cy", function(d,i){return cyAvg[i];});

       d3.select("#planets").selectAll(".labels").transition()
       .attr("y", function(d,i){return cyAvg[i]+parseInt(earth)+20;});
    }
  }

  //Pulsanti
  submenu = d3.select("body").append("div")
    .attr("id", "submenu")
    .attr("class", "infoText");

    submenu.append("button")
    .attr("id", "maxButton")
    .text("Max")
    .on("mouseover", function() { changeLine("max"); } );

    submenu.append("button")
    .attr("id", "minButton")
    .text("Min")
    .on("mouseover", function() {changeLine("min"); } );

    submenu.append("button")
    .attr("id", "avgButton")
    .text("Average")
    .style("background-color", "#492b05")
    .on("mouseover", function() {changeLine("avg"); } );

  //Tooltip
  planets.filter(function(d) {return d.key!="Sun"})
  .on("mouseover", function(d) {
          tooltip.transition()
              .duration(200)
              .style("opacity", .9);
          tooltip.html(function(){
            var stringTemp = "";
            var tempType = "";
            var pressure = "";
            if(tempMMA=="min") {
              stringTemp = d.min_temp;
              tempType = "Minimum Temperature:";
            }
            else if(tempMMA=="max") {
                tempType = "Maximum Temperature:";
                stringTemp = d.max_temp;
            }
            else{
              tempType = "Average Temperature:";
              stringTemp = (parseInt(d.min_temp)+parseInt(d.max_temp))/2;
            }
              pressure = "At pressure: " + d.pressure + " atm";
              return "<b>"+d.key+"</b><br><b>"+tempType+"</b><br>"+stringTemp+"° C<br>"+pressure;})
          })
      .on("mouseout", function(d) {
          tooltip.transition()
              .duration(500)
              .style("opacity", 0);
  });

}
