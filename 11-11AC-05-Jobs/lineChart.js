function createLineChart(dataObj, title, iddiv) {
    var svgBounds = d3.select("#lineChart").node().getBoundingClientRect();
    var xpad = 100;
    var ypad = 80;
    var vals = [];
    var keys;
    d3.select("#line").selectAll("polyline").remove();
    d3.select("#line").selectAll("path").remove();

    dataObj.forEach(d => { Object.keys(d.values).map( key => vals.push(d.values[key]));
    keys=Object.keys(d.values);});

    d3.select("#line-chart").select(".nb").text("");
    d3.select("#" + iddiv).select("h2").html(title);

    if(vals[0] == 0) {d3.select("#line-chart").select(".nb").text("Data not available"); return;}

    var z = d3.scaleOrdinal()
        .range(["#d6c900", "#3fc9a5", "#b178a5", "#977160", "#ff8b82"]);

    var max= d3.max(vals,d => d)+0.07;

    var yScale = d3.scaleLinear()
        .domain([0, max])
        .rangeRound([svgBounds.height-ypad, 25]);

    var xScale = d3.scaleBand()
        .domain(dataObj.map(d => d.xValue))
.rangeRound([xpad, svgBounds.width-70])
        .paddingInner(1);

    d3.select("#lineChart").select("#xAxis")
        .attr("transform", "translate(0," + (svgBounds.height-ypad) + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start");

    d3.select("#lineChart").select("#yAxis")
        .attr("transform", "translate(" + xpad + ",0)")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(yScale));

    for (var i=0; i<keys.length; i++){
        dataObj.forEach(function (d) {
            var aLineGenerator = d3.line()
                    .x(d => xScale(d.xValue))
            .y( d => yScale(eval("d.values."+keys[i])));
            d3.select("#line")
                .datum(dataObj)
                .append("path")
                .attr("d", aLineGenerator)
                .style("stroke", z(keys[i]));
            if(keys.length==1)
                d3.select("#line").selectAll("path").style("stroke", "#5eadff");
        })
    }
}

