function mapLegend (dataObj) {
    var vals = [];

    dataObj.forEach(d => vals.push(d.val));

    var minValue = d3.min(vals, d => d);
    var maxValue = d3.max(vals, d => d);
    if(maxValue < 10)
        var midValue = parseFloat((minValue + maxValue) / 2).toFixed(2);
    else
        var midValue = ((minValue + maxValue) / 2).toFixed(0);

    d3.select("#rectlegend_min")
        .attr("dy", ".35em")
        .text(minValue);

    d3.select("#rectlegend_mid")
        .attr("dy", ".35em")
        .text(midValue);

    d3.select("#rectlegend_max")
        .attr("dy", ".35em")
        .text(maxValue);
}

function drawMapItaly (dataObj, selectedYear, selectedWork) {
    var projection = d3.geoMercator().center([10,44])
        .translate([300,200])
        .scale([2500]);

    var path = d3.geoPath().projection(projection);

    var paths = d3.select("#map").selectAll("path");
    paths.remove();
    var map = d3.select("#map").selectAll("path").data(JsonItaly.features)
            .enter()
            .append("path")
            .attr("d", path)
            .classed("regions", true)
            .attr("id", d => d.properties.name);

    updatecolor(dataObj);

    map.on("click", function(d) {
        updatecolor(dataObj);
        d3.select(this).attr("fill", "red");
        var lineChartData =[];

        ItaMarketPerRegioneTrimestri.forEach( d => {
        {
            var regione = d.regione;
            if (regione.localeCompare(d3.select(this).attr('id'))==0)
                lineChartData.push({
                    xValue: d.trimestre,
                    values: {rapporto1: eval("d." + selectedWork)}
                })
        }
    });
        createLineChart(lineChartData, "Quarters trend - " + d3.select(this).attr('id'), "line-chart-italy");

        if (selectedWork.localeCompare("lav_att")== 0 || selectedWork.localeCompare("lav_ces")==0){

            var zona = findZona(d3.select(this).attr('id'));
            var pieChartData = [];
            var pieChartTitle = [document.getElementById("workSelection").options
                .item(document.getElementById("workSelection").selectedIndex).text + " - " + selectedYear + " " +  zona];
            console.log("zona prima del for " + zona);
            console.log("year prima del for " + selectedYear);

            ItaMarketPerGender.forEach(d => {
                if(d.year == selectedYear && zona.localeCompare(d.zona)==0)

            pieChartData.push({k: "Maschi" , val: eval("d.m_" + selectedWork)},
                {k:"Femmine", val: eval("d.f_" + selectedWork)})

        });

            createPieChart(pieChartData, pieChartTitle[0], "pie-chart-italy");

        }

    });
    mapLegend(dataObj);


}

function findZona(regione) {

    var nord = ["liguria", "piemonte", "trentino_alto_adige", "lombardia", "valle_d'aosta", "emilia_romagna", "friuli_venezia_giulia", "veneto"];
    var centro = ["toscana", "umbria", "marche", "lazio", "molise", "abruzzo"];
    var mezzog =["campania", "puglia", "basilicata", "calabria", "sicilia", "sardegna"];
    var zona;

    console.log(regione);
    nord.forEach(function (d) {
        if (regione.localeCompare(d)==0) zona= "nord";
    })

    centro.forEach(function (d) {
        if (regione.localeCompare(d)==0)  zona = "centro";
    })

    mezzog.forEach(function (d) {
        if (regione.localeCompare(d)==0) zona = "mezzogiorno";
    })

    return zona;
}


function updatecolor(dataObj){
    var vals = [];

    dataObj.forEach(d => vals.push(d.val));

    console.log(vals);

    var maxValue = d3.max(vals, d => d);
    var minValue = d3.min(vals, d => d);

    console.log(maxValue, minValue);

    var colorScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range(["aqua","blue"]);

    dataObj.forEach(d => d3.select("#" + d.regione).attr("fill", colorScale(d.val)));
}