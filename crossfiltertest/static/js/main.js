var svg_width = 400
var svg_height = 400
var rows = 40
var columns = 40
colorScale = d3.scale.linear()
                    .domain([-10,-0.5,0,0.5,10])
                    .range(["#ca0020","#f4a582", "#f7f7f7","#92c5de", "#0571b0"]);
darkScale = d3.scale.linear()
                    .domain([0, 250])
                    .range([0, 1]);
xScale = d3.scale.linear()
                .domain([0,columns-1])
                .range([1,svg_width]);
yScale = d3.scale.linear()
                 .domain([0,rows-1])
                 .range([1,svg_height]);

function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}

function reduceAdd(d, v){
    d[0] = Math.floor(v.time.getTime()/(1000 * 60 * 60 * 24));
    d[1] = v.time.getDay() + 1;
    d[2] = v.time.getMonth() + 1;
    d[3] = v.time.getYear();
    d[4] += 1;
    return d;
}

function reduceRemove(d, v){
    d[4] -= 1;
    return d;
}


function reduceInitial(){
    return [1,1,1,0,0];
}

function orderValue(d){
    return d[4];
}

function linearFit(group){
    var i
        sumx = 0,
        sumx2 = 0,
        sumy = 0,
        sumxy = 0,
        cnt = 1;
    var n = group.length;
    for(i=0; i< n; i++){
        sumx += group[i].key;
        sumy += group[i].value;
        sumxy += (group[i].key * group[i].value);
        sumx2 += (group[i].key * group[i].key);
        cnt++;
    }
    var meanx = sumx/n,
        meany = sumy/n,
        meanxy = sumxy/n,
        meanx2 = sumx2/n;
    var denominator = (meanx2 - (meanx * meanx));
    var slope = 0;
    if(denominator != 0){
        slope = (meanxy - (meanx * meany))/denominator;
    }

    var yintercept = meany - (slope * meanx);
    return [slope, yintercept];
}

d3.csv("static/binned_outfile.txt", function(data){
    var ndx = crossfilter(data)
    var parseDate = d3.time.format("%Y-%m-%d").parse;
    data.forEach(function(d) {
	    d.time = parseDate(d.time.substring(0,10));
	    d.date = d.time.getDate();
    });
    var dateBinDim = ndx.dimension(function(d) {return [d.bin,d.time];});
    var dateHitsList = dateBinDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    var nested = d3.nest().key(function(d){ return d.key[0];})
            .entries(dateHitsList.all());
    chart = plot().data(nested);
    d3.select("#map").call(chart);
    $("#timecombo").change(function(){
        chart.filterIndex(this.value);
        d3.select("#map").call(chart);
    });
});

function render(method) {
    d3.select(this).call(method);
}

function plot() {

    var data,
        fitData,
        filterIndex = 0;

    function chart(div) {
        div.each(function() {
            var div = d3.select(this),
            g = div.select("svg");
            // Create the skeletal chart.
            if (g.empty()) {
                g = div.append("svg")
                    .attr("width", svg_width+20)
                    .attr("height", svg_height+20)
            }
            fitAllBins();
            plotData(g);
        });

        function fitAllBins(){
            n = data.length;
            fitData = [];
            for(i = 0; i < n ; i++){
                bin = data[i].key;
                keysArray = [];
                fullArray = [];
                dataCount = 0;
                count = 0;
                for(j = 0; j < data[i].values.length; j++){
                    filterKey = data[i].values[j].value[filterIndex];
                    dataIndex = keysArray.indexOf(filterKey);
                    if(dataIndex == -1){
                        keysArray[dataCount] = filterKey;
                        fullArray[dataCount] = {key : filterKey, value: 0};
                        dataIndex = dataCount;
                        dataCount += 1;
                    }
                    fullArray[dataIndex].value += data[i].values[j].value[4];
                    count += data[i].values[j].value[4];
                }
                fit = linearFit(fullArray);
                y = Math.floor(bin / 40);
                x = bin - (y * 40);

                fitData[i] = {x:x, y:y, value:fit[0], count:count};
            }
        }

        function plotData(g){
            g.selectAll(".bin").remove();
            g.selectAll(".bin")
                .data(fitData)
                .enter()
                .append("rect")
                .attr("class", "bin")
                .attr("x", function(d){ return xScale(d.x + 1);})
                .attr("y", function(d){ return svg_height-yScale(d.y + 1);})
                .attr("width", svg_width/columns)
                .attr("height", svg_height/rows)
                .attr("fill", function(d){
                                /*rgb = colorScale(d.value);
                                hsl = d3.hsl(rgb);
                                hsl.s = darkScale(d.count);*/
                                return colorScale(d.value);
                            })
                .attr("opacity", function(d){
                                return darkScale(d.count);
                            });
        }
    }
    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        return chart;
    };

    chart.filterIndex = function(_) {
        if (!arguments.length) return filterIndex;
        filterIndex = _;
        return chart;
    };
    return chart;
}

