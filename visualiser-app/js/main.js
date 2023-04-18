// const { parse } = require("uuid");

function readData(file, id) {
  d3.csv(file, processData)
  .then((data) => console.log(data))
  .catch((error) => console.log("Error: ", error.message));
}

function processData(datum) {
  let dataItem = {
    id: parseInt(datum.ID),
    name: datum.Player.slice(0, datum.Player.indexOf("(")) || "na",
    country: datum.Player.slice(datum.Player.indexOf("(")+1, datum.Player.length-1) || "na",
    span: datum.Span || "na",
    matches_played: parseInt(datum.Mat) || "na",
    innings: parseInt(datum.Inns) || "na",
    not_outs: parseInt(datum.NO) || "na",
    runs: parseInt(datum.Runs) || "na",
    high_score: parseInt(datum.HS) || "na",
    batting_avg: parseFloat(datum.Ave) || "na",
    balls_faced: parseInt(datum.BF) || "na",
    strike_rate: parseFloat(datum.SR) || "na",
    centuries: parseInt(datum["100"]) || "na",
    half_cents: parseInt(datum["50"]) || "na",
    half_cents: parseInt(datum["0"]) || "na"
  };
  return dataItem;
}