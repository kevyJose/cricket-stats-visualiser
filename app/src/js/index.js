//global attributes for latest chart
let selectedLocation = 'C'
let x_selected = 'none'
let y_selected = 'none'
let x_title = 'X title'
let y_title = 'Y title'
let color_code = ''  // 0=BIS/SENA, 1=Matches_Played
let allMaps = []  //each chart has a map

let raw_data;

//Do these initial calls once the DOM is finished loading
window.addEventListener('DOMContentLoaded', function() {
  // setupGlobalListeners();
  // processFormSubmission();  

  readData('./data/data-statsguru-3.csv', '#raw')    
    .then(console.log('Data read successfully'))
    .catch((error) => console.log('Error: ', error.message)); 
});




function processFormSubmission(event) {
  event.preventDefault();
  const form = document.querySelector("form")
  const log = document.querySelector("#log")
  const map = new Map(); // Creating a map to store the data

  form.addEventListener(
    "submit",
    (event) => {
      // event.preventDefault();

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
      // Displaying the map in the log
      log.innerText = JSON.stringify(map, null, 2)    
      // event.preventDefault()

      //set global variables
      setCurrChartAttributes(map);

      //use extracted info to plot chart
      doGlobalChart(event, '#scatter_plot');
    },
    false
  );


  allMaps.push(map)
}


function setCurrChartAttributes(map) {
  selectedLocation = map.get('location')
  x_selected = map.get('x-attr')
  y_selected = map.get('y-attr')
  x_title = capitalizeString(x_selected)
  y_title = capitalizeString(y_selected)
  color_code = map.get('color-code')

  print('testing global var updates:  { ', selectedLocation, x_selected, y_selected, x_title, y_title, color_code, ' }')
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
  // event.preventDefault();    
  let gc = new GlobalChart(id_tag, raw_data, selectedLocation, 
                           x_title, y_title, x_selected, y_selected)
  gc.doChart();

}



function capitalizeString(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}




// function handleLocationChange(input_elem) {
//   selectedLocation = input_elem.value
//   console.log('selected location: ' + selectedLocation)  
// }

// function handleXAttributeChange(input_elem) {
//   const selected_x_option = input_elem.options[input_elem.selectedIndex]
//   x_title = selected_x_option.textContent
//   x_selected = selected_x_option.value
//   console.log('selected x-attribute: ' + x_selected)
//   // console.log('X title: ' + x_title)
// }

// function handleYAttributeChange(input_elem) {
//   const selected_y_option = input_elem.options[input_elem.selectedIndex]
//   y_title = selected_y_option.textContent
//   y_selected = selected_y_option.value
//   console.log('selected y-attribute: ' + y_selected)
//   // console.log('Y title: ' + y_title)
// }

// function handleColorCodeChange(input_elem) {
//   const selected_colorCode = input_elem
//   colorCode_title = selected_colorCode.textContent;
//   color_code = selected_colorCode.value;
//   console.log('selected color-code: ' + color_code)
// }


// function setupGlobalListeners() {   
//   const location_input = document.getElementById('location-menu')
//   const Xattr_input = document.getElementById('x-attr-menu')
//   const Yattr_input = document.getElementById('y-attr-menu')
//   const colorCode_input = document.querySelector('[name="colorCode"]');

//   location_input.addEventListener('change', function() {
//     handleLocationChange(location_input);
//   });
//   Xattr_input.addEventListener('change', function() {
//     handleXAttributeChange(Xattr_input);
//   });
//   Yattr_input.addEventListener('change', function() {
//     handleYAttributeChange(Yattr_input);
//   });
//   colorCode_input.addEventListener('click', function() {
//     handleColorCodeChange(colorCode_input);
//   });  
// }