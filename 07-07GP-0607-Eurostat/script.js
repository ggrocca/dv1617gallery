//data for selected work position
var dataselected;
//data containing all country code
var allCountryCode;
//year present in the survey
var yearDom=["2002","2006","2010","2014"];
//color scale
var color;
//selected column (year and measure)
var selected_dim;
//selected year
var sel_year;
//selected measure (euro or pps)
var sel_meas;
//max for selected measure over all years
var max_sel_meas;
//padding
var Axis_Padding=55;
var pad=10;
//variable that regulate the generation of list when search for country by using the search bar
var start=true;
//timer that regulate the visibility of list when search for country by using the search bar
var timer;
//selected country and value that indicates who is the last modified
var sel1="a";
var sel2="a";
var selval1=0;
var selval2=1;
//create a transition
var t = d3.transition()
.duration(2000)


//load csv containing the country code
d3.csv("data/countries_code.csv", function (error, csv) {
       if (error) {
       console.log(error);  //Log the error.
       throw error;
       }
       
       // Store csv data in a global variable
       allCountryCode = csv;
       
       });


function DrawMap(){
    //we get the dimension of svg
    var svgBounds = d3.select("#map_svg").node().getBoundingClientRect();
    var w = svgBounds.width;
    var h = svgBounds.height;
    //we set the scale of the map
    var scale=w/1.5;
    
    
    // we set the Mercator geographic projection, the center and the scale
    var projection = d3.geoMercator()
    .center([ 13, 56 ])
    .translate([ w/2, h/2 ])
    .scale(scale);
    
    //we create a new geographic path generator using the projection created
    var path = d3.geoPath()
    .projection(projection);
    var svg=d3.select("#map_svg");
    var g=d3.select("#map");
    
    
    //we load in GeoJSON data
    d3.json("data/eu.geojson", function(json) {
            d3.select("#map").selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke-width", 0.01)
            .attr("stroke" , "white")
            .attr("id", function(d){ return d.properties.ID});
            });
    
    
    //we create a zoom behavior and set the scale range
    var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);
    
    //we disable wheel zoom
    svg
    .call(zoom)
    .on("wheel.zoom", null);
    
    //we create a variable in order to regulate the choice of zoom translate (when zoom scale becomes 1 we want to return to starting map)
    var reset=false;
    //tx and ty represent the translate to be done on zoom
    tx=-w/2;
    ty=-h/2;
    
    function zoomed() {
        g.attr("transform", d3.event.transform);
        //set the map-zoomer equal to scale of zoom
        d3.select("#map-zoomer").node().value = d3.event.transform.k;
        if (reset) {
            //if reset=true set the tranlate x and y to the starting value
            tx=-w/2;
            ty=-h/2;
        }
        else {
            //the translate must be weighed for the scale of zoom
            tx=d3.event.transform.x/(d3.event.transform.k-1);
            ty=d3.event.transform.y/(d3.event.transform.k-1);
        }
    }
    //when reset_map() is called, map return the starting zoom situation (d3.zoomIdentity)
    function reset_map() {
        reset=true;
        svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity );
    }
    //on click the zoom-in button
    d3.select("#zoom-in").on("click",function(){
                             reset=false;
                             //we create a var k in order to get the value of current zoom
                             var k=+d3.select("#map-zoomer").node().value;
                             if (k < 8){
                             //increment zoom
                             var scale=k + 1;
                             svg.transition()
                             .duration(750)
                             .call( zoom.transform, d3.zoomIdentity.translate(tx*(scale-1),ty*(scale-1)).scale(scale) );
                             }});
    //on click the zoom-out button
    d3.select("#zoom-out").on("click",function(){
                              reset=false;
                              //we create a var k in order to get the value of current zoom
                              var k=+d3.select("#map-zoomer").node().value;
                              //We allow to decrease the zoom only if current-zoom is greater than 1
                              if (k > 1){
                              var scale=k - 1;
                              //if zoom scale becomes 1 set reset=true
                              if (scale==1) {reset=true;}
                              svg.transition()
                              .duration(750)
                              .call( zoom.transform, d3.zoomIdentity.translate(tx*(scale-1),ty*(scale-1)).scale(scale) );
                              }});
    //on change the map-zoomer
    d3.select("#map-zoomer").on("change",function(){
                                reset=false;
                                //set the scale equal to map-zoomer's value
                                var scale = +this.value;
                                //if zoom scale becomes 1 set reset=true
                                if (scale==1) {reset=true;}
                                svg
                                .call( zoom.transform, d3.zoomIdentity.translate(tx*(scale-1),ty*(scale-1)).scale(scale) );
                                });
    d3.select("#resetmap").on("click", reset_map);
    
    //when the page is load, first we draw the map and then we call change data in order to load csv, color map and draw other charts
    changeData();
}


function resetSel(){
    //Red elements return to the original colors
    d3.select("#barChart").select(sel1)
    .attr("fill", function(d){return color(d[selected_dim]);});
    d3.select("#lineChart").select(sel1)
    .style("opacity", 0.1)
    .style("stroke", "black")
    .style("stroke-width",2);
    d3.select("#map").select(sel1)
    .attr("stroke-width", 0.01)
    .attr("stroke", "white");
    d3.select("#scatter").select(sel1)
    .attr("fill", function(d){return color(d[selected_dim]);});
    //Yellow elements return to the original colors
    d3.select("#barChart").select(sel2)
    .attr("fill", function(d){return color(d[selected_dim]);});
    d3.select("#lineChart").select(sel2)
    .style("opacity", 0.1)
    .style("stroke", "black")
    .style("stroke-width",2);
    d3.select("#map").select(sel2)
    .attr("stroke-width", 0.01)
    .attr("stroke", "white");
    d3.select("#scatter").select(sel2)
    .attr("fill", function(d){return color(d[selected_dim]);});
    
    //reset sel1 and sel2
    sel1="a";
    sel2="a";
    selval1=0;
    selval2=1;
    //hides legend of selected country
    d3.selectAll(".colorsel")
    .style("display", "none");
    d3.selectAll(".name")
    .style("display", "none");
    

}

