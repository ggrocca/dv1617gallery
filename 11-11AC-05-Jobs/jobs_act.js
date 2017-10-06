var JobsActDataPerYear;
var JobsActDataPerFascia;
var JobsActDataPerMonth;

function createTooltip() {
    d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .attr("id", "tooltip")
        .style("display", "none");
}

function createGraphs(selectedDimension) {

    createTooltip();

    var infoTrasfData = new Array();
    infoTrasfData['det_ind'] = d3.sum(JobsActDataPerYear, d=>d.td_to_ti);
    infoTrasfData['appr_ind'] = d3.sum(JobsActDataPerYear, d=>d.appr_to_ti);
    infoTrasfData['nuove_ass'] = d3.sum(JobsActDataPerYear, d=>d.nuove_ass_ti);
    infoTrasfData['title'] = "Trasformation to permanent contract:";
    updateInfo(infoTrasfData);

    if (selectedDimension.localeCompare('lic_ti__ass_ti') == 0 ){
        var lineChartTitle = "TI layoffs / TI hirings";
        var lineChartData =[];
        var barChartTitle2 = ["TI hirings per age range"];
        var barChartTitle = ["TI hirings and TI layoffs - Absolute values", "TI hirings per age range"];
        var pieChartTitle = ["TI hirings per gender"];
        var barChartData = [];
        var barChartData2 = [];
        var dataObj2 = [];
        var pieChartDataClick = [];

        JobsActDataPerYear.filter(function (d) {
            pieChartDataClick.push({
                year:d.year,
                values: {var1: d.maschi_ti, var2:d.femmine_ti },
                legend:{leg1:"Men", leg2:"Women"}
            })
        });
        JobsActDataPerFascia.filter(function(d) {
            dataObj2.push({
                year: d.year,
                k: d.fascia,
                values: {var1: d.ass_ti_fascia},
                legend:{leg1: "TI hirings"}
            })
        });
        JobsActDataPerYear.forEach(d => barChartData.push({k: d.year,
                    values: {var1: d.ass_ti, var2: d.lic_ti},
                    legend: {leg1: "TI hirings", leg2: "TI layoffs"}
                }));
        createBarchart(barChartData, barChartTitle, "barChart", "bar-chart", dataObj2, selectedDimension, lineChartTitle, pieChartDataClick, pieChartTitle);

        JobsActDataPerYear.forEach( d => lineChartData.push({xValue: d.year,
                values: {rapporto1: d.lic_ti__ass_ti,},
                titles: {title1: "TI layoffs/TI hirings"}
            }));
        createLineChart(lineChartData, lineChartTitle, "line-chart");

        JobsActDataPerFascia.filter(function(d) {
            if (d.year  == 0)
            {
                barChartData2.push({
                        k: d.fascia,
                        values: {var1: d.ass_ti_fascia},
                        legend:{leg1: "TI hirings"}
                    })
            }
        });
        createBarchart(barChartData2, barChartTitle2, "barChart2", "bar-chart2");

        var pieChartData = [{k: "Men", val: d3.sum(JobsActDataPerYear, d=>d.maschi_ti)},
            {k: "Women", val: d3.sum(JobsActDataPerYear, d=>d.femmine_ti)}];
        createPieChart(pieChartData, pieChartTitle[0], "pie-chart");
    }

    if (selectedDimension.localeCompare('ass_ti__ass_td') == 0 ){
        var lineChartTitle = "TI hirings / TD hirings";
        var barChartTitle = ["TI hirings and TD hirings - Absolute values","TI hirings and TD hirings per age range"];
        var barChartTitle2 = ["TI hirings and TD hirings per age range"];
        var barChartData = [];
        var barChartData2 = [];
        var dataObj2 = [];
        var pieChartDataClick = [];
        var pieChartTitle = ["TI hirings per gender", "TD hirings per gender"];

        JobsActDataPerYear.filter(function (d) {
            pieChartDataClick.push({
                year:d.year,
                values: {var1: d.maschi_ti, var2:d.femmine_ti, var3:d.maschi_td, var4:d.femmine_td},
                legend:{leg1:"Men", leg2:"Women"}
            })
        });
        JobsActDataPerFascia.filter(function(d) {
            dataObj2.push({
                year: d.year,
                k: d.fascia,
                values: {var1: d.ass_ti_fascia, var2: d.ass_td_fascia},
                legend:{leg1: "TI hirings", leg2: "TD hirings"}
            })
        });
        JobsActDataPerYear.forEach(d => barChartData.push( { k: d.year,
                    values: {var1: d.ass_ti, var2: d.ass_td},
                    legend:{leg1: "TI hirings", leg2: "TD hirings"}
                }));
        createBarchart(barChartData, barChartTitle, "barChart", "bar-chart", dataObj2, selectedDimension, lineChartTitle, pieChartDataClick, pieChartTitle);

        var lineChartData =[];
        JobsActDataPerYear.forEach( d => lineChartData.push({xValue: d.year,
                values: {rapporto1: d.ass_ti__ass_td},
                titles: {title1:"TI hirings/TD hirings"}
            }));
        createLineChart(lineChartData, lineChartTitle, "line-chart");

        JobsActDataPerFascia.filter(function(d) {
            if (d.year  == 0)
            {
                barChartData2.push({
                    k: d.fascia,
                    values: {var1: d.ass_ti_fascia, var2: d.ass_td_fascia},
                    legend:{leg1: "TI hirings", leg2: "TD hirings"}
                })
            }
        });
        createBarchart(barChartData2, barChartTitle2, "barChart2", "bar-chart2");

        var pieChartData = [{k: "Men", val: d3.sum(JobsActDataPerYear, d=>d.maschi_ti)},
            {k: "Women", val: d3.sum(JobsActDataPerYear, d=>d.femmine_ti)}];
        createPieChart(pieChartData, "TI hirings per gender", "pie-chart");

        var pieChartData = [{k: "Men", val: d3.sum(JobsActDataPerYear, d=>d.maschi_td)},
            {k: "Women", val: d3.sum(JobsActDataPerYear, d=>d.femmine_td)}];
        createPieChart(pieChartData, "TD hirings per gender", "pie-chart2");
    }

    if (selectedDimension.localeCompare('lic_td__ass_td') == 0 ){
        var barChartTitle = ["TD layoffs and TD hirings - Absolute values", "TD hirings per age range"];
        var barChartTitle2 = ["TD hirings per age range"];
        var lineChartTitle = "TD layoffs / TD hirings";
        var lineChartData =[];
        var pieChartTitle = ["TD hirings per gender"];
        var barChartData = [];
        var dataObj2 = [];
        var pieChartDataClick = [];

        JobsActDataPerYear.filter(function (d) {
            pieChartDataClick.push({
                year:d.year,
                values: {var1: d.maschi_td, var2:d.femmine_td },
                legend:{leg1:"Men", leg2:"Women"}
            })
        });
        JobsActDataPerFascia.filter(function(d) {
            dataObj2.push({
                year: d.year,
                k: d.fascia,
                values: {var1: d.ass_td_fascia},
                legend:{leg1: "TD hirings"}
            })
        });
        JobsActDataPerYear.forEach( d=> barChartData.push( { k: d.year,
                    values: {var1: d.lic_td, var2: d.ass_td},
                    legend:{leg1: "TD layoffs", leg2: "TD hirings"}
                }));
        createBarchart(barChartData, barChartTitle, "barChart", "bar-chart", dataObj2, selectedDimension, lineChartTitle, pieChartDataClick, pieChartTitle);

        JobsActDataPerYear.forEach(d => lineChartData.push({xValue: d.year,
                values: {rapporto1:d.lic_td__ass_td},
                titles: {title1:"TI layoffs/TD layoffs"}
            }));
        createLineChart(lineChartData, lineChartTitle, "line-chart");

        var barChartData2 = []
        JobsActDataPerFascia.filter(function(d) {
            if (d.year  == 0) { barChartData2.push({
                    k: d.fascia,
                    values: {var1: d.ass_td_fascia},
                    legend:{leg1: "TD hirings"}
                })
            }
        });
        createBarchart(barChartData2, barChartTitle2, "barChart2", "bar-chart2");

        var pieChartData = [{k: "Men", val: d3.sum(JobsActDataPerYear, d=>d.maschi_td)},
        {k: "Women", val: d3.sum(JobsActDataPerYear, d=>d.femmine_td)}];
        createPieChart(pieChartData, pieChartTitle[0], "pie-chart");
    }

    if (selectedDimension.localeCompare('lic_ti__lic_td') == 0){
        var barChartTitle = ["TI layoffs and TD layoffs - Absolute values"];
        var lineChartTitle = "TI layoffs / TD layoffs";
        var dataObj2 = [];
        var barChartData = []

        JobsActDataPerYear.forEach(d => barChartData.push( {k: d.year,
                    values: {var1: d.lic_ti, var2: d.lic_td},
                    legend:{leg1: "TI layoffs", leg2: "TD layoffs"}
                }));
        createBarchart(barChartData, barChartTitle, "barChart", "bar-chart", dataObj2, selectedDimension, lineChartTitle);

        var lineChartData =[];
        JobsActDataPerYear.forEach(d => lineChartData.push({xValue: d.year,
                values: {rapporto1:d.lic_ti__lic_td},
                titles: {title1:"TI layoffs/TD layoffs"}
        }))
        createLineChart(lineChartData, lineChartTitle, "line-chart");

        d3.select("#bar-chart2").attr("class", "invisible");
        d3.select("#pie-chart").attr("class", "invisible");
        d3.select("#pie-chart2").attr("class", "invisible");
    }

    if (selectedDimension.localeCompare('ti_hiring_by_age') == 0){
        var dataObj2= [];
        var barChartData = [];
        var barChartDataTitle = ["TI hirings grouped by age - Absolute values", "TI hirings per age range and gender"];
        var multiLineChartData =[];
        var barChartTitle2 = [ "TI hirings per age range and gender"];
        var barChartData2 = [];

        JobsActDataPerFascia.filter(function(d) {
                dataObj2.push({
                    year:d.year,
                    k: d.fascia,
                    values: {var1: d.ass_ti_maschi, var2: d.ass_ti_femmine},
                    legend:{leg1: "Men", leg2: "Women"}
                })
        });
        JobsActDataPerYear.forEach(function (d) {
            barChartData.push(
                {k: d.year,
                    values: {var1: d.fino24_ti, var2: d.da25a29_ti,  var3: d.da30a39_ti,  var4: d.da40a49_ti,  var5: d.oltre50_ti },
                    legend:{leg1: "Up to 24", leg2: "From 25 to 29",  leg3: "From 30 to 39", leg4:"From 40 to 49", leg5: "50 and over"}
                })
        });
        createBarchart(barChartData, barChartDataTitle, "barChart", "bar-chart", dataObj2, selectedDimension);

        JobsActDataPerYear.forEach( d => multiLineChartData.push({xValue: d.year,
                values: {rapporto1: d.fino24_ti__ass_ti, rapporto2: d.da25a29_ti__ass_ti, rapporto3: d.da30a39_ti__ass_ti,
                rapporto4: d.da40a49_ti__ass_ti, rapporto5: d.oltre50_ti__ass_ti},
                titles: {title1: "Up to 24", title2: "From 25 to 29", title3: "From 30 to 39", title4: "From 40 to 49", title5: "50 and over"}
            }));
        createLineChart(multiLineChartData, "TI hirings per age range / TI hirings", "line-chart");

        JobsActDataPerFascia.filter(function(d) {
            if (d.year  == 0) {
                barChartData2.push({
                    k: d.fascia,
                    values: {var1: d.ass_ti_maschi, var2: d.ass_ti_femmine},
                    legend:{leg1: "Men", leg2: "Women"}
                })
            }
        });
        createBarchart(barChartData2, barChartTitle2, "barChart2", "bar-chart2");
        d3.select("#pie-chart").attr("class", "invisible");
        d3.select("#pie-chart2").attr("class", "invisible");
    }
}


