let selectedLocation = 'C'
let x_selected = 'none'
let y_selected = 'none'
let x_title = 'X title'
let y_title = 'Y title'
let color_code = 0  // 0=BIS/SENA, 1=Matches_Played

let raw_data;

//Do these initial calls once the DOM is finished loading
window.addEventListener('DOMContentLoaded', function() {
  setupGlobalListeners();  

  readData('./data/data-statsguru-3.csv', '#raw')    
    .then(console.log('Data read successfully'))
    .catch((error) => console.log('Error: ', error.message)); 
});


function handleLocationChange(input_elem) {
  selectedLocation = input_elem.value
  console.log('selected location: ' + selectedLocation)  
}

function handleXAttributeChange(input_elem) {
  const selected_x_option = input_elem.options[input_elem.selectedIndex]
  x_title = selected_x_option.textContent
  x_selected = selected_x_option.value
  console.log('selected x-attribute: ' + x_selected)
  // console.log('X title: ' + x_title)
}

function handleYAttributeChange(input_elem) {
  const selected_y_option = input_elem.options[input_elem.selectedIndex]
  y_title = selected_y_option.textContent
  y_selected = selected_y_option.value
  console.log('selected y-attribute: ' + y_selected)
  // console.log('Y title: ' + y_title)
}

function handleColorCodeChange(input_elem) {
  const selected_colorCode = input_elem
  colorCode_title = selected_colorCode.textContent;
  color_code = selected_colorCode.value;
  console.log('selected color-code: ' + color_code)

  // Uncheck the previously checked radio button
  const previouslyChecked = document.querySelector('[name*="color-code"]:checked');
  if (previouslyChecked !== selected_colorCode) {
    previouslyChecked.checked = false;
  }
  // Check the currently clicked radio button
  selected_colorCode.checked = true;
}



function setupGlobalListeners() {   
  const location_input = document.getElementById('location-menu')
  const Xattr_input = document.getElementById('x-attr-menu')
  const Yattr_input = document.getElementById('y-attr-menu')
  const colorCode_input = document.querySelector('[name*="color-code"]');

  location_input.addEventListener('change', function() {
    handleLocationChange(location_input);
  });
  Xattr_input.addEventListener('change', function() {
    handleXAttributeChange(Xattr_input);
  });
  Yattr_input.addEventListener('change', function() {
    handleYAttributeChange(Yattr_input);
  });

  colorCode_input.addEventListener('click', function() {
      handleColorCodeChange(colorCode_input);
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



function doGlobalChart(event, id_tag) {  
  event.preventDefault();    
  let gc = new GlobalChart(id_tag, raw_data, selectedLocation, 
                           x_title, y_title, x_selected, y_selected)
  gc.doChart(event);

}