function mySearch() {
    //clear timer when something is typed in searchbar
    clearTimeout(timer);
    
    //Timer allows you to hide the list after a while
    timer = setTimeout(function () {
                       d3.select("#searchDiv")
                       .style("opacity", 0).style("z-index", -1);
                       }, 10000);
    
    //The variable start allows you to create the list of countries only once
    if (start==true) {
    
        var ul = d3.select("#searchDiv").append("ul").attr("id", "myUL").selectAll("li").data(dataselected, function(d) {return d.GEO;});
        ul=ul.enter().append("li").attr("id", function(d) {return d.id}).append("a").attr("href","#").text(function(d) { return d.GEO});
        start=false;
}

    

    var filter, li, a, i;
    //filter is the value of the search bar turned into uppercase letters
    filter = document.getElementById("searchBar").value.toUpperCase();
    //li is the collection of all li of the list (each li represent a country)
    li = document.getElementById("myUL").getElementsByTagName("li");
    //This hides the list when the input is empty
    if (filter.length <1) {
        d3.select("#searchDiv")
        .style("opacity", 0);
    }
    else {d3.select("#searchDiv")
        .style("opacity", 1).style("z-index",1);}

    
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        //a is the a element contained in the i-th li
        a = li[i].getElementsByTagName("a")[0];
        //if statement check if filter is contained in a (indexOf() returns -1 if the value to search for never occurs)
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
    
    var element = d3.select("#myUL").selectAll("li");

    element.on("click", function(d) {
               var selection="#"+this.id;
               //IF statement check which selection is the last modified
               if (selval1<selval2) {
               //set color of sel1
               var color_sel="red";
               //if statement avoid to have the same country in each selection
               if (selection!=sel2) {
               d3.select("#barChart").select(sel1).attr("fill", function(d){return color(d[selected_dim]);});
               d3.select("#lineChart").select(sel1).style("opacity", 0.1).style("stroke", "black").style("stroke-width",2);
               d3.select("#map").select(sel1).attr("stroke-width", 0.01).attr("stroke", "white");
               d3.select("#scatter").select(sel1).attr("fill", function(d){return color(d[selected_dim]);});
               
               sel1=selection;
               selval2=0;
               selval1=1;
               //show legend for sel1 and update it
               d3.select("#color1").style("display", "block");
               d3.select("#sel1").style("display", "block");
               d3.select("#reset_span").style("display", "block");
               document.getElementById("sel1").textContent = d.GEO;
               
               }
               else {color_sel="yellow" }
               //but also if selection doesn't change we want that last clicked is on the top of others (this is the reason of use selection instead of sel1 and color_sel instead of "red")
               d3.select("#barChart").select(selection).attr("fill", color_sel);
               //"(selected node).parentNode.appendChild(selected node)" allow to put the last selected country on top of the others, in this way its border is not covered by the others
               d3.select((d3.select("#lineChart").select(selection).node()).parentNode.appendChild((d3.select("#lineChart").select(selection).node())))
               .style("stroke", color_sel).style("stroke-width",5).style("opacity",1);
               d3.select((d3.select("#map").select(selection).node()).parentNode.appendChild((d3.select("#map").select(selection).node())))
               .attr("stroke-width", 4).attr("stroke", color_sel);
               d3.select((d3.select("#scatter").select(selection).node()).parentNode.appendChild((d3.select("#scatter").select(selection).node())))
               .attr("fill", color_sel);
               }
               else {
               var color_sel="yellow"
               //if statement avoid to have the same country in each selection
               if (selection!=sel1) {
               d3.select("#barChart").select(sel2).attr("fill", function(d){return color(d[selected_dim]);});
               d3.select("#lineChart").select(sel2).style("opacity", 0.1).style("stroke", "black").style("stroke-width",2);
               d3.select("#map").select(sel2).attr("stroke-width", 0.01).attr("stroke", "white");
               d3.select("#scatter").select(sel2).attr("fill", function(d){return color(d[selected_dim]);});
               
               sel2=selection;
               selval1=0;
               selval2=1;
               //show legend for sel2 and update it
               d3.select("#color2").style("display", "block");
               d3.select("#sel2").style("display", "block");
               d3.select("#reset_span").style("display", "block");
               document.getElementById("sel2").textContent = d.GEO;
               
               }
               else { color_sel="red" }
               //but also if selection doesn't change we want that last clicked is on the top of others (this is the reason of use selection instead of sel2)
               d3.select("#barChart").select(selection).attr("fill", color_sel);
               //"(selected node).parentNode.appendChild(selected node)" allow to put the last selected country on top of the others, in this way its border is not covered by the others
               d3.select((d3.select("#lineChart").select(selection).node()).parentNode.appendChild((d3.select("#lineChart").select(selection).node())))
               .style("stroke", color_sel).style("stroke-width",5).style("opacity",1);
               d3.select((d3.select("#map").select(selection).node()).parentNode.appendChild((d3.select("#map").select(selection).node())))
               .attr("stroke-width", 4).attr("stroke", color_sel);
               d3.select((d3.select("#scatter").select(selection).node()).parentNode.appendChild((d3.select("#scatter").select(selection).node())))
               .attr("fill", color_sel);
               }
               
               //after selection has been made we can hide the list
               d3.select("#searchDiv")
               .style("opacity", 0).style("z-index", -1);
               })
    .on("mouseover", function() {
        clearTimeout(timer)
        timer = setTimeout(function () {
                           d3.select("#searchDiv")
                           .style("opacity", 0).style("z-index", -1);
                           }, 10000);
        })
    
}