function chooseData(v) {
    createGraphs(v);
}


function updateInfo(info) {
    d3.select("#trasformazioni").html(info['title']);
    d3.select("#det_ind").html(info['det_ind']);
    d3.select("#appr_ind").html(info['appr_ind']);
    d3.select("#nuove_ind").html(info['nuove_ass']);
}


/* DATA LOADING */
d3.csv("data/jobs_act_per_year.csv", function (error1, csv1) {
    d3.csv("data/jobs_act_per_fascia.csv", function (error2, csv2) {
        d3.csv("data/jobs_act_per_month.csv", function (error3, csv3) {

            if (error1) {
                console.log(error1);
                throw error1;
            }

            if (error2) {
                console.log(error2);
                throw error2;
            }

            if (error3) {
                console.log(error3);
                throw error3;
            }

            csv2.forEach(function (d) {
                d.ass_ti_fascia = +d.ass_TI_fascia;
                d.ass_td_fascia = +d.ass_TD_fascia;
                d.year = +d.anno;
                d.ass_ti_maschi = +d.ass_TI_maschi;
                d.ass_td_maschi = +d.ass_TD_maschi;
                d.ass_ti_femmine = +d.ass_TI_femmine;
                d.ass_td_femmine = +d.ass_TD_femmine;
            });
            JobsActDataPerFascia = csv2;

            csv3.forEach(function (d) {
                d.year = +d.anno;
                d.month = d.mese;
                d.ass_ti__ass_td = +d.ass_TI__ass_TD;
                d.lic_ti__ass_ti = +d.lic_TI__ass_TI;
                d.lic_td__ass_td= +d.lic_TD__ass_TD;
                d.lic_ti__lic_td = +d.lic_TI__lic_TD;
            });
            JobsActDataPerMonth = csv3;

            csv1.forEach(function (d) {
                d.year = +d.anno;
                d.ass_ti = +d.ass_TI;
                d.ass_td = +d.ass_TD;
                d.lic_ti = +d.lic_TI;
                d.lic_td = +d.lic_TD;
                d.lic_ti__ass_ti = +d.lic_TI__ass_TI;
                d.ass_ti__ass_td = +d.ass_TI__ass_TD;
                d.lic_td__ass_td = +d.lic_TD__ass_TD;
                d.lic_ti__lic_td = +d.lic_TI__lic_TD;
                d.appr_to_ti = +d.APPR_to_TI;
                d.td_to_ti = +d.TD_to_TI;
                d.nuove_ass_ti = +d.nuove_ass_TI;
                d.maschi_ti = +d.maschi_TI;
                d.femmine_ti = +d.femmine_TI;
                d.maschi_td = +d.maschi_TD;
                d.femmine_td = +d.femmine_TD;
                d.fino24_ti = +d.fino24_TI;
                d.da25a29_ti = +d.da25a29_TI;
                d.da30a39_ti = +d.da30a39_TI;
                d.da40a49_ti = +d.da40a49_TI;
                d.oltre50_ti = +d.oltre50_TI;
                d.fino24_ti__ass_ti = +d.fino24_TI__ass_TI;
                d.da25a29_ti__ass_ti = +d.da25a29_TI__ass_TI;
                d.da30a39_ti__ass_ti = +d.da30a39_TI__ass_TI;
                d.da40a49_ti__ass_ti = +d.da40a49_TI__ass_TI;
                d.oltre50_ti__ass_ti = +d.oltre50_TI__ass_TI;
            });
            JobsActDataPerYear = csv1;

            if (window.location.href.match("jobs_act.html") != null)
                createGraphs('lic_ti__ass_ti');
        });
    });
});