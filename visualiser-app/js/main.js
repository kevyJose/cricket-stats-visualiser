// const { parse } = require("uuid");

function readData(file, id) {
  return d3.csv(file)
  .then(processData)
  .catch((error) => console.log("Error: ", error.message));
}

var raw_data;

function processData(data) {
  //nest the data by name
  let rolledUpData = d3.rollup(data, reduceData, groupBy)

  let players = Array.from(rolledUpData, ([name, data]) => ({ name, data }))

  raw_data = players

  console.log(players)
}


//key function
function groupBy(data) {
  // return data.Player;
  return data.Player.slice(0, data.Player.indexOf("("));
}

//reducer function
function reduceData(values){
  return values.map(function(row) {
    return {
      id: parseInt(row.ID),
      // name: row.Player.slice(0, row.Player.indexOf("(")) || "na",    
      country: row.Player.slice(row.Player.indexOf("(")+1, row.Player.length-1) || "na",
      location: row.Location || "na",
      span: row.Span || "na",
      matches_played: parseInt(row.Mat) || "na",
      innings: parseInt(row.Inns) || "na",
      not_outs: parseInt(row.NO) || "na",
      runs: parseInt(row.Runs) || "na",
      high_score: parseInt(row.HS) || "na",
      batting_avg: parseFloat(row.Ave) || "na",
      balls_faced: parseInt(row.BF) || "na",
      strike_rate: parseFloat(row.SR) || "na",
      centuries: parseInt(row["100"]) || "na",
      half_cents: parseInt(row["50"]) || "na",
      half_cents: parseInt(row["0"]) || "na"      
    };
  });    
}



// scatter chart: runs vs matches_played
function doFirstChart(id_tag) {
  // console.log(raw_data)

  const filteredData = raw_data.map(d => {
    return {id: d.id, name: d.name, runs: d.runs, matches_played: d.matches_played};
  });

  // console.log("filtered:  ", filteredData);

  let matchesData = filteredData.map((d) => d.matches_played)
  let runsData = filteredData.map((d) => d.runs)

  matchesMax = d3.max(matchesData)
  runsMax = d3.max(runsData)
  // console.log(matchesMax)
  // console.log(runsMax)

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select(id_tag)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
          
          
  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, matchesMax+50])
  .range([ 0, width ]);
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .style("fill", "#ffffff")
  .style("color", "#ffffff");

  // Add Y axis
  var y = d3.scaleLinear()
  .domain([0, runsMax+2000])
  .range([ height, 0]);
  svg.append("g")
  .call(d3.axisLeft(y))
  .style("fill", "#ffffff")
  .style("color", "#ffffff");

  // Add dots
  svg.append('g')
  .selectAll("dot")
  .data(filteredData)
  .enter()
  .append("circle")
    .attr("cx", function (d) { return x(d.matches_played); } )
    .attr("cy", function (d) { return y(d.runs); } )
    .attr("r", 1.5)
    .style("fill", "#ffffff")

  

}