function createBarchart() {
    //we put the data selected into a variable, so we can change it without changing the value of the global variable
    var data;
    
    //if includeMiss is not checked we filter out missing data
    if(!document.getElementById("includeMiss").checked){
        data=dataselected.filter(function(d) {
                                 return d[selected_dim] > -1});
    }
    else {data=dataselected;}
    
    
    //if checkSort is checked we sort data by value
    if(document.getElementById("checkSort").checked){
        data.sort(function(a, b) {
                  if(!(a[selected_dim]> -1)){ return 1;}
                  else if(!(b[selected_dim] > -1)){ return -1; }
                  else if(a[selected_dim] === b[selected_dim]){ return 0; }
                  else { return b[selected_dim] - a[selected_dim]; }})};

    
    
    //We need more padding to put the country names on the x axis
    var bottomPad = 80;
    //we get the dimension of svg
    var svgBounds = d3.select("#barChart").node().getBoundingClientRect();
    //we create the xScale
    var xScale = d3.scaleBand()
    .domain(data.map(function(d){ return d.GEO }))
    .range([Axis_Padding, svgBounds.width-pad])
    .padding(0.1)
    .paddingInner(0.1)
    .paddingOuter(0.2);
    
    //we create de yScale
    var max= d3.max(data, function(d) {return d[selected_dim]} );
    var yScale = d3.scaleLinear()
    .domain([0, max])
    .range([svgBounds.height - bottomPad , pad]);
    
    //we add the axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    
    d3.select("#barChart").select(".xAxis")
    .attr("transform", "translate(" + 0 + "," + (svgBounds.height-bottomPad) +")")
    .transition(t)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-8")
    .attr("dy", "-5")
    .attr("transform", "rotate(-90)");
    
    d3.select("#barChart").select(".yAxis")
    .attr("class", "yAxis")
    .attr("transform", "translate(" + Axis_Padding + ",0)")
    .transition(t)
    .call(yAxis);
    
    //add axis name on y
    var axis_name = d3.select("#barChart").select(".Axis_name");
    axis_name.selectAll("text").remove();
    axis_name.append("text")
    .attr("x", 5)
    .attr("y", (svgBounds.height-bottomPad)/2)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "grey")
    .text(sel_meas)
    .style("writing-mode","tb")
    .style("glyph-orientation-vertical","0")
    .style("letter-spacing","1");
    
    //we create bar chart
    //we need the if statement (d[selected_dim]>-1) to deal with the missing data without generating errors
    //when we fill the bars we check if the bar represent a selected country
    var barchart = d3.select("#bars").selectAll("rect").data(data);
    barchart.exit().transition(t).remove();
    barchart = barchart.enter().append("rect")
    .merge(barchart);
    barchart.transition(t)
    .attr("x",function(d) {
          return xScale(d.GEO);
          })
    .attr("y",function(d){
          if (d[selected_dim]>-1) return yScale(d[selected_dim]);
          })
    .attr("width", xScale.bandwidth())
    .attr("height", function (d) {
          if (d[selected_dim]>-1) return svgBounds.height - bottomPad - yScale(d[selected_dim]);
          })
    .attr("fill", function(d) {if (sel1 == ("#"+d.id)) { return "red"}
          else if (sel2==("#"+d.id)) {return "yellow"}
          else return color(d[selected_dim]);
          })
    .attr("id", function(d) {return d.id;});
    //on mouseover we color orange the corresponding element of each chart (for line chart we set also opacity=1 and stroke-width=5)
    barchart.on("mouseover", function(d) {
        var over_state="#"+d.id;
        d3.select(this).attr("fill", "orange");
        d3.select((d3.select("#lineChart").select(over_state).node()).parentNode.appendChild((d3.select("#lineChart").select(over_state).node())))
        .style("stroke", "orange").style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(over_state).node()).parentNode.appendChild((d3.select("#map").select(over_state).node())))
        .attr("stroke-width", 4).attr("stroke", "orange");
        d3.select((d3.select("#scatter").select(over_state).node()).parentNode.appendChild((d3.select("#scatter").select(over_state).node())))
        .attr("fill", "orange");
        
        })
    //on mouseout we return to the previous situation
    .on("mouseout", function(d) {
        var over_state="#"+d.id;
        d3.select(this).attr("fill", function(d){ if (over_state==sel1) {return "red";}
                             if (over_state==sel2) {return "yellow";}
                             else return color(d[selected_dim]);
                             });
        d3.select("#lineChart").select(over_state)
        .style("opacity", function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 1;}
               else return 0.05;
               })
        .style("stroke", function(d){ if (over_state==sel1) {return "red";}
               if (over_state==sel2) {return "yellow";}
               else return "black";
               })
        .style("stroke-width",function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 5;}
               else return 4;
               })

        d3.select("#map").select(over_state)
        .attr("stroke-width", function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 4;}
              else return 0.01;
              })
        .attr("stroke", function(d){ if (over_state==sel1) {return "red";}
              if (over_state==sel2) {return "yellow";}
              else return "white";
              });
        d3.select("#scatter").select(over_state)
        .attr("fill", function(d){ if (over_state==sel1) {return "red";}
              if (over_state==sel2) {return "yellow";}
              else return color(d[selected_dim]);
              })
        //we put again elements that represent the selected states at the top()
        //if selval1<selva2 then sel2 is selected after sel1 and must be on the top
        if (selval1<selval2){
        if(sel1.length>1){
        d3.select((d3.select("#lineChart").select(sel1).node()).parentNode.appendChild((d3.select("#lineChart").select(sel1).node())))
        d3.select((d3.select("#map").select(sel1).node()).parentNode.appendChild((d3.select("#map").select(sel1).node())))
        d3.select((d3.select("#scatter").select(sel1).node()).parentNode.appendChild((d3.select("#scatter").select(sel1).node())))
        }
        if(sel2.length>1){
        d3.select((d3.select("#lineChart").select(sel2).node()).parentNode.appendChild((d3.select("#lineChart").select(sel2).node())))
        d3.select((d3.select("#map").select(sel2).node()).parentNode.appendChild((d3.select("#map").select(sel2).node())))
        d3.select((d3.select("#scatter").select(sel2).node()).parentNode.appendChild((d3.select("#scatter").select(sel2).node())))
        }
        }
        else {
        if(sel2.length>1){
        d3.select((d3.select("#lineChart").select(sel2).node()).parentNode.appendChild((d3.select("#lineChart").select(sel2).node())))
        d3.select((d3.select("#map").select(sel2).node()).parentNode.appendChild((d3.select("#map").select(sel2).node())))
        d3.select((d3.select("#scatter").select(sel2).node()).parentNode.appendChild((d3.select("#scatter").select(sel2).node())))
        }
        if(sel1.length>1){
        d3.select((d3.select("#lineChart").select(sel1).node()).parentNode.appendChild((d3.select("#lineChart").select(sel1).node())))
        d3.select((d3.select("#map").select(sel1).node()).parentNode.appendChild((d3.select("#map").select(sel1).node())))
        d3.select((d3.select("#scatter").select(sel1).node()).parentNode.appendChild((d3.select("#scatter").select(sel1).node())))
        }
        
        }
        })
        
    //We allow you to select a state by clicking on the bar that represents it (Just like the search bar)
    .on("click", function(d) {
        var selection="#"+this.id;
        //IF statement check which selection is the last modified
        if (selval1<selval2) {
        //set color of sel1
        var color_sel="red";
        //if statement avoid to have the same country in each selection
        if (selection!=sel2) {
        d3.select("#barChart").select(sel1).attr("fill", function(d){return color(d[selected_dim]);});
        d3.select("#lineChart").select(sel1).style("opacity", 0.1).style("stroke", "black").style("stroke-width",2);
        d3.select("#map").select(sel1).attr("stroke-width", 0.01).attr("stroke", "white");
        d3.select("#scatter").select(sel1).attr("fill", function(d){return color(d[selected_dim]);});
        sel1=selection;
        selval2=0;
        selval1=1;
        //show legend for sel1 and update it
        d3.select("#color1").style("display", "block");
        d3.select("#sel1").style("display", "block");
        d3.select("#reset_span").style("display", "block");
        document.getElementById("sel1").textContent = d.GEO;
        }
        else {color_sel="yellow" }
        //but also if selection doesn't change we want that last clicked is on the top of others (this is the reason of use selection instead of sel1 and color_sel instead of "red")
        d3.select("#barChart").select(selection).attr("fill", color_sel);
        //"(selected node).parentNode.appendChild(selected node)" allow to put the last selected country on top of the others, in this way its border is not covered by the others
        d3.select((d3.select("#lineChart").select(selection).node()).parentNode.appendChild((d3.select("#lineChart").select(selection).node())))
        .style("stroke", color_sel).style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(selection).node()).parentNode.appendChild((d3.select("#map").select(selection).node())))
        .attr("stroke-width", 4).attr("stroke", color_sel);
        d3.select((d3.select("#scatter").select(selection).node()).parentNode.appendChild((d3.select("#scatter").select(selection).node())))
        .attr("fill", color_sel);
        }
        else {
        var color_sel="yellow"
        //if statement avoid to have the same country in each selection
        if (selection!=sel1) {
        d3.select("#barChart").select(sel2).attr("fill", function(d){return color(d[selected_dim]);});
        d3.select("#lineChart").select(sel2).style("opacity", 0.1).style("stroke", "black").style("stroke-width",2);
        d3.select("#map").select(sel2).attr("stroke-width", 0.01).attr("stroke", "white");
        d3.select("#scatter").select(sel2).attr("fill", function(d){return color(d[selected_dim]);});
        sel2=selection;
        selval1=0;
        selval2=1;
        //show legend for sel1 and update it
        d3.select("#color2").style("display", "block");
        d3.select("#sel2").style("display", "block");
        d3.select("#reset_span").style("display", "block");
        document.getElementById("sel2").textContent = d.GEO;
        }
        else { color_sel="red" }
        //but also if selection doesn't change we want that last clicked is on the top of others (this is the reason of use selection instead of sel2)
        d3.select("#barChart").select(selection).attr("fill", color_sel);
        //"(selected node).parentNode.appendChild(selected node)" allow to put the last selected country on top of the others, in this way its border is not covered by the others
        d3.select((d3.select("#lineChart").select(selection).node()).parentNode.appendChild((d3.select("#lineChart").select(selection).node())))
        .style("stroke", color_sel).style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(selection).node()).parentNode.appendChild((d3.select("#map").select(selection).node())))
        .attr("stroke-width", 4).attr("stroke", color_sel);
        d3.select((d3.select("#scatter").select(selection).node()).parentNode.appendChild((d3.select("#scatter").select(selection).node())))
        .attr("fill", color_sel);
        }
        });

    //when the checksort change we change the order of bars (or order by value or alphabetical order)
    d3.select("#checkSort").on("change", change);
    d3.select("#includeMiss").on("change", change);
    function change() {
        
        //if includeMiss is not checked we filter out missing data
        if(!document.getElementById("includeMiss").checked){
            data=dataselected.filter(function(d) {
                                     return d[selected_dim] > -1});
        }
        else {data=dataselected;}
        
        var x0 = xScale.domain(data.sort(document.getElementById("checkSort").checked
                                         ? function(a, b) {
                                         if(!(a[selected_dim]> -1)){ return 1;}
                                         else if(!(b[selected_dim] > -1)){ return -1; }
                                         else if(a[selected_dim] === b[selected_dim]){ return 0; }
                                         else { return b[selected_dim] - a[selected_dim]; }}
                                         : function(a, b) {return d3.ascending(a.GEO, b.GEO); })
                               .map(function(d) {
                                    return d.GEO; })).copy();
        
        d3.select("#barChart").selectAll("rect")
        .sort(function(a, b) { return x0(a.GEO) - x0(b.GEO); });
        
        //create transition and move bars in order of position (e.g if i=2 bar transition start with a delay of 80)
        var transition = d3.select("#barChart").transition().duration(750),
        delay = function(d, i) { return i * 40; };
        
        //set new position of bars by using new scale and set width according to new bandwidth
        transition.selectAll("rect")
        .delay(delay)
        .attr("x", function(d) { return x0(d.GEO); })
        .attr("width", x0.bandwidth());
        
        transition.select(".xAxis")
        .call(xAxis)
        .selectAll("g")
        .delay(delay);
        
        //we need to restyle xaxis because can be that there are new text element
        d3.select("#barChart").select(".xAxis")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-8")
        .attr("dy", "-5")
        .attr("transform", "rotate(-90)");
        

    }  
    
    
}


