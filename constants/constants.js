const myProxy = "https://jliu115-observablehq.herokuapp.com/"
const dataPath = "../data/";  // This should be the path of source .csv files on deployment.
const hours_vs_gdp_csv = "annual-working-hours-vs-gdp-per-capita.csv";
const hours_vs_productivity_csv = "productivity-vs-annual-hours-worked.csv"; 
const time_vs_productivity_csv = "labor-productivity-per-hour.csv";

const worldMapPath = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/";
const world_topology_json = "world.geojson";

// Declare the margin of the svg panel holding the plot(s)
const margin = {top: 40, right: 20, bottom: 30, left: 100};

// Declare the size of the scatter plot(s)
const width_scatterPlot = 1050 - margin.left - margin.right;
const height_scatterPlot = 1000 - margin.top - margin.bottom;

// Declare the size of the line plot(s)
const width_linePlot = 1200 - margin.left - margin.right;
const height_linePlot = 750 - margin.top - margin.bottom;

const continents = ["Asia", "Europe", "North America", "South America", "Africa", "Antarctica", "Oceania"];

const countryCodesToAnnotate = ["KHM", "HKG", "USA", "URY"];