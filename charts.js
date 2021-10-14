function init() {
  var selector = d3.select("#selDataset"); 

  // populate the select options with the list of sample names
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector.append("option").text(sample).property("value", sample);
    });

    // use the first sample to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

init();  // initialize the dashboard

// get new data each time a new sample is selected
function optionChanged(newSample) {
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0]; // contains all personal data in array
   
    var PANEL = d3.select("#sample-metadata");
    PANEL.html("");  // clear any existing metadata

    // iterate through result array and display "KEY: value" for each element
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// display data for specified sample id from drop-down menu
function buildCharts(sample) { 
  d3.json("samples.json").then((data) => {
    var samples = data.samples;  // samples array
    var filteredSample = samples.filter(sampleObj => sampleObj.id == sample);
    var sampleResult = filteredSample[0]; // match on filtered id
    
    var metaDatas = data.metadata  // metaData array
    var filteredMetadata = metaDatas.filter(sampleObj => sampleObj.id == sample);
    var metaResult = filteredMetadata[0];

    var washingFreq = parseFloat(metaResult.wfreq);  // converted to float
    var otu_ids = sampleResult.otu_ids;
    var otu_labels = sampleResult.otu_labels;
    var sample_values = sampleResult.sample_values;  // sorted in descending order
    
    // BAR CHART
    var yticks = otu_ids.slice(0,10).map(otuID => `OTU ${otuID}`).reverse(); 
    var barTrace = [
      {
        x: sample_values.slice(0,10).reverse(),
        y: yticks,
        text: otu_labels.slice(0,10).reverse(),
        type: "bar",
        orientation: "h"
      }
    ]; 
    var barLayout = {title: "Top 10 Bacteria Cultures Found"};   
    Plotly.newPlot("bar", barTrace, barLayout);

    // BUBBLE CHART
    var bubbleTrace = [
      {
        x: otu_ids,
        y: sample_values,
        text: otu_labels,
        type: "bubble",
        mode: "markers",
        marker: {
          size: sample_values,
          color: otu_ids,
        }
    }];

    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: {title: "OTU ID"}       
    };

    Plotly.newPlot("bubble", bubbleTrace, bubbleLayout); 


    // GAUGE CHART
    var gaugeTrace = [
      {
        value: washingFreq,
        type: "indicator",
        mode: "gauge+number",
        title: {text: "Weekly Belly Button Washing Frequency"},
        gauge: {
          axis: {range: [0,10]},
          bar: {color: "black"},
          steps: [
            {range: [0,2], color: "red"},
            {range: [2,4], color: "orange"},
            {range: [4,6], color: "yellow"},
            {range: [6,8], color: "yellowgreen"},
            {range: [8,10], color: "green"}
          ]
        }

      }
    ];

    var gaugeLayout = {
      width: 500,
      height: 400
    };

    Plotly.newPlot("gauge", gaugeTrace, gaugeLayout);

  });
}