function DrawLineChart(){
    //we get the dimension of svg
    var svgBounds = d3.select("#lineChart").node().getBoundingClientRect();
    //we create the yScale (now we use maximum on all years and not on the selected one)
    var yScale = d3.scaleLinear()
    .domain([0, max_sel_meas])
    .range([svgBounds.height-Axis_Padding,pad]);
    //we create the xScale
    var xScale = d3.scaleBand()
    .domain(yearDom)
    .range([Axis_Padding, svgBounds.width]);

    //we add axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    
    d3.select("#lineChart").select(".xAxis")
    .attr("transform", "translate(" + 0 + "," + (svgBounds.height-Axis_Padding) +")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-8")
    .attr("dy", "-5")
    .attr("transform", "rotate(-90)");
    
    d3.select("#lineChart").select(".yAxis")
    .attr("transform", "translate(" + Axis_Padding + "," + 0 +")")
    .transition(t)
    .call(yAxis);
    
    //add axis name on y
    var axis_name = d3.select("#lineChart").select(".Axis_name");
    axis_name.selectAll("text").remove();
    axis_name.append("text")
    .attr("x", 5)
    .attr("y", (svgBounds.height-Axis_Padding)/2)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "grey")
    .text(sel_meas)
    .style("writing-mode","tb")
    .style("glyph-orientation-vertical","0")
    .style("letter-spacing","1");
    //add axis name on x
    d3.select("#lineChart").append("text")
    .attr("x", (svgBounds.width+Axis_Padding)/2)
    .attr("y", 325)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "grey")
    .text("years")
    .style("letter-spacing","1");

    //we need to create a linechart but each column is a point and not each row, so we create a function that generates the points of polyline
    //if data is missing this function doesn't return nothing
    function point_gen(d,anno){
        if (d[sel_meas + anno]>-1) return ((xScale(anno)+xScale.bandwidth()/2)+ "," + yScale(d[sel_meas+anno]) + "," );
        else return "";}
    //we create a tooltip
    var div =d3.select("body")
    .append("div")
    .attr("class","tooltip");
    
    var single_point;
    
    //we create lines
    //when we choose stroke color, stroke-width and opacity we check if the bar represent a selected country
    var lines=d3.select("#lineChart").select("#line").selectAll("polyline").data(dataselected);
    lines.exit().transition(t).remove();
    lines=lines.enter()
    .append("polyline").merge(lines);
    lines
    .style("stroke", function(d) {if (sel1 == ("#"+d.id)) { return "red"}
           else if (sel2==("#"+d.id)) {return "yellow"}
           else return "black";
           })
    .style("stroke-width",function(d){
           if (sel1==("#"+d.id)||sel2==("#"+d.id)) return 5;
           else return 4;})
    .style("fill", "none")
    .style("opacity",function(d){
           if (sel1==("#"+d.id)||sel2==("#"+d.id)) return 1;
           else return 0.05;})
    .attr("id", function(d) {return d.id;})
    .transition(t)
    .attr("points", function(d) {
          var points_generated=point_gen(d, "2002") + point_gen(d,"2006") + point_gen(d,"2010") + point_gen(d,"2014");
          // according to the way we generated the points the last character is always "," and we delete it
          points_generated=points_generated.substring(0,points_generated.length-1);
          //if points_generated is a single point, then it will not appear in line chart
          single_point=points_generated.split(",");
          if(single_point.length>2){
          return points_generated;}
          //if is a single point we create a small vertical line and in this way it will appear 
          else {
          var point=(single_point[0] + " , " + (Number(single_point[1])-3) + " , " + single_point[0]+ " , "+ (Number(single_point[1])+3))
          return point;
          }
          });
    //on mouseover we color orange the corresponding element of each chart and we set also opacity=1 and stroke-width=5 for overed line
    //Furthermore show the tooltip with Time series of values and their percentage changes will be shown
    lines
    .on("mouseover", function(d) {
        var over_state="#"+d.id;
        d3.select(this.parentNode.appendChild(this)).style("stroke", "orange").style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(over_state).node()).parentNode.appendChild((d3.select("#map").select(over_state).node())))
        .attr("stroke-width", 4).attr("stroke", "orange");
        d3.select((d3.select("#scatter").select(over_state).node()).parentNode.appendChild((d3.select("#scatter").select(over_state).node())))
        .attr("fill", "orange");
        d3.select("#barChart").select(over_state).attr("fill", "orange");
        div.style("opacity", 0.9)
        .style("left", (d3.event.pageX - 65) + "px")
        .style("top", (d3.event.pageY - 75) + "px")
        .style("width", "200px");
        
        //We create the time series of values and their percentage changes and put them in a table
        //for round to 2 decimal places we multiply the value x10 000, we round it and then we divide it by 100 (insted of directly multiply x100 in order to obtain value%)
        div.html( "<h3>"+ d.GEO + "</h3>" + "<table>"+
                 "<tr> <td>"+ "year"+"</td> <td>"+ yearDom[0] +"</td> <td>"+yearDom[1] +"</td> <td>"+ yearDom[2] +"</td> <td>"+ yearDom[3]+ "</td> </tr> " +
                 "<tr> <td>"+sel_meas+"</td> <td>"+ d[sel_meas+yearDom[0]] +"</td> <td>" + d[sel_meas+yearDom[1]] + "</td> <td>" + d[sel_meas+yearDom[2]] +"</td> <td>" + d[sel_meas+yearDom[3]] + "</td> </tr> " +
                 "<tr> <td>"+ "growth % </td> <td>"+ "NaN" +"</td> <td>" + Math.round((d[sel_meas+yearDom[1]]/d[sel_meas+yearDom[0]]-1)*10000)/100 + "</td> <td>" + Math.round((d[sel_meas+yearDom[2]]/d[sel_meas+yearDom[1]]-1)*10000)/100 +"</td> <td>" + Math.round((d[sel_meas+yearDom[3]]/d[sel_meas+yearDom[2]]-1)*10000)/100 + "</td> </tr> </table>"
                )
        
        
        
        })
    //on mouseout we return to the previous situation
    .on("mouseout", function(d) {
        var over_state="#"+d.id;
        
        d3.select("#barChart").select(over_state).attr("fill", function(d){ if (over_state==sel1) {return "red";}
                             if (over_state==sel2) {return "yellow";}
                             else return color(d[selected_dim]);
                             });
        d3.select(this)
        .style("opacity", function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 1;}
               else return 0.05;
               })
        .style("stroke", function(d){ if (over_state==sel1) {return "red";}
               if (over_state==sel2) {return "yellow";}
               else return "black";
               })
        .style("stroke-width",function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 5;}
               else return 4;
               })
        
        d3.select("#map").select(over_state)
        .attr("stroke-width", function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 4;}
              else return 0.01;
              })
        .attr("stroke", function(d){ if (over_state==sel1) {return "red";}
              if (over_state==sel2) {return "yellow";}
              else return "white";
              });
        d3.select("#scatter").select(over_state)
        .attr("fill", function(d){ if (over_state==sel1) {return "red";}
              if (over_state==sel2) {return "yellow";}
              else return color(d[selected_dim]);
              });
        
        //we put again elements that represent the selected states at the top()
        //if selval1<selva2 then sel2 is selected after sel1 and must be on the top
        if (selval1<selval2){
        if(sel1.length>1){
        d3.select((d3.select("#lineChart").select(sel1).node()).parentNode.appendChild((d3.select("#lineChart").select(sel1).node())))
        d3.select((d3.select("#map").select(sel1).node()).parentNode.appendChild((d3.select("#map").select(sel1).node())))
        d3.select((d3.select("#scatter").select(sel1).node()).parentNode.appendChild((d3.select("#scatter").select(sel1).node())))
        }
        if(sel2.length>1){
        d3.select((d3.select("#lineChart").select(sel2).node()).parentNode.appendChild((d3.select("#lineChart").select(sel2).node())))
        d3.select((d3.select("#map").select(sel2).node()).parentNode.appendChild((d3.select("#map").select(sel2).node())))
        d3.select((d3.select("#scatter").select(sel2).node()).parentNode.appendChild((d3.select("#scatter").select(sel2).node())))
        }
        }
        else {
        if(sel2.length>1){
        d3.select((d3.select("#lineChart").select(sel2).node()).parentNode.appendChild((d3.select("#lineChart").select(sel2).node())))
        d3.select((d3.select("#map").select(sel2).node()).parentNode.appendChild((d3.select("#map").select(sel2).node())))
        d3.select((d3.select("#scatter").select(sel2).node()).parentNode.appendChild((d3.select("#scatter").select(sel2).node())))
        }
        if(sel1.length>1){
        d3.select((d3.select("#lineChart").select(sel1).node()).parentNode.appendChild((d3.select("#lineChart").select(sel1).node())))
        d3.select((d3.select("#map").select(sel1).node()).parentNode.appendChild((d3.select("#map").select(sel1).node())))
        d3.select((d3.select("#scatter").select(sel1).node()).parentNode.appendChild((d3.select("#scatter").select(sel1).node())))
        }
        
        }
        
        div.style("opacity", 0)
        .style("left", 0 + "px")
        .style("top", 0 + "px");
        
        });


}


