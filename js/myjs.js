// variables
    // for taxiid selector
var select_data
var select_value
    // for map
var bounds = null;
var gen_map;
var tile_layer;
var layer;
var show_map;
var color_type = ['#4BC0C0',
'#36A2EB',
'#9966FF']
    // for json object
var gen_data;

var ctx = document.getElementById("totalChart");
var data 

// individual chart
var totalChart 
var hourChart
var taxi_id
var sel = $('<select id="select_id">').appendTo('#selector_taxiid');
$.getJSON("result/json_data/taxi_id.json", function(json) {
    taxi_id = json;
    $(json).each(function() {
        sel.append($("<option>").attr('value',this).text(this));
    });
});
var temp = []
while(temp.push(4)<24);
var datahour = {
    labels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
    datasets: [
        {
            label: 'Type1',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            data: temp
        },{
            label: 'Type2',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            data: temp
        },{
            label: 'Type3',
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            borderColor: 'rgba(153, 102, 255, 0.9)',
            data: temp
        }
    ]
}


$(document).ready(function(){
    $.getJSON('result/json_data/gen_data.json', function(json){
        gen_data = json;
    });

    data = {
        datasets: [{
            data: [1, 1, 1],
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 0.9)'
            ],
            borderwidth: 1
        }],
    
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Type1',
            'Type2',
            'Type3',
        ],
        
    };

    if(document.getElementById('totalChart')){
        totalChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: Chart.defaults.doughnut
        });
    }
    if(document.getElementById('hourChart')){
        console.log('render init')
        hourChart = new Chart(document.getElementById('hourChart'), {
            type: 'bar',
            data: datahour,
            options: {
                title: {
                    display: true,
                    text: 'กราฟผลการวิคเคราะห​์พฤติกรรมการหาผู้โดยสารของรถแท็กซี่ ID : '+select_value+' ในช่วงเวลาต่าง ๆ'
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        })
    }
    
})


function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
}
function addListData(chart, label, data){
    for(var i =0; i<label.length; i++){
        addData(chart, label[i], data[i]);
    }
    chart.update()
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}

// ---- generate select for id ----

function getCol(matrix, col){
    var column = [];
    for(var i=0; i<matrix.length; i++){
        column.push(matrix[i][col]);
    }
    return column;
}
$( "#select_id" ).change(function(){
    select_value = ($('#select_id').val())
    select_data = $(gen_data)
          .filter(function (i,n){
              return n.taxi_id===select_value;
          });
    var type1 = $(select_data)
          .filter(function(i,n){
              return n.type === 1;
          })
    var type2 = $(select_data)
          .filter(function(i,n){
              return n.type === 2;
          })
    var type3 = $(select_data)
          .filter(function(i,n){
              return n.type === 3;
          })
    var countHour = [];
    while(countHour.push([0,0,0]) < 24);
    $(select_data).each(function(){
        countHour[this.hour][this.type-1] = countHour[this.hour][this.type-1]+1
    })
    removeData(totalChart);
    removeData(totalChart);
    removeData(totalChart);
    addListData(totalChart, ['Type1', 'Type2', 'Type3'], [type1.length, type2.length, type3.length]);

    // datahour.datasets[i].data
    for(var i=0; i<3; i++){
        datahour.datasets[i].data = getCol(countHour, i)
        console.log(getCol(countHour, i))
    }
    hourChart.destroy();
    console.log(datahour.datasets)
    if(document.getElementById('hourChart')){
        hourChart = new Chart(document.getElementById('hourChart'), {
            type: 'bar',
            data: datahour,
            options: {
                title: {
                    display: true,
                    text: 'กราฟผลการวิคเคราะห​์พฤติกรรมการหาผู้โดยสารของรถแท็กซี่ ID : '+select_value+' ในช่วงเวลาต่าง ๆ'
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        })
    }
    //  create visualize map
    
    if(document.getElementById('show_map')){
        console.log('should ma na ja')
        console.log(select_data)
        show_map.remove()
        show_map = L.map('show_map',
        {
            center: [13.741229,100.554225],
            zoom: 10,
            maxBounds: bounds,
            layers: [],
            worldCopyJump: false,
            crs: L.CRS.EPSG3857
        });
        L.control.scale().addTo(show_map);
        tile_layer = L.tileLayer(
            'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
            {
            "attribution": null, 
            "detectRetina": false, 
            "maxZoom": 18, 
            "minZoom": 1, 
            "noWrap": false, 
            "subdomains": "abc"
            }
            ).addTo(show_map);
        // show_map.addLayer(shelterMarkers);
        var layer_control = {
            base_layers : { "openstreetmap" : tile_layer, },  
        }
        var layer = L.control.layers(
            layer_control.base_layers,
            {},
            {position: 'topright',
             collapsed: true,
             autoZIndex: true,
             hideSingleBase: true
            }).addTo(show_map);
        var counter = 0;
        $(select_data).each(function(){
            counter = counter+1
            console.log(JSON.parse(this.line)[0])
            console.log('ma la')
            var feature_group = L.featureGroup().addTo(show_map);
            console.log(this.type)
            L.circle(JSON.parse(this.line)[0],{color: color_type[this.type-1]}).addTo(feature_group);
            L.polyline(JSON.parse(this.line), {color: color_type[this.type-1]})
                .bindPopup('at '+this.hour+"o'clock")
                .addTo(feature_group)
            // var feature_group = L.featureGroup([L.circle(JSON.parse(this.line)[0]), L.polyline(JSON.parse(this.line)).bindPopup('at '+this.hour+"o'clock")])
            layer.addOverlay(
                feature_group, counter
            ).addTo(show_map)
            
            // var feature_group = L.featureGroup().addTo(show_map);
            // L.polyline(this.line1)
            //     .bindTooltip("type : "+this.type+", at "+this.hour+"o'clock.")
            //     .addTo(feature_group);
            // layer.addOverlay( feature_group, this.type+':'+this.hour)
        })
    }
})

// ---- create a map ----

var show_map = document.getElementById('show_map');
if(show_map){
    console.log('in')
    select_value = ($('#select_id').val());
    console.log(select_value)
    console.log(select_data)
    show_map = L.map(
        'show_map',
        {center: [13.741229,100.554225],
        zoom: 14,
        maxBounds: bounds,
        layers: [],
        worldCopyJump: false,
        crs: L.CRS.EPSG3857
       });
    L.control.scale().addTo(show_map);
    
    var tile_layer_8268462282db4c6da50a17230d137b04 = L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        {
        "attribution": null, 
        "detectRetina": false, 
        "maxZoom": 18, 
        "minZoom": 1, 
        "noWrap": false, 
        "subdomains": "abc"
        }
        ).addTo(show_map);
        
}
