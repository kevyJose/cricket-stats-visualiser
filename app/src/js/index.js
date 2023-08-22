//global attributes for latest chart
let selectedLocation = 'C'
let x_selected = 'none'
let y_selected = 'none'
let x_title = 'X title'
let y_title = 'Y title'
let color_code = ''
let allMaps = []  // a map contains chart specs.
let allCharts = [] // all generated charts

let raw_data;


window.addEventListener('DOMContentLoaded', () => {
});

document.addEventListener('DOMContentLoaded', () => {
  readData('./data/data-statsguru-3.csv', '#raw')    
    .then(console.log('Data read successfully'))
    .catch((error) => console.log('Error: ', error.message))
    
  doFilterDropdowns();  
});


function submit_filterForm(event) {
  event.preventDefault();

  // Get selected start and end years
  const startYear = parseInt(document.getElementById('start-year-dropdown').value);
  const endYear = parseInt(document.getElementById('end-year-dropdown').value);
  const chartNum = parseInt(document.getElementById('chart-select-dropdown').value);

  const filtersMap = new Map()

  if (endYear >= startYear) {
    //update the graph to render filtered values
    const selectedChart = allCharts[chartNum-1]
    filtersMap.set('year-range', [startYear, endYear])        
    selectedChart.reRender(filtersMap)    
  }
  else {
    alert("End year must be greater than or equal to start year.")
  }
}


function doFilterDropdowns() { 
  const startYr_elem = document.getElementById("start-year-dropdown")
  const endYr_elem = document.getElementById("end-year-dropdown")  

  doYearDropdown(startYr_elem)
  doYearDropdown(endYr_elem)
}


function doChartSelectDropdown(elem) {
  let i = allCharts.length
  let option = document.createElement("option")
  option.value = i
  option.text = 'Chart #' + i
  elem.appendChild(option)  
}


function doYearDropdown(elem) {
  for (let i = 1971; i <= 2023; i++) {
    let option = document.createElement("option")
    option.value = i
    option.text = i
    elem.appendChild(option)
  }  
}


function enableFilterElems() {
  const startYr_elem = document.getElementById("start-year-dropdown")
  const endYr_elem = document.getElementById("end-year-dropdown")

  startYr_elem.disabled = false
  endYr_elem.disabled = false
}



function submit_configForm(event) {
  event.preventDefault();
  enableFilterElems();   
  const form = document.getElementById("config_form")
  const chartSelect_elem = document.getElementById("chart-select-dropdown")  

  const map = new Map();
  const data = new FormData(form)

  for (const entry of data) {
    const inputElement = form.elements[entry[0]];
    let key = entry[0]
    let value = entry[1]
    console.log('key: ', key)
    console.log('value: ', value)

    // radio btn or checkbox
    if ((inputElement.type === "radio" || inputElement.type === "checkbox") &&
      inputElement.checked) {
      map.set(key, value)
    }
    // select dropdown 
    else if (inputElement.tagName === "SELECT") {
      const selectedOption = inputElement.options[inputElement.selectedIndex];
      map.set(key, selectedOption.value)
    }
    //other input types 
    else {
      map.set(key, value)
    }
  }

  //set global variables
  setCurrChartAttributes(map);
  //use extracted info to plot chart
  doGlobalChart(event, '#scatter_plot');
  allMaps.push(map)
  // console.log('allMaps: ', allMaps)  

  // update chart-selection dropdown
  if(allCharts.length > 0){
    doChartSelectDropdown(chartSelect_elem)
    chartSelect_elem.disabled = false
  }
}


function setCurrChartAttributes(map) {
  selectedLocation = map.get('location')
  x_selected = map.get('x-attr')
  y_selected = map.get('y-attr')
  x_title = capitalizeString(x_selected)
  y_title = capitalizeString(y_selected)
  color_code = map.get('color-code')

  console.log('testing global var updates:  { ', selectedLocation, x_selected, y_selected, 
                                                 x_title, y_title, color_code, ' }')
}



function readData(file, id) {
  return d3.csv(file)
  .then(processData)
  .catch((error) => console.log('Error: ', error.message));
}


function processData(data) {
  //nest the data by name
  let rolledUpData = d3.rollup(data, reduceData, groupBy)
  let players = Array.from(rolledUpData, ([name, data]) => ({ name, data }))
  raw_data = players  
  console.log('raw_data: ', raw_data)
}


//key function
function groupBy(data) {
  // return data.Player;
  return data.Player.slice(0, data.Player.indexOf('('));
}


//reducer function
function reduceData(values){
  return values.map(function(row) {
    return {
      id: parseInt(row.ID),
      name: row.Player.slice(0, row.Player.indexOf('(')) || 'na',    
      country: row.Player.slice(row.Player.indexOf('(')+1, row.Player.length-1) || 'na',
      location: row.Location || 'na',
      span: row.Span || 'na',
      matches_played: parseInt(row.Mat) || 'na',
      innings: parseInt(row.Inns) || 'na',
      not_outs: parseInt(row.NO) || 'na',
      runs: parseInt(row.Runs) || 'na',
      high_score: parseInt(row.HS) || 'na',
      batting_avg: parseFloat(row.Ave) || 'na',
      balls_faced: parseInt(row.BF) || 'na',
      strike_rate: parseFloat(row.SR) || 'na',
      centuries: row['100'] === '0' ? 0 : (parseInt(row['100']) || 'na'),
      half_cents: row['50'] === '0' ? 0 : (parseInt(row['50']) || 'na'),
      below_fifties: row['0'] === '0' ? 0 : (parseInt(row['0']) || 'na')      
    };
  });    
}



function doGlobalChart(event, id_tag) {   
  let gc = new GlobalChart(id_tag, raw_data, selectedLocation, 
                           x_title, y_title, x_selected, y_selected,
                           color_code)
  gc.initChart();
  allCharts.push(gc)
  console.log('allCharts: ', allCharts)  
}



function capitalizeString(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}