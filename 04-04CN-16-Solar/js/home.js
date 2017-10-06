function create(data){
  d3.select("#home").style("background-color", "#492b05");

  var min = svgWidth/100;
  var max = svgWidth/10;

  d3.select("svg")
  .transition()
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  var planets = d3.select("#planets").selectAll("circle").data(data);

  planets.enter()
    .filter(function(d){return d.key=="Sun"})
    .append("circle")
    .attr("id", function(d){return d.key;})
    .attr("r", scaleDim(data, min, max, maxr)*10)
    .attr("fill", function(d) {return planetColors[d.key];})
    .attr("cx", scaleDim(data, min, max, maxr)*(-9))
    .attr("cy", function(d) {yInit = scaleDim(data, min, max, maxr)+100; return yInit;});

  var sun = d3.select("#Sun");
  var posPrev = 0;
  var radiusPrev = scaleDim(data, min, max, maxr)*(-9) + parseInt(scaleDim(data, min, max, maxr)*10);
  planets.enter()
    .filter(function(d){return d.key!="Sun"})
    .append("circle")
    .attr("id", function(d){return d.key;})
    .attr("r", function(d) {
      if(d.key=="Earth") {
        earth = scaleDim(data, min, max, d.radius);
        return earth;}
      return scaleDim(data, min, max, d.radius);
      })
    .attr("fill", function(d) {return planetColors[d.key];})
    .attr("cx", function(d,i) {
      posPrev = scaleDim(data, min, max, d.radius)+posPrev+radiusPrev+20;
      radiusPrev = scaleDim(data, min, max, d.radius)
      return posPrev;})
    .attr("cy", yInit)
    .call(function(di){
      sun = d3.select("#Sun");
      posPrev = 0;
      radiusPrev = scaleDim(data, min, max, maxr)*(-9) + parseInt(scaleDim(data, min, max, maxr)*10);
      d3.select("svg").append("svg:defs").append("svg:marker")
          .attr("id", "triangle")
          .attr("refX", 6)
          .attr("refY", 6)
          .attr("markerWidth", 30)
          .attr("markerHeight", 30)
          .attr("markerUnits","userSpaceOnUse")
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M 0 0 12 6 0 12 3 6")
          .style("fill", "white");
      d3.select("svg").append("line")
          .attr("x1",  d3.select("#Earth").attr("cx"))
          .attr("y1", +d3.select("#Earth").attr("cy")+ +d3.select("#Earth").attr("r")+80)
          .attr("x2", d3.select("#Earth").attr("cx"))
          .attr("y2", +d3.select("#Earth").attr("cy")+ +d3.select("#Earth").attr("r")+40)
          .attr("stroke-width", 1)
          .attr("stroke", "white")
          .attr("id", "lineArrow")
          .attr("class", "homeLines")
          .attr("marker-end", "url(#triangle)")
          .attr("opacity", "0");
      d3.select("#lineArrow").transition()
          .duration(3000)
          .delay(500)
          .attr("opacity", "1");
      d3.select("#lineArrow").transition()
          .duration(3000)
          .delay(3000)
          .attr("opacity", "0");
      d3.select("svg").append("text")
          .attr("x",  d3.select("#Earth").attr("cx")-60)
          .attr("y", +d3.select("#Earth").attr("cy")+ +d3.select("#Earth").attr("r")+100)
          .attr("font-family", "BTTF")
          .text("You're here!")
          .attr("id", "textArrow")
          .attr("class", "homeLines")
          .style("font-size", "18px")
          .attr("fill", "white")
          .attr("opacity", "0");
      d3.select("#textArrow").transition()
          .duration(3000)
          .delay(500)
          .attr("opacity", "1");
      d3.select("#textArrow").transition()
          .duration(3000)
          .delay(3000)
          .attr("opacity", "0");

        var linep = "M " +(d3.select("#Jupiter").attr("cx")-d3.select("#Jupiter").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+30)+" L"+(d3.select("#Jupiter").attr("cx")-d3.select("#Jupiter").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+40)+" L "+(+d3.select("#Neptune").attr("cx")+ +d3.select("#Neptune").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+40) +" L "+(+d3.select("#Neptune").attr("cx")+ +d3.select("#Neptune").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+30)
        d3.select("svg").append("path")
          .attr("d", linep)
          .style("stroke-width", "1px")
          .attr("fill", "none")
          .attr("class", "homeLines")
          .attr("id","lineGas")
          .style("stroke", "white")
          .attr("opacity", "0");
      d3.select("#lineGas").transition()
          .duration(3000)
          .delay(2000)
          .attr("opacity", "1");

        d3.select("svg").append("text")
        .attr("x", function(){
          return (+d3.select("#Neptune").attr("cx")-d3.select("#Jupiter").attr("cx"))/0.8;
        })
        .attr("y",function(){
          return (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+60);
        })
        .text("Gas giants")
        .attr("id","textGas")
        .attr("class", "homeLines")
        .style("font-size", "14px")
        .attr("font-family", "BTTF")
        .attr("fill", "white")
        .attr("opacity", "0");
    d3.select("#textGas").transition()
        .duration(3000)
        .delay(2500)
        .attr("opacity", "1");

        var liner = "M " +(d3.select("#Mercury").attr("cx")-d3.select("#Mercury").attr("r"))+" "+ (+d3.select("#Mercury").attr("cy")+ +d3.select("#Jupiter").attr("r")+30)+" L"+(d3.select("#Mercury").attr("cx")-d3.select("#Mercury").attr("r"))+" "+ (+d3.select("#Mercury").attr("cy")+ +d3.select("#Jupiter").attr("r")+40)+" L "+(+d3.select("#Mars").attr("cx")+ +d3.select("#Mars").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+40) +" L "+(+d3.select("#Mars").attr("cx")+ +d3.select("#Mars").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+30)

        d3.select("svg").append("path")
          .attr("d", liner)
          .style("stroke-width", "1px")
          .attr("fill", "none")
          .attr("class", "homeLines")
          .attr("id","lineRock")
          .style("stroke", "white")
          .attr("opacity", "0");
      d3.select("#lineRock").transition()
          .duration(3000)
          .delay(2000)
          .attr("opacity", "1");

        d3.select("svg").append("text")
        .attr("x", function(){
          return (+d3.select("#Mars").attr("cx")-d3.select("#Mercury").attr("cx"))/0.95;
        })
        .attr("y",function(){
          return (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+60);
        })
        .text("Terrestrial")
        .attr("id","textRock")
        .attr("class", "homeLines")
        .style("font-size", "14px")
        .attr("font-family", "BTTF")
        .attr("fill", "white")
        .attr("opacity", "0");
    d3.select("#textRock").transition()
        .duration(3000)
        .delay(2500)
        .attr("opacity", "1");


  });
//giant gas

  planets.transition()
    .attr("r", function(d){
      if(d.key=="Sun")return scaleDim(data, min, max, maxr)*10;
      else if(d.key=="Earth") {
        earth = scaleDim(data, min, max, d.radius);
        return earth;
      }
      return scaleDim(data, min, max, d.radius);
    })
    .attr("fill", function(d) {return planetColors[d.key];})
    .attr("cx",  function(d){
      d3.select("svg").select("#lineArrow").attr("opacity","0");
      d3.select("svg").select("#textArrow").attr("opacity","0");
      d3.select("svg").select("#lineGas").attr("opacity","0");
      d3.select("svg").select("#textGas").attr("opacity","0");
      d3.select("svg").select("#lineRock").attr("opacity","0");
      d3.select("svg").select("#textRock").attr("opacity","0");
      if(d.key=="Sun")return (scaleDim(data, min, max, maxr)*(-9));
      posPrev = parseInt(scaleDim(data, min, max, d.radius))+parseInt(posPrev)+parseInt(radiusPrev)+20;
      radiusPrev = scaleDim(data, min, max, d.radius)
      return posPrev;
    })
    .attr("cy", yInit)
    .call(function(d){

      sun = d3.select("#Sun");
      posPrev = 0;
      radiusPrev = scaleDim(data, min, max, maxr)*(-9) + parseInt(scaleDim(data, min, max, maxr)*10);
      d3.select("#planets").selectAll("text").transition()
      .attr("y", function(d) {
        cy = yInit;
        r = scaleDim(data, min, max, d.radius);
        return parseInt(cy)+parseInt(r)+20;
      })
      .attr("x", function(d){
        posPrev = scaleDim(data, min, max, d.radius)+posPrev+radiusPrev+20;
        radiusPrev = scaleDim(data, min, max, d.radius)
        return posPrev-d.key.length*4;
      });


    }).on("end", function(d){
      if(d.key=="Neptune"){

      var linep = "M " +(d3.select("#Jupiter").attr("cx")-d3.select("#Jupiter").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+30)+" L"+(d3.select("#Jupiter").attr("cx")-d3.select("#Jupiter").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+40)+" L "+(+d3.select("#Neptune").attr("cx")+ +d3.select("#Neptune").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+40) +" L "+(+d3.select("#Neptune").attr("cx")+ +d3.select("#Neptune").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+30)
      d3.select("svg").select("#lineGas").transition()
          .attr("d", linep)
          .style("stroke-width", "1px")
          .attr("fill", "none")
          .attr("id","lineGas")
          .style("stroke", "white");

        d3.select("#lineGas").transition()
          .duration(3000)
          .delay(2000)
          .attr("opacity", "1");

        d3.select("svg").select("#textGas").transition()
            .attr("x", function(){
              return (+d3.select("#Neptune").attr("cx")-d3.select("#Jupiter").attr("cx"))/0.8;
            })
            .attr("y",function(){
              return (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+60)
            })
            .text("Gas giants")
            .attr("id","textGas")
            .style("font-size", "14px")
            .attr("font-family", "BTTF")
            .attr("fill", "white");

          d3.select("#textGas").transition()
            .duration(3000)
            .delay(2500)
            .attr("opacity", "1");

            var liner = "M " +(d3.select("#Mercury").attr("cx")-d3.select("#Mercury").attr("r"))+" "+ (+d3.select("#Mercury").attr("cy")+ +d3.select("#Jupiter").attr("r")+30)+" L"+(d3.select("#Mercury").attr("cx")-d3.select("#Mercury").attr("r"))+" "+ (+d3.select("#Mercury").attr("cy")+ +d3.select("#Jupiter").attr("r")+40)+" L "+(+d3.select("#Mars").attr("cx")+ +d3.select("#Mars").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+40) +" L "+(+d3.select("#Mars").attr("cx")+ +d3.select("#Mars").attr("r"))+" "+ (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+30)

            d3.select("svg").select("#lineRock").transition()
                .attr("d", liner)
                .style("stroke-width", "1px")
                .attr("fill", "none")
                .attr("id","lineRock")
                .style("stroke", "white");

              d3.select("#lineRock").transition()
                .duration(3000)
                .delay(2000)
                .attr("opacity", "1");

              d3.select("svg").select("#textRock").transition()
                  .attr("x", function(){
                    return (+d3.select("#Mars").attr("cx")-d3.select("#Mercury").attr("cx"))/0.95;
                  })
                  .attr("y",function(){
                    return (+d3.select("#Jupiter").attr("cy")+ +d3.select("#Jupiter").attr("r")+60)
                  })
                  .text("Terrestrial")
                  .attr("id","textRock")
                  .style("font-size", "14px")
                  .attr("font-family", "BTTF")
                  .attr("fill", "white");

                d3.select("#textRock").transition()
                  .duration(3000)
                  .delay(2500)
                  .attr("opacity", "1");

        //arrow
        d3.select("svg").select("#lineArrow").transition()
            .duration(3000)
            .delay(500)
            .attr("opacity", "1")
            .attr("x1",  d3.select("#Earth").attr("cx"))
            .attr("y1", +d3.select("#Earth").attr("cy")+ +d3.select("#Earth").attr("r")+80)
            .attr("x2", d3.select("#Earth").attr("cx"))
            .attr("y2", +d3.select("#Earth").attr("cy")+ +d3.select("#Earth").attr("r")+40)
            .attr("stroke-width", 1)
            .attr("stroke", "white")
            .attr("class", "homeLines")
            .attr("marker-end", "url(#triangle)");
        d3.select("svg").select("#textArrow").transition()
            .duration(3000)
            .delay(500)
            .attr("opacity", "1")
            .attr("x",  d3.select("#Earth").attr("cx")-60)
            .attr("y", +d3.select("#Earth").attr("cy")+ +d3.select("#Earth").attr("r")+100)
            .attr("font-family", "BTTF")
            .text("You're here!")
            .attr("class", "homeLines")
            .style("font-size", "16px")
            .attr("fill", "white");
        d3.select("#lineArrow").transition()
            .duration(3000)
            .delay(3000)
            .attr("opacity", "0");
        d3.select("#textArrow").transition()
            .duration(3000)
            .delay(3000)
            .attr("opacity", "0");
      }

    });

  //Titolo
  d3.select("svg").append("text")
    .attr("x", svgBounds.left+100)
    .attr("y", svgBounds.bottom-100)
    .attr("class", "homeTitle")
    .attr("id", "firstLine")
    .text("Journey <")
    .style("font-size", "75px")
    .attr("fill", "orange");
  d3.select("svg").append("text")
    .attr("x", svgBounds.left+100)
    .attr("y", svgBounds.bottom-30)
    .attr("class", "homeTitle")
    .attr("id", "secondLine")
    .text("& Solar System")
    .style("font-size", "75px")
    .attr("fill", "orange");

  d3.selectAll(".homeTitle").transition()
    .duration(3000)
    .delay(500)
    .attr("x", svgBounds.left+100)
    .attr("y", function(d,i){return svgBounds.bottom-50+(i*40);})
    .style("font-size", "35px");

  //Nomini
  planets.enter().filter(function(d){return d.key!="Sun"})
    .append("text")
    .text(function(d){return d.key;})
    .attr("class", "labels")
    .attr("id", function(d){return d.key+"Label";})
    .attr("y", labelPosition)
    .attr("x", function(d){return d3.select("#"+d.key).attr("cx")-d.key.length*4;})
    .attr("fill", "orange")
    .attr("font-size", "15px");

}
