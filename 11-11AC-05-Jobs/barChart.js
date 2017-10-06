function createBarchart (dataObj, title, idbar, iddiv, dataObj2, selectedDimension, lineChartTitle, updatePieChart, pieChartTitle){
    var svgBounds = d3.select("#" + idbar).node().getBoundingClientRect();
    var xpad = 100;
    var ypad = 100;
    var xpadlegend = 120;
    var vals = [];
    var legendVals= [];
    var valsOfValues = [];
    var keys;
    var legendtitles;
    var rectForEachGroup;

    d3.select("#bar-chart2").attr("class", "view");
    d3.select("#" + iddiv).select("h2").html(title[0]);

    dataObj.forEach(d => {
        Object.keys(d.values).map( key => vals.push(d.values[key]));
    Object.keys(d.legend).map( key => legendVals.push(d.legend[key]));
    Object.keys(d.values).map( key => valsOfValues.push({vv: d.values[key]}));
    keys=Object.keys(d.values);
    legendtitles = Object.keys(d.legend);
});
    rectForEachGroup = keys.length;

    //scale
    var x0 = d3.scaleBand()
        .rangeRound([xpad, svgBounds.width - xpadlegend])
        .paddingInner(0.25);

    var x1 = d3.scaleBand()
        .paddingInner(0.05);

    var y = d3.scaleLinear()
        .rangeRound([svgBounds.height -ypad, 5]);

    var colors = ["#d6c900", "#3fc9a5", "#b178a5", "#977160", "#ff8b82"];
    var selectColor = [];
    for(var i =0; i<rectForEachGroup; i++){
        selectColor.push(colors[i])
    }

    if (title[0].localeCompare("TD hirings per age range")==0)
        selectColor = ["#3fc9a5"];

    if(legendVals[0].localeCompare("Men")==0)
        selectColor= ["#4d7dda", "#ffa1ff"];
    var z = d3.scaleOrdinal()
        .range(selectColor);

    x0.domain(dataObj.map(d => d.k));
    x1.domain(d3.range(rectForEachGroup)).rangeRound([0, x0.bandwidth()]);
    y.domain([0,(d3.max(vals, d => d))+40000]);


    //axes
    var div = d3.select("#" + idbar);
    div.select("#xAxis")
        .attr("transform", "translate(0," + (svgBounds.height-ypad) + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start");;
    div.select("#yAxis")
        .attr("transform", "translate(" + xpad + ",0)")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));

    //bars
    var barChart = d3.select("#" + iddiv).select("#rects").selectAll("g")
        .data(dataObj);

    barChart = barChart.enter()
            .append("g").
            merge(barChart)
            .attr("transform", (d) => "translate(" + x0(d.k) + ",0)");

    var rectData =[];
    dataObj.forEach(function (d) {
        for(var i =0; i<rectForEachGroup; i++)
            rectData.push({k: rectData-i, v: d.values[keys[i]]})
    });

    barChart = barChart.selectAll("rect")
        .data(function (d) {
            var rectData = []
            for (var i = 0; i < rectForEachGroup; i++)
                rectData.push({k: (1+i), v: d.values[keys[i]], year: d.k});
            return rectData;
        });

    barChart.exit().remove();

    barChart= barChart.enter()
        .append("rect").merge(barChart);

    barChart.transition()
        .attr("x", d => x1(d.k))
.attr("y", d=> y(d.v))
.attr("width", x1.bandwidth())
        .attr("height",d => svgBounds.height - ypad - y(d.v))
.attr("fill", d => z(d.k))
.attr("class", "unselected")
        .duration(1000);

    //legend
    var legendData;
    dataObj.forEach(function (d) {
        legendData = []
        for (var i = 0; i < rectForEachGroup; i++)
            legendData.push({k: (1+i), tx: d.legend[legendtitles[i]]});
        return legendData;
    });

    var legend = d3.select("#" + iddiv).select("#legend")
        .selectAll("g")
        .data(legendData);

    legend.exit().remove();
    legend = legend.enter()
            .append("g")
            .merge(legend)
            .attr("transform",(d, i) => "translate(0," + i * 20 + ")" );

    legend.selectAll("rect").remove();
    legend.append("rect")
        .attr("x", svgBounds.width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", d=>z(d.k));

    legend.selectAll("text").remove();
    legend.append("text")
        .attr("x", svgBounds.width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d.tx);

    /*if (typeof selectedDimension == "number")
        return;*/

    if (idbar.localeCompare("barChart")!= 0)
        return;
    else {
        barChart.on("click", function (d) {
            barChart.attr("fill", d => z(d.k))
            .attr("class", "unselected");

            d3.select(this).attr("class", "selected");
            var year = d.year;

            if (selectedDimension.localeCompare('ti_hiring_by_age') != 0) {
                var filteredData = [];
                JobsActDataPerMonth.filter(function (d) {
                    if (d.year == year)
                        filteredData.push({
                            xValue: d.month,
                            values: {rapporto1: eval("d." + selectedDimension)}
                        })
                });
                createLineChart(filteredData, lineChartTitle + " - " + year, "line-chart");
            }

            var infoTrasfData = new Array();
            JobsActDataPerYear.filter(function (d) {
                if (d.year == year) {
                    infoTrasfData['det_ind'] = d.td_to_ti;
                    infoTrasfData['appr_ind'] = d.appr_to_ti;
                    infoTrasfData['nuove_ass'] = d.nuove_ass_ti;
                    infoTrasfData['title'] = "Trasformation to permanent contract in " + year;
                }
            });
            updateInfo(infoTrasfData);

            if ((selectedDimension.localeCompare("lic_ti__lic_td") * selectedDimension.localeCompare("ti_hiring_by_age")) != 0){
                var pieChartData;
                updatePieChart.filter(function (d) {
                    if (d.year == year){
                        pieChartData = [{k:d.legend.leg1, val: d.values.var1}, {k:d.legend.leg2, val:d.values.var2}];
                        createPieChart(pieChartData, pieChartTitle[0] + " - " + year, "pie-chart");

                        if(d.values.var3 != null){
                            pieChartData = [{k:d.legend.leg1, val: d.values.var3}, {k:d.legend.leg2, val:d.values.var4}];
                            createPieChart(pieChartData, pieChartTitle[1] + " - " + year, "pie-chart2");
                        }
                    }
                })
            };

            if (selectedDimension.localeCompare("lic_ti__lic_td")==0 )
                return;

            var barChartData2 = [];
            dataObj2.filter(function (d) {
                if (d.year == year) {
                    if(d.values.var2 != null)
                        barChartData2.push({
                            k: d.k,
                            values: {var1: d.values.var1, var2: d.values.var2},
                            legend: {leg1: d.legend.leg1, leg2: d.legend.leg2}
                        })
                    else
                        barChartData2.push({
                            k: d.k,
                            values: {var1: d.values.var1},
                            legend: {leg1: d.legend.leg1}
                        })
                }
            });

            var title2 = [title[1] +" - " + year];
            createBarchart(barChartData2, title2, "barChart2", "bar-chart2");

            })
    }
}