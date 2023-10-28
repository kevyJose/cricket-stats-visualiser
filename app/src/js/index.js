//global attributes for latest chart
let selectedLocation = 'C'
let x_selected = ''
let y_selected = ''
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


/**
 * 
 */
function enablePlayerSearch() {
  const chartSelect_right = document.getElementById("chart-select-right") //dropdown
  const searchField = document.getElementById("player-search-field")
  const searchButton = document.getElementById("searchButton")
  const resultsList = document.getElementById("results-list");
  const errorMsg = document.getElementById("error-msg");

  // enable the element
  searchField.disabled = false  

  // form-validation for searching player's name
  searchField.addEventListener('input', () => {
    // only accept letters, spaces, apostrophes, hyphens
    const pattern = /^[a-zA-Z '-]+$/; 
    const inputValue = searchField.value;
    
    if (! pattern.test(inputValue)) {
      searchField.setCustomValidity('Try again! Please enter a valid player name.');
    } else {
      searchField.setCustomValidity('');
    }
  });

  // Clear previous content for new queries
  chartSelect_right.addEventListener('change', () => {
    resultsList.innerHTML = ""; 
    errorMsg.textContent = "";
    searchButton.disabled = false
  });
}



/**
 * Handles the submission of the search form
 * Displays the resulting players from the search query 
 * 
 * @param {object} event 
 */
function submit_searchForm(event) {
  event.preventDefault();
  
  // get selected chart
  const selectedChartVal = document.getElementById('chart-select-right').value;
  const searchQuery = document.getElementById("player-search-field").value.toLowerCase().trim();
  let selectedCharts = [];

  // searching for player(s) that are present in all charts 
  if(selectedChartVal === 'all') {    
    selectedCharts = allCharts

    // get common player(s) across all charts, whose name matches the search query
    const commonPlayers = selectedCharts.reduce((intersection, chart) => {
      const chartSearchResults = chart.selectedData.filter(player => player.name.toLowerCase().includes(searchQuery));
      return intersection.length === 0
        ? chartSearchResults
        : intersection.filter(player => chartSearchResults.some(p => p.name === player.name));
    }, []);
  
    displaySearchResults(commonPlayers, selectedCharts);
  }
  else {
    let selectedChart = allCharts.find(chart => chart.id_tag === selectedChartVal)
    selectedCharts.push(selectedChart)

    if (selectedChart) {
      // get search results and display them
      const searchResults = selectedChart.selectedData.filter(player => player.name.toLowerCase().includes(searchQuery))    
      displaySearchResults(searchResults, selectedCharts);
    } 
    else {
      // selected chart not found
      console.error("Selected chart not found.");
    } 
  }    
  
}



/**
 * Handles the click event of a player button by:
 *     - higlighting the player data-point
 *     - displaying the player profile
 * 
 * @param {object} player 
 * @param {Array} selectedCharts 
 */
function handlePlayerButtonClick(player, selectedCharts) {
  // console.log('handling player-button click...')
  selectedCharts.forEach((chart) => chart.highlightPlayer(player));

  // Display the tooltip-player info for the selected player
  displayTooltipPlayerInfo(player);
}


// Function to display the tooltip-player info for the selected player
function displayTooltipPlayerInfo(player) {
  const locationsMap = new Map([
    ['C', 'Combined'],
    ['H', 'Home'],
    ['A', 'Away'],
    ['N', 'Neutral'],
    ['B', 'BIS'],
    ['S', 'SENA'],
    ['O', 'Other'],
  ]); 

    // Inside the click event handler, select the .tooltip-player element
    const tooltipDiv = d3.select('.tooltip-player');
    tooltipDiv.html(''); // Clear previous content

    // Set the content of tooltip
    tooltipDiv
      .style('opacity', 1.0) 
      .html(`
        <div class='tooltip-player-name'>${player.name}</div>
        <div>Country: ${player.country}</div>
        <div>Location: ${locationsMap.get(player.location)}</div>
        <div>Span: ${player.span}</div>
        <div>Matches Played: ${player.matches_played}</div>
        <div>Innings: ${player.innings}</div>
        <div>Runs: ${player.runs}</div>
        <div>Not Outs: ${player.not_outs}</div>
        <div>High Score: ${player.high_score}</div>
        <div>Batting Average: ${player.batting_average}</div>
        <div>Balls Faced: ${player.balls_faced}</div>
        <div>Strike Rate: ${player.strike_rate}</div>
        <div>Centuries: ${player.centuries}</div>
        <div>Half Centuries: ${player.half_cents}</div>
        <div>Below Fifties: ${player.below_fifties}</div>
      `);
}


/**
 * 
 * @param {*} results 
 * @param {*} selectedCharts 
 */
function displaySearchResults(results, selectedCharts) {
  const searchResultsDiv = document.getElementById("searchResults");
  const resultsList = document.getElementById("results-list");
  const errorMsg = document.getElementById("error-msg");

  // Clear previous content
  resultsList.innerHTML = ""; 
  errorMsg.textContent = ""; 

  if (results.length === 0) {
    resultsList.innerHTML = "";
    errorMsg.textContent = "No results found.";
  } 
  else {    
    // Create buttons for each player in results
    results.forEach(player => {
      const button = document.createElement("button");
      button.className = 'resultButton-Off'       
      button.id = player.id
      button.textContent = player.name;

      // Add a click event listener to the button
      button.addEventListener("click", () => {        
        // toggle the button
        button.classList.toggle("resultButton-On");
        button.classList.toggle("resultButton-Off");

        handlePlayerButtonClick(player, selectedCharts);
      });   
      resultsList.appendChild(button)
    });
  }
}



function submit_configForm(event) {
  event.preventDefault();
  // CONFIG FORM VALIDATION
  // Get the selected values of 'x-attr-menu' and 'y-attr-menu'
  const xAttr = document.getElementById('x-attr-menu').value;
  const yAttr = document.getElementById('y-attr-menu').value;

  // Check for invalid values
  if (xAttr == '' || yAttr == '') {
    // Display an error message or alert
    alert('Please select valid values for X and Y features.');
    return; // Prevent the rest of the code from executing
  }


  // if above validation passes, the following code runs...
  enableFilterElems();
  enablePlayerSearch();
  
  let newPlotId = doScatterPlot_div();    
  const form = document.getElementById("config_form")
  const chartSelect_left = document.getElementById("chart-select-left")
  const chartSelect_right = document.getElementById("chart-select-right")
  const map = new Map();
  const data = new FormData(form)

  // extract form info... 
  for (const entry of data) {
    const inputElement = form.elements[entry[0]];
    let key = entry[0]
    let value = entry[1]
    // console.log('key: ', key)
    // console.log('value: ', value)

    // READ radio button inputs
    if ((inputElement.type === "radio" || inputElement.type === "checkbox") &&
      inputElement.checked) {
      map.set(key, value)
    }
    // READ dropdown inputs
    else if (inputElement.tagName === "SELECT") {
      const selectedOption = inputElement.options[inputElement.selectedIndex];
      map.set(key, selectedOption.value)
    }
    // READ other input types 
    else {
      map.set(key, value)
    }
  }

  //set global variables
  // global vars. are re-assigned to most recent chart
  setCurrChartAttributes(map);
  //use extracted info to plot chart
  doGlobalChart(event, '#'+newPlotId);

  // append all-charts option when >1 charts exist
  if (allCharts.length == 2) {
    // add an option to the select dropdown
    const allOptionR = document.createElement("option");
    const allOptionL = document.createElement("option");
    allOptionR.value = 'all';
    allOptionR.text = 'All Charts';
    allOptionL.value = 'all';
    allOptionL.text = 'All Charts';
    chartSelect_right.insertBefore(allOptionR, chartSelect_right.childNodes[2]);
    chartSelect_left.insertBefore(allOptionL, chartSelect_left.childNodes[2]);
  }  

  // update chart-selection dropdown
  if(allCharts.length > 0){
    console.log('updating chart selection dropdowns...')
    doChartSelectDropdown(chartSelect_left)
    doChartSelectDropdown(chartSelect_right)
    chartSelect_left.disabled = false
    chartSelect_right.disabled = false
  }
}



function submit_filterForm(event) {
  event.preventDefault();
  // Get filter-form inputs
  let startYear = document.getElementById('start-year-dropdown').value;
  let endYear = document.getElementById('end-year-dropdown').value;
  // let endYearElem = document.getElementById('end-year-dropdown');
  let debutYear = document.getElementById('debut-year-dropdown').value;
  let finalYear = document.getElementById('final-year-dropdown').value;
  const selectedChartVal = document.getElementById('chart-select-left').value;
  let selectedCharts = [];
  const countrySelect = document.querySelectorAll('input[name="country-checkbox"]:checked');
  const countrySelectArr = Array.from(countrySelect).map(checkbox => checkbox.value)
  // let resultsDiv = document.getElementById('searchResults');
  const resultsList = document.getElementById("results-list");
  const errorMsg = document.getElementById("error-msg");


  // Clear search-results box 
  resultsList.innerHTML = ""; 
  errorMsg.textContent = "";

  // FILTER FORM VALIDATION
  // Check for invalid values
  if (selectedChartVal == '' ) {
    // Display an error message or alert
    alert('Please select a chart to apply filters.');
    return; // Prevent the rest of the code from executing
  }


  if (selectedChartVal === 'all') {
    selectedCharts = allCharts
  }
  else {    
    const selectedChart = allCharts.find(chart => chart.id_tag === selectedChartVal);
    selectedCharts.push(selectedChart)
    // console.log('selectedChart: ', selectedChart)
  }


  const filtersMap = new Map();

  if ((startYear !== '') && (endYear !== '')) {
    startYear = parseInt(startYear)
    endYear = parseInt(endYear)
    if (endYear >= startYear) {
      //update the graph to render filtered values    
      filtersMap.set('year-range', [startYear, endYear])      
    }
    else {
      // FIX: return and change this to equiv. of setCustomValidity()
      alert("END YEAR must be greater than or equal to START YEAR.")
      return;     
    }       
  }
  if (countrySelectArr.length > 0) {
    filtersMap.set('country-select', countrySelectArr)    
  }
  if (debutYear !== '') {    
    debutYear = parseInt(debutYear)
    filtersMap.set('debut-year', debutYear)
  }
  if(finalYear !== '') {
    finalYear = parseInt(finalYear)
    filtersMap.set('final-year', finalYear)
  }

  // Do the reRender
  if (filtersMap.size > 0) {
    // do a for loop to call rerender on all charts
    selectedCharts.forEach((chart) => chart.reRender(filtersMap));
    // selectedChart.reRender(filtersMap)    
  }
  else {    
    alert("You must select values in fields to apply filters!")    
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
  option.value = '#scatter-plot-' + i
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

// 
function enableFilterElems() {
  const startYr_elem = document.getElementById("start-year-dropdown")
  const endYr_elem = document.getElementById("end-year-dropdown")
  const countrySelect_grp = document.getElementById("country-select-boxes")
  const debutYr_elem = document.getElementById("debut-year-dropdown")
  const finalYr_elem = document.getElementById("final-year-dropdown")
  const applyBtn_elem = document.getElementById("apply-filter-btn")

  // enable the elems
  startYr_elem.disabled = false
  endYr_elem.disabled = false
  debutYr_elem.disabled = false
  finalYr_elem.disabled = false
  applyBtn_elem.disabled = false

  // select all input checkboxes within the div
  const checkboxes = countrySelect_grp.querySelectorAll('input[type="checkbox"]')

  // enable each checkbox
  for (const box of checkboxes) {    
    box.removeAttribute('disabled');
  }
}


// creates a new div element for each scatter-plot
function doScatterPlot_div() {
  let numPlots = document.querySelectorAll('[id^="scatter-plot"]').length
  // console.log('num of scatter plots, before appending new one:  ' + numPlots)
  let newPlotId = 'scatter-plot-' + (numPlots+1)

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