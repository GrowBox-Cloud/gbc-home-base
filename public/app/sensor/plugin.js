if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["sensor"];

    function Remap(value, from1, to1, from2, to2) {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

    function rndColor() {
        return (Math.random() * 256 | 0) + ", " + (Math.random() * 256 | 0) + ", " + (Math.random() * 256 | 0)
    }


    function getports(cb) {
        var bindings = require('@serialport/bindings');

        var $ports = [];
        bindings.list().then(function(ports) {
            ports.forEach(port => {
                $ports.push(port)
            })
            if (cb) cb($ports)
        })
    }

    
    function wheel(WheelPos){//0 - 255
      WheelPos = 255 - WheelPos;
      if(WheelPos < 85) {
      return [255 - WheelPos * 3, 0, WheelPos * 3]
      }
      if(WheelPos < 170) {
        WheelPos -= 85;
      return [0, WheelPos * 3, 255 - WheelPos * 3];
      }
      WheelPos -= 170;
      return [WheelPos * 3, 255 - WheelPos * 3, 0];
    }
    
    function findCanvasPos(obj) {
        var curleft = 0, curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return { x: curleft, y: curtop };
        }
        return undefined;
    }

    function candleFi(ts) {

        var CANDLE_TIME = {
            MIN_1: 1000 * 60,
            MIN_5: 1000 * 60 * 5,
            MIN_15: 1000 * 60 * 15,
            MIN_30: 1000 * 60 * 35,
            HOUR_1: 1000 * 60 * 60,
            HOUR_4: (1000 * 60 * 60) * 4,
            HOUR_6: (1000 * 60 * 60) * 6,
            HOUR_12: (1000 * 60 * 60) * 12,
            DAY_1: (1000 * 60 * 60) * 24
        }

        // ms in 5 minutes. 
        var out = {};
        for (var i in CANDLE_TIME) {
            var coff = CANDLE_TIME[i];


            out[i] = new Date(
                Math.floor(ts / coff) * coff).getTime();
        }

        return out;

    }

    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            sensor: {
                init: function(app, app_type, app_arguments) {

                    imports.app.on("settings", function(parameters) {
                        if (app_type == "node") {
                            var running_sensors = {};


                            app.on("user_ready", function() {
                                // lastMID
                                app.on("sensor_data", function(data) {
                                    if (data.ID) {
                                        var TSfi = candleFi(data.TS);

                                        var SD = app.user.get("sensor_data_" + data.ID);

                                        var $gun_d = SD.get(data.TS).put(data);

                                        for (var i in TSfi) {
                                            SD.get(TSfi[i]).get(data.TS).put($gun_d)
                                        }
                                    }
                                })

                            })
                            app.io.on('connection', (socket) => {


                                // console.log('a user connected');
                                socket.on("get_sensors", function(cb) {
                                    app.emit("get_settings", function(parameters) {
                                        getports(function(ports) {
                                            if (cb) cb(ports, parameters.sensors);
                                        })
                                    });
                                });

                                socket.on("set_sensor", function(path, option, value, cb) {
                                    app.emit("get_settings", function(parameters) {
                                        if (!parameters.sensors[path]) parameters.sensors[path] = {};
                                        parameters.sensors[path][option] = value;
                                        app.emit("set_settings", "sensors", parameters.sensors, function() {
                                            console.log("sensor setting changes", path, option, value)
                                            if (cb) cb(path);
                                        });
                                    });
                                })

                                socket.on("send_sensor", function(path, data, cb) {
                                    if (running_sensors[path]) {
                                        if (running_sensors[path].port.isOpen) {
                                            running_sensors[path].port.write(data + ";");
                                            if (cb) cb();
                                        }
                                    }
                                })

                                socket.on("get_sensor_data", function(path, cb) {
                                    if (running_sensors[path]) {
                                        running_sensors[path].getData(cb)
                                    }
                                })


                                socket.on("get_camera_image", function(cb) {
                                    snapPicture(cb)
                                })

                            });

                            function startCheck() {
                                app.emit("get_settings", function(parameters) {
                                    if (parameters.sensors) {
                                        for (var s in parameters.sensors) {
                                            var s_config = parameters.sensors[s];
                                            if (s_config.auto_connect) {
                                                if (!running_sensors[s]) {
                                                    running_sensors[s] = SensorClass(s, app);
                                                }
                                                else if (running_sensors[s].port.isOpen) {
                                                    // console.log(s, running_sensors[s].values.ID)
                                                }
                                                else {
                                                    // console.log(s, "is not open, trying to reopen")
                                                    // if (running_sensors[s].heartbeatFAIL >= 3) {

                                                    //     (function(s) {
                                                    //         running_sensors[s].destroy(function() {
                                                    //             delete running_sensors[s];
                                                    //         })
                                                    //     })(s)
                                                    // }
                                                    // else {
                                                    try {
                                                        var ts = running_sensors[s].port.open();
                                                        console.log(s, "is not open, trying to reopen");
                                                    }
                                                    catch (e) {
                                                        // console.log("err","open fail2")
                                                    }
                                                    // }
                                                }
                                            }
                                            else {
                                                if (running_sensors[s])
                                                    (function(s) {
                                                        console.log("disconnecting ", s)
                                                        running_sensors[s].destroy(function() {
                                                            delete running_sensors[s];
                                                            console.log("disconnected ", s)
                                                        })
                                                    })(s)
                                            }
                                        }
                                    }
                                })
                            }
                            if (!parameters.sensors) {
                                parameters.sensors = {};
                                app.emit("set_settings", "sensors", parameters.sensors, function() {

                                });
                            }

                            setInterval(startCheck, 15000);
                            setTimeout(startCheck, 1000);



                            /*
                                return;
    

                            */
                        }
                        else if (app_type == "browser") {
                            var $ = require("$");
                            app.io.on("sensor_data", function(sensor_data) {
                                                                app.emit("sensor_data",sensor_data);
                            });
                            if (app_arguments.page == "sensors" && app_arguments.path) {
                                app.$page_name.text("Sensor " + app_arguments.path);



                                var sensorsList = $("<div class='' id='sensor_list' class='text-align:center;'/>");

                                sensorsList.appendTo(app.$head);


                                var sensorDataContainer = $("<div class='d-flex justify-content-center flex-wrap' id='sensorData'>");
                                sensorDataContainer.appendTo(sensorsList);

                                var chartContainer = $("<div class='d-flex justify-content-center' id='chartContainer'>");
                                chartContainer.appendTo(sensorsList);

                                var chart = loadChart(chartContainer[0]);
                                var chartData = {};
                                var charSeries = {};

                                app.io.on("sensor_data", function(sensor_data) {
                                    if (sensor_data.path == app_arguments.path) {
                                        var data = sensor_data;

                                        for (var j in data) {
                                            (function(j) {
                                                if (j == "ID") return;
                                                if (j.toUpperCase() == "PATH") return;
                                                if (j == "TS") return;
                                                if (j == "MID") return;


                                                if (j == "water1a") data[j] = Remap(data[j], 4094, 0, 1, 0);


                                                var s = $(`#sensor-${j}`);
                                                var value_; // = data[j];

                                                var chartable = true;
                                                var changeable;

                                                switch (j) {
                                                    case 'RGB0':
                                                        value_ = data[j].join(",") + "<div style='width:30px:height:30px;border:black 1px solid;background-color:rgb(" + data[j].join(",") + ")'>&nbsp;</div>"
                                                        chartable = false;
                                                        break;
                                                    case 'RGB1':
                                                        value_ = data[j].join(",") + "<div style='width:30px:height:30px;border:black 1px solid;background-color:rgb(" + data[j].join(",") + ")'>&nbsp;</div>"
                                                        chartable = false;
                                                        break;
                                                    case 'RGB_A':
                                                        value_ = data[j] + "<div style='width:30px:height:30px;border:black 1px solid;background-color:rgba(0,0,0," + data[j] + ")'>&nbsp;</div>"
                                                        chartable = false;
                                                        changeable = function() {
                                                            var dialog = $(`<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                                  <div class="modal-dialog" role="document">
                                                                    <div class="modal-content">
                                                                      <div class="modal-header">
                                                                        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                                                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                                          <span aria-hidden="true">&times;</span>
                                                                        </button>
                                                                      </div>
                                                                      <div class="modal-body">
                                                                        Set Alpha
                                                                        <input />
                                                                      </div>
                                                                      <div class="modal-footer">
                                                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                                                        <button type="button" class="btn btn-primary">Save changes</button>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                            </div>`);

                                                            dialog.find(".btn-primary").click(function() {
                                                                var val = dialog.find("input").val();
                                                                app.io.emit("send_sensor", sensor_data.path, "rgb_a=" + val);
                                                            });

                                                            dialog.modal("show");
                                                        }
                                                        break;
                                                    case 'W1':
                                                        value_ = 4095 - parseFloat(data[j].join("."))
                                                        value_ = Remap(value_,0,4095,0,100).toFixed(2);
                                                        break;
                                                    case 'W2':
                                                        value_ = 4095 - parseFloat(data[j].join("."));
                                                        if(value_ < 100) return;;
                                                        value_ = Remap(value_,0,4095,0,100).toFixed(2);
                                                        break;
                                                    case 'W2A':
                                                        value_ = 4095 - parseFloat(data[j]);
                                                        if(value_ < 100) return;;
                                                        value_ = Remap(value_,0,4095,0,100).toFixed(2);
                                                        break;
                                                    case 'RGB_R':
                                                    case 'R1':
                                                    case 'R2':
                                                    case 'R3':
                                                    case 'R4':
                                                        chartable = false;
                                                    default:
                                                        value_ = data[j];
                                                }

                                                if (!s[0]) {
                                                    //border-primary
                                                    $(`<div id="sensor-${j}"class="card  mb-3 mr-3" style="max-width: 20rem;">
                                                        <div class="card-header">${j}</div>
                                                        <div class="card-body">
                                                            <h4 class="card-title">${value_}</h4>
                                                        </div>
                                                    </div>`).click(function() {
                                                        if (chartable)
                                                            $(this).toggleClass("border-primary")
                                                        else if (changeable) changeable();
                                                    }).appendTo(sensorDataContainer);
                                                }
                                                else {
                                                    s.find(".card-title").html(value_);
                                                }

                                                var isToggeled = $(`#sensor-${j}`).hasClass("border-primary");


                                                if (chartable) {
                                                    if (!chartData[j]) chartData[j] = [];
                                                    chartData[j].push({ time: data.TS, value: value_ })

                                                    if (isToggeled) {
                                                        // var t = (new Date(data.TS)).toString();


                                                        if (!charSeries[j]) charSeries[j] = chart.addAreaSeries({
                                                            // topColor: 'rgba(67, 83, 254, 0.7)',
                                                            // bottomColor: 'rgba(67, 83, 254, 0.3)',
                                                            topColor: 'rgba(0,0,0, 0)',
                                                            bottomColor: 'rgba(0,0,0, 0)',
                                                            lineColor: 'rgba(' + rndColor() + ', 1)',
                                                            lineWidth: 2,
                                                        });

                                                        charSeries[j].setData(chartData[j]);
                                                    }
                                                    else if (!isToggeled) {
                                                        if (charSeries[j]) {
                                                            chart.removeSeries(charSeries[j]);
                                                            delete charSeries[j];
                                                        }
                                                    }
                                                }
                                            })(j);
                                            // if (callback) callback();
                                        }



                                        var sr = $(`#sensor-${j}-sendCode`);

                                        if (!sr[0])
                                            $(`<div id="sensor-${j}-sendCode"class="card  mb-3 mr-3" style="max-width: 20rem;">
                                            <div class="card-header">${j}</div>
                                            <div class="card-body">
                                                <h4 class="card-title"><button>Send Code</button></h4>
                                            </div>
                                        </div>`).click(function() {
                                                var dialog = $(`<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                                  <div class="modal-dialog" role="document">
                                                                    <div class="modal-content">
                                                                      <div class="modal-header">
                                                                        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                                                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                                          <span aria-hidden="true">&times;</span>
                                                                        </button>
                                                                      </div>
                                                                      <div class="modal-body">
                                                                           Code:
                                                                        <input />
                                                                      </div>
                                                                      <div class="modal-footer">
                                                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                                                        <button type="button" class="btn btn-primary">Save changes</button>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                            </div>`);

                                                dialog.find(".btn-primary").click(function() {
                                                    var val = dialog.find("input").val();
                                                    app.io.emit("send_sensor", sensor_data.path, val);
                                                });

                                                dialog.modal("show");
                                            }).appendTo(sensorDataContainer);
                                    }
                                });

/*
                                function loadSensors(ports_advailable, ports_enabled) {
                                    sensorsList.html("");

                                    var sensorDataContainer = $("<div class='d-flex justify-content-center flex-wrap' id='sensorData'>");
                                    sensorDataContainer.appendTo(sensorsList);

                                    var pictureContainer = $("<div class='d-flex justify-content-center' id='picture'>");
                                    pictureContainer.appendTo(sensorsList);

                                    var chartContainer = $("<div class='d-flex justify-content-center' id='chartContainer'>");
                                    chartContainer.appendTo(sensorsList);

                                    var sensoraddContainer = $("<div class='d-flex justify-content-center mt-3' id='sensorAdd'>");
                                    sensoraddContainer.appendTo(sensorsList);

                                    // console.log(ports_advailable, ports_enabled)
                                    var unusedPORTS = [];
                                    var $ports = {};

                                    for (var i in ports_advailable) {
                                        $ports[ports_advailable[i].path] = ports_advailable[i];

                                        var f = false;
                                        for (var j in ports_enabled) {
                                            if (ports_enabled[j] == ports_advailable[i].path) f = true;
                                        }
                                        if (f == false)
                                            unusedPORTS.push(ports_advailable[i].path);
                                    }

                                    if (unusedPORTS.length) {
                                        var addForm = $("<form>");

                                        var dropdown = $("<select class='form-control'>")
                                        for (var i in unusedPORTS) {

                                            $("<option value='" + unusedPORTS[i] + "'>" + unusedPORTS[i] + ($ports[unusedPORTS[i]].manufacturer ? " - " + $ports[unusedPORTS[i]].manufacturer : "") + "</option>").appendTo(dropdown)

                                        }
                                        dropdown.appendTo(addForm)

                                        var addbtn = $("<button class='form-control'>Add</button>");

                                        addbtn.appendTo(addForm)
                                        addbtn.click(function() {
                                            // console.log(dropdown.val())

                                            app.io.emit("add_sensor", dropdown.val(), function() {

                                                app.io.emit("list_sensors", loadSensors)

                                            })
                                        })

                                        addForm.appendTo(sensoraddContainer)

                                    }



                                    function get_sensor_data($ports_enabled, callback) {
                                        var timeNOW = (new Date()).getTime();
                                        app.io.emit("get_sensor_data", $ports_enabled, function(data) {

                                            // console.log(data)

                                            for (var j in data) {
                                                if (j == "id") continue;

                                                if (j == "water1a") data[j] = Remap(data[j], 4094, 0, 1, 0);


                                                var s = $(`#sensor-${j}`);
                                                var V = parseInt(data[j]).toFixed(2);
                                                if (!s[0]) {
                                                    $(`<div id="sensor-${j}"class="card border-primary mb-3 mr-3" style="max-width: 20rem;">
                                                        <div class="card-header">${j}</div>
                                                        <div class="card-body">
                                                            <h4 class="card-title">${V}</h4>
                                                        </div>
                                                    </div>`).appendTo(sensorDataContainer);
                                                }
                                                else {
                                                    s.find(".card-title").text(V);
                                                }

                                                if (!chartData[j]) chartData[j] = [];
                                                chartData[j].push({ time: timeNOW, value: data[j] })


                                                if (!charSeries[j]) charSeries[j] = chart.addAreaSeries({
                                                    // topColor: 'rgba(67, 83, 254, 0.7)',
                                                    // bottomColor: 'rgba(67, 83, 254, 0.3)',
                                                    topColor: 'rgba(0,0,0, 0)',
                                                    bottomColor: 'rgba(0,0,0, 0)',
                                                    lineColor: 'rgba(' + rndColor() + ', 1)',
                                                    lineWidth: 2,
                                                });

                                                charSeries[j].setData(chartData[j]);

                                                if (callback) callback();
                                            }
                                        });
                                    }

                                    function start_get_sensor_data_timer(sensorPort) {
                                        var runningCheck = false;
                                        var lastCheck = 0;
                                        setInterval(function() {
                                            if (runningCheck) return;
                                            if (lastCheck > 0 && (new Date()).getTime() - lastCheck < 1000) return;

                                            lastCheck = (new Date()).getTime();
                                            runningCheck = true;

                                            get_sensor_data(sensorPort, function() {
                                                runningCheck = false;
                                            })

                                        }, 1000)
                                    }

                                    for (var i in ports_enabled) {
                                        start_get_sensor_data_timer(ports_enabled[i])
                                    }

                                    app.io.emit("get_camera_image", function(base64picture) {
                                        // console.log("got base64Img");
                                        $(`<div class="card border-primary mb-3 mr-3" style="max-width: 20rem;">
                                                    <div class="card-header">Camera</div>
                                                    <div class="card-body">
                                                        <h4 class="card-title"><img style="width: 100%;" src="data:image/png;base64,${base64picture}"/></h4>
                                                    </div>
                                                </div>`).appendTo(pictureContainer)



                                    })
                                }
*/
                                // app.io.emit("list_sensors", loadSensors)


                            }
                            else
                            if (app_arguments.page == "sensors") {

                                app.io.on("sensor_data", function(sensor_data) {
                                    if (sensor_data.path) {
                                        var pid = sensor_data.path.replaceAll("/", "_") + "_";
                                        var prow = $("#" + pid + "ID");
                                        prow.html("<a href='?page=sensors&path=" + sensor_data.path + "'>" + sensor_data.ID + "</a>")
                                    }
                                });

                                app.$page_name.text("Sensors");

                                var sensorsList = $("<div class='' id='sensor_list' class='text-align:center;'/>");

                                sensorsList.appendTo(app.$head);

                                function sensorList(ports_advailable, ports_list) {

                                    var table = $("<table class='table'>");

                                    var row;
                                    var eid;

                                    row = $("<tr>");
                                    $("<th>Serial Port</th>").appendTo(row);
                                    $("<th>Connect</th>").appendTo(row);
                                    $("<th>ID</th>").appendTo(row);
                                    row.appendTo(table);
                                    for (var i in ports_advailable) {
                                        (function(i) {
                                            eid = ports_advailable[i].path.replaceAll("/", "_") + "_";
                                            row = $("<tr id='" + eid + "'>")

                                            $("<td>" + ports_advailable[i].path + "</td>").appendTo(row)


                                            var auto_connect = $("<input type='checkbox' id='" + eid + "auto_connect'/>");
                                            $("<td></td>").append(auto_connect).appendTo(row);
                                            auto_connect.on("change", function() {

                                                app.io.emit("set_sensor", ports_advailable[i].path, "auto_connect", auto_connect[0].checked, function() {

                                                });
                                            })

                                            //ID
                                            $("<td id='" + eid + "ID'></td>").appendTo(row);

                                            row.appendTo(table)

                                        })(i)
                                    }

                                    for (var i in ports_list) {
                                        (function(i) {
                                            eid = i.replaceAll("/", "_") + "_";
                                            row = table.find("#" + eid);
                                            var auto_connect;
                                            if (!row[0]) {
                                                row = $("<tr id='" + i.replaceAll("/", "_") + "'>")

                                                $("<td>" + i + "</td>").appendTo(row)


                                                auto_connect = $("<input type='checkbox' id='" + eid + "auto_connect'/>");
                                                $("<td></td>").append(auto_connect).appendTo(row);
                                                auto_connect.on("change", function() {

                                                    app.io.emit("set_sensor", i, "auto_connect", auto_connect[0].checked, function() {

                                                    });
                                                })

                                                //ID
                                                $("<td id='" + eid + "ID'></td>").appendTo(row);

                                                row.appendTo(table)
                                            }


                                            if (!auto_connect) {
                                                auto_connect = row.find("#" + eid + "auto_connect")
                                            }
                                            auto_connect[0].checked = ports_list[i].auto_connect;
                                        })(i)
                                    }

                                    table.appendTo(sensorsList)


                                }

                                app.io.emit("get_sensors", sensorList)


                            }

                        }



                    });

                }
            }
        });

    }

    function loadChart(chartContainer) {
        /*global LightweightCharts */
        var chart = LightweightCharts.createChart(chartContainer, {
            width: 600,
            height: 300,
            localization: {
                timeFormatter: businessDayOrTimestamp => {
                    return Date(businessDayOrTimestamp); //or whatever JS formatting you want here
                },
            },
            timeScale: {
                // rightOffset: 12,
                // barSpacing: 3,
                // fixLeftEdge: true,
                // lockVisibleTimeRangeOnResize: true,
                // rightBarStaysOnScroll: true,
                // borderVisible: false,
                // borderColor: '#fff000',
                visible: true,
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time, tickMarkType, locale) => {
                    var d = new Date(time);
                    var years = d.getUTCFullYear();
                    var months = d.getUTCMonth();
                    var days = d.getUTCDay();
                    var hours = d.getUTCHours();
                    var minutes = d.getUTCMinutes()
                    var seconds = d.getUTCSeconds();
                    return String(hours + ":" + minutes + ":" + seconds /*+ "\n " + months + "-" + days + "-" + years*/);
                },
            },
            rightPriceScale: {
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
                mode: LightweightCharts.PriceScaleMode.Logarithmic,
            },


            // rightPriceScale: {
            //     scaleMargins: {
            //         top: 0.1,
            //         bottom: 0.1,
            //     },
            //     mode: LightweightCharts.PriceScaleMode.Perc?entage,
            //     borderColor: 'rgba(197, 203, 206, 0.4)',
            // },
            // timeScale: {
            //     borderColor: 'rgba(197, 203, 206, 0.4)',
            // },
            // layout: {
            //     backgroundColor: '#100841',
            //     textColor: '#ffffff',
            // },
            // grid: {
            //     vertLines: {
            //         color: 'rgba(197, 203, 206, 0.4)',
            //         style: LightweightCharts.LineStyle.Dotted,
            //     },
            //     horzLines: {
            //         color: 'rgba(197, 203, 206, 0.4)',
            //         style: LightweightCharts.LineStyle.Dotted,
            //     },
            // },
        });

        // var areaSeries = chart.addAreaSeries({
        //     topColor: 'rgba(67, 83, 254, 0.7)',
        //     bottomColor: 'rgba(67, 83, 254, 0.3)',
        //     lineColor: 'rgba(67, 83, 254, 1)',
        //     lineWidth: 2,
        // });

        // areaSeries.setData([
        //     { time: '2018-10-19', value: 219.31 },
        //     { time: '2018-10-22', value: 220.65 }
        // ])

        return chart;
    }

    function snapPicture(done) {


        function base64_encode(file) {

            var fs = require("fs");
            // read binary data
            var bitmap = fs.readFileSync(file);
            // convert binary data to base64 encoded string
            return new Buffer(bitmap).toString('base64');
        }

        //raspistill -t 2000 -o image.jpg -w 640 -h 480

        var spawn = require('child_process').spawn;

        var raspistill = spawn('raspistill', ["-o", "image.jpg", "-w", "1920", "-h", "1080"]);

        raspistill.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        raspistill.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        raspistill.on('close', (code) => {
            if (code !== 0)
                console.log(`raspistill exited with code ${code}`);


            if (done) done(base64_encode("image.jpg"));
        });

    }

    function SensorClass(path, app) {

        var sensorClass = {};

        var fs = require("fs");

        // var spawn = require('child_process').spawn;

        var SerialPort = require('serialport')
        var Readline = require('@serialport/parser-readline')


        console.log("connecting to sensor", path)
        var port = new SerialPort(path, { baudRate: 115200 })
        sensorClass.port = port;
        var parser = new Readline()
        port.pipe(parser)

        sensorClass.parser = parser;

        var lastMsgTS = (new Date()).getTime();
        sensorClass.values = {};

        port.on("error", function(e) {
            if (e.toString().indexOf("No such file or directory") > -1) {

            }
            else {
                console.log("sp error", e)
            }
        });
        port.on("open", function() {
            console.log(path, "connected")

        });

        var checkInt = setInterval(function() {
            var checkTS = (new Date()).getTime();

            if ((checkTS - lastMsgTS) > 60 * 1000) {
                if (port.isOpen) {
                    console.log(path, "closed", "due to heartbeat")
                    // if (!sensorClass.heartbeatFAIL) sensorClass.heartbeatFAIL = 0;
                    // sensorClass.heartbeatFAIL += 1
                    port.close();
                    lastMsgTS = (new Date()).getTime();
                    // if(sensorClass.heartbeatFAIL >= 3){
                    console.log(path, "clearing values")
                    for (var i in sensorClass.values) {
                        delete sensorClass.values[i];
                    }
                    //     sensorClass.heartbeatFAIL = 0;
                    // }
                }
            }
        }, 1000);


        sensorClass.destroy = function(cb) {
            if (port.isOpen)
                port.close()
            clearInterval(checkInt);
            sensorClass.values = {};
            if (cb) cb();
        };

        parser.on('data', function(line) {
            // sensorClass.heartbeatFAIL = 0;
            lastMsgTS = (new Date()).getTime();
            var L = line.toString("utf8").trim().toUpperCase();
            console.log(L)

            L = L.split(",");
            var parsedValues = {};

            for (var i in L) {
                var I, key, val;
                I = L[i].split(":");
                key = I[0];
                if (!I[1]) return;
                val = I[1].split("-");

                switch (key) {
                    case 'ID':
                        parsedValues['ID'] = val[0];
                        parsedValues['MID'] = parseFloat(val[1]);
                        parsedValues['TS'] = lastMsgTS;
                        break;
                    default:
                        for (var j in val) {
                            val[j] = parseFloat(val[j]);
                        }
                        if (val.length > 1)
                            parsedValues[key] = val;
                        else
                            parsedValues[key] = val[0];
                }

            }
            parsedValues.path = path;

            for (var i in parsedValues) {
                sensorClass.values[i] = parsedValues[i];
            }

            app.io.emit("sensor_data", parsedValues);
            app.emit("sensor_data", parsedValues);
            //console.log(current_values);

            // console.log(L);
            // if (L == "--data-start--") {
            //     output = {};
            //     return;
            // }
            // if (L == "--data-end--") {
            //     // console.log(output);
            //     for (var i in cbList) {
            //         if (typeof cbList[i] == "function")
            //             cbList[i](output);
            //     }
            //     cbList = [];
            //     running = false;

            //     return;
            // }
            // var i = L.split(": ")[0];
            // var v = L.split(": ")[1];
            // // if(i == "water1a"){
            // //     output[i] = Remap(v,3292,1500,1,100)
            // // }else
            // switch (i) {
            //     case 'id':
            //         output[i] = v;
            //         break;
            //     default:
            //         output[i] = parseFloat(v);
            // }




        });

        function base64_encode(file) {
            // read binary data
            var bitmap = fs.readFileSync(file);
            // convert binary data to base64 encoded string
            return new Buffer(bitmap).toString('base64');
        }

        sensorClass.getData = function(cb) {
            cb(sensorClass.values);
        };

        return sensorClass;


        /*
        setInterval(function() {
            if (!running) running = true;
            else return;

            // snapPicture(function(base64_encoded_picture) {

            // output.image = base64_encoded_picture;
            port.write('\n');
            setTimeout(function() {
                // console.log(base64_encoded_picture)
            }, 1000);
            // });


        }, 15000);


                function snapPicture(done) {
                    //raspistill -t 2000 -o image.jpg -w 640 -h 480

                    var raspistill = spawn('raspistill', ["-o", "image.jpg", "-w", "800", "-h", "600"]);

                    raspistill.stdout.on('data', (data) => {
                        console.log(`stdout: ${data}`);
                    });

                    raspistill.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });

                    raspistill.on('close', (code) => {
                        if (code !== 0)
                            console.log(`raspistill exited with code ${code}`);


                        if (done) done(base64_encode("image.jpg"));
                    });

                }
        */
    }
});