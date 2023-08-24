
class GlobalChart {

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
    this.margin = { top: 25, right: 30, bottom: 50, left: 70 };
    this.width = 650 - this.margin.left - this.margin.right;
    this.height = 550 - this.margin.top - this.margin.bottom;
  }

  
  // initialise the chart
  initChart() {
    console.log('doing initChart...')
    let selectedData = this.selectData()

    console.log('selectedData: ', selectedData)

    const x_values = selectedData.map((d) => d.xAttr);
    const y_values = selectedData.map((d) => d.yAttr);
    const xMax = d3.max(x_values);
    const yMax = d3.max(y_values);    
    const svg = this.createSVG(this.id_tag, this.margin, this.width, this.height);
    const { x, y } = this.doAxes(svg, this.width, this.height, xMax, yMax);
    this.doDotsGroup(svg, selectedData, x, y);
    this.doTitle(svg, this.width, this.margin);
    this.doAxisLabels(svg, this.width, this.height, this.margin);
    this.doLegend(svg, this.width);
  }


  // NEW version
  reRender(filters = {}) {
    // console.log('filters length:  ', Object.keys(filters).length)
    // console.log('filters:  ', filters)
    if (filters.size > 0) {
      const filteredData = this.filterData(filters);

      // Update existing chart elements with filtered data
      const x_values = filteredData.map((d) => d.xAttr);
      const y_values = filteredData.map((d) => d.yAttr);
      const xMax = d3.max(x_values);
      const yMax = d3.max(y_values);

      const svg = d3.select(this.id_tag).select('svg'); // Get the existing SVG
      const { x, y } = this.doAxes(svg, this.width, this.height, xMax, yMax);
      
      // Update dots group
      // const dots = svg.selectAll('circle').data(filteredData);
      const dots = d3.selectAll(this.id_tag).selectAll('circle')

      //JOIN, ENTER, UPDATE, EXIT
      let join = dots.data(filteredData)
      let enter = join.enter()

      enter.append('circle')
           .attr('cx', (d) => (d.xAttr === 'na' ? null : x(d.xAttr)))
           .attr('cy', (d) => (d.yAttr === 'na' ? null : y(d.yAttr)))
          //  .attr('r', 1)
          //  .attr('fill', )

      circles.join(update => update.attr('cx', (d) => (d.xAttr === 'na' ? null : x(d.xAttr)))
                                   .attr('cy', (d) => (d.yAttr === 'na' ? null : y(d.yAttr))));

      let exit = join.exit()
      exit.remove();
      // UpdateAxis(filteredData);
    }
  }



  // // OLD version: update the chart 
  // reRender(filters = {}) {
  //   // console.log('filters length:  ', Object.keys(filters).length)
  //   // console.log('filters:  ', filters)
  //   if (filters.size > 0) {
  //     const filteredData = this.filterData(filters);

  //     // Update existing chart elements with filtered data
  //     const x_values = filteredData.map((d) => d.xAttr);
  //     const y_values = filteredData.map((d) => d.yAttr);
  //     const xMax = d3.max(x_values);
  //     const yMax = d3.max(y_values);

  //     const svg = d3.select(this.id_tag).select('svg'); // Get the existing SVG
  //     const { x, y } = this.doAxes(svg, this.width, this.height, xMax, yMax);
      
  //     // Update dots group
  //     const dots = svg.selectAll('circle').data(filteredData);
  //     // const dots = d3.selectAll(this.id_tag).selectAll("circle")

  //     dots.attr('cx', (d) => (d.xAttr === 'na' ? null : x(d.xAttr)))
  //         .attr('cy', (d) => (d.yAttr === 'na' ? null : y(d.yAttr)));

  //     // Title Prefix
  //     // extract the applied 'filter types' and concat. into string
  //     const keysArray = Array.from(filters.keys())
  //     const keysString = keysArray.join(' & ')
  //     const titlePrefix = 'FILTERS (' + keysString + ') : '

  //     // Update title
  //     this.doTitle(svg, this.width, this.margin, titlePrefix);

  //     // Update axis labels
  //     this.doAxisLabels(svg, this.width, this.height, this.margin);
      
  //     // Remove any extra dots if needed
  //     dots.exit().remove();      
      
  //   }
  // }



  // select relevant data, according to configuration
  selectData() {   
    return raw_data.map(player => {
      const filteredRow = player.data.filter(row => row.location === selectedLocation); 

      // only process players that return a row
      if (filteredRow.length > 0) {
        const selectedRow = filteredRow[0];        
        
        const row = {
          id: selectedRow.id,
          name: selectedRow.name,
          country: selectedRow.country,
          span: selectedRow.span,
          matches_played: selectedRow.matches_played,        
          xAttr: selectedRow[x_selected],
          yAttr: selectedRow[y_selected],
        };
        
        return row;        
      }
      
      return null;
    }).filter(row => row !== null);    
  }  



  filterData(filters = {}) {   
    return raw_data.map(player => {
      const filteredRow = player.data.filter(row => row.location === selectedLocation);     

      // handle players that don't return rows for the queried-location
      if (filteredRow.length > 0) {
        const selectedRow = filteredRow[0];

        const row = {
          id: selectedRow.id,
          name: selectedRow.name,
          country: selectedRow.country,
          span: selectedRow.span,
          matches_played: selectedRow.matches_played,        
          xAttr: selectedRow[x_selected],
          yAttr: selectedRow[y_selected],
        };  
        
        let filteredPlayer = null
  
        filters.forEach((value, key) => {
          // console.log('Filters Array contents...')
          // console.log(`Key: ${key}, Value: ${value}`)
          if (key === 'year-range') {
            let player_span = row.span
            let spanArray = player_span.split('-')
            const span_start = parseInt(spanArray[0]) 
            const span_end = parseInt(spanArray[1])
            const query_start = value[0]
            const query_end = value[1]
            
  
            // check if query-range touches span-range
            if (((query_start >= span_start) && (query_start <= span_end)) || 
               ((query_end >= span_start) && (query_end <= span_end))) {
                // console.log('REACHED INSIDE.....  ', row)
                filteredPlayer = row                
            }
          }
        });
        
        return filteredPlayer;
      }

      return null;      
    }).filter(filteredPlayer => filteredPlayer !== null);     
  }


  createSVG(id_tag, margin, width, height) {  
    console.log('id_tag:  ' + id_tag)  
    return d3.select(id_tag)
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', '#e6effc') // background color
      .style('border', '4px solid #ccc') // Set the border properties here
    .append('g')
      .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');
  }


  doDotsGroup(svg, data, x, y) {  
    console.log('doing doDotsGroup....')
    // console.log('data:  ', data)  
    svg.append('g')    
      .selectAll('dot')
      .data(data)
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
          .style('color', 'white')          
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
    .style('fill', '#000000')
    .text(x_title);

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x',0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#000000')
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
      .style('fill', '#000000')
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
      .style('fill', '#000000')
      .style('color', '#000000');

    // Add Y axis
    let y = d3.scaleLinear()
    .domain([0, yMax+40])
    .range([ height, 0]);
    svg.append('g')
      .call(d3.axisLeft(y))
      .style('fill', '#000000')
      .style('color', '#000000');

    return { x: x, y: y };
  }


  doTitle(svg, width, margin, prefix = '') {            
    svg.append('text')
    .attr('x', (width / 2))
    .attr('y', margin.top - 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('fill', '#000000')
    .text(prefix + y_title + ' vs. ' + x_title);
  }

}


