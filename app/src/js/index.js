
let selectedLocation = 'C'
let x_selected = 'none'
let y_selected = 'none'
let x_title = 'X title'
let y_title = 'Y title'

let raw_data;

//Do these initial calls once the DOM is finished loading
window.addEventListener('DOMContentLoaded', function() {
  setupDropdownListener()

  readData('./data/data-statsguru-3.csv', '#raw')    
    .then(console.log('Data read successfully'))
    .catch((error) => console.log('Error: ', error.message)); 
});


function setupDropdownListener() {   
  const location_menu = document.getElementById('location-menu')
  const x_attr_menu = document.getElementById('x-attr-menu')
  const y_attr_menu = document.getElementById('y-attr-menu')

  location_menu.addEventListener('change', function() {
    selectedLocation = location_menu.value
    console.log('selected location: ' + selectedLocation)    
  });

  x_attr_menu.addEventListener('change', function() {
    const selected_x_option = x_attr_menu.options[x_attr_menu.selectedIndex]
    x_title = selected_x_option.textContent
    x_selected = selected_x_option.value
    console.log('selected x-attribute: ' + x_selected)
    // console.log('X title: ' + x_title)
  });

  y_attr_menu.addEventListener('change', function() {
    const selected_y_option = y_attr_menu.options[y_attr_menu.selectedIndex]
    y_title = selected_y_option.textContent
    y_selected = selected_y_option.value
    console.log('selected y-attribute: ' + y_selected)
    // console.log('Y title: ' + y_title)
    
  });
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



function doChart(id_tag) {

  let gc = new GlobalChart(id_tag, raw_data, selectedLocation, 
                           x_title, y_title, x_selected, y_selected)
  gc.doChart()

}













