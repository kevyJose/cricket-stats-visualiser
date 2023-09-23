
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
    this.margin = { top: 80, right: 70, bottom: 60, left: 70 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 700 - this.margin.top - this.margin.bottom;
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
    this.doTitleReformat();
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
      // console.log('filteredData size: ', filteredData.length)

      // remove chart contents (axes, dots)
      const dotsGroup = this.svg.select('.dots')
      dotsGroup.remove()
      // dotsGroup.selectAll('circle').remove()
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

        // append x,y features to the row
        // these features are used as chart coords
        selectedRow.xAttr = selectedRow[this.x_selected];
        selectedRow.yAttr = selectedRow[this.y_selected];
        
        return selectedRow;        
      }
      
      return null;
    }).filter(selectedRow => selectedRow !== null);    
  }
  


  filterData(filters = {}) {
    // console.log('filters... ', filters)    
    return raw_data.map(player => {
      const filteredRow = player.data.filter(row => row.location === selectedLocation);
      
      if (filteredRow.length > 0) {
        const row = filteredRow[0];

        // append x,y features to the row
        // these features are used as chart coords                
        row.xAttr = row[this.x_selected];
        row.yAttr = row[this.y_selected];
        
        let filteredPlayer = null
        let i = 0  // index
        let match_count = 0  // the no. of filters fulfilled
  
        // iterate the queried filters
        // if the player values fulfil ALL the queried filters, then select player
        filters.forEach((value, key) => {          
          // curr. player values
          const player_span = row.span 
          const spanArray = player_span.split('-')
          const player_debut = parseInt(spanArray[0]) 
          const player_final = parseInt(spanArray[1])
          const player_country = row.country          

          if (key === 'year-range') {
            // queried values 
            const query_start = value[0]
            const query_end = value[1]           
  
            // check if query-range touches span-range
            if (((query_start >= player_debut) && (query_start <= player_final)) || 
               ((query_end >= player_debut) && (query_end <= player_final))) {                
                // final iteration 
                if (i == filters.size - 1) {                 
                  match_count++
                  // match_count is 100%
                  if (match_count == filters.size) {
                    filteredPlayer = row
                  }                  
                }
                // less than final iteration
                else {
                  match_count++
                }                                
            }
          }

          else if (key === 'country-select') {
            // queried value
            const query_countries = value
            
            query_countries.some((query_country) => {
              //check if curr. player country matches query country
              if (player_country == query_country) {
                // final iteration 
                if (i == filters.size - 1) {                                 
                  match_count++

                  // match_count is 100%
                  if (match_count == filters.size) {
                    filteredPlayer = row
                    return true;
                  }                  
                }
                // less than final iteration
                else {
                  match_count++
                  return true;
                }
              }              
            });            
          }

          else if (key === 'debut-year') {            
            const query_debut = value
            
            //check if curr-player-debut matches query-debut
            if (player_debut == query_debut) {
                // final iteration 
                if (i == filters.size - 1) {                                   
                  match_count++

                  // match_count is 100%
                  if (match_count == filters.size) {
                    filteredPlayer = row
                  }                  
                }
                // less than final iteration
                else {
                  match_count++
                }              
            }            
          }

          else if (key === 'final-year') {
            const query_final = value

            // check if curr-player-final matches query-final
            if (player_final == query_final) { 
                // final iteration 
                if (i == filters.size - 1) {                                   
                  match_count++

                  // match_count is 100%
                  if (match_count == filters.size) {
                    filteredPlayer = row
                  }                  
                }
                // less than final iteration
                else {
                  match_count++
                }             
            }
          }
          
          //increment i to prep for next iteration
          i++
          // after final iter, reset 'i' and 'match_count'
          if (i == filters.size) {
            i = 0
            match_count = 0
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
      .style('border', '4px solid #ccc') // svg border
    .append('g')
      .attr('transform', `translate( ${margin.left} , ${margin.top} )`);
  }



  doDotsGroup(svg, data, x, y) {  
    // console.log('doing doDotsGroup....')
    // console.log('data:  ', data)
    const locationsMap = new Map([
      ['C', 'Combined'],
      ['H', 'Home'],
      ['A', 'Away'],
      ['N', 'Neutral'],
      ['B', 'BIS'],
      ['S', 'SENA'],
      ['O', 'Other'],
    ]);    

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
          <div class='tooltip-name'>${d.name}</div>
          <div>Country: ${d.country}</div>
          <div>Location: ${locationsMap.get(d.location)}</div>
          <div>Span: ${d.span}</div>
          <div>Matches Played: ${d.matches_played}</div>
          <div>Innings: ${d.innings}</div>
          <div>Runs: ${d.runs}</div>
          <div>Not Outs: ${d.not_outs}</div>
          <div>High Score: ${d.high_score}</div>
          <div>Batting Average: ${d.batting_average}</div>
          <div>Balls Faced: ${d.balls_faced}</div>
          <div>Strike Rate: ${d.strike_rate}</div>
          <div>Centuries: ${d.centuries}</div>
          <div>Half Centuries: ${d.half_cents}</div>
          <div>Below Fifties: ${d.below_fifties}</div>
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
    const xLabel = svg.append('text')
      .attr('transform', `translate( ${width/2}, ${height+45} )`)
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial') 
      .style('font-size', '24px')
      .style('fill', '#000000')
      .text(this.x_title);

    // Add Y axis label
    const yLabel = svg.append('text')      
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x',0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial') 
      .style('font-size', '24px')
      .style('fill', '#000000')
      .text(this.y_title);
  }


  doLegend(svg, width) {    
    let legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width}, -40)`); // Adjust the position as needed
  
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
    .range([ height+5, 0 ])    

    // add X-axis
    const xAxis = svg.append('g')
      .attr('class', 'x-axis') // reference
      .attr('transform', `translate(0, ${height})`)
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


  doTitleReformat() {
    let x_str = this.x_title
    let y_str = this.y_title

    // reformat x-title
    if (x_str.includes('_')) {
      const index = x_str.indexOf('_')
      x_str = x_str.replace('_',' ')

      if(index < x_str.length - 1) {
        // console.log('I MADE IT INSIDE....')
        x_str = x_str.substring(0, index+1) + x_str.charAt(index+1).toUpperCase() + x_str.substring(index+2)
        this.x_title = x_str
      }      
    }
    // reformat y-title
    if (y_str.includes('_')) {
      const index = y_str.indexOf('_')
      y_str = y_str.replace('_',' ')

      if(index < y_str.length - 1) {
        // console.log('I MADE IT INSIDE....')
        y_str = y_str.substring(0, index+1) + y_str.charAt(index+1).toUpperCase() + y_str.substring(index+2)
        this.y_title = y_str
      }      
    }
  }



  doTitle(svg, width, margin, prefix = '') {
    // this.doTitleReformat();
    svg.append('text')
    .attr('x', (width / 2))
    .attr('y', -40)
    .attr('text-anchor', 'middle')
    .style('font-family', 'Arial')    
    .style('font-size', '28px')
    .style('fill', '#000000')
    .text(prefix + this.y_title + ' vs. ' + this.x_title);
  }


}


