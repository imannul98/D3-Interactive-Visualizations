const bar_margin = { top: 30, right: 30, bottom: 70, left: 60 },
    bar_width = 1000 - bar_margin.left - bar_margin.right,
    bar_height = 350 - bar_margin.top - bar_margin.bottom;

const scatter_margin = { top: 30, right: 30, bottom: 70, left: 60 },
    scatter_width = 1000 - scatter_margin.left - scatter_margin.right,
    scatter_height = 350 - scatter_margin.top - scatter_margin.bottom;

const line_margin = { top: 30, right: 30, bottom: 70, left: 60 },
    line_width = 1000 - line_margin.left - line_margin.right,
    line_height = 350 - line_margin.top - line_margin.bottom;

var main = d3.select("#main");

main.append("h3").text("a. Hovering")
    .style("padding-left", line_margin.left + "px")
main.append("p").text("Hover over the line chart to see the total average crime rate for each of the five states over the years.")
    .style("padding-left", line_margin.left + "px")

const lineChartSvg = main.append("svg")
    .attr("width", line_width + line_margin.left + line_margin.right)
    .attr("height", line_height + line_margin.top + line_margin.bottom);

main.append("h3").text("b. Brushing")
    .style("padding-left", line_margin.left + "px");
main.append("p").text("Brush the Barchart to highlight the line plots of the selected states. After brushing, click anywhere in the bar chart to revert the charts to their original styles")
    .style("padding-left", line_margin.left + "px")

const barChartSvg = main.append("svg")
    .attr("width", bar_width + bar_margin.left + bar_margin.right)
    .attr("height", bar_height + bar_margin.top + bar_margin.bottom);

const lineChartSvg2 = main.append("svg")
    .attr("width", line_width + line_margin.left + line_margin.right)
    .attr("height", line_height + line_margin.top + line_margin.bottom);

main.append("h3").text("c. Linking & Reconfigure")
    .style("padding-left", line_margin.left + "px");
main.append("p").text("1. Hover over a bar in the bar chart to highlight corresponding points in the scatter plot, or hover over points in the scatter plot to highlight the 2019 population of the selected state in the bar chart. 2. Reconfigure the scatter plot by selecting new variables for the x-axis and the y-axis from the dropdown menu.")
    .style("padding-left", line_margin.left + "px");

const barChartSvg2 = main.append("svg")
    .attr("width", bar_width + bar_margin.left + bar_margin.right)
    .attr("height", bar_height + bar_margin.top + bar_margin.bottom);
const scatterPlotSvg = main.append("svg")
    .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
    .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom);



