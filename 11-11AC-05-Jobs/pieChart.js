function createPieChart(dataObj, title, iddiv){

    d3.select("#pie-chart2").attr("class", "invisible");
    var div = d3.select("#" + iddiv);
    div.attr("class", "viewPies");
    var svgBounds = div.select("#pieChart").node().getBoundingClientRect();
    div.select("h2").html(title);
    var xpad = 80;
    var radius = Math.min(svgBounds.width-xpad, svgBounds.height) / 2;
    var color = d3.scaleOrdinal(["#4d7dda", "#ffa1ff"]);
    div.select("#pie").attr("transform", "translate(" + svgBounds.width / 2 + "," + svgBounds.height / 2 + ")");

    var pie = d3.pie()
            .sort(null)
            .value(d => d.val);

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var arc = div.select("#pie").selectAll(".arc")
        .data(pie(dataObj));
    arc.exit().remove();
    arc = arc.enter()
        .append("g").merge(arc)
        .attr("class", "arc");
    arc.selectAll("path").remove();

    arc.append("path")
        .attr("d", path)
        .attr("fill", d=> color(d.data.k));

    var sum = 0;
    dataObj.forEach(d => sum = sum + d.val);

    arc.on("mouseover", function (d) {
            d3.select("#tooltip")
                .style("display", "inline")
                .text("" + d3.format(".2f")((d.data.val/(sum))*100) + "%")
                .style("left", (d3.event.pageX ) + "px")
                .style("top", (d3.event.pageY ) + "px");
        })
        .on("mouseout", function () {
            d3.select("#tooltip")
                .style("display", "none");
        });

    var legend = div.select("#pieLegend")
        .selectAll("g")
        .data(dataObj);

    legend = legend.enter()
            .append("g")
            .merge(legend)
            .attr("transform",(d, i) => "translate(0," + i * 20 + ")" );

    legend.selectAll("rect").remove();
    legend.append("rect")
        .attr("x", svgBounds.width - 55)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", d=> color(d.k));

    legend.selectAll("text").remove();
    legend.append("text")
        .attr("x", svgBounds.width - 100)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d.k);
}
