// Utilities for "World map, view 5"

function renderFourthChart(year) {
    // Declare the svg holding the world map
    const svg = d3.select("svg"),
        width = parseInt(svg.attr("width")),
        height = parseInt(svg.attr("height"));

    // Declare the world countries data as a HashMap, to be populated later
    var data = new Map();

    // Create scale for world map's color, according to the continent
    const mapColors = d3.scaleOrdinal()
                        .domain(continents)
                        .range(d3.schemeSet1);

    // Declare the world map's projection
    const projection = d3.geoMercator()
                         .scale(70)
                         .center([0, 20])
                         .translate([width / 2, height / 2]);

    // Create a tooltip component that is hidden at the beginning
    const popup = d3.select("#view-5")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "black")
                    .style("color", "white")
                    .style("width", "150px")
                    .style("height", "50px");

    // Load the external data (world map topology & world countries data), then Draw the world map
    Promise.all([
        d3.json(worldMapPath + world_topology_json),
        d3.csv(dataPath + hours_vs_gdp_csv, function (d) {
            if (d.year == year) {
                data.set(d.code,
                    {
                        year: d.year,
                        gdp_per_capita: Number(d.gdp_per_capita),
                        name: d.entity,
                        population: d.total_population,
                        continent: d.continent,
                    });  // Populate the data with the desired world country data of the year
            }
        })
    ]).then(function (loadedData) {
        let topology = loadedData[0];

        // Draw the world map
        svg.append("g")
           .selectAll("path")
           .data(topology.features)
           .join("path")
           .attr("d", d3.geoPath().projection(projection))  // Draw each distinct country
           .attr("fill", function (d) {
                if (!data.has(d.id)) return 0;
                else return mapColors(data.get(d.id).continent);
            })  // Fill the color for each country, according to its continent
           .on("mouseover", function (event, d) {
                popup.transition()
                     .duration(200)
                     .style("opacity", .9);  // Reveal the tooptip
                popup.html(getWorldMapTooltipHTML(data.get(d.id)));
                popup.style("left", (event.pageX) + "px")
                     .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (event, d) {
                popup.transition()
                     .duration(500)
                     .style("opacity", 0);  // Hide the tooltip again
            });
    });

    // Finally, Render the legend for continents on the world map
    renderContinentLegend(d3.select("#worldmap"), continents, width, mapColors);
}

function getWorldMapTooltipHTML(d) {
    return (d.population && d.gdp_per_capita) ? 
        "<div>" + d.name + "</div> <div> Population: " + d.population + "</div> <div> Avg. " + Math.round(d.gdp_per_capita) + "$ per year</div>" 
        :
        "<div>" + d.name + "</div> <div> Data not available </div>";
}