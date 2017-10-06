var JsonItaly;
var ItaMarketPerRegione;
var Trimestri;
var ItaMarketPerGender;
var ItaMarketPerRegioneTrimestri;

function chooseDataItalyMarket() {
    createTooltip();
    var selectedWork = document.getElementById('workSelection').value;
    var selectedYear = document.getElementById('yearSelection').value;
    var filteredData = [];

    ItaMarketPerRegione.filter(function (d) {
        if(d.year == selectedYear)
            filteredData.push({
                    regione: d.regione,
                    val: eval("d." + selectedWork)
                })
    });
    drawMapItaly(filteredData, selectedYear, selectedWork);

    var barChartData = [];
    var barChartTitle = ["Hiring types - " + selectedYear];

    Trimestri.forEach(function (d) {
        if(d.year == selectedYear)
            barChartData.push({
                k: d.trimestre,
                values: {var1: d.ass_TI, var2: d.ass_TD, var3: d.appr, var4: d.con_col, var5: d.altro},
                legend: {leg1: "TI hirings", leg2: "TD hirings", leg3: "Training", leg4:"Cooperation", leg5:"Other"}
            })
    });

    createBarchart(barChartData, barChartTitle, "barChartItaly", "bar-chart-italy");

    var lineChartData =[];
    Trimestri.forEach( d => {
            lineChartData.push({xValue: d.trimestre,
                values: {rapporto1: eval("d." + selectedWork)},
            })
    });
    createLineChart(lineChartData, "Quarters trend", "line-chart-italy");


    d3.select("#pie-chart-italy").attr("class", "invisible");

    if (selectedWork.localeCompare("lav_att")== 0 || selectedWork.localeCompare("lav_ces")==0){

        var pieChartData = [];
        var pieChartTitle = [document.getElementById("workSelection").options.item(document.getElementById("workSelection").selectedIndex).text + " - " + selectedYear]
        var tmp = [];
        ItaMarketPerGender.forEach(d => {
            if(d.year == selectedYear)
                tmp.push({m:eval("d.m_" + selectedWork), f:eval("d.f_" + selectedWork)})
        });

        pieChartData.push({k: "Men", val: d3.sum(tmp, d=>d.m)},
        {k: "Women", val: d3.sum(tmp, d=>d.f)})
        createPieChart(pieChartData, pieChartTitle[0], "pie-chart-italy");

    }

}

function jsonItaly(error, json) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    JsonItaly = json;
    chooseDataItalyMarket();
}

function csvMarketPerGender(error, csv) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    csv.forEach(function (d) {
        d.year = +d.anno;
        d.m_lav_att = +d.m_lav_att;
        d.m_lav_ces = +d.m_lav_ces;
        d.f_lav_att = +d.f_lav_att;
        d.f_lav_ces = +d.f_lav_ces;
    });

    ItaMarketPerGender = csv;
}

function csvMarketPerRegione(error, csv) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    csv.forEach(function (d) {
        d.year = +d.anno;
        d.lav_att = +d.lav_att;
        d.lav_ces = +d.lav_ces;
        d.lavoratori_att = +d.lavoratori_att;
        d.lavoratori_ces = +d.lavoratori_ces;
        d.ass_TI = +d.ass_TI;
        d.ass_TD = +d.ass_TD;
        d.appr = +d.apprendistato;
        d.avv_per_lav = +d.avv_per_lav;
        d.ces_per_lav = +d.ces_per_lav;
    });

    ItaMarketPerRegione = csv;
}

function csvMarketPerRegioneTrimestri(error, csv) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    csv.forEach(function (d) {
        d.year = +d.anno;
        d.lav_att = +d.lav_att;
        d.lav_ces = +d.lav_ces;
        d.avv_per_lav = +d.avv_per_lav;
        d.ces_per_lav = +d.ces_per_lav;
    });

    ItaMarketPerRegioneTrimestri = csv;
}

function csvTrimestri(error, csv) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    csv.forEach(function (d) {
        d.year = +d.anno;
        d.ass_TI = +d.ass_TI;
        d.ass_TD = +d.ass_TD;
        d.appr = +d.apprendistato;
        d.con_col = +d.con_col;
        d.altro = +d.altro;
        d.lav_att = +d.lav_att;
        d.lav_ces = +d.lav_ces;
        d.avv_per_lav = +d.avv_per_lav;
        d.ces_per_lav = +d.ces_per_lav;
    });
    Trimestri= csv;
}

d3.csv("data/italy_market_per_regione.csv", csvMarketPerRegioneTrimestri);
d3.csv("data/m_f_per_zona.csv", csvMarketPerGender);
d3.csv("data/italy_market.csv", csvMarketPerRegione);
d3.csv("data/trimestri.csv", csvTrimestri);
d3.json("data/Ita_cudini.json", jsonItaly);

