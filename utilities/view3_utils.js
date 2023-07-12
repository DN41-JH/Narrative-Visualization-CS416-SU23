// Utilities for "Average Annual Working Hours vs. Productivity per Capita, view 3"

async function renderSecondChart(year) {
    // Load and clean the desired data
    const data = await d3.csv(dataPath + hours_vs_productivity_csv);
    const filteredData = data.filter(function (d) {
        return (d.entity != "") && (d.year == year) && (d.continent != "") && (d.average_annual_hours_worked != "") && (d.productivity != "");
    });

    // Declare the svg panel for holding the scatter plot
    let svg = d3.select("#scatterplot-2").append("svg")
                .attr("width", width_scatterPlot + margin.left + margin.right)
                .attr("height", height_scatterPlot + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Declare X scale and add X axis (Avg. Productivity per capita, [$])
    const xScale = d3.scaleLinear()
                     .domain([1300, 2650])  // Hard-coded Avg. annual working hours range
                     .range([0, width_scatterPlot]);
    svg.append("g")
       .attr("transform", "translate(0," + height_scatterPlot + ")")
       .call(d3.axisBottom(xScale).tickFormat(d => d + " hr"));

    // Declare Y scale and add Y axis (Avg. annual working hours, [hours])
    const yScale = d3.scaleLinear()
                     .domain([0, 90])  // Hard-coded Avg. productivity per capita range
                     .range([height_scatterPlot, 0]);
    svg.append("g")
       .call(d3.axisLeft(yScale).tickFormat(d => d + " $/hr"));

    // Create scale for dot size
    const dotSizeScale = getDotSizeScale();

    // Create scale for dots' color, according to the continent
    const dotColors = d3.scaleOrdinal()
                        .domain(continents)
                        .range(d3.schemeSet1);

    // Create a tooltip component that is hidden at the beginning
    const popup = d3.select("#view-3")
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
            return yScale(Number(d.productivity));
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
            popup.html(getSecondPlotTooltipHTML(d));
            popup.style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
       .on("mouseout", function (event, d) {
            popup.transition()
                 .duration(500)
                 .style("opacity", 0);  // Hide the tooltip again
        });

    // Add the always-displaying annotation for every designated country on the scatter plot
    countryCodesToAnnotate.forEach(function (countryCode) {
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i].code === countryCode) {
                const countryData = filteredData[i];
                renderSecondChartAnnotations(countryData, xScale(Number(countryData.average_annual_hours_worked)), yScale(Number(countryData.productivity)), margin);
            }
        }
    });

    // Finally, Render the legend for continents on the scatter plot
    renderContinentLegend(svg, continents, width_scatterPlot, dotColors);
}

function renderSecondChartAnnotations(d, x, y, margin) {
    const dx = ((d.entity == "Uruguay") || (d.entity == "Hong Kong")) ? -30 : 30, dy = -30;

    const annotations = [
        {
            note: {
                label: Math.round(d.productivity) + "$ per hour, " + Math.round(d.average_annual_hours_worked) + " hrs per year",
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

function getSecondPlotTooltipHTML(d) {
    return "<div>" + d.entity + "</div> <div> Avg. " + Math.round(d.productivity) + "$ per hour</div> <div>" + Math.round(d.average_annual_hours_worked) + " hrs worked yearly </div>";
}