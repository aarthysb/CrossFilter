var data = [
		{ id: 1,day: 1,date: "12/27/2012", code: "http_404", hits: 2},
		{ id: 2,day: 1,date: "12/27/2012", code: "http_200", hits: 190},
		{ id: 3,day: 1,date: "12/27/2012", code: "http_302", hits: 100},
		{ id: 4,day: 2,date: "12/28/2012", code: "http_404", hits: 3},
		{ id: 5,day: 2,date: "12/28/2012", code: "http_200", hits: 190},
		{ id: 6,day: 2,date: "12/28/2012", code: "http_302", hits: 75},
		{ id: 7,day: 3,date: "12/29/2012", code: "http_404", hits: 4},
		{ id: 8,day: 3,date: "12/29/2012", code: "http_200", hits: 100},
		{ id: 9,day: 3,date: "12/29/2012", code: "http_302", hits: 60},
		{ id: 10,day: 4,date: "12/30/2012", code: "http_404", hits: 5},
		{ id: 11,day: 4,date: "12/30/2012", code: "http_200", hits: 100},
		{ id: 12,day: 4,date: "12/30/2012", code: "http_302", hits: 55},
		{ id: 13,day: 5,date: "12/31/2012", code: "http_404", hits: 6},
		{ id: 14,day: 5,date: "12/31/2012", code: "http_200", hits: 100},
		{ id: 15,day: 5,date: "12/31/2012", code: "http_302", hits: 44},
		{ id: 16,day: 6,date: "01/01/2013", code: "http_404", hits: 7},
		{ id: 17,day: 6,date: "01/01/2013", code: "http_200", hits: 7},
		{ id: 18,day: 6,date: "01/01/2013", code: "http_302", hits: 90},
		{ id: 19,day: 7,date: "01/02/2013", code: "http_404", hits: 8},
		{ id: 20,day: 7,date: "01/02/2013", code: "http_200", hits: 6},
		{ id: 21,day: 7,date: "01/02/2013", code: "http_302", hits: 70},
		{ id: 22,day: 8,date: "01/03/2013", code: "http_404", hits: 9},
		{ id: 23,day: 8,date: "01/03/2013", code: "http_200", hits: 5},
		{ id: 24,day: 8,date: "01/03/2013", code: "http_302", hits: 28},
		{ id: 25,day: 9,date: "01/04/2013", code: "http_404", hits: 65},
		{ id: 26,day: 9,date: "01/04/2013", code: "http_200", hits: 4},
		{ id: 27,day: 9,date: "01/04/2013", code: "http_302", hits: 26},
		{ id: 28,day: 10,date: "01/05/2013", code: "http_404", hits: 11},
		{ id: 29,day: 10,date: "01/05/2013", code: "http_200", hits: 65},
		{ id: 30,day: 10,date: "01/05/2013", code: "http_302", hits: 20},
		{ id: 31,day: 11,date: "01/06/2013", code: "http_404", hits: 12},
		{ id: 32,day: 11,date: "01/06/2013", code: "http_200", hits: 50},
		{ id: 33,day: 11,date: "01/06/2013", code: "http_302", hits: 19},
		{ id: 34,day: 12,date: "01/07/2013", code: "http_404", hits: 13},
		{ id: 35,day: 12,date: "01/07/2013", code: "http_200", hits: 50},
		{ id: 36,day: 12,date: "01/07/2013", code: "http_302", hits: 11}
		];

var ndx = crossfilter(data);

var parseDate = d3.time.format("%m/%d/%Y").parse;

data.forEach(function(d) {
	d.date = parseDate(d.date);
});

function reduceAdd(d, v){
    d.list.push(v.id);
    d.sum += v.hits;
    return d;
}

function reduceRemove(d, v){
    d.list.splice(d.list.indexOf(v.id), 1);
    d.sum -= v.hits;
    return d;
}


function reduceInitial(){
    return {list:[], sum:0};
}

function orderValue(d){
    return d.sum;
}


var dateDim = ndx.dimension(function(d) {return d.day;});
var dateHitsList = dateDim.group().reduce(reduceAdd, reduceRemove, reduceInitial).order(orderValue);
var codeDim =ndx.dimension(function(d) {return d.code;});
var codeSumGroup = codeDim.group().reduce(reduceAdd, reduceRemove, reduceInitial).order(orderValue);
var minDate = dateDim.bottom(1)[0].date;
var maxDate = dateDim.top(1)[0].date;

