
function chemicalComp(data){
  //Titolo
  d3.select("svg").append("text")
    .attr("x", svgBounds.left+100)
    .attr("y", svgBounds.bottom-10)
    .attr("class", "homeTitle")
    .attr("id", "secondLine")
    .text("Atmospheres' chemical composition ")
    .style("font-size", "35px")
    .attr("fill", "orange")
    .style("opacity", "0");
  d3.select(".homeTitle").transition()
    .duration(750)
    .style("opacity", "1");

  d3.select("#chem").style("background-color", "#492b05");

  var height = svgHeight/4;
  var width = svgWidth/2;

  var chemColours = []

  var x = d3.scaleBand()
      .rangeRound([0, svgWidth/1.5])
      .paddingInner(0.2)
      .align(1);

  var y = d3.scaleLinear()
      .rangeRound([svgHeight/2, 0]);

  var z = d3.scaleOrdinal()
    .range(Object.values(chemColors));

  d3.csv("data/compositions.csv", function(error, myChemicalData) {
    if (error) throw error;

    var keys = myChemicalData.columns.slice(1);

    x.domain(myChemicalData.map(function(d){return d.Planet;}));
    y.domain([0, 100]);
    z.domain(keys);

    g = d3.select("#planets")
    .append("g")
    .attr("id", "chart")
    .attr("transform", "translate(" + height + "," + (height-25) + ")");

    g.append("g")
    .attr("id", "stacked")
    .selectAll("g")
    .data(d3.stack().keys(keys)(myChemicalData))
    .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
      .attr("class", function(d){return d.key.replace(/\s/g, '');})
      .on("mouseover", function(d){highlightChem(d.key);})
      .on("mouseout", function(d){restoreOpacity(d.key);})
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.Planet); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth());

    //Assi
    g.append("g")
        .attr("class", "axisWhite")
        .attr("fill", "white")
        .style("stroke", "white")
        .attr("transform", "translate(0," + svgHeight/2 + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Open Sans', sans-serif");

    g.append("g")
        .attr("fill", "rgba(1,1,1,1)")
        .attr("stroke", "rgba(1,1,1,1)")
        .attr("transform", "translate(0," + (-25) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "plaPerc")
        .text("100%")
        .attr("fill", "white")
        .attr("stroke", "white")
        .style("font-size", "12px")
        .style("font-family", "'Open Sans', sans-serif");

    g.append("g")
        .attr("class", "axisWhite")
        .attr("fill", "white")
        .style("stroke", "white")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Open Sans', sans-serif")
      .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("text-anchor", "start");

      function highlightChem(d){

        d3.select("#stacked").selectAll("g").attr("opacity", "0.3");
        d3.selectAll(".legend").attr("opacity", "0.3");
        d3.select("#stacked").selectAll("."+d.replace(/\s/g, '')).attr("opacity", "1");

        var xs = d3.select("."+d.replace(/\s/g, '')).selectAll("rect");

        d3.select("#"+d.replace(/\s/g, '')+"Label").style("fill", "orange");
        d3.select("#"+d.replace(/\s/g, '')+"Legend").attr("opacity", "1");

        d3.select("#chart").selectAll(".plaPerc")
        .text(function(p,i){
          return myChemicalData[i][d]+"%";
        }) ;
      }

      function restoreOpacity(d){
        d3.select("#stacked").selectAll("g").attr("opacity", "1");
        d3.selectAll(".legend").attr("opacity", "1");
        d3.select("#chart").selectAll(".plaPerc").text("100%");
        d3.select("#"+d.replace(/\s/g, '')+"Label").style("fill", "white");
      }

      //Leggenda
      var legend = g.append("g")
        .style("font-family", "'Open Sans', sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(" + x.bandwidth()*4.5 + "," + i * 20 + ")"; });

      legend.append("rect")
          .attr("class", "legend")
          .attr("id", function(d){return d.replace(/\s/g, '')+"Legend";})
          .attr("x", width - 19)
          .attr("width", 19)
          .attr("height", 19)
          .attr("fill", z)
          .on("mouseover", function(d){highlightChem(d);})
          .on("mouseout", function(d){restoreOpacity(d);});

      legend.append("text")
          .attr("id", function(d){return d.replace(/\s/g, '')+"Label";})
          .attr("x", width - 24)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .style("fill", "white")
          .text(function(d) { return d; })
          .on("mouseover", function(d){highlightChem(d);})
          .on("mouseout", function(d){restoreOpacity(d);});

      //Scompariamolo e spostiamo i pianetini
      d3.select("#Sun").transition().attr("r", "0");
      d3.selectAll(".labels").attr("x", "-100");

      d3.select("#planets").selectAll("circle")
      .filter(function(d){return d.key!="Sun"})
      .transition()
      .attr("r", earth)
      .attr("cx", function(d,i){
        console.log(x.bandwidth()*0.02);
        return height+x.bandwidth()/2+(i*(earth+x.bandwidth()));
        //+x.bandwidth()*0.02

      })
      .attr("cy", svgHeight/2+200+earth);


});
}
