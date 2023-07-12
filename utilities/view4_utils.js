// Utilities for "Productivity evolution over time, view 4"

async function renderThirdChart() {
    // Load and clean the desired data
    const data = await d3.csv(dataPath + time_vs_productivity_csv);
    const filteredData = data.filter(function (d) {
        return (d.eneity != "") && (d.productivity != "") && (d.year != "");
    });

    // Extract all the countries from the data set
    const countries = getCountries(filteredData);

    // Declare the svg panel for holding the line plot
    const svg = d3.select("#lineplot-1")
                  .append("svg")
                  .attr("width", width_linePlot + margin.left + margin.right)
                  .attr("height", height_linePlot + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Declare X scale and add X axis (Time, [year])
    const xScale = d3.scaleLinear()
                     .domain([1945, 2019])  // Hard-coded time range, after WW-II
                     .range([0, width_linePlot]);
    svg.append("g")
       .attr("transform", "translate(0," + height_linePlot + ")")
       .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    // Declare Y scale and add Y axis (Avg. Productivity per capita, [$/hour])
    const yScale = d3.scaleLinear()
                     .domain([0, 80])  // Hard-coded Avg. productivity range
                     .range([height_linePlot, 0]);
    svg.append("g")
       .call(d3.axisLeft(yScale).tickFormat(d => d + " $/hr"));

    // Create scale for lines' color, based on the country's continent
    const lineColors = d3.scaleOrdinal()
                         .domain(continents)
                         .range(d3.schemeSet1);

    // Create a drop-down menu for all available countries
    d3.select("#select-country")
      .selectAll('country-options')
      .data(countries)
      .enter()
      .append('option')
      .text(function (d) {
            return d;
        }) // text showed in the menu, as the country name
      .attr("value", function (d) {
            return d;
        }); // corresponding value returned by the button, as the country name
    
    // Obtain the data of the very first country, and Initialize the line plot with it
    const firstCountryData = filteredData.filter(function (d) {
        return d.entity === countries[0];
    });
    const line = svg.append('g')
                    .append("path")
                    .attr("id", "line-" + countries[0])
                    .datum(firstCountryData)
                    .attr("d", d3.line()
                                 .x(function (d) {
                                    return xScale(parseInt(d.year))
                                  })
                                 .y(function (d) {
                                    return yScale(Number(d.productivity))
                                  }))
                    .attr("stroke", function (d) {
                        return lineColors(d.continent);
                     })
                    .style("stroke-width", 5)
                    .style("fill", "none");
    
    const mostRecentFirstCountryData = firstCountryData.at(-1);
    renderThirdChartAnnotations(mostRecentFirstCountryData, xScale(Number(mostRecentFirstCountryData.year)) - 10, yScale(Number(mostRecentFirstCountryData.productivity)) - 10, margin);

    // Finally, Handle the update of line plot, when a new country is selected in the drop-down menu
    d3.select("#select-country")
      .on("change", function (d) {
            const selectedCountry = d3.select(this).property("value");
            handleUpdate(filteredData, selectedCountry, line, xScale, yScale, lineColors);
        });
}

function handleUpdate(filteredData, selectedCountry, line, xScale, yScale, colors) {
    // Obtain the newly selected country's data
    const selectedCountryData = filteredData.filter(function (d) {
        return (d.entity === selectedCountry);
    });

    // Update the line with the newly selected country's data
    line.datum(selectedCountryData)
        .attr("id", "line-" + selectedCountry)
        .attr("d", d3.line()
                     .x(function (d) {
                        return xScale(parseInt(d.year))
                      })
                     .y(function (d) {
                        return yScale(Number(d.productivity))
                     }))
        .attr("stroke", function (d) {
                return colors(selectedCountry);
            });

    // Also Update the annotation
    const finalCountryData = selectedCountryData.at(-1);
    renderThirdChartAnnotations(finalCountryData, xScale(Number(finalCountryData.year)) - 5, yScale(finalCountryData.productivity) - 5, margin)
}

function renderThirdChartAnnotations(d, x, y, margin) {
    // Remove the previous annotation first
    d3.select(".annotation-group").remove();

    const annotations = [
        {
            note: {
                label: "An average worker makes ~" + Math.round(d.productivity) + "$ per hour, in " + parseInt(d.year),
                lineType: "none",
                bgPadding: {"top": 15, "left": 10, "right": 10, "bottom": 10},
                title: d.entity,
                orientation: "topBottom",
                align: "top"
            },
            type: d3.annotationCallout,
            x: x,
            y: y,
            dx: -100,
            dy: -10
        },
    ];

    // Add the new annotation to the plot
    d3.select("svg")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "annotation-group")
      .call(d3.annotation().annotations(annotations));
}