function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}

var width = 500
var height = 400
var width2 = 300
var margin = {top: 10, right: 10, bottom: 20, left: 10}


var charts = [

    barChart()
        .dimension(dateDim)
        .group(dateHitsList)
      .x(d3.scale.linear()
        .domain([1,12])
        /*.domain([minDate, maxDate])*/
        .range([margin.left, width])),

    scatterPlot()
        .dimension(dateDim)
        .group(dateHitsList)
      .x(d3.scale.linear()
        .domain([1,12])
        /*.domain([minDate, maxDate])*/
        .range([margin.left, width]))
]

var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

renderAll();

// Renders the specified chart or list.
function render(method) {
    d3.select(this).call(method);
}

// Whenever the brush moves, re-rendering everything.
function renderAll() {
    chart.each(render);
}

window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
};

window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
};

function linearFit(group){
    print_filter(group);
    var i
        sumx = 0,
        sumx2 = 0,
        sumy = 0,
        sumxy = 0,
        cnt = 1;
    var n = group.length;
    for(i=0; i< n; i++){
        sumx += group[i].key;
        sumy += group[i].value.sum;
        sumxy += (group[i].key * group[i].value.sum);
        sumx2 += (group[i].key * group[i].key);
        cnt++;
    }
    var meanx = sumx/n,
        meany = sumy/n,
        meanxy = sumxy/n,
        meanx2 = sumx2/n;
    var slope = (meanxy - (meanx * meany))/(meanx2 - (meanx * meanx));
    var yintercept = meany - (slope * meanx);
    return [slope, yintercept];
}

$("#combo").change(function(){
    var selected = $(this).val();
    if(selected == "all"){
        codeDim.filterAll();
    }else{
        codeDim.filter(selected);
    }
    renderAll();
});

function barChart() {
    if (!barChart.id) barChart.id = 0;

    var x,
        y = d3.scale.linear().range([height, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;

    function chart(div) {

        y.domain([0, group.top(1)[0].value.sum]);

        div.each(function() {
            var div = d3.select(this),
            g = div.select("g");

            // Create the skeletal chart.
            if (g.empty()) {
                div.select(".title").append("a")
                    .attr("href", "javascript:reset(" + id + ")")
                    .attr("class", "reset")
                    .text("reset")
                    .style("display", "none");

                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                g.append("clipPath")
                    .attr("id", "clip-" + id)
                    .append("rect")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height  + margin.top + margin.bottom);

                g.selectAll(".bar")
                    .data(["background", "foreground"])
                    .enter().append("path")
                    .attr("class", function(d) { return d + " bar"; })
                    .datum(group.all());

                g.selectAll(".foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")");

                g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(axis);

                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }

            // Only redraw the brush if set externally.
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.select(".title a").style("display", brush.empty() ? "none" : null);
                if (brush.empty()) {
                    g.selectAll("#clip-" + id + " rect")
                    .attr("x", 0)
                    .attr("width", width);
                } else {
                    var extent = brush.extent();
                    g.selectAll("#clip-" + id + " rect")
                    .attr("x", x(extent[0]))
                    .attr("width", x(extent[1]) - x(extent[0]));
                }
            }

            g.selectAll(".bar").attr("d", barPath);
        });

        function barPath(groups) {
            var path = [],
            i = -1,
            n = groups.length,
            d;
            while (++i < n) {
            d = groups[i];
            path.push("M", x(d.key), ",", height, "V", y(d.value.sum), "h9V", height);
            }
            return path.join("");
        }

        function resizePath(d) {
            var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
            return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
        }
    }

    brush.on("brushstart.chart", function() {
    var div = d3.select(this.parentNode.parentNode.parentNode);
    div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
        var g = d3.select(this.parentNode),
            extent = brush.extent();
        if (round) g.select(".brush")
            .call(brush.extent(extent = extent.map(round)))
            .selectAll(".resize")
            .style("display", null);
        g.select("#clip-" + id + " rect")
            .attr("x", x(extent[0]))
            .attr("width", x(extent[1]) - x(extent[0]));
        dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
        if (brush.empty()) {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title a").style("display", "none");
            div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
            dimension.filterAll();
        }
    });

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
    };

    chart.filter = function(_) {
        if (_) {
            brush.extent(_);
            dimension.filterRange(_);
        } else {
            brush.clear();
            dimension.filterAll();
        }
        brushDirty = true;
        return chart;
    };

    chart.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return chart;
    };

    chart.round = function(_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
    };

    return d3.rebind(chart, brush, "on");
}

