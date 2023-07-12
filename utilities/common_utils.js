// Commonly Used Utility Functions Below

function getDotSizeScale() {
    // Hard-code the scale for dots' size in scatter plots.
    return d3.scaleLog()
             .domain([200000, 1310000000]) // Hard-code the total population range
             .range([1, 30]);
}

function renderContinentLegend(svg, continents, width, colors) {
    // Append one dot in the legend for each continent
    svg.selectAll("legend-dots")
       .data(continents)
       .enter()
       .append("circle")
       .attr("cx", width - 100)
       .attr("cy", function (d, i) {
            return (20 + i * 25);
        })
       .attr("r", 2)
       .style("fill", function (d) {
            return colors(d);
        });

    // Append the continent name beside each dot
    svg.selectAll("legend-labels")
       .data(continents)
       .enter()
       .append("text")
       .attr("x", width + 8 - 100)
       .attr("y", function (d, i) {
            return (20 + i * 25);
        })
       .style("fill", function (d) {
            return colors(d);
        })
       .text(function (d) {
            return d;
        })
       .attr("text-anchor", "left")
       .style("alignment-baseline", "middle");
}

function getCountries(data) {
    var countries = new Set();

    data.forEach(element => {
        countries.add(element.entity);
    });

    return Array.from(countries);
}