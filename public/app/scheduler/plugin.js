if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["scheduler"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            scheduler: {
                init: function(app, app_type, app_arguments) {

                    app.on("start", function() {
                        if (app_type == "node") {
                            console.log("node started");

                            app.io.on('connection', (socket) => {
                                // console.log('a user connected');
                            });

                            app.on("sensor_data", function(data) {
                                var ts = (new Date(data.TS)).getTime()

                                var ts_fs = candleFi(data.TS);

                                // console.log(ts);
                                // console.log(ts_fs)
                            })

                        }
                        if (app_type == "browser") {
                            var $ = require("$");


                            if (app_arguments.page == "scheduler") {

                                var schedule_id = app_arguments.schedule;
                                if (!schedule_id) {

                                    app.$page_name.text("Scheduler");

                                    var schedulerList = $("<div class='' id='scheduler_list' class='text-align:center;'/>");
                                    $(`<h2>Subroutines Cycle</h2>
                                        <h5 style="color:green">Running/Stopped</h5>
                                        <button class="btn btn-danger mb-3">Stop/Start</button>
                                        
                                        <table class="table">
                                          <thead>
                                            <tr>
                                              <th scope="col">#</th>
                                              <th scope="col">First</th>
                                              <th scope="col">Last</th>
                                              <th scope="col">Handle</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <th scope="row">1</th>
                                              <td>Mark</td>
                                              <td>Otto</td>
                                              <td>@mdo</td>
                                            </tr>
                                            <tr>
                                              <th scope="row">2</th>
                                              <td>Jacob</td>
                                              <td>Thornton</td>
                                              <td>@fat</td>
                                            </tr>
                                            <tr>
                                              <th scope="row">3</th>
                                              <td>Larry</td>
                                              <td>the Bird</td>
                                              <td>@twitter</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                                                            
                                    <hr/>
                                    <h2>Subroutines</h2>`).appendTo(schedulerList)

                                    schedulerList.appendTo(app.$head);

                                    app.on("user_ready", function() {
                                        // app.user.get("scheduler_list").put({c:"test3"})
                                        app.user.get("scheduler_list").once(function(list) {
                                            for (var i in list) {
                                                if (i == "_") continue;
                                                var listid = list[i];

                                                $("<a href='/?page=scheduler&schedule=" + listid + "'><h2>" + listid + "</h2></a>").appendTo(schedulerList)
                                                // if(listid){
                                                //     app.user.get("scheduler_items").get(listid).on(function(schedule){
                                                //         console.log("schedule",schedule)
                                                //     })
                                                // }


                                            }
                                        })
                                    })
                                }
                                else {

                                    app.$page_name.text("Schedule Settings");


                                    app.on("user_ready", function() {

                                        $(`<div>
                                            
                                            <h2><a href="javascript:0;">${schedule_id}</a></h2>
                                            
                                            <hr/>
                                            <h3>Schedule Time Frame</h3>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">Schedule Cycle Hours</label>
                                                <input id="schedule_cycle_h" type="range" class="form-control-range" id="formControlRange"  min="0" max="23"  step="1" value="23">
                                            </div>
                                            <div class="form-group">
                                                <label for="formControlRange">Schedule Cycle Minutes</label>
                                                <input id="schedule_cycle_m" type="range" class="form-control-range" id="formControlRange"  min="0" max="60"  step="15" value="0">
                                            </div>
                                            <div><h2 id="schedule_cycle_value"></h2></div>
                                            
                                            <hr/>
                                            <h3>Schedule Settngs</h3>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">RGB0</label>
                                                <canvas id="canvas_rgb0" width="50" height="50" style="border:1px solid #000000;display:block;margin:0 auto;"></canvas>
                                                <input id="schedule_cycle_rgb0" type="range" class="form-control-range" id="formControlRange"  min="0" max="255"  step="15" value="0">
                                                <input id="schedule_cycle_rgb0" type="range" class="form-control-range" id="formControlRange"  min="0" max="255"  step="15" value="0">
                                                <input id="schedule_cycle_rgb0" type="range" class="form-control-range" id="formControlRange"  min="0" max="255"  step="15" value="0">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">RGB1</label>
                                                <canvas id="canvas_rgb0" width="50" height="50" style="border:1px solid #000000;display:block;margin:0 auto;"></canvas>
                                                <input id="schedule_cycle_rgb0" type="range" class="form-control-range" id="formControlRange"  min="0" max="255"  step="15" value="0">
                                                <input id="schedule_cycle_rgb0" type="range" class="form-control-range" id="formControlRange"  min="0" max="255"  step="15" value="0">
                                                <input id="schedule_cycle_rgb0" type="range" class="form-control-range" id="formControlRange"  min="0" max="255"  step="15" value="0">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">RGB_A</label>
                                                <canvas id="canvas_rgb0" width="50" height="50" style="border:1px solid #000000;display:block;margin:0 auto;"></canvas>
                                                <input id="schedule_cycle_rgb0" type="range" class="form-control-range" id="formControlRange"  min="0" max="255"  step="15" value="0">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">RGB_R</label>
                                                <input id="schedule_cycle_rgb0" type="range" class="form-control-range" id="formControlRange"  min="1" max="45"  step="15" value="0">
                                            </div>
                                            
                                            
                                            <div class="form-group">
                                                <label for="exampleFormControlSelect1">Next Schedule</label>
                                                <select class="form-control" id="exampleFormControlSelect1">
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </select>
                                            </div>
                                            
                                        
                                        </div>`).appendTo(app.$head);

                                        $("#schedule_cycle_h").change(function() {
                                            var m = $("#schedule_cycle_m").val();
                                            if (m < 10) m = "0" + m
                                            $("#schedule_cycle_value").text($("#schedule_cycle_h").val() + ":" + m)
                                        })
                                        $("#schedule_cycle_m").change(function() {
                                            var m = $("#schedule_cycle_m").val();
                                            if (m < 10) m = "0" + m;
                                            $("#schedule_cycle_value").text($("#schedule_cycle_h").val() + ":" + m)
                                        })


                                        var m = $("#schedule_cycle_m").val();
                                        if (m < 10) m = "0" + m;
                                        $("#schedule_cycle_value").text($("#schedule_cycle_h").val() + ":" + m)

                                        app.on("sensor_data", function() {

                                        })
                                    });
                                }


                            }

                        }
                    });

                }
            }
        });

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

            var out = {};
            for (var i in CANDLE_TIME) {
                var coff = CANDLE_TIME[i];


                out[i] = new Date(
                    Math.floor(ts / coff) * coff).getTime();
            }

            return out;

        }

    }

});