// Global var for progetto---------------------------------------
var projection; // the projection used in the map, not needed as global?
var datiGlobal; // the data
var datiGlobalNormalized;
//var dati;
var mappa; // the map
var selYear = "15"; // the selected year in the upped slider, it is used inside the functions that update the graphs
var varName = "Assunzioni"; // the selected kind of contract in the upped dropdown menu, it is used inside the functions that update the graphs
var ageGenderButton; // the gender to plot in the lower view, read from radio buttons,used in the functions that draw the graphs
var rateButton; // the rate to plot in the lower view, read from radio buttons,used in the functions that draw the graphs
//functions-------------------------------------------------
var datiBottom; // stores the data for the lower view
// read from selectors items the values of year and type of contract -> updates global variables -> and calls the functions to update the graphs, these functions use the global variables inside
var selectedRegion = "ITALIA"; //stores the selected region in the map,used in various functions for lookup
var varNameBottom; //stores the value of the radiobutton in the lower view
var myKeys; //stores the variable names used for the stacked barchart, used to reorder it
var firstTime = 0; //used in the stacked barchart,the first time it's drawn when a new variable is selected from the dropdown menu it needs to generate new keys, if it's drawn again because the user choose to reorder it it neeed to reorder the keys instead

//var nationalView = false;
//load the csvs with all the data, draw the page the first time
d3.csv("data/Tassi.csv", function(error, csv) {
    if (error) {
        console.log(error); //Log the error.
        throw error;
    }
    datiBottom = csv;

    d3.csv("data/DatiNormalizzati1000.csv", function(error, csv) {
        if (error) {
            console.log(error); //Log the error.
            throw error;
        }
        datiGlobalNormalized = csv;
    });

    d3.csv("data/alldataITA.csv", function(error, csv) {
        if (error) {
            console.log(error); //Log the error.
            throw error;
        }
        datiGlobal = csv;
        initializeProgram();
    });

});
//the function that draws the page the first time
function initializeProgram() {

    readDataFromSelectorsBottom();
    readDataFromSelectors();
    createUpperCharts("ITALIA", createData("ITALIA"))
    colorMap("ATOT", "15");
    createLineChartBottom();
}

function makeNationalView() {
    readDataFromSelectorsBottom();
    readDataFromSelectors();
    if (document.getElementById("nationalViewCheckbox").checked) {
        createUpperCharts("ITALIA", createData("ITALIA"));
    } else {
        createUpperCharts(selectedRegion, createData(selectedRegion));
    }
}
//this fuction is called on change of the selectors in the html upper view, it updates the global variables and updates the graphs and map
function readDataFromSelectors() {
    selYear = document.querySelector('input[name="yearSelector"]:checked').value;
    varName = document.getElementById('dataset').value;
    changeMap();
    firstTime = 0;
    if (document.getElementById("nationalViewCheckbox").checked) {
        createUpperCharts("ITALIA", createData("ITALIA"));
    }
    if (!document.getElementById("nationalViewCheckbox").checked) {
        createUpperCharts(selectedRegion, createData(selectedRegion));
    }
}

//this functions is called on change of the selectors in the lower view, it updates the global variables and the graph
function readDataFromSelectorsBottom() {

    ageGenderButton = document.querySelector('input[name="agegender"]:checked').value;
    rateButton = document.querySelector('input[name="rate"]:checked').value;
    varNameBottom = rateButton + ageGenderButton;
    createLineChartBottom();
}

// this function read the global variables for year and kind of contract and then calls the function wich color the map with the appropriate parameters
function changeMap() {

    if (varName == "Cessazioni") {
        colorMap("CTOT", selYear);
    }
    if (varName == "Assunzioni") {
        colorMap("ATOT", selYear);
    };
    if (varName == "Trasformazioni") {
        colorMap("TTOT", selYear);
    };
}