//line chart
d3.csv("https://raw.githubusercontent.com/fuyuGT/CS7450-data/main/state_crime.csv").then(
    function (data) {

        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const state_group = d3.rollup(data, v => d3.mean(v, d => +d['Data.Rates.Property.All']), d => d.State, d => d.Year);
        console.log(state_group);

        let dataArray = Array.from(state_group, ([key, value]) => ({key, value}));

        const lineChartWidth = 700, lineChartHeight = line_height
        let lineChart = lineChartSvg.append('g')
            .attr('transform', 'translate(' + 100 + ',' + 50 + ')')
        
        // States and their respective colors
        const states = ["California", "Colorado", "Florida", "Georgia", "Indiana"];
        const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"];

        // Scale for line colors
        var colorScale = d3.scaleOrdinal()
            .domain(states)
            .range(colors);
        
        drawLineChart(lineChart,data,states,colorScale)

        let lineChart2 = lineChartSvg2.append('g')
            .attr('transform', 'translate(' + 100 + ',' + 50 + ')');

        const states2 = Array.from(state_group.keys());
        console.log(states)
    
        // Scale for line colors
        var colorScale2 = d3.scaleOrdinal()
            .domain(states)
            .range(d3.schemeCategory10); 
        
        drawLineChart(lineChart2,data,states2,colorScale2)

        function drawLineChart(lineChart,data,states,colorScale){
            // Define the time scale for the X-axis
            const xScale = d3.scaleTime()
                .domain(d3.extent(data, d => d3.timeParse("%Y")(d.Year)))
                .range([0, lineChartWidth]);

            // Append X-axis to the chart
            lineChart.append("g")
                .attr("transform", `translate(0, ${lineChartHeight})`)
                .call(d3.axisBottom(xScale));
            // Label for X-axis
            lineChart.append("text")
                .attr("class", "my-axis-label")
                .attr("transform", `translate(${lineChartWidth / 2}, ${lineChartHeight + 40})`)
                .text("Year");

            lineChart.insert("rect", ":first-child")
                .attr("width", lineChartWidth)
                .attr("height", lineChartHeight)
                .attr("fill", '#fafafa');

            // Define the linear scale for the Y-axis
            const yScale = d3.scaleLinear()
                .domain([d3.min(data, d => +d['Data.Rates.Property.All']), d3.max(data, d => +d['Data.Rates.Property.All'])])
                .range([lineChartHeight, 0]);

            // Append Y-axis to the chart
            lineChart.append("g")
                .call(d3.axisLeft(yScale));

            // Label for Y-axis
            lineChart.append("text")
                .attr("class", "my-axis-label")
                .attr("transform", "rotate(-90)")
                .attr("y", -45)
                .attr("x", 0 - 1.6*(lineChartHeight / 2))
                .text("Total Average Crime Rate");

            // Define the line generator
            let line = d3.line()
                .x(d => xScale(d3.timeParse("%Y")(d.year)))
                .y(d => yScale(d.value));

            lineChart.append("text")
                .attr("class", "my-title")
                .attr("transform", `translate(${lineChartWidth / 2-100}, -10)`)
                .text("Total Average Crime Rate Over the Years")
            
            states.forEach((state, index) => {
                const stateData = Array.from(state_group.get(state), ([year, value]) => ({ year, value, State: state }));
                // Append line for the state
                lineChart.append("path")
                    .datum({data: stateData,State : state})
                    .attr("fill", "none")
                    .attr("stroke", colorScale(state))
                    .attr("stroke-width", 2.5)
                    .attr("d", d=>line(d.data))
                    .classed("state-line", true);;
                    
                // Append circles for tooltip functionality
                lineChart.selectAll(".point-" + state.replace(/ /g, "_")) // Replace spaces with underscores for valid class names
                    .data(stateData)
                    .enter().append("circle")
                    .attr("class", "point-" + state.replace(/ /g, "_"))
                    .attr("cx", d => xScale(d3.timeParse("%Y")(d.year)))
                    .attr("cy", d => yScale(d.value))
                    .attr("r", 5) // Size of circles for interaction
                    .style("opacity", 0) // Make them invisible
                    .on("mouseover", function(event, d) {
                        tooltip.style("opacity", 1); // Show the tooltip
                        tooltip.html(`State: ${d.State}<br>Year: ${d.year}<br>Total Average Crime Rate: ${d.value}`)
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 15) + "px");
                    })
                    .on("mousemove", function(event, d) {
                        tooltip.style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 15) + "px");
                        })
                    .on("mouseout", function(d) {
                        tooltip.style("opacity", 0); // Hide the tooltip
                    });
            });

            const statesPerColumn = 27; // Number of states before wrapping to a new column
        const columnWidth = 100; // Adjust as needed for spacing between columns

// Append legend groups, adjusting transform for row and column based on index
lineChart.selectAll(".legend")
    .data(states)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => {
        const col = Math.floor(i / statesPerColumn); // Calculate current column
        const x = lineChartWidth + 20 + col * columnWidth; // Adjust X based on column
        const y = (i % statesPerColumn) * 10; // Adjust Y based on row within column
        return `translate(${x}, ${y})`;
    })
    .append("text")
    .attr("x", 0)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(d => d)
    .attr("fill", d => colorScale(d))
    .style("font-size", "10px"); // Optional: adjust font size as needed

// Append circles for legend, adjusting position based on row and column
lineChart.selectAll(".legend-circle")
    .data(states)
    .enter()
    .append("circle")
    .attr("transform", (d, i) => {
        const col = Math.floor(i / statesPerColumn); // Calculate current column
        const x = lineChartWidth + 10 + col * columnWidth; // Adjust X for circle based on column
        const y = (i % statesPerColumn) * 10 + 10; // Adjust Y for circle based on row within column
        return `translate(${x}, ${y})`;
    })
    .attr("r", 4)
    .style("fill", d => colorScale(d));

            }

            
    })

