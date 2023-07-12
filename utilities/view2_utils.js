// Utilities for "Average Annual Working Hours vs. GDP per Capita chart, view 2"

async function renderFirstChart(year) {
    // Load and clean the desired data
    const data = await d3.csv(dataPath + hours_vs_gdp_csv);
    const filteredData = data.filter(function (d) {
        return (d.entity != "") && (d.year == year) && (d.continent != "") && (d.average_annual_hours_worked != "") && (d.gdp_per_capita != "");
    });

    // Declare the svg panel for holding the scatter plot
    let svg = d3.select("#scatterplot-1").append("svg")
                .attr("width", width_scatterPlot + margin.left + margin.right)
                .attr("height", height_scatterPlot + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Declare X scale and add X axis (Avg. annual working hours, [hours])
    const xScale = d3.scaleLinear()
                     .domain([1300, 2650])  // Hard-coded annual working hours range
                     .range([0, width_scatterPlot]);
    svg.append("g")
       .attr("transform", "translate(0," + width_scatterPlot + ")")
       .call(d3.axisBottom(xScale).tickFormat(d => d + "  hr"));

    // Declare Y scale and add Y axis (Avg. GDP per Capita at the year, [$]) 
    const yScale = d3.scaleLinear()
                     .domain([1000, 74000])  // Hard-coded GDP range
                     .range([height_scatterPlot, 0]);
    svg.append("g")
       .call(d3.axisLeft(yScale).tickFormat(d => d + " $/year"));

    // Create scale for dot size
    const dotSizeScale = getDotSizeScale()

    // Create scale for dots' color, according to the continent
    const dotColors = d3.scaleOrdinal()
                        .domain(continents)
                        .range(d3.schemeSet1);

    // Create a tooltip component that is hidden at the beginning
    const popup = d3.select("#view-2")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "black")
                    .style("color", "white")
                    .style("width", "150px")
                    .style("height", "50px");

    // Add dots to the scatter plot, each dot represents a distinct country
    svg.append('g')
       .selectAll("scatterplot-dot")
       .data(filteredData)
       .enter()
       .append("circle")
       .attr("class", "bubbles")
       .attr("id", function (d) {
            return "bubble-" + d.code;
        })
       .attr("cx", function (d) {
            return xScale(Number(d.average_annual_hours_worked));
        })
       .attr("cy", function (d) {
            return yScale(Number(d.gdp_per_capita));
        })
       .attr("r", function (d) {
            return dotSizeScale(Number(d.total_population));
        })
       .style("fill", function (d) {
            return dotColors(d.continent);
        })
       .on("mouseover", function (event, d) {
            popup.transition()
                 .duration(200)
                 .style("opacity", .9);  // Reveal the tooltip
            popup.html(getFirstPlotTooltipHTML(d));
            popup.style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px")
        })
       .on("mouseout", function (event, d) {
            popup.transition()
                 .duration(500)
                 .style("opacity", 0);  // Hide the tooptip again
        });

    // Add the always-displaying annotation for every designated country on the scatter plot
    countryCodesToAnnotate.forEach(function (countryCode) {
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i].code === countryCode) {
                const countryData = filteredData[i];
                renderFirstChartAnnotations(countryData, xScale(Number(countryData.average_annual_hours_worked)), yScale(Number(countryData.gdp_per_capita)), margin);
            }
        }
    });
    
    // Finally, Render the legend for continents on the scatter plot
    renderContinentLegend(svg, continents, width_scatterPlot, dotColors);
}

function renderFirstChartAnnotations(d, x, y, margin) {
    const dx = (d.entity == "Uruguay") ? -30 : 30, dy = -30;

    const annotations = [
        {
            note: {
                label: Math.round(d.gdp_per_capita) + "$ GDP per capita, " + Math.round(d.average_annual_hours_worked) + " hrs per year",
                lineType: "none",
                bgPadding: {"top": 15, "left": 10, "right": 10, "bottom": 10},
                title: d.entity,
                orientation: "leftRight",
                "align": "middle"
            },
            type: d3.annotationCallout,
            x: x,
            y: y,
            dx: dx,
            dy: dy
        },
    ];

    // Add the annotation to the plot
    d3.select("svg")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "annotation-group")
      .call(d3.annotation().annotations(annotations));
}

function getFirstPlotTooltipHTML(d) {
    return "<div>" + d.entity + "</div> <div> Avg. " + Math.round(d.gdp_per_capita) + "$ per capita</div> <div>" + Math.round(d.average_annual_hours_worked) + " hrs worked yearly</div>";
}