// this function take as argument a kind of contract and a year, perform and append on the map properties of the value of that kind of contract for the selected year, it does this for each region in the map. Then it creates an appropriate color scale and fill the regions color with the scaled value.
function colorMap(variable, year) {
    var selectedVariable = variable + year;

    var legendData = [];
    var dati;
    if (document.getElementById("normalizationCheckBox").checked) {
        dati = datiGlobalNormalized;
    }
    if (!document.getElementById("normalizationCheckBox").checked) {
        dati = datiGlobal;
    }

    for (var i = 0; i < dati.length; i++) {
        //nome regione
        var nomeRegione = dati[i].Regione;
        //Grab data value, and convert from string to float
        var valoreContratto = parseInt(dati[i][selectedVariable]); //ctot14;
        //Find the corresponding regione inside the GeoJSON
        for (var j = 0; j < mappa.features.length; j++) {
            var nomeRegioneMappa = mappa.features[j].properties.NOME_REG;
            if (nomeRegione == nomeRegioneMappa) {
                //Copy the data value into the JSON
                mappa.features[j].properties.value = valoreContratto;
            }
        }
    }

    for (var k = 0; k < mappa.features.length; k++) {
        aux = {
            value: mappa.features[k].properties.value,
        }
        legendData.push(aux);
    }
    legendData.sort(function(a, b) {
        return parseFloat(a.value) - parseFloat(b.value);
    });

    var littleLegendData = [];
    littleLegendData = [0, legendData[4].value, legendData[8].value, legendData[12].value, legendData[17].value, legendData[19].value];

    if (!document.getElementById("normalizationCheckBox").checked) {

        for (var i = 0; i < littleLegendData.length; i++) {
            littleLegendData[i] = Math.round(littleLegendData[i]*1000)/1000;
        }
    }

    var colorScale = d3.scaleThreshold()
        .domain([littleLegendData[0], littleLegendData[1], littleLegendData[2], littleLegendData[3], littleLegendData[4], littleLegendData[5]])
        .range(["white", "#d9f0a3", "#addd8e", "#78c679", "#31a354", "#006837"]);

    var myLegendRect = d3.select("#legend").selectAll("rect").data(littleLegendData.slice(0, littleLegendData.length - 1));
    myLegendRect.exit().remove();
    myLegendRect = myLegendRect.enter().append("rect").merge(myLegendRect);
    myLegendRect.transition().delay(100).duration(300).attr("y", function(d, i) {
            return 40 + 25 + i * 50;
        })
        .attr("x", 0)
        .attr("height", 50)
        .attr("width", 50)
        .attr("fill", function(d) {
            return colorScale(d);
        });

    var myLegendText = d3.select("#legend").selectAll("text").data(littleLegendData.slice(0, littleLegendData.length - 1));
    myLegendText.exit().remove();
    myLegendText = myLegendText.enter().append("text").merge(myLegendText);
    myLegendText.transition().delay(100).duration(300).attr("y", function(d, i) {
            return 40 + 30 + 25 + i * 50;
        })
        .attr("x", 50)
        .text(function(d, i) {
            return "da " + littleLegendData[i] + " a " + littleLegendData[i + 1];
        });
    if (!document.getElementById("normalizationCheckBox").checked) {
        d3.select("#legend").append("text").transition().delay(100).duration(300).attr("y", 50).text("Numero di " + varName).attr("font-size", 20);
    }
    if (document.getElementById("normalizationCheckBox").checked) {
        d3.select("#legend").append("text").transition().delay(100).duration(300).attr("y", 50).text("Numero di " + varName + " per mille abitanti").attr("font-size", 20);
    }


    var myColoredMap = d3.select("#map").selectAll("path").data(mappa.features);
    myColoredMap.exit().remove();
    myColoredMap = myColoredMap.enter().merge(myColoredMap).attr("fill", function(d) {
        //Get data value
        var value = d.properties.value;
        if (value) {
            //If value exists…
            return colorScale(value);
        } else {
            //If value is undefined…
            return "#ccc";
        }
    }).attr("class", function(d) {
        if (d.properties.NOME_REG == selectedRegion) {
            return "selected";
        } else {
            return "normal";
        }
    })
}

// this function draws the basic map and stores it in a global variable for later use