// Bar chart
// Based on https://d3-graph-gallery.com/graph/barplot_basic.html
d3.csv("https://raw.githubusercontent.com/fuyuGT/CS7450-data/main/state_crime.csv").then(function (data) {

    // Bars
    const maxBarHeight = 200
    const barChartWidth = 800
    const originalFill = "#7c70ce"

    let barGroup = barChartSvg.append('g')
        .attr('transform', 'translate(' + 100 + ',' + 50 + ')')
    
    barGroup.insert("rect", ":first-child")
        .attr("width", barChartWidth)
        .attr("height", maxBarHeight)
        .attr("fill", '#fafafa');
      

    drawBarChart(data)

    function drawBarChart(data) {

        let state_data = data.filter(d => d.Year==2019 && d.State !== 'United States');
        console.log(state_data)
        const xBar = d3.scaleBand()
        .range([0, barChartWidth])
        .domain(data.map(d => d.State))
        .padding(0.2);

        let yMaxBar = d3.max(state_data, d => +d['Data.Population']);
        console.log(yMaxBar);

        const yBar = d3.scaleLinear()
        .domain([0, yMaxBar])
        .range([maxBarHeight, 0]);


        let myBars = barGroup.selectAll(".myBar")
        .data(state_data)
        .join('rect')
        .attr('class', 'myBar')
        .attr("x", d => xBar(d.State))
        .attr("y", d => {
            let value = +d['Data.Population'];
            return yBar(value);
        })
        .attr("width", xBar.bandwidth())
        .attr("height", d => {
            let value = +d['Data.Population'];
            let height = maxBarHeight - yBar(value);
            return height;
        })
        .attr("fill", originalFill)
        .style('cursor', 'pointer')

        // Adding axes
        barGroup.append("g")
            .attr("transform", `translate(0, ${maxBarHeight})`)
            .call(d3.axisBottom(xBar))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        barGroup.append("text")
            .attr("class", "my-axis-label")
            .attr("transform", `translate(${barChartWidth / 2}, ${maxBarHeight + 75})`)
            .text("States")

        // add y axis
        barGroup.append("g")
            .call(d3.axisLeft(yBar));

        barGroup.append("text")
            .attr("class", "my-axis-label")
            .attr("transform", "translate(-70,165)rotate(-90)")
            .text("Average Murder Rate")
        // Title
        barGroup.append("text")
            .attr("class", "my-title")
            .attr("transform", `translate(${barChartWidth / 2-60}, -10)`)
            .text("State Population in 2019")


        let barTooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)

        // Implement brushing on the bar chart
        let brushGroup = barGroup.append("g")
            .attr("class", "brush");
        let brush = d3.brushX()
            .extent([[0, 0], [barChartWidth, maxBarHeight]])
            .on('start', function () {
                lineChartSvg2.selectAll(".state-line").style("opacity", null).style("stroke-width", null);
                brushGroup.call(brush.move, null);
            })
            .on("brush", brushed);

        barGroup.append("g")
            .attr("class", "brush")
            .call(brush);

        function brushed(event) {
            if (event.selection) {
                let selectedStates = [];
                const [x0, x1] = event.selection;
                myBars.classed("selected", function(d) {
                    const cx = xBar(d.State) + xBar.bandwidth() / 2;
                    const isSelected = isBrushed([x0, x1], cx);
                    if (isSelected) {
                        selectedStates.push(d.State);
                    }
                    return isSelected;
                });
                highlightLines(selectedStates);
            } 
            else {
                myBars.classed("selected", false);
            }
        }
        
        brushGroup.call(brush) 
        //myBars.raise()

        function isBrushed(brush_coords, cx) {
            if (brush_coords) {
                let x0 = brush_coords[0],
                    x1 = brush_coords[1];
                return x0 <= cx && cx <= x1;
            }
            return false;
        }
        d3.selectAll('.myBar')
            .style('cursor', 'pointer')
            .on('mouseenter', mouseEnterBar)
            .on('mouseleave', mouseLeaveBar)
            .on('mousemove', mouseMoveBar)


        function mouseEnterBar(event, d) {
            d3.select(this)
                .style("opacity", 1)
                // .style('fill', hoveredFill)
                .style('stroke', '#fff')
                .style('stroke-width', 1)
            barTooltip
                .style('opacity', 0.9)
                .html(`State: ${d.State}`)
        }
        
        function mouseLeaveBar() {
            d3.select(this)
                .style('stroke', '')
            barTooltip.style('opacity', 0)
            d3.selectAll('.myCircles')
                .attr("r", 4)
                .style("fill", originalFill)
                .style('opacity', 0.7)
                .style('stroke', '')
        }

        function mouseMoveBar(event, d) {
            const leftPos = event.pageX - xBar.bandwidth()
            const topPos = event.pageY - 100
            barTooltip
                .style("left", leftPos + "px")
                .style("top", topPos + "px");
        }
    }
});
function highlightLines(selectedStates) {
    lineChartSvg2.selectAll(".state-line") 
        .style("opacity", 0.1) 
        .filter(d => selectedStates.includes(d.State)) 
        .style("opacity", 1) 
        .style("stroke-width", "3px");
}



