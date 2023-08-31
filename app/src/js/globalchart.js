
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
    this.svg = null; 
  }


  
  // initialise the chart
  initChart() {
    // console.log('doing initChart...')
    const selectedData = this.selectData()
    console.log('selectedData: ', selectedData)

    this.svg = this.createSVG(this.id_tag, this.margin, this.width, this.height);
    const { xScale, yScale } = this.doAxes(this.svg, this.width, this.height, selectedData, this.margin);
    this.doDotsGroup(this.svg, selectedData, xScale, yScale);
    this.doTitle(this.svg, this.width, this.margin);
    this.doAxisLabels(this.svg, this.width, this.height, this.margin);
    this.doLegend(this.svg, this.width);
  }



  // NEW version
  reRender(filters = {}) {
    console.log('filters length:  ', filters.size)
    // console.log('filters:  ', filters)
    if (filters.size > 0) {
      const filteredData = this.filterData(filters)      
      console.log('filteredData: ', filteredData)
      console.log('filteredData size: ', filteredData.length)

      // remove chart contents (axes, dots)
      const dotsGroup = this.svg.select('.dots')
      dotsGroup.selectAll('circle').remove()
      const xAxis = this.svg.select('.x-axis')
      const yAxis = this.svg.select('.y-axis')
      xAxis.remove()
      yAxis.remove()

      // new axes
      const { xScale, yScale } = this.doAxes(this.svg, this.width, this.height, filteredData, this.margin);
      // new dots-group
      this.doDotsGroup(this.svg, filteredData, xScale, yScale);      
    }
  }
  



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
    let count = 0
    
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

        // THIS IS WORKING FOR APPLYING ONE FILTER. I DONT THINK YOU CAN APPLY BOTH FILTER OPTIONS SIMULTANEOUSLY
        // NEED TO IMPLEMENT THIS
  
        filters.forEach((value, key) => {
          // console.log('Filters Array contents...')
          // console.log(`Key: ${key}, Value: ${value}`)

          // curr. player values
          const player_span = row.span 
          const spanArray = player_span.split('-')
          const span_start = parseInt(spanArray[0]) 
          const span_end = parseInt(spanArray[1])
          const player_country = row.country          

          if (key === 'year-range') {
            // queried values 
            const query_start = value[0]
            const query_end = value[1]           
  
            // check if query-range touches span-range
            if (((query_start >= span_start) && (query_start <= span_end)) || 
               ((query_end >= span_start) && (query_end <= span_end))) {                
                // count++
                // console.log('count #' + count)
                // console.log('name: ' + player.name)
                // console.log('span-start: ' + span_start)
                // console.log('span-end: ' + span_end)
                // console.log('query-start: ' + query_start)
                // console.log('query-end: ' + query_end)                
                filteredPlayer = row                
            }
          }
          else if (key === 'country-select') {
            // queried value
            const query_country = value

            if(player_country == query_country){
              filteredPlayer = row
            }
          }
          else if (key === 'debut-year') {            
            const query_debut = value

            if (query_debut == span_start) {
              filteredPlayer = row
            }            
          }
          else if (key === 'final-year') {
            const query_final = value

            if (query_final == span_end) {
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
    // console.log('doing doDotsGroup....')
    // console.log('data:  ', data)  
    const dotsGroup = svg.append('g')
      .attr('class', 'dots')

    const circles = dotsGroup.selectAll('circle')
      .data(data)
      .enter()
      .filter((d) => d.xAttr !== 'na' && d.yAttr !== 'na') // Filter data points

    circles.append('circle')
      .attr('cx', (d) => x(d.xAttr))
      .attr('cy', (d) => y(d.yAttr))
      .attr('r', 3.0)
      .style('fill', (d) => this.setDotColor(d))

      // mouseover...
      .on('mouseover', (event, d) => {        
        // show tooltip on mouseover
        d3.select('.tooltip')
        .style('opacity', 0.9)
        .style('color', 'white')          
        .html(`
          <div>Name: ${d.name}</div>
          <div>Country: ${d.country}</div>
          <div>Span: ${d.span}</div> 
          <div>${x_title}: ${d.xAttr}</div>
          <div>${y_title}: ${d.yAttr}</div>                
        `)
      })
      // mouseout...
      .on('mouseout', (event, d) => {        
        d3.select('.tooltip').style('opacity', 0);
      });
        
  }


  // Set the color of the dot
  setDotColor(d) {
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
  }



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


  doAxes(svg, width, height, data, margin) {    
    // X-scale
    let xScale = d3.scaleLinear()   
    .domain(d3.extent(data, d => d.xAttr)).nice()
    .range([ 0, width ])    

    // Y-scale
    let yScale = d3.scaleLinear()    
    .domain(d3.extent(data, d => d.yAttr)).nice()
    .range([ height, 0])    

    // add X-axis
    const xAxis = svg.append('g')
      .attr('class', 'x-axis') // reference
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale).ticks(width/50))
      .style('fill', '#000000')
      .style('color', '#000000');
     
    // add Y-axis
    const yAxis = svg.append('g')
      .attr('class', 'y-axis') // reference
      .call(d3.axisLeft(yScale))
      .style('fill', '#000000')
      .style('color', '#000000');

    return { xScale: xScale, yScale: yScale };
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