function scatterPlot() {
    if (!scatterPlot.id) scatterPlot.id = 0;

    var x,
        y = d3.scale.linear().range([height-10, 0]),
        id = scatterPlot.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;


    function chart(div) {

        y.domain([0, group.top(1)[0].value.sum]);

        div.each(function() {
            var div = d3.select(this),
            g = div.select("g");

            // Create the skeletal chart.
            if (g.empty()) {
                div.select(".title").append("a")
                    .attr("href", "javascript:reset(" + id + ")")
                    .attr("class", "reset")
                    .text("reset")
                    .style("display", "none");

                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                g.append("clipPath")
                    .attr("id", "clip-" + id)
                    .append("rect")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

                g.selectAll(".foreground.dot")
                    .attr("clip-path", "url(#clip-" + id + ")");

                g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(axis);

                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }

            // Only redraw the brush if set externally.
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.select(".title a").style("display", brush.empty() ? "none" : null);
                if (brush.empty()) {
                    g.selectAll("#clip-" + id + " rect")
                    .attr("x", 0)
                    .attr("width", width);
                } else {
                    var extent = brush.extent();
                    g.selectAll("#clip-" + id + " rect")
                    .attr("x", x(extent[0]))
                    .attr("width", x(extent[1]) - x(extent[0]));
                }
            }


            g.call(drawCircle);
            g.call(drawLine);
        });

        function drawCircle(g){

            selection = g.selectAll(".dot")
                        .data(group.all())

            selection.exit().remove()

            selection.attr("r", 3.5)
                    .attr("cx", function(d) {return x(d.key)})
                    .attr("cy", function(d) {return y(d.value.sum)})

            selection.enter()
                    .append("circle")
                    .attr("r", 3.5)
                    .attr("cx", function(d) {return x(d.key)})
                    .attr("cy", function(d) {return y(d.value.sum)})
                    .attr("class", "dot");

        }

        function drawLine(g){
            parameters = linearFit(group.all());
            var x1 = 1;
            var y1 = parameters[0] + parameters[1];
            var x2 = 12;
            var y2 = parameters[0] * group.all().length + parameters[1];
            var trendData = [[x1,y1,x2,y2]];

            g.selectAll(".trendline").remove();

            trendline = g.selectAll(".trendline")
                                    .data(trendData)
                                    .enter()
                                    .append("line")
                                    .attr("class", "trendline")
                                    .attr("x1", function(d) { return x(d[0]); })
                                    .attr("y1", function(d) { return y(d[1]); })
                                    .attr("x2", function(d) { return x(d[2]); })
                                    .attr("y2", function(d) { return y(d[3]); })
                                    .attr("stroke", "black")
                                    .attr("stroke-width", 1);

        }

        function resizePath(d) {
            var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
            return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
        }
    }

    brush.on("brushstart.chart", function() {
    var div = d3.select(this.parentNode.parentNode.parentNode);
    div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
        var g = d3.select(this.parentNode),
            extent = brush.extent();
        if (round) g.select(".brush")
            .call(brush.extent(extent = extent.map(round)))
            .selectAll(".resize")
            .style("display", null);
        g.select("#clip-" + id + " rect")
            .attr("x", x(extent[0]))
            .attr("width", x(extent[1]) - x(extent[0]));
        dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
        if (brush.empty()) {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title a").style("display", "none");
            div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
            dimension.filterAll();
        }
    });

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
    };

    chart.filter = function(_) {
        if (_) {
            brush.extent(_);
            dimension.filterRange(_);
        } else {
            brush.clear();
            dimension.filterAll();
        }
        brushDirty = true;
        return chart;
    };

    chart.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return chart;
    };

    chart.round = function(_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
    };

    return d3.rebind(chart, brush, "on");
}