// Bar chart2
// Based on https://d3-graph-gallery.com/graph/barplot_basic.html
d3.csv("https://raw.githubusercontent.com/fuyuGT/CS7450-data/main/state_crime.csv").then(function (data) {

    // Bars
    const maxBarHeight = 200
    const barChartWidth = 800
    const originalFill = "#7c70ce"

    let barGroup = barChartSvg2.append('g')
        .attr('transform', 'translate(' + 100 + ',' + 50 + ')')

    barGroup.insert("rect", ":first-child")
        .attr("width", barChartWidth)
        .attr("height", maxBarHeight)
        .attr("fill", '#fafafa');

    
    
    drawBarChart(data)

    function drawBarChart(data) {

        let state_data = data.filter(d => d.Year==2019 && d.State !== 'United States');
        console.log(state_data)
        const xBar = d3.scaleBand()
            .range([0, barChartWidth])
            .domain(data.map(d => d.State))
            .padding(0.2);

        let yMaxBar = d3.max(state_data, d => +d['Data.Population']);
        console.log(yMaxBar);

        const yBar = d3.scaleLinear()
        .domain([0, yMaxBar])
        .range([maxBarHeight, 0]);


        let myBars = barGroup.selectAll(".myBar1")
        .data(state_data)
        .join('rect')
        .attr('class', 'myBar1')
        .attr("x", d => xBar(d.State))
        .attr("y", d => {
            let value = +d['Data.Population'];
            return yBar(value);
        })
        .attr("width", xBar.bandwidth())
        .attr("height", d => {
            let value = +d['Data.Population'];
            let height = maxBarHeight - yBar(value);
            return height;
        })
        .attr("fill", originalFill)
        .style('cursor', 'pointer')

        
        let barTooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        d3.selectAll('.myBar1')
        .style('cursor', 'pointer')
        .on('mouseenter', mouseEnterBar)
        .on('mouseleave', mouseLeaveBar)
        .on('mousemove', mouseMoveBar)

        function mouseEnterBar(event, d) {
            d3.select(this)
            .style("opacity", 1)
            // .style('fill', hoveredFill)
            .style('stroke', '#fff')
            .style('stroke-width', 1)
        barTooltip
            .style('opacity', 0.9)
            .html(`State: ${d.State} <br> Population: ${d['Data.Population']} `)
        
                // INSERT CODE HERE
            d3.selectAll('.myCircles')
                .style('stroke', t => t.State === d.State ? '#fff' : '')
                .style('opacity', t => t.State === d.State ? 1 : 0.1)
        }
        function mouseLeaveBar() {
            d3.select(this)
            .style('stroke', '')
        barTooltip.style('opacity', 0)
            d3.selectAll('.myCircles')
                .attr("r", 4)
                .style("fill", "#7c70ce")
                .style('opacity', 0.9)
                .style('stroke', '')
        }
    
        function mouseMoveBar(event, d) {
            const leftPos = event.pageX - xBar.bandwidth()
            const topPos = event.pageY - 100
            barTooltip
                .style("left", leftPos + "px")
                .style("top", topPos + "px");
        }
        // Adding axes
        barGroup.append("g")
            .attr("transform", `translate(0, ${maxBarHeight})`)
            .call(d3.axisBottom(xBar))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        barGroup.append("text")
            .attr("class", "my-axis-label")
            .attr("transform", `translate(${barChartWidth / 2}, ${maxBarHeight + 75})`)
            .text("States")

        // add y axis
        barGroup.append("g")
            .call(d3.axisLeft(yBar));

        barGroup.append("text")
            .attr("class", "my-axis-label")
            .attr("transform", "translate(-70,165)rotate(-90)")
            .text("Average Murder Rate")

        // Title
        barGroup.append("text")
            .attr("class", "my-title")
            .attr("transform", `translate(${barChartWidth / 2-60}, -10)`)
            .text("State Population in 2019")
        }

});


