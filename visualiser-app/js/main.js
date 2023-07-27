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

/** 
 * Filters the raw_data by selected location and attributes
 * 
 * @param {array} rawData 
 * @param {string} selectedLocation 
 * @returns {array} array of (filtered) player objects
 */
function filterData(rawData, selectedLocation) {

  return raw_data.map(player => {
    const filteredRow = player.data.filter(row => row.location === selectedLocation);
    const selectedRow = filteredRow[0];
    // console.log(selectedRow)

    if (filteredRow.length === 0) {
      return { name: player.name, row: {} };
    }

    // console.log('select X: ', selected_x)
    // console.log('selected Y: ', selected_y)

    const selectedData = {
      id: selectedRow.id,
      name: selectedRow.name,
      country: selectedRow.country,
      xAttr: selectedRow[x_selected],
      yAttr: selectedRow[y_selected],

    };
    // return { name: player.name, row: selectedData};
    
    return { name: player.name, id: selectedData.id,  country: selectedData.country, xAttr: selectedData.xAttr, yAttr: selectedData.yAttr };
  });
  
}



/**
 * 
 * @param {*} id_tag 
 * @param {*} margin 
 * @param {*} width 
 * @param {*} height 
 */
function createSVG(id_tag, margin, width, height) {

  return d3.select(id_tag)
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', '#131054') // background color
      .style('border', '4px solid #ccc') // Set the border properties here
    .append('g')
      .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');  

}


/**
 * Uses tooltip to display pop-up on mouseover
 * 
 * @param {*} event 
 * @param {*} d 
 */
function doMouseOver(event, d) {
  // show tooltip on mouseover
  d3.select('.tooltip')
  .style('opacity', 0.9)
  .html(`
    <div>Name: ${d.name}</div>
    <div>Country: ${d.country}</div>
    <div>${x_title}: ${d.xAttr}</div>
    <div>${y_title}: ${d.yAttr}</div>        
  `)                        
  // .style('left', (d3.event.pageX + 10) + 'px')
  // .style('top', (d3.event.pageY - 28) + 'px');

}


/**
 * configure and draw the dot objects
 * 
 * @param {*} svg 
 * @param {*} filteredData 
 * @param {*} x 
 * @param {*} y 
 */
function doDotsGroup(svg, filteredData, x, y) {
  svg.append('g')    
    .selectAll('dot')
    .data(filteredData)
    .enter()
    .append('circle')
      .attr('cx', function (d) {
        if (d.xAttr === 'na' || d.yAttr === 'na') {
          return null;
        } else {
          return x(d.xAttr);
        }
      })

      .attr('cy', function (d) {
        if (d.xAttr === 'na' || d.yAttr === 'na') {
          return null;
        } else if (d.yAttr !== 'na') {
          return y(d.yAttr);
        }
      })

      .attr('r', 3.0)
      .style('fill', function(d) {
        // Specify color based on the 'country' attribute
        if (d.country === 'BAN' || d.country === 'IND' || d.country === 'SL') {
          return '#e41a1c';
        } else if (d.country === 'SA' || d.country === 'ENG' || d.country === 'NZ' || d.country === 'AUS') {
          return '#377eb8';
        } else {
          return '#4daf4a';
        }
      })

      //call helper fn. on mouseover
      .on('mouseover', function(event, d) {
        doMouseOver(event, d)
      })
      //hide the tooltip on mouseout
      .on('mouseout', function(d) {        
        d3.select('.tooltip').style('opacity', 0);
      });
}


/**
 * 
 * @param {*} svg 
 * @param {*} width 
 * @param {*} height 
 * @param {*} margin 
 */
function doAxisLabels(svg, width, height, margin) {
  // Add X axis label
  svg.append('text')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height + 45) + ')')
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('fill', '#ffffff')
    .text(x_title);

  // Add Y axis label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x',0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('fill', '#ffffff')
    .text(y_title);
}


/**
 * 
 * @param {*} svg 
 * @param {*} width 
 * @param {*} height 
 */
function doLegend(svg, width) {  
  let legend = svg.append('g')
  .attr('class', 'legend')
  .attr('transform', 'translate(' + (width - 40) + ',' + 2 + ')'); // Adjust the position as needed

  // Define the legend data based on the 'country' attribute
  let legendData = [
    { label: 'BIS', color: '#e41a1c' },
    { label: 'SENA', color: '#377eb8' },
    { label: 'Other', color: '#4daf4a' }
  ];

  // Create the legend items
  let legendItems = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`); // Adjust the spacing between legend items

  // Add the colored rectangles to the legend items
  legendItems.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 12)
    .attr('height', 12)
    .style('fill', d => d.color);

  // Add the text labels to the legend items
  legendItems.append('text')
    .attr('x', 20)
    .attr('y', 6)
    .attr('dy', '0.35em')
    .style('font-size', '12px')
    .style('fill', '#ffffff')
    .text(d => d.label);
}


/**
 * 
 * @param {*} svg 
 * @param {*} width 
 * @param {*} height 
 * @param {*} xMax 
 * @param {*} yMax 
 */
function doAxes(svg, width, height, xMax, yMax) {
  // Add X axis
  let x = d3.scaleLinear()
  .domain([0, xMax+50])
  .range([ 0, width ]);
  svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))
    .style('fill', '#ffffff')
    .style('color', '#ffffff');

  // Add Y axis
  let y = d3.scaleLinear()
  .domain([0, yMax+40])
  .range([ height, 0]);
  svg.append('g')
    .call(d3.axisLeft(y))
    .style('fill', '#ffffff')
    .style('color', '#ffffff');

  return { x: x, y: y };
}


/**
 * 
 * @param {*} svg 
 * @param {*} width 
 * @param {*} margin 
 */
function doTitle(svg, width, margin) {  
  svg.append('text')
  .attr('x', (width / 2))
  .attr('y', margin.top - 20)
  .attr('text-anchor', 'middle')
  .style('font-size', '16px')
  .style('fill', '#ffffff')
  .text(y_title + ' vs. ' + x_title);
}


function doChart(id_tag) {
  // console.log(raw_data)
  // array of player objects (filtered by location & attributes)
  const filteredData = filterData(raw_data, selectedLocation)

  console.log('Data_filtered_by_' + selectedLocation, filteredData)

  //array of 'matches_played' values 
  let x_values = filteredData.map((d) => d.xAttr)
  //array of 'runs' values
  let y_values = filteredData.map((d) => d.yAttr)

  // console.log(x_values)
  // console.log(y_values)

  let xMax = d3.max(x_values)
  let yMax = d3.max(y_values)

  // set the dimensions and margins of the graph
  let margin = {top: 25, right: 30, bottom: 50, left: 70};
  let width = 650 - margin.left - margin.right;
  let height = 550 - margin.top - margin.bottom;
  let svg = createSVG(id_tag, margin, width, height);
  
  let x, y

  // Create x and y axes
  ({ x, y } = doAxes(svg, width, height, xMax, yMax));

  // Create and draw the dot objects
  doDotsGroup(svg, filteredData, x, y);

  // Create chart title
  doTitle(svg, width, margin);
  
  // Create the axis labels
  doAxisLabels(svg, width, height, margin);

  // Create the legend
  doLegend(svg, width);
}


function isPositiveInteger(value) {
  // Check if the value is a number
  if (typeof value !== 'number') {
    return false;
  }

  // Check if the value is an integer
  if (!Number.isInteger(value)) {
    return false;
  }

  // Check if the value is positive
  if (value < 0) {
    return false;
  }

  return true;
}