function DrawScatter(){
    //we get the dimension of svg
    var svgBounds = d3.select("#scatter").node().getBoundingClientRect();
    //we create xscale and yscale...whe choose to increase the range of value in order to obtain a better representation
    var ymin=d3.min(dataselected, function (d) { return d[selected_dim]; }) - 150;
    var ymax=d3.max(dataselected, function (d) { return d[selected_dim];}) + 150;
    var yScale = d3.scaleLinear()
    .domain([ ymin, ymax])
    .range([svgBounds.height-Axis_Padding,pad]);
    var hour_sel="hour" + sel_year;
    var xmin=d3.min(dataselected, function (d) { return d[hour_sel]; })-10;
    var xmax=d3.max(dataselected, function (d) { return d[hour_sel];})+10;
    var xScale = d3.scaleLinear()
    .domain([ xmin , xmax ])
    .range([Axis_Padding ,svgBounds.width - pad]);
    
    //we add the axis and quadrants
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    
    var quadrant=d3.select("#scatter").select("#quadrant");
    quadrant.selectAll("line").remove();
    quadrant.append("line")
    .attr("x1",xScale(xmin))
    .attr("x2",xScale(xmax))
    .attr("y1", yScale((ymax+ymin)/2))
    .attr("y2", yScale((ymax+ymin)/2))
    .attr("stroke-width", 1)
    .attr("stroke", "grey")
    .style("stroke-dasharray", ("3,3"));
    
    quadrant.append("line")
    .attr("y1",yScale(ymin))
    .attr("y2",yScale(ymax))
    .attr("x1", xScale((xmax+xmin)/2))
    .attr("x2", xScale((xmax+xmin)/2))
    .attr("stroke-width", 1)
    .attr("stroke", "grey")
    .style("stroke-dasharray", ("3,3"));
    
    
    d3.select("#scatter").select(".xAxis")
    .attr("transform", "translate(" + 0 + "," + (svgBounds.height-Axis_Padding) +")")
    .transition(t)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-8")
    .attr("dy", "-5")
    .attr("transform", "rotate(-90)");
    
    
    d3.select("#scatter").select(".yAxis")
    .attr("transform", "translate(" + Axis_Padding + "," + 0 +")")
    .transition(t)
    .call(yAxis)
    
    //add axis name on y
    var axis_name = d3.select("#scatter").select(".Axis_name");
    axis_name.selectAll("text").remove();
    axis_name.append("text")
    .attr("x", 5)
    .attr("y", (svgBounds.height-Axis_Padding)/2)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "grey")
    .text(sel_meas)
    .style("writing-mode","tb")
    .style("glyph-orientation-vertical","0")
    .style("letter-spacing","0.1");
    //add axis name on x
    d3.select("#scatter").append("text")
    .attr("x", (svgBounds.width+Axis_Padding)/2)
    .attr("y", 325)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "grey")
    .text("hours")
    .style("letter-spacing","1");
    
    //we create a tooltip
    var div =d3.select("body")
    .append("div")
    .attr("class","tooltip");
    
    //we create circle
    //when we fill circle we check if the circle represent a selected country
    //we need the if statement (d[selected_dim]>-1) to deal with the missing data without generating errors and then we hide circles having not x or y
    var scatter= d3.select("#scatter").select("#points").selectAll("circle").data(dataselected);
    scatter.exit().transition(t).remove();
    scatter=scatter.enter().append("circle")
    .merge(scatter);
    scatter.transition(t).attr("cx", function(d) { if(d[hour_sel]>-1) return xScale(d[hour_sel]);})
    .attr("cy", function(d) {if (d[selected_dim]>-1) return yScale(d[selected_dim]);})
    .attr("r" , 4)
    .attr("visibility", function(d){
          if(!(d[hour_sel]>-1) ) return "hidden";
          if(!(d[selected_dim]>-1)) return "hidden";
          })
    .attr("fill",function(d) {if (sel1 == ("#"+d.id)) { return "red"}
          else if (sel2==("#"+d.id)) {return "yellow"}
          else return color(d[selected_dim]);})
    .attr("id", function(d) {return d.id;});
    //on mouseover we color orange the corresponding element of each chart and we set also opacity=1 and stroke-width=5 for corresponding line
    //Furthermore show the tooltip with value, mean hours paid and mean value/hour
    scatter
    .on("mouseover", function(d) {
        var over_state="#"+d.id;
        d3.select(this.parentNode.appendChild(this)).attr("fill", "orange");
        d3.select((d3.select("#lineChart").select(over_state).node()).parentNode.appendChild((d3.select("#lineChart").select(over_state).node())))
        .style("stroke", "orange").style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(over_state).node()).parentNode.appendChild((d3.select("#map").select(over_state).node())))
        .attr("stroke-width", 4).attr("stroke", "orange");
        d3.select("#barChart").select(over_state).attr("fill", "orange");
        div.style("opacity", 0.9)
        .style("left", (d3.event.pageX - 65) + "px")
        .style("top", (d3.event.pageY - 75) + "px")
        .style("width", "130px");
    //for round to 2 decimal places we multiply the mean value/hour x100, then we round it and then we divide it by 100
        div.html( "<h3>"+ d.GEO + "</h3>" + d[selected_dim] +" " + sel_meas + " <br> " + d[hour_sel] + " h" + " <br>  " + (Math.round((d[selected_dim]/d[hour_sel])*100))/100 + " " + sel_meas + "/h")
                })
    //on mouseout we return to the previous situation
    .on("mouseout", function(d) {
        var over_state="#"+d.id;
        
        d3.select("#barChart").select(over_state).attr("fill", function(d){ if (over_state==sel1) {return "red";}
                                                       if (over_state==sel2) {return "yellow";}
                                                       else return color(d[selected_dim]);
                                                       });
        d3.select("#lineChart").select(over_state)
        .style("opacity", function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 1;}
               else return 0.05;
               })
        .style("stroke", function(d){ if (over_state==sel1) {return "red";}
               if (over_state==sel2) {return "yellow";}
               else return "black";
               })
        .style("stroke-width",function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 5;}
               else return 4;
               })
        
        d3.select("#map").select(over_state)
        .attr("stroke-width", function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 4;}
              else return 0.01;
              })
        .attr("stroke", function(d){ if (over_state==sel1) {return "red";}
              if (over_state==sel2) {return "yellow";}
              else return "white";
              });
        d3.select(this)
        .attr("fill", function(d){ if (over_state==sel1) {return "red";}
              if (over_state==sel2) {return "yellow";}
              else return color(d[selected_dim]);
              })
        
        //we put again elements that represent the selected states at the top()
        //if selval1<selva2 then sel2 is selected after sel1 and must be on the top
        if (selval1<selval2){
        if(sel1.length>1){
        d3.select((d3.select("#lineChart").select(sel1).node()).parentNode.appendChild((d3.select("#lineChart").select(sel1).node())))
        d3.select((d3.select("#map").select(sel1).node()).parentNode.appendChild((d3.select("#map").select(sel1).node())))
        d3.select((d3.select("#scatter").select(sel1).node()).parentNode.appendChild((d3.select("#scatter").select(sel1).node())))
        }
        if(sel2.length>1){
        d3.select((d3.select("#lineChart").select(sel2).node()).parentNode.appendChild((d3.select("#lineChart").select(sel2).node())))
        d3.select((d3.select("#map").select(sel2).node()).parentNode.appendChild((d3.select("#map").select(sel2).node())))
        d3.select((d3.select("#scatter").select(sel2).node()).parentNode.appendChild((d3.select("#scatter").select(sel2).node())))
        }
        }
        else {
        if(sel2.length>1){
        d3.select((d3.select("#lineChart").select(sel2).node()).parentNode.appendChild((d3.select("#lineChart").select(sel2).node())))
        d3.select((d3.select("#map").select(sel2).node()).parentNode.appendChild((d3.select("#map").select(sel2).node())))
        d3.select((d3.select("#scatter").select(sel2).node()).parentNode.appendChild((d3.select("#scatter").select(sel2).node())))
        }
        if(sel1.length>1){
        d3.select((d3.select("#lineChart").select(sel1).node()).parentNode.appendChild((d3.select("#lineChart").select(sel1).node())))
        d3.select((d3.select("#map").select(sel1).node()).parentNode.appendChild((d3.select("#map").select(sel1).node())))
        d3.select((d3.select("#scatter").select(sel1).node()).parentNode.appendChild((d3.select("#scatter").select(sel1).node())))
        }
        
        }

        div.style("opacity", 0)
        .style("left", 0 + "px")
        .style("top", 0 + "px");
        
        })
    
    //We allow you to select a state by clicking on the circle that represents it (Just like the search bar)
    .on("click", function(d) {
        var selection="#"+this.id;
        //IF statement check which selection is the last modified
        if (selval1<selval2) {
        //set color of sel1
        var color_sel="red";
        //if statement avoid to have the same country in each selection
        if (selection!=sel2) {
        d3.select("#barChart").select(sel1).attr("fill", function(d){return color(d[selected_dim]);});
        d3.select("#lineChart").select(sel1).style("opacity", 0.1).style("stroke", "black").style("stroke-width",2);
        d3.select("#map").select(sel1).attr("stroke-width", 0.01).attr("stroke", "white");
        d3.select("#scatter").select(sel1).attr("fill", function(d){return color(d[selected_dim]);});
        sel1=selection;
        selval2=0;
        selval1=1;
        //show legend for sel1 and update it
        d3.select("#color1").style("display", "block");
        d3.select("#sel1").style("display", "block");
        d3.select("#reset_span").style("display", "block");
        document.getElementById("sel1").textContent = d.GEO;
        }
        else {color_sel="yellow" }
        //but also if selection doesn't change we want that last clicked is on the top of others (this is the reason of use selection instead of sel1 and color_sel instead of "red")
        d3.select("#barChart").select(selection).attr("fill", color_sel);
        //"(selected node).parentNode.appendChild(selected node)" allow to put the last selected country on top of the others, in this way its border is not covered by the others
        d3.select((d3.select("#lineChart").select(selection).node()).parentNode.appendChild((d3.select("#lineChart").select(selection).node())))
        .style("stroke", color_sel).style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(selection).node()).parentNode.appendChild((d3.select("#map").select(selection).node())))
        .attr("stroke-width", 4).attr("stroke", color_sel);
        d3.select((d3.select("#scatter").select(selection).node()).parentNode.appendChild((d3.select("#scatter").select(selection).node())))
        .attr("fill", color_sel);
        }
        else {
        var color_sel="yellow"
        //if statement avoid to have the same country in each selection
        if (selection!=sel1) {
        d3.select("#barChart").select(sel2).attr("fill", function(d){return color(d[selected_dim]);});
        d3.select("#lineChart").select(sel2).style("opacity", 0.1).style("stroke", "black").style("stroke-width",2);
        d3.select("#map").select(sel2).attr("stroke-width", 0.01).attr("stroke", "white");
        d3.select("#scatter").select(sel2).attr("fill", function(d){return color(d[selected_dim]);});
        sel2=selection;
        selval1=0;
        selval2=1;
        //show legend for sel1 and update it
        d3.select("#color2").style("display", "block");
        d3.select("#sel2").style("display", "block");
        d3.select("#reset_span").style("display", "block");
        document.getElementById("sel2").textContent = d.GEO;
        }
        else { color_sel="red" }
        //but also if selection doesn't change we want that last clicked is on the top of others (this is the reason of use selection instead of sel2)
        d3.select("#barChart").select(selection).attr("fill", color_sel);
        //"(selected node).parentNode.appendChild(selected node)" allow to put the last selected country on top of the others, in this way its border is not covered by the others
        d3.select((d3.select("#lineChart").select(selection).node()).parentNode.appendChild((d3.select("#lineChart").select(selection).node())))
        .style("stroke", color_sel).style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(selection).node()).parentNode.appendChild((d3.select("#map").select(selection).node())))
        .attr("stroke-width", 4).attr("stroke", color_sel);
        d3.select((d3.select("#scatter").select(selection).node()).parentNode.appendChild((d3.select("#scatter").select(selection).node())))
        .attr("fill", color_sel);
        }
        });
    
}


