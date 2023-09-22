//global attributes for latest chart
let selectedLocation = 'C'
let x_selected = 'none'
let y_selected = 'none'
let x_title = 'X title'
let y_title = 'Y title'
let color_code = ''
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



function submit_configForm(event) {
  event.preventDefault();
  
  let newPlotId = doScatterPlot_div();
  enableFilterElems();   
  const form = document.getElementById("config_form")
  const chartSelect_elem = document.getElementById("chart-select-dropdown")  

  const map = new Map();
  const data = new FormData(form)

  for (const entry of data) {
    const inputElement = form.elements[entry[0]];
    let key = entry[0]
    let value = entry[1]
    // console.log('key: ', key)
    // console.log('value: ', value)

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
  // const chartIndex = allCharts.length

  doGlobalChart(event, '#'+newPlotId);

  // update chart-selection dropdown
  if(allCharts.length > 0){
    doChartSelectDropdown(chartSelect_elem)
    chartSelect_elem.disabled = false
  }
}



function submit_filterForm(event) {
  event.preventDefault();

  // Get filter-form inputs
  let startYear = document.getElementById('start-year-dropdown').value;
  let endYear = document.getElementById('end-year-dropdown').value;
  let debutYear = document.getElementById('debut-year-dropdown').value;
  let finalYear = document.getElementById('final-year-dropdown').value;
  const chartSelect = parseInt(document.getElementById('chart-select-dropdown').value);
  // const countrySelect = document.getElementById('country-select-dropdown').value;
  const countrySelect = document.querySelectorAll('input[name="country-checkbox"]:checked');
  const countrySelectArr = Array.from(countrySelect).map(checkbox => checkbox.value)

  const selectedChart = allCharts[chartSelect-1]
  const filtersMap = new Map()

  // console.log('startYr: ' + startYear)
  // console.log('endYr: ' + endYear)
  // console.log('countrySelect: ' + countrySelect)

  if ((startYear !== 'NONE') && (endYear !== 'NONE')) {
    startYear = parseInt(startYear)
    endYear = parseInt(endYear)
    if (endYear >= startYear) {
      //update the graph to render filtered values    
      filtersMap.set('year-range', [startYear, endYear])
    }
    else {
      alert("End year must be greater than or equal to start year.")
    }       
  }

  if (countrySelectArr.length > 0) {
    filtersMap.set('country-select', countrySelectArr)    
  }

  if (debutYear !== 'NONE') {    
    debutYear = parseInt(debutYear)
    filtersMap.set('debut-year', debutYear)
  }

  if(finalYear !== 'NONE') {
    finalYear = parseInt(finalYear)
    filtersMap.set('final-year', finalYear)
  }

  // Do the reRender
  if (filtersMap.size > 0) {
    selectedChart.reRender(filtersMap)    
  }
  else {    
    alert("You must input the fields to apply filters!")    
  }
  
}


function doFilterDropdowns() { 
  const startYr_elem = document.getElementById("start-year-dropdown")
  const endYr_elem = document.getElementById("end-year-dropdown")
  const debutYr_elem = document.getElementById("debut-year-dropdown")
  const finalYr_elem = document.getElementById("final-year-dropdown")
  doYearDropdown(startYr_elem)
  doYearDropdown(endYr_elem)
  doYearDropdown(debutYr_elem)
  doYearDropdown(finalYr_elem)
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
  const countrySelect_elem = document.getElementById("country-select-dropdown")
  const debutYr_elem = document.getElementById("debut-year-dropdown")
  const finalYr_elem = document.getElementById("final-year-dropdown")
  const applyBtn_elem = document.getElementById("apply-filter-btn")

  startYr_elem.disabled = false
  endYr_elem.disabled = false
  // countrySelect_elem.disabled = false
  debutYr_elem.disabled = false
  finalYr_elem.disabled = false
  applyBtn_elem.disabled = false
}


// creates a new div element for each scatter-plot
function doScatterPlot_div() {

  let numPlots = document.querySelectorAll('[id^="scatter-plot"]').length
  // console.log('num of scatter plots, before appending new one:  ' + numPlots)
  let newPlotId = 'scatter-plot-' + numPlots

  let newDiv = document.createElement('div')
  newDiv.className = 'chart'
  newDiv.id = newPlotId

  // add div element to html body
  let centerDiv = document.querySelector('.center')
  centerDiv.appendChild(newDiv)

  return newPlotId;
}



function setCurrChartAttributes(map) {
  selectedLocation = map.get('location')
  x_selected = map.get('x-attr')
  y_selected = map.get('y-attr')
  x_title = capitalizeString(x_selected)
  y_title = capitalizeString(y_selected)
  color_code = map.get('color-code')

  // console.log('testing global var updates:  { ', selectedLocation, x_selected, y_selected, 
  //                                                x_title, y_title, color_code, ' }')
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


// group each player's rows by their name
function groupBy(data) {
  // Exctract the player's name only, exclude country info
  return data.Player.slice(0, data.Player.indexOf('('));
}


//reducer function
function reduceData(values) {
  return values.map(function(row) {
    // skip rows that contain '-'
    if (
      row.ID === '-' ||
      row.Player === '-' ||
      row.Location === '-' ||
      row.Span === '-' ||      
      row.Ave === '-' ||
      row.SR === '-'
    ) {      
      return null;
    }

    return {
      id: parseInt(row.ID),
      name: row.Player.slice(0, row.Player.indexOf('(')) || `unnamed_${row.ID}`,    
      country: row.Player.slice(row.Player.indexOf('(')+1, row.Player.length-1) || 'na',
      location: row.Location || 'na',
      span: row.Span || 'na',
      matches_played: parseInt(row.Mat) || 0,
      innings: parseInt(row.Inns) || 0,
      not_outs: parseInt(row.NO) || 0,
      runs: parseInt(row.Runs) || 0,
      high_score: parseInt(row.HS) || 0,
      batting_average: parseFloat(row.Ave) || 0,
      balls_faced: parseInt(row.BF) || 0,
      strike_rate: parseFloat(row.SR) || 0,
      centuries: parseInt(row['100']) || 0,
      half_cents: parseInt(row['50']) || 0,
      below_fifties: parseInt(row['0']) || 0      
    };

  }).filter(row => row !== null); //remove skipped rows
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