d3.json("mappa/mappa.json", function(error, world) {
    var width = 800;
    var height = 800;
    projection = d3.geoMercator().scale(2500).translate([-100, height * 3]).precision(0.1);
    var path = d3.geoPath()
        .projection(projection);

    var regions = topojson.feature(world, world.objects.reg2011);
    mappa = regions;
    d3.select("#map").selectAll("path")
        .data(mappa.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("click", function(d) {

            firstTime = 0;
            d3.select("#map").selectAll("path").attr("class", "normal");
            d3.select(this).attr("class", "selected");
            document.getElementById("nationalViewCheckbox").checked = false;
            selectedRegion = d.properties.NOME_REG;
            if (d.properties.NOME_REG == "TRENTINO ALTO-ADIGE" && document.getElementById("normalizationCheckBox").checked )
            {
                alert("I dati per il Trentino alto-adige sono normalizzati alla popolazione del 2016 per ogni anno per mancanza dati")
            }
            createUpperCharts(selectedRegion, createData(selectedRegion));

        });
});

// this is an auxiliary function that updates a vector(dataToUse) with the right values needed to draw the graphs according to the values of the global variables
function createData(regionName) {
    dataToUse = [];
    var dati;
    if (document.getElementById("normalizationCheckBox").checked) {
        dati = datiGlobalNormalized;
    }
    if (!document.getElementById("normalizationCheckBox").checked) {
        dati = datiGlobal;
    }

    for (i = 0; i < dati.length; i++) {
        var tmp = ["14", "15", "16"];
        if (dati[i].Regione == regionName) {
            if (varName == "Cessazioni") {
                completeNames = ["T. Indeterminato", "Rapporti a Termine", "Apprendisti", "Rapporti Stagionali", "Totale"];
                for (var j = 0; j < tmp.length; j++) {
                    data = {
                        year: tmp[j],
                        "T. Indeterminato": dati[i]["CTI" + tmp[j]],
                        "Rapporti a Termine": dati[i]["CRT" + tmp[j]],
                        "Apprendisti": dati[i]["CA" + tmp[j]],
                        "Rapporti Stagionali": dati[i]["CRS" + tmp[j]],
                        TOT: dati[i]["CTOT" + tmp[j]],
                    }
                    dataToUse.push(data);
                }
            }

            if (varName == "Assunzioni") {
                completeNames = ["T. Indeterminato", "A termine", "In Apprendistato", "Stagionali", "Totale"];
                for (var j = 0; j < tmp.length; j++) {
                    data = {
                        year: tmp[j],
                        "Indeterminato": dati[i]["ATI" + tmp[j]],
                        "A termine": dati[i]["AT" + tmp[j]],
                        "In Apprendistato": dati[i]["AA" + tmp[j]],
                        "Stagionali": dati[i]["AS" + tmp[j]],
                        TOT: dati[i]["ATOT" + tmp[j]],
                    }
                    dataToUse.push(data);
                };
            };
            if (varName == "Trasformazioni") {
                completeNames = ["Rapp.Term->T.Ind", "Appr->T.Ind", "Totale"];
                for (var j = 0; j < tmp.length; j++) {
                    data = {
                        year: tmp[j],
                        "Rapp.Term->T.Ind": dati[i]["RTTI" + tmp[j]],
                        "Appr->T.Ind": dati[i]["TATI" + tmp[j]],
                        TOT: dati[i]["TTOT" + tmp[j]],
                    }
                    dataToUse.push(data);
                };

            };
            return dataToUse;
            break;
        }
    }
}
//auxiliary fuction needed to fix the text in the legends
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
//this function draws the stacked barchart
function createUpperCharts(regionName, dataToUse) {

    var colorDict = {
        //colors for Cessazioni
        "T. Indeterminato": "#feb24c",
        "Rapporti a Termine": "#fd8d3c",
        "Apprendisti": "#f03b20",
        "Rapporti Stagionali": "#bd0026",
        //colors for Assunzioni
        "Indeterminato": "#bdd7e7",
        "A termine": "#6baed6",
        "In Apprendistato": "#3182bd",
        "Stagionali": "#08519c",
        //colors for Trasformazioni
        "Rapp.Term->T.Ind": "#bcbddc",
        "Appr->T.Ind": "#756bb1",
    }
    var svgBounds = d3.select("#barChart").node().getBoundingClientRect();
    var margin = {
            top: 50,
            right: 130,
            bottom: 35,
            left: 130
        },
        barWidth = svgBounds.width - margin.left - margin.right,
        barHeight = svgBounds.height - margin.top - margin.bottom;

    var svg = d3.select("#barChart")
        .attr("width", barWidth + margin.left + margin.right)
        .attr("height", barHeight + margin.top + margin.bottom);
    //if it's the first time that the barchart is made with a kind of contract it needs to update the keys, else the keys are stored in the global variable and reordered when needed
    if (firstTime == 0) {
        myKeys = Object.keys(dataToUse[0]).slice(1, dataToUse[0].length);
        myKeys.pop();
        firstTime = 1;
    }
    //auxiliary method used later to reorder the barchart
    Array.prototype.move = function(from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
    };
    var xScale = d3.scaleBand()
        .rangeRound([0, barWidth])
        .paddingInner(0.5)
        .align(0.1)
        .domain(dataToUse.map(function(d) {
            return d.year;
        }));

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataToUse, function(d) {
            return parseInt(d.TOT);
        })]).range([barHeight, margin.top]).nice();

    var divTooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var group = svg.append("g").attr("transform", "translate(" + margin.left + "," + 0 + ")");
    svg.selectAll("rect").remove();
    d3.selectAll("text.legendText").remove();

    group.append("g")
        .selectAll("g")
        .data(d3.stack().keys(myKeys)(dataToUse)).enter().append("g")
        .attr("fill", function(d) {
            return colorDict[d.key];
        })
        .selectAll("rect")
        .data(function(d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function(d) {
            return xScale(d.data.year);
        })
        .attr("y", function(d) {
            return yScale(d[1]);
        })
        .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .on("mousemove", function(d) {
            d3.select(this).style("stroke", "black").style("stroke-width", "1.5")
            divTooltip.transition()
                .duration(200)
                .style("opacity", .9);
            divTooltip.html(parseFloat(d[1]- d[0]).toFixed(2))
                .style("left", (d3.event.pageX) + "px") //
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", "none")
            divTooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    //legend
    reverseKeys = myKeys;
    var legend = group.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(reverseKeys.reverse())
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("text")
        .attr("class", "legendText")
        .attr("x", barWidth + 120)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) {
            return d;
        });
    legend.append("rect")
        .attr("x", barWidth + 5)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", function(d) {
            return colorDict[d]
        })
        .attr("class", function(d, i) {
            if (i == reverseKeys.length - 1) {
                return "legendSelected";
            } else {
                return "none";
            }
        })
        .on("click", function(d, i) {
            if (i != myKeys.length - 1) {
                myKeys.move(i, 0);
                createUpperCharts(regionName, dataToUse);
            }
        });
    //title
    if (!document.getElementById("normalizationCheckBox").checked) {
        d3.select("#barChartTitle").selectAll("text").remove();
        d3.select("#barChartTitle").append("text").attr("transform", "translate(35,50)").text(varName + " in " + capitalizeFirstLetter(regionName.toLowerCase()));
    }
    if (document.getElementById("normalizationCheckBox").checked) {
        d3.select("#barChartTitle").selectAll("text").remove();
        d3.select("#barChartTitle").append("text").attr("transform", "translate(35,50)").text(varName + " in " + capitalizeFirstLetter(regionName.toLowerCase()) + " per mille abitanti");
    }
    //axis
    d3.select("#yAxisBar")
        .attr("transform", "translate(" + (margin.left - 2) + "," + 0 + ")")
        .attr("class", "axisBary")
        .transition().delay(100).duration(300)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -10)
        .attr("dy", ".35em")
        .style("text-anchor", "left");
    d3.select("#xAxisBar")
        .attr("class", "axisBar")
        .attr("transform", "translate(" + margin.left + "," + barHeight + ")")
        .transition().delay(100).duration(300)
        .call(d3.axisBottom(xScale).ticks(3));

}
//this function creates the line chart in the lower view
function createLineChartBottom() {
    var svgBounds = d3.select("#lineChartBottom").node().getBoundingClientRect();
    var margin = {
            top: 35,
            right: 60,
            bottom: 35,
            left: 50
        },
        lineWidth = svgBounds.width - margin.left - margin.right,
        lineHeight = svgBounds.height - margin.top - margin.bottom;

    var svg = d3.select("#lineChartBottom")
        .attr("width", lineWidth + margin.left + margin.right)
        .attr("height", lineHeight + margin.top + margin.bottom);

    var partTime = d3.timeParse("%d/%m/%Y")
    var xScaleLine = d3.scaleTime()
        .domain(d3.extent(datiBottom, function(d) {
            return partTime(d.Date);
        }))
        .rangeRound([margin.left, lineWidth]);

    var yScaleLine = d3.scaleLinear()
        .domain([0, d3.max(datiBottom, function(d) {
            return Math.max(d[varNameBottom], d[rateButton + "MF"]);
        })]).range([lineHeight, margin.top]);
    // the line for the selected rate in the selected particular subset of the general population
    var valueline = d3.line()
        .x(function(d) {
            return xScaleLine(partTime(d.Date))
        })
        .y(function(d) {
            return yScaleLine(parseFloat(d[varNameBottom]))
        });
    // the line for the selected rate in the general population
    var valuelineBaseline = d3.line()
        .x(function(d) {
            return xScaleLine(partTime(d.Date))
        })
        .y(function(d) {
            return yScaleLine(parseFloat(d[rateButton + "MF"]))
        });
    //title
    rateButtonValue = d3.select("#" + rateButton).text();
    if(ageGenderButton == "15_24") {
            selector = "AAA";
    }
    if(ageGenderButton == "25_34") {
            selector = "BBB";
    }
    if(ageGenderButton == "35_49") {
            selector = "CCC";
    }
    if(ageGenderButton == "50_64") {
            selector = "DDD";
    }
    if(ageGenderButton == "M") {
            selector = "M";
    }
    if(ageGenderButton == "F") {
            selector = "F";
    }
    ageGenderButtonValue = d3.select("#" + selector).text();;
    d3.select("#lineChartTitleBottom").selectAll("text").remove();
    d3.select("#lineChartTitleBottom").append("text").attr("transform", "translate(35,50)").text(rateButtonValue + " per la popolazione generale vs sottopopolazione ("+ageGenderButtonValue+")");
    //axis
    d3.select("#yAxisLineBottom")
        .attr("transform", "translate(" + margin.left + ",0)")
        .attr("class", "axis")
        .transition().delay(100).duration(300)
        .call(d3.axisLeft(yScaleLine));
    // add the y Axis
    d3.select("#xAxisLineBottom")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (lineHeight) + ")")
        .transition().delay(100).duration(300)
        .call(d3.axisBottom(xScaleLine));
    //lines
    svg.selectAll("path.lineBottom").remove();
    svg.append("path").data([datiBottom]).transition().delay(100).duration(300).attr("d", valueline).attr("class", "lineBottom");
    svg.selectAll("text.graphText").remove();
    svg.append("text").attr("transform", "translate(" + xScaleLine(partTime(datiBottom[datiBottom.length - 1]["Date"])) + "," + yScaleLine(parseFloat(datiBottom[datiBottom.length - 1][varNameBottom])) + ")").attr("class", "graphText").text("Tasso " + ageGenderButtonValue);

    svg.selectAll("path.lineBottomBaseline").remove();
    svg.append("path").data([datiBottom]).transition().delay(100).duration(300).attr("d", valuelineBaseline).attr("class", "lineBottomBaseline");
    svg.append("text").attr("transform", "translate(" + xScaleLine(partTime(datiBottom[datiBottom.length - 1]["Date"])) + "," + yScaleLine(parseFloat(datiBottom[datiBottom.length - 1][rateButton + "MF"])) + ")").attr("class", "graphText").text("Tasso tot.");
}
