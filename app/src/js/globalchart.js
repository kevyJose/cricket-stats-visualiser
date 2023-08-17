
class GlobalChart {
  id_tag
  rawData
  selectedLocation
  x_title
  y_title
  x_selected
  y_selected
  color_code

  constructor(id_tag, rawData, selectedLocation, x_title, 
              y_title, x_selected, y_selected, color_code) {                
    this.id_tag = id_tag;
    this.rawData = rawData;
    this.selectedLocation = selectedLocation;
    this.x_title = x_title;
    this.y_title = y_title;
    this.x_selected = x_selected;
    this.y_selected = y_selected;
    this.color_code = color_code;
  }


  doChart() {
    const filteredData = this.filterData();
    const x_values = filteredData.map((d) => d.xAttr);
    const y_values = filteredData.map((d) => d.yAttr);
    const xMax = d3.max(x_values);
    const yMax = d3.max(y_values);
    const margin = { top: 25, right: 30, bottom: 50, left: 70 };
    const width = 650 - margin.left - margin.right;
    const height = 550 - margin.top - margin.bottom;
    const svg = this.createSVG(this.id_tag, margin, width, height);
    const { x, y } = this.doAxes(svg, width, height, xMax, yMax);
    this.doDotsGroup(svg, filteredData, x, y);
    this.doTitle(svg, width, margin);
    this.doAxisLabels(svg, width, height, margin);
    this.doLegend(svg, width);
  }


  filterData() {   
    return raw_data.map(player => {
      const filteredRow = player.data.filter(row => row.location === selectedLocation);
      const selectedRow = filteredRow[0];
      // console.log(selectedRow)
  
      if (filteredRow.length === 0) {
        return { name: player.name, row: {} };
      }
  
      const selectedData = {
        id: selectedRow.id,
        name: selectedRow.name,
        country: selectedRow.country,
        matches_played: selectedRow.matches_played,
        xAttr: selectedRow[x_selected],
        yAttr: selectedRow[y_selected],

      };
      
      return { name: player.name, id: selectedData.id, country: selectedData.country, 
               matches_played: selectedData.matches_played, xAttr: selectedData.xAttr, 
               yAttr: selectedData.yAttr };
    });    
  }


  createSVG(id_tag, margin, width, height) {    
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


  doDotsGroup(svg, filteredData, x, y) {    
    svg.append('g')    
      .selectAll('dot')
      .data(filteredData)
      .enter()
      .append('circle')
        .attr('cx', (d) => {
          if (d.xAttr === 'na' || d.yAttr === 'na') {
            return null;
          } else {
            return x(d.xAttr);
          }
        })

        .attr('cy', (d) => {
          if (d.xAttr === 'na' || d.yAttr === 'na') {
            return null;
          } else if (d.yAttr !== 'na') {
            return y(d.yAttr);
          }
        })

        .attr('r', 3.0)

        //Set 'fill' color of the dot, based on color_code
        .style('fill', (d) => {
          // console.log('color_code... ', this.color_code)
          if(this.color_code === 'bis') {
            // Specify color based on the 'country' attribute
            if (d.country === 'BAN' || d.country === 'IND' || d.country === 'SL') {
              return '#e41a1c';
            } 
            else if (d.country === 'SA' || d.country === 'ENG' || 
                     d.country === 'NZ' || d.country === 'AUS') {
              return '#377eb8';
            } 
            else {
              return '#4daf4a';
            }
          } 
          else if(this.color_code === 'matches') {
            //specify color-regions based on no. matches played
            if (d.matches_played >= 0 && d.matches_played <= 24) { // 0-24
              return '#FFFFFF';                             
            }
            else if(d.matches_played >= 25 && d.matches_played <= 49) { // 25-49
              return '#cccccc'; 
            }
            else if(d.matches_played >= 50 && d.matches_played <= 99) { // 50-99
              return '#969696'; 
            }
            else if(d.matches_played >= 100 && d.matches_played <= 249) { // 100-249
              return '#636363'; 
            }
            else if(d.matches_played >= 250 && d.matches_played <= 500) { // 250-500
              return '#252525'; 
            }
            else { //any other values
              return '#FF0000'; 
            }
          }
        })

        //call helper fn. on mouseover
        .on('mouseover', (event, d) => {        
          // show tooltip on mouseover
          d3.select('.tooltip')
          .style('opacity', 0.9)
          .html(`
            <div>Name: ${d.name}</div>
            <div>Country: ${d.country}</div>
            <div>${x_title}: ${d.xAttr}</div>
            <div>${y_title}: ${d.yAttr}</div>        
          `)
        })
        //hide the tooltip on mouseout
        .on('mouseout', (event, d) => {        
          d3.select('.tooltip').style('opacity', 0);
        })
  };





  doAxisLabels(svg, width, height, margin) {    
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


  doLegend(svg, width) {    
    let legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + (width - 40) + ',' + 2 + ')'); // Adjust the position as needed
  
    // Define the legend for COUNTRY-GROUPINGS
    let legendData_bis = [
      { label: 'BIS', color: '#e41a1c' },
      { label: 'SENA', color: '#377eb8' },
      { label: 'Other', color: '#4daf4a' }
    ];

    let legendData_matches = [
      { label: '0-24', color: '#f7f7f7' },
      { label: '25-49', color: '#cccccc' },
      { label: '50-99', color: '#969696' },
      { label: '100-249', color: '#636363' },
      { label: '250-500', color: '#252525' }
    ];

    let legendData = []

    if(this.color_code === 'bis') {
      legendData = legendData_bis            
    }
    else if(this.color_code === 'matches') {
      legendData = legendData_matches
    }    
  
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


  doAxes(svg, width, height, xMax, yMax) {    
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


  doTitle(svg, width, margin) {            
    svg.append('text')
    .attr('x', (width / 2))
    .attr('y', margin.top - 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('fill', '#ffffff')
    .text(y_title + ' vs. ' + x_title);
  }

}


