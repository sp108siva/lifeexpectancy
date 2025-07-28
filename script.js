// margins & dimensions
const margin = { top: 40, right: 200, bottom: 50, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select('#canvas')
  .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// State
const state = {
  currentSlide: 0,
  selectedCountry: null,
  showProjection: false
};

let data;          // will hold CSV rows
let colorScale;    // region → color

// Scales & axes
const xScale = d3.scaleLinear().domain([1960, 2030]).range([0, width]);
const yScale = d3.scaleLinear().domain([30, 85]).range([height, 0]);
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
const yAxis = d3.axisLeft(yScale);

// Load data and initialize
d3.csv('life_expectancy.xlsx', d => ({
  country: d.country,
  year: +d.year,
  lifeExp: +d.life_expectancy //,
  //region: d.region
})).then(raw => {
  data = raw;
  
  // build a color scale by region
  const regions = Array.from(new Set(data.map(d => d.country))); //changed to country from region
  colorScale = d3.scaleOrdinal()
                 .domain(regions)
                 .range(d3.schemeTableau10);

  drawAxes();
  initControls();
  updateScene();
});

// draw axes once
function drawAxes() {
  svg.append('g')
     .attr('class','x-axis')
     .attr('transform',`translate(0,${height})`)
     .call(xAxis);

  svg.append('g')
     .attr('class','y-axis')
     .call(yAxis);
}

// hook up Next/Back
function initControls() {
  d3.select('#next').on('click', () => {
    if (state.currentSlide < 4) state.currentSlide++;
    updateScene();
  });
  d3.select('#back').on('click', () => {
    if (state.currentSlide > 0) state.currentSlide--;
    updateScene();
  });
}

// main dispatcher
function updateScene() {
  // clear
  svg.selectAll('.plot-layer').remove();
  d3.select('#annotation').html('');
  d3.select('#controls').html('');

  // enable/disable nav
  d3.select('#back').attr('disabled', state.currentSlide === 0 ? true : null);
  d3.select('#next').attr('disabled', state.currentSlide === 4 ? true : null);

  switch (state.currentSlide) {
    case 0: renderSlide0(); break;
    case 1: renderSlide1(); break;
    case 2: renderSlide2(); break;
    case 3: renderSlide3(); break;
    case 4: renderSlide4(); break;
  }
}

// --------------------------
// SLIDE 0: 1960 baseline
// --------------------------
function renderSlide0() {
  const layer = svg.append('g').attr('class','plot-layer');

  // filter 1960
  const year0 = data.filter(d => d.year === 1960);

  layer.selectAll('circle')
    .data(year0)
    .enter().append('circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.lifeExp))
      .attr('r', 4)
      .attr('fill', d => colorScale(d.country)) //changed to country from region
      .attr('opacity', 0.8);

  // Annotation: high vs low cluster
  const ann = [
    {
      note: {
        title: 'Wide income gap',
        label: 'High‐income countries start around 70+ yrs, low‐income around 35–45 yrs'
      },
      x: xScale(1960) + 20,
      y: yScale(60),
      dx: 80,
      dy: -60
    }
  ];
  const makeAnn = d3.annotation()
    .annotations(ann)
    .type(d3.annotationCallout)
    .accessors({ x: d => d.x, y: d => d.y });
  
  svg.append('g')
     .attr('class','annotation-group')
     .call(makeAnn);
}

// --------------------------
// SLIDE 1: East Asia 1960–1990
// --------------------------
function renderSlide1() {
  const layer = svg.append('g').attr('class','plot-layer');

  // pick a few East Asian countries
  const focus = ['China','Japan','South Korea'];
  const filtered = data
    .filter(d => focus.includes(d.country) && d.year <= 1990);

  // nest by country
  const nest = d3.group(filtered, d => d.country);
  const lineGen = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.lifeExp));

  layer.selectAll('path')
    .data(Array.from(nest.values()))
    .join('path')
      .attr('d', d => lineGen(d))
      .attr('fill','none')
      .attr('stroke', d => colorScale(d[0].country)) // changed to country from region
      .attr('stroke-width', 2);

  // Annotation
  const ann = [
    {
      note: {
        title: "East Asia's Gains",
        label: 'China, Japan & South Korea rose ~20 yrs in three decades'
      },
      x: xScale(1990) - 10,
      y: yScale(nest.get('China').find(d => d.year===1990).lifeExp),
      dx: -120,
      dy: -30
    }
  ];
  const makeAnn = d3.annotation()
    .annotations(ann)
    .type(d3.annotationCallout)
    .accessors({ x: d => d.x, y: d => d.y });

  svg.append('g')
     .attr('class','annotation-group')
     .call(makeAnn);

  // tooltip on hover
  layer.selectAll('circle')
    .data(filtered)
    .enter().append('circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.lifeExp))
      .attr('r', 3)
      .attr('fill', '#555')
      .on('mouseover', (e,d) => {
        const tip = d3.select('#controls')
          .append('div')
            .attr('class','tooltip')
            .style('position','absolute')
            .style('left', `${e.pageX}px`)
            .style('top', `${e.pageY}px`)
            .html(`<strong>${d.country}</strong><br/>${d.year}: ${d.lifeExp} yrs`);
      })
      .on('mouseout', () => d3.selectAll('.tooltip').remove());
}

// --------------------------
// SLIDE 2–4: (stub for you)
// --------------------------
function renderSlide2() {
  // e.g. sub-Saharan Africa plateaus + drill‐down
}

function renderSlide3() {
  // pandemic dips & recoveries
}

function renderSlide4() {
  // projections to 2030 & call to action
}