// Scatterplot
// based on https://d3-graph-gallery.com/graph/scatter_basic.html
d3.csv("https://raw.githubusercontent.com/fuyuGT/CS7450-data/main/state_crime.csv").then(function (data) {


    let state_data = data.filter(d => d.Year==2019 && d.State !== 'United States');
    console.log('scatter', state_data);
    const maxHeight = 400, maxWidth = 500
    
    let xMax = d3.max(state_data.map(d => +d['Data.Rates.Property.Burglary']))
    const x = d3.scaleLinear()
        .domain([0, xMax])
        .range([0, maxWidth]);

    let yMax = d3.max(state_data.map(d => +d["Data.Rates.Property.Larceny"]))
    let yMin = d3.min(state_data.map(d => +d["Data.Rates.Property.Larceny"]))

    const y = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([maxHeight, 0]);

    let sizeMax = d3.max(state_data.map(d => +d['Data.Rates.Property.Burglary']));
    const s = d3.scaleLinear()
        .domain([0, sizeMax])
        .range([2.5, 6]);

    let scatterPlot = scatterPlotSvg.append('g')
        .attr('transform', 'translate(' + 100 + ',' + 50 + ')')
    
    

    // Define constants for style
    const originalCircleOpacity = 0.7,
        hoveredCircleOpacity = 1,
        originalBarOpacity = 0.9,
        hideBarOpacity = 0.1,
        originalFill = "#7c70ce",
        hoveredFill = "#f588f0";
    
    // Select elements for controls
    const xSelect = d3.select("#x-select"),
        ySelect = d3.select("#y-select"),
        stateSelect = d3.select("#state-select");

    //Step 1 
    // Populate dropdowns with options
    const attributes = ["Data.Rates.Property.All","Data.Rates.Property.Burglary","Data.Rates.Property.Larceny","Data.Rates.Property.Motor","Data.Rates.Violent.All","Data.Rates.Violent.Assault","Data.Rates.Violent.Murder","Data.Rates.Violent.Rape","Data.Rates.Violent.Robbery","Data.Totals.Property.All","Data.Totals.Property.Burglary","Data.Totals.Property.Larceny","Data.Totals.Property.Motor","Data.Totals.Violent.All","Data.Totals.Violent.Assault","Data.Totals.Violent.Murder","Data.Totals.Violent.Rape","Data.Totals.Violent.Robbery"],
        states = [...new Set(state_data.map(d => d.State))].sort();  

    attributes.forEach(attr => {
        // Append a new option to the xSelect dropdown with the current attribute as both its visible text and value

        xSelect.append("option").text(attr).attr("value", attr);
        ySelect.append("option").text(attr).attr("value", attr);
    });

    states.forEach(state => {
        stateSelect.append("option").text(state).attr("value", state);
    });

    // Step 1 ends

    // Step 2 starts
    // Initial plot configuration
    let xAttribute = "Data.Rates.Property.All",  // initial x attribute
        yAttribute = "Data.Rates.Property.Burglary"; // initial y attribute

    // Set initial values for dropdowns
    xSelect.property("value", xAttribute);
    ySelect.property("value", yAttribute);

    // Function to update scatter plot (implementation not shown)
    updateScatterPlot(state_data, xAttribute, yAttribute);


    // Step 2 ends

    // Step 3 starts
    // Event listener for dropdown changes
    xSelect.on("change", function (event) {
        xAttribute = this.value;
        updateScatterPlot(state_data, xAttribute, yAttribute);
    });

    ySelect.on("change", function (event) {
        yAttribute = this.value;
        updateScatterPlot(state_data, xAttribute, yAttribute);
    });

    stateSelect.on("change", function (event) {
        stateName = this.value
        console.log(stateName)
        highlightMovies(stateName)
    })
    // Step 3 ends

    function updateScatterPlot(data, xAttribute, yAttribute) {

        scatterPlot.selectAll('*').remove();
        scatterPlot.insert("rect", ":first-child")
        .attr("width", scatter_width)
        .attr("height", scatter_height)
        .attr("fill", '#fafafa');
        data = data.filter(d => +d[xAttribute] && +d[yAttribute]);
        x.domain(d3.extent(data, d => +d[xAttribute]))
            .range([0, scatter_width])
            .nice();

        let xAxisGroup = scatterPlot.append("g")
            .attr("transform", `translate(0,${scatter_height})`)
            .call(d3.axisBottom(x));

        xAxisGroup.append("text")
            .attr("class", "my-axis-label")
            .attr("x", scatter_width / 2)
            .attr("y", 40) 
            .style("text-anchor", "middle")
            .attr('fill', 'black')
            .text(xAttribute);

        y.domain(d3.extent(data, d => +d[yAttribute]))
            .range([scatter_height, 0])
            .nice();

        let yAxisGroup = scatterPlot.append("g")
            .call(d3.axisLeft(y));

        yAxisGroup.append("text")
            .attr("class", "my-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -scatter_height / 2)
            .attr("y", -50)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr('fill', 'black')
            .attr('font-size', 30)
            .text(yAttribute);

        scatterPlot.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr('class', 'myCircles')
            .attr("cx", d => x(+d[xAttribute]))
            .attr("cy", d => y(+d[yAttribute]))
            .attr("r", 4)
            .style("fill", originalFill)
            .style('opacity', originalCircleOpacity)
            .style('cursor', 'pointer')
            .on('mouseenter', mouseOverCircle)
            .on('mouseleave', mouseLeaveCircle);

        let circleTooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        
        let xLine = scatterPlot.append("line")
            .style('stroke', 'white')
            .style('stroke-width', 1)
            .style("visibility", "hidden")
            .style("stroke-dasharray", "3 3")
            .lower();

        // Add guide lines for hovered circle - Y line
        let yLine = scatterPlot.append("line")
            .style('stroke', 'white')
            .style('stroke-width', 1)
            .style("visibility", "hidden")
            .style("stroke-dasharray", "3 3")
            .lower(); 
        
        scatterPlot.append("text")
            .attr("class", "my-title")
            .attr("x", scatter_width / 2)
            .attr("y", -10) 
            .style("text-anchor", "middle")
            .attr('fill', 'black')
            .attr('font-size', 24) 
            .text('Scatterplot of '+xAttribute + ' vs ' + yAttribute);

        function mouseOverCircle(event, d) {
            // tooltip
            circleTooltip
                .style('opacity', 0.9)
                .html(`State: ${d.State} <br> ${xAttribute}: ${d[xAttribute]} <br> ${yAttribute}: ${d[yAttribute]}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            //highlighting
            d3.selectAll(".myCircles")
                .style('opacity', 0.1)
            d3.select(this)
                .style('opacity', 0.9)
                // .attr('r', 8)
                .style('stroke', '#fff')
                .style('stroke-width', 2)
            xLine
                .style('visibility', 'visible')
                .attr('x1', x(d[xAttribute]))
                .attr('x2', x(d[xAttribute]))
                .attr('y1', y(0))
                .attr('y2', y(d[yAttribute]))
                .style('opacity', originalCircleOpacity)
            yLine
                .style('visibility', 'visible')
                .attr('x1', x(0))
                .attr('x2', x(d[xAttribute]))
                .attr('y1', y(d[yAttribute]))
                .attr('y2', y(d[yAttribute]))
                .style('opacity', originalCircleOpacity)
            
            // CODES TO CHANGE BAR APPEARANCE
            d3.selectAll('.myBar1')
            .style('opacity', bar_d => bar_d.State === d.State ? originalBarOpacity : hideBarOpacity)
            .style('stroke', bar_d => bar_d.State === d.State ? '#fff' : '')

        }
        function mouseLeaveCircle() {
            circleTooltip
                .style('opacity', 0)
            d3.selectAll('.myCircles')
                .style('opacity', originalCircleOpacity)
                .style('stroke', '')
            xLine.style('visibility', 'hidden')
            yLine.style('visibility', 'hidden')

            d3.selectAll('.myBar1')
            .style('opacity', originalBarOpacity)
            .style('stroke', '')
        }

    }

    function highlightMovies(stateName) {
        console.log('Highlighting movies for state:', stateName);
        d3.selectAll('.myCircles')
            .each(function (d) { 
                if (stateName === "all") {
                    d3.select(this).style('fill', originalFill); 
                } else {
                    if (d.State === stateName) {
                        d3.select(this)
                            .style('fill', 'red') 
                            .raise();
                    } else {
                        d3.select(this).style('fill', originalFill);
                    }
                }
            });
    }


})