function ColorMap(){
    
    var max= d3.max(dataselected, function(d) { return  d[selected_dim];});
    var min= d3.min(dataselected, function(d) { return  d[selected_dim];});
    //we create the color scale
    color = d3.scaleLinear()
    .domain([0 , max])
    .range(["#ffffff", "#004d00"]);
    
    //we create a scale for the legend in this way 1 correspond to min value and 50 to max value
    var legend_scale = d3.scaleLinear()
    .domain([1 , 50])
    .range([min, max]);
    
    //we create an array cointaining the integer between 1 and 50
    var list = [];
    for (var i = 1; i <= 50; i++) {
        list.push(i);
    }
    //reset the legend
    d3.select("#legend").selectAll("text").remove();
    d3.select("#legend").selectAll("rect").remove();
    
    var legend = d3.select("#legend").selectAll("rect")
    .data(list);

    //set width and height of legend
    var ls_w = 7, ls_h = 20;
    
    //we create the color legend for value between min and max
    legend.enter().append("rect")
    .attr("y", 5)
    .attr("x", function(d){ return 50 +((d-1)*ls_w);})
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d) { return color(legend_scale(d)); });
    
    d3.select("#legend").append("text")
    .attr("y", 20)
    .attr("x", 48)
    .attr("text-anchor","end")
    .attr("font-size","15px")
    .text(min);
    
    d3.select("#legend").append("text")
    .attr("y", 20)
    .attr("x", 402)
    .attr("text-anchor","start")
    .attr("font-size","15px")
    .text(max);
    
    //we create the legend for missing values
    d3.select("#legend").append("rect")
    .attr("y", 5)
    .attr("x", 470)
    .attr("width", 20)
    .attr("height", ls_h)
    .attr("fill","black");
    
    d3.select("#legend").append("text")
    .attr("y", 20)
    .attr("x", 492)
    .attr("text-anchor","start")
    .attr("font-size","15px")
    .text("Missing values");
    
    //we join each path with data where path id is the data.id (country code)
    //when we style stroke path we check if the it represent a selected country
    //we need the if statement (d[selected_dim]>-1) to deal with the missing data, in case of missing we don't fill path (it will be black)
    var country_map = d3.select("#map").selectAll("path")
    .data(dataselected, function(d) { return (d && d.id) || d3.select(this).attr("id"); })
    .attr("fill",function(d){
          if (d[selected_dim]>-1) {return color(d[selected_dim]);}})
    .attr("stroke", function(d) {if (sel1 == ("#"+d.id)) { return "red"}
          else if (sel2==("#"+d.id)) {return "yellow"}
          else return "white";})
    .attr("stroke-width", function(d) {if ((sel1 == ("#"+d.id))||(sel2==("#"+d.id))) { return "4";}
          else return 0.01;});
    
    //on mouseover we color orange the corresponding element of each chart and we set also opacity=1 and stroke-width=5 for corresponding line
    //Furthermore show the value on the legend by appending a rectangle in the corresponding position and a text indicating name and value for the selected country
    country_map.on("mouseover", function(d) {
                var over_state="#"+d.id;
                d3.select(this.parentNode.appendChild(this)).attr("stroke-width", 4).attr("stroke", "orange");
                d3.select((d3.select("#lineChart").select(over_state).node()).parentNode.appendChild((d3.select("#lineChart").select(over_state).node())))
                .style("stroke", "orange").style("stroke-width",5).style("opacity",1);
                d3.select("#barChart").select(over_state).attr("fill", "orange");
                d3.select((d3.select("#scatter").select(over_state).node()).parentNode.appendChild((d3.select("#scatter").select(over_state).node())))
                .attr("fill", "orange");

                if (d[selected_dim]>-1){
                   d3.select("#legend").append("rect")
                   .attr("y", 5)
                   .attr("x", (50 +(legend_scale.invert(d[selected_dim])-1)*ls_w))
                   .attr("width", ls_w)
                   .attr("height", ls_h*3/2)
                   .attr("fill",color(d[selected_dim]))
                   .attr("stroke-width", 2)
                   .attr("stroke", "orange")
                   .attr("id", "overed");
                   
                   d3.select("#legend").append("text")
                   .attr("y", 5+ls_h+ls_h)
                   .attr("x", (50 +(legend_scale.invert(d[selected_dim])-1)*ls_w+ls_w/2))
                   .attr("text-anchor","middle")
                   .attr("font-size","10px")
                   .text(d.GEO)
                   .attr("id", "text_overed")
                   d3.select("#legend").append("text")
                   .attr("y", 15+ls_h+ls_h)
                   .attr("x", (50 +(legend_scale.invert(d[selected_dim])-1)*ls_w+ls_w/2))
                   .attr("text-anchor","middle")
                   .attr("font-size","10px")
                   .text(d[selected_dim] +" "+ sel_meas )
                   .attr("id", "value_overed");

                   
                   }
                   else {
                   d3.select("#legend").append("rect")
                   .attr("y", 5)
                   .attr("x", 470)
                   .attr("width", 20)
                   .attr("height", ls_h*3/2)
                   .attr("fill","black")
                   .attr("stroke-width", 2)
                   .attr("stroke", "orange")
                   .attr("id", "overed");
                   
                   d3.select("#legend").append("text")
                   .attr("y", 5+ls_h+ls_h)
                   .attr("x", 480)
                   .attr("text-anchor","middle")
                   .attr("font-size","10px")
                   .text(d.GEO + " is missing")
                   .attr("id", "text_overed")
                   }
                   })
    //on mouseout we return to the previous situation
    .on("mouseout", function(d) {
        var over_state="#"+d.id;
        
        d3.select("#barChart").select(over_state).attr("fill", function(d){ if (over_state==sel1) {return "red";}
                                                       if (over_state==sel2) {return "yellow";}
                                                       else return color(d[selected_dim]);
                                                       });
        d3.select("#lineChart").select(over_state)
        .style("opacity", function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 1;}
               else return 0.05;
               })
        .style("stroke", function(d){ if (over_state==sel1) {return "red";}
               if (over_state==sel2) {return "yellow";}
               else return "black";
               })
        .style("stroke-width",function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 5;}
               else return 4;
               })
        
        d3.select(this)
        .attr("stroke-width", function(d){ if ((over_state==sel1)||(over_state==sel2)) {return 4;}
              else return 0.01;
              })
        .attr("stroke", function(d){ if (over_state==sel1) {return "red";}
              if (over_state==sel2) {return "yellow";}
              else return "white";
              });
        d3.select("#scatter").select(over_state)
        .attr("fill", function(d){ if (over_state==sel1) {return "red";}
              if (over_state==sel2) {return "yellow";}
              else return color(d[selected_dim]);
              })
        
        //we put again elements that represent the selected states at the top()
        //if selval1<selva2 then sel2 is selected after sel1 and must be on the top
        if (selval1<selval2){
        if(sel1.length>1){
        d3.select((d3.select("#lineChart").select(sel1).node()).parentNode.appendChild((d3.select("#lineChart").select(sel1).node())))
        d3.select((d3.select("#map").select(sel1).node()).parentNode.appendChild((d3.select("#map").select(sel1).node())))
        d3.select((d3.select("#scatter").select(sel1).node()).parentNode.appendChild((d3.select("#scatter").select(sel1).node())))
        }
        if(sel2.length>1){
        d3.select((d3.select("#lineChart").select(sel2).node()).parentNode.appendChild((d3.select("#lineChart").select(sel2).node())))
        d3.select((d3.select("#map").select(sel2).node()).parentNode.appendChild((d3.select("#map").select(sel2).node())))
        d3.select((d3.select("#scatter").select(sel2).node()).parentNode.appendChild((d3.select("#scatter").select(sel2).node())))
        }
        }
        else {
        if(sel2.length>1){
        d3.select((d3.select("#lineChart").select(sel2).node()).parentNode.appendChild((d3.select("#lineChart").select(sel2).node())))
        d3.select((d3.select("#map").select(sel2).node()).parentNode.appendChild((d3.select("#map").select(sel2).node())))
        d3.select((d3.select("#scatter").select(sel2).node()).parentNode.appendChild((d3.select("#scatter").select(sel2).node())))
        }
        if(sel1.length>1){
        d3.select((d3.select("#lineChart").select(sel1).node()).parentNode.appendChild((d3.select("#lineChart").select(sel1).node())))
        d3.select((d3.select("#map").select(sel1).node()).parentNode.appendChild((d3.select("#map").select(sel1).node())))
        d3.select((d3.select("#scatter").select(sel1).node()).parentNode.appendChild((d3.select("#scatter").select(sel1).node())))
        }
        
        }

        d3.select("#legend").select("#overed").remove();
        d3.select("#legend").select("#text_overed").remove();
        d3.select("#legend").select("#value_overed").remove();
        
        })
    //We allow you to select a state by clicking on it (Just like the search bar)
    .on("click", function(d) {
        var selection="#"+this.id;
        //IF statement check which selection is the last modified
        if (selval1<selval2) {
        //set color of sel1
        var color_sel="red";
        //if statement avoid to have the same country in each selection
        if (selection!=sel2) {
        d3.select("#barChart").select(sel1).attr("fill", function(d){return color(d[selected_dim]);});
        d3.select("#lineChart").select(sel1).style("opacity", 0.1).style("stroke", "black").style("stroke-width",2);
        d3.select("#map").select(sel1).attr("stroke-width", 0.01).attr("stroke", "white");
        d3.select("#scatter").select(sel1).attr("fill", function(d){return color(d[selected_dim]);});
        sel1=selection;
        selval2=0;
        selval1=1;
        //show legend for sel1 and update it
        d3.select("#color1").style("display", "block");
        d3.select("#sel1").style("display", "block");
        d3.select("#reset_span").style("display", "block");
        document.getElementById("sel1").textContent = d.GEO;
        }
        else {color_sel="yellow" }
        //but also if selection doesn't change we want that last clicked is on the top of others (this is the reason of use selection instead of sel1 and color_sel instead of "red")
        d3.select("#barChart").select(selection).attr("fill", color_sel);
        //"(selected node).parentNode.appendChild(selected node)" allow to put the last selected country on top of the others, in this way its border is not covered by the others
        d3.select((d3.select("#lineChart").select(selection).node()).parentNode.appendChild((d3.select("#lineChart").select(selection).node())))
        .style("stroke", color_sel).style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(selection).node()).parentNode.appendChild((d3.select("#map").select(selection).node())))
        .attr("stroke-width", 4).attr("stroke", color_sel);
        d3.select((d3.select("#scatter").select(selection).node()).parentNode.appendChild((d3.select("#scatter").select(selection).node())))
        .attr("fill", color_sel);
        }
        else {
        var color_sel="yellow"
        //if statement avoid to have the same country in each selection
        if (selection!=sel1) {
        d3.select("#barChart").select(sel2).attr("fill", function(d){return color(d[selected_dim]);});
        d3.select("#lineChart").select(sel2).style("opacity", 0.1).style("stroke", "black").style("stroke-width",2);
        d3.select("#map").select(sel2).attr("stroke-width", 0.01).attr("stroke", "white");
        d3.select("#scatter").select(sel2).attr("fill", function(d){return color(d[selected_dim]);});
        sel2=selection;
        selval1=0;
        selval2=1;
        //show legend for sel1 and update it
        d3.select("#color2").style("display", "block");
        d3.select("#sel2").style("display", "block");
        d3.select("#reset_span").style("display", "block");
        document.getElementById("sel2").textContent = d.GEO;
        }
        else { color_sel="red" }
        //but also if selection doesn't change we want that last clicked is on the top of others (this is the reason of use selection instead of sel2)
        d3.select("#barChart").select(selection).attr("fill", color_sel);
        //"(selected node).parentNode.appendChild(selected node)" allow to put the last selected country on top of the others, in this way its border is not covered by the others
        d3.select((d3.select("#lineChart").select(selection).node()).parentNode.appendChild((d3.select("#lineChart").select(selection).node())))
        .style("stroke", color_sel).style("stroke-width",5).style("opacity",1);
        d3.select((d3.select("#map").select(selection).node()).parentNode.appendChild((d3.select("#map").select(selection).node())))
        .attr("stroke-width", 4).attr("stroke", color_sel);
        d3.select((d3.select("#scatter").select(selection).node()).parentNode.appendChild((d3.select("#scatter").select(selection).node())))
        .attr("fill", color_sel);
        }
        });

    
}


    function changeData() {
        //put age selected in a variable
        var age=document.getElementById("Age").value;
        //put occupation selected in a variable
        var occupation=document.getElementById("Occupation").value;
        //put sex selected in a variable
        var sex=document.getElementById("Sex").value;
        //put activity selected in a variable
		var activity=document.getElementById("Activity").value;
        //create the path of selected data
        var datafile="data/"+ sex + "/" + age + "/" + activity + "/" + occupation + "/data.csv";
        
        //put selected year in a global variable
        sel_year=document.getElementById("Year").value;
        //put selected measure in a global variable
        sel_meas=document.getElementById("Measure").value;
        //put selected measure concatenatd to selected year in a global variable
        selected_dim=sel_meas+sel_year;

        //load csv containing selected data
        d3.csv(datafile, function (error, csv) {
               if (error) {
               console.log(error); //Log the error.
               throw error;
               }
               
               csv.forEach(function (d) {
                           
                           //parsing values
                           d.euro2002 = +d.EURO2002;
                           d.pps2002 = +d.PPS2002;
                           d.hour2002 = +d.HOUR2002;
                           
                           d.euro2006 = +d.EURO2006;
                           d.pps2006 = +d.PPS2006;
                           d.hour2006 = +d.HOUR2006;
                           
                           d.euro2010 = +d.EURO2010;
                           d.pps2010 = +d.PPS2010;
                           d.hour2010 = +d.HOUR2010;
                           
                           d.euro2014 = +d.EURO2014;
                           d.pps2014 = +d.PPS2014;
                           d.hour2014 = +d.HOUR2014;
                           
                           //iterate through all countryCode data and put the corresponding country code into d.id
                           allCountryCode.forEach(function(e) {
                                                  if (d.GEO==e.country)
                                                  d.id=e.code;
                                                  })
                           });
               
               // Store csv data in a global variable
               dataselected = csv;
               //create an array containing the max values for each year
               var max_values=[];
               yearDom.forEach(function(d){
                               max_values.push(d3.max(dataselected, function(e) {return e[sel_meas+d]} ));
                               });
               //select the max value over all year and put it into a global variable
               max_sel_meas=d3.max(max_values);
               //draw all charts and color the map!
               ColorMap();
               DrawLineChart();
               DrawScatter();
               createBarchart();
               //if there are selected country then show legend
               if(sel1.length>1) {
               d3.select("#color1").style("display","block");
               d3.select("#sel1").style("display","block");
               d3.select("#reset_span").style("display","block");
               }
               if(sel2.length>1) {
               d3.select("#color2").style("display","block");
               d3.select("#sel2").style("display","block");
               d3.select("#reset_span").style("display","block");
               }
               });
    }
