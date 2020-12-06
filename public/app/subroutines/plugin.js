if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["subroutines"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            subroutines: {
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


                            if (app_arguments.page == "subroutine") {

                                var subroutine_id = app_arguments.subroutine;
                                if (!subroutine_id) {

                                    app.$page_name.text("Subroutine");

                                    var subroutineList = $("<div class='' id='subroutine_list' class='text-align:center;'/>");
                                    $(`<table class="table subroutine_stage_table">
                                          <thead>
                                            <tr>
                                              <th scope="col">Subroutine</th>
                                              <th scope="col">Status</th>
                                              <th scope="col">Time Length</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                          </tbody>
                                        </table>
                                        
                                        <div class="mx-auto mb-2"><button class="btn btn-primary add_subroutine">Add</button></div>
                                         `).appendTo(subroutineList)

                                    subroutineList.appendTo(app.$head);

                                    var subroutine_stage_table = $(".subroutine_stage_table tbody");


                                    app.on("user_ready", function() {
                                        // app.user.get("subroutine_list").put({c:"test3"})
                                        app.user.get("subroutine_list").once(function(list) {
                                            // for (var i in list) {
                                            //     if (i == "_") continue;
                                            //     var listid = list[i];


                                            for (var i in list) {
                                                if (i.indexOf("_") == -1) {
                                                    app.user.get("subroutine_list").get(i).once(function(subroutine) {
                                                        if (subroutine) {
                                                            console.log(subroutine)
                                                            $(`<tr>
                                                                    <td><a href='/?page=subroutine&subroutine=${subroutine.id}'><h2>${subroutine.name}</h2></a></td>
                                                                    <td class="text-success">Active</td>
                                                                    <td></td>
                                                                    
                                                                </tr>`).appendTo(subroutine_stage_table);
                                                        }
                                                    })

                                                }
                                            }

                                            // $(`<tr>
                                            //     <td><a href='/?page=subroutine&subroutine=${listid}'><h2>${listid}</h2></a></td>
                                            //     <td class="text-success">Active</td>
                                            //     <td></td>

                                            // </tr>`).appendTo(subroutine_stage_table);
                                            // if(listid){
                                            //     app.user.get("subroutine_items").get(listid).on(function(subroutine){
                                            //         console.log("subroutine",subroutine)
                                            //     })
                                            // }


                                            // }


                                            $(".add_subroutine").click(function() {
                                                app.ui.inputDialog("Add Subroutine", "Subroutine Name", true, function(val) {
                                                    console.log(val)
                                                    var id = imports.app.makeid("16");
                                                    app.user.get("subroutine_list").get(id).put({ name: val, id: id }, function() {
                                                        window.document.location = window.document.location.toString();
                                                    })
                                                })
                                            })
                                        })
                                    })
                                }
                                else {

                                    app.$page_name.text("Subroutine Settings");



                                    app.on("user_ready", function() {
                                        app.user.get("subroutine_list").get(subroutine_id).once(function(subroutine) {
                                            if(subroutine["_"]) delete subroutine["_"];
                                            if(subroutine["#"]) delete subroutine["#"];
                                            
                                            
                                            var RGB_R_MAX = 45;
                                            var rgb0, rgb1, rgb_r, rgb_a;

                                            if (subroutine.rgb0)
                                                rgb0 = subroutine.rgb0.split("-")
                                            else
                                                rgb0 = [255, 0, 0];

                                            if (subroutine.rgb1)
                                                rgb1 = subroutine.rgb1.split("-")
                                            else
                                                rgb1 = [0, 0, 255];

                                            if (subroutine.rgb_r)
                                                rgb_r = subroutine.rgb_r.split("-")
                                            else
                                                rgb_r = [1,0,0];
                                                
                                            if (subroutine.rgb_a)
                                                rgb_a = subroutine.rgb_a.split("-")
                                            else
                                                rgb_a = [0,0,0];



                                            $(`<div>
                                            
                                            <h2><a href="javascript:0;">${subroutine.name}</a></h2>
                                            
                                            <hr/>
                                            <h3>Subroutine Time Frame</h3>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">Subroutine Cycle Hours</label>
                                                <input id="subroutine_cycle_h" type="range" class="form-control-range" id="formControlRange"  min="0" max="23"  step="1" value="${subroutine.hours ? subroutine.hours : "23"}">
                                            </div>
                                            <div class="form-group">
                                                <label for="formControlRange">Subroutine Cycle Minutes</label>
                                                <input id="subroutine_cycle_m" type="range" class="form-control-range" id="formControlRange"  min="0" max="59"  step="1" value="${subroutine.minutes ? subroutine.minutes : "0"}">
                                            </div>
                                            <div><h2 id="subroutine_cycle_value"></h2></div>
                                            
                                            <hr/>
                                            <h3>Subroutine Settngs</h3>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">RGB0</label>
                                                <canvas id="canvas_rgb0" width="50" height="50" style="border:1px solid #000000;display:block;margin:0 auto;" class="mb-2 "></canvas>
                                                <input id="subroutine_cycle_rgb0_r" type="range" class="form-control-range range_rgb0" min="0" max="255"  step="1" value="${rgb0[0]}">
                                                <input id="subroutine_cycle_rgb0_g" type="range" class="form-control-range range_rgb0" min="0" max="255"  step="1" value="${rgb0[1]}">
                                                <input id="subroutine_cycle_rgb0_b" type="range" class="form-control-range range_rgb0" min="0" max="255"  step="1" value="${rgb0[2]}">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">RGB1</label>
                                                <canvas id="canvas_rgb1" width="50" height="50" style="border:1px solid #000000;display:block;margin:0 auto;" class="mb-2 "></canvas>
                                                <input id="subroutine_cycle_rgb1_r" type="range" class="form-control-range range_rgb1" min="0" max="255"  step="1" value="${rgb1[0]}">
                                                <input id="subroutine_cycle_rgb1_g" type="range" class="form-control-range range_rgb1" min="0" max="255"  step="1" value="${rgb1[1]}">
                                                <input id="subroutine_cycle_rgb1_b" type="range" class="form-control-range range_rgb1" min="0" max="255"  step="1" value="${rgb1[2]}">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">RGB_A</label>
                                                <canvas id="canvas_rgb_a" width="50" height="50" style="border:1px solid #000000;display:block;margin:0 auto;" class="mb-2 "></canvas>
                                                <input id="subroutine_cycle_rgb_a" type="range" class="form-control-range range_rgb_a" min="0" max="255"  step="1" value="${rgb_a[0]}">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="formControlRange">RGB_R</label>
                                                <div><h2 id="subroutine_rgb_r_value">${subroutine.rgb_r ? subroutine.rgb_r : "1"}</h2></div>
                                                <input id="subroutine_cycle_rgb_r" type="range" class="mb-2 form-control-range range_rgb_r" min="1" max="${RGB_R_MAX}"  step="1" value="${subroutine.rgb_r[0]}">
                                                <canvas id="canvas_rgb_r" width="250" height="50" style="border:1px solid #000000;display:block;margin:0 auto;"></canvas>
                                                
                                            </div>
                                            
                                        
                                        </div>`).appendTo(app.$head);



                                            // $("#subroutine_cycle_rgb_r").change(function() {
                                            //     subroutine.rgb_r = $("#subroutine_cycle_rgb_r").val();
                                            //     $("#subroutine_rgb_r_value").text(subroutine.rgb_r);
                                            //     app.user.get("subroutine_list").get(subroutine_id).put(subroutine)
                                            // });
                                            $("#subroutine_cycle_h").change(function() {
                                                var m = $("#subroutine_cycle_m").val();
                                                if (m < 10) m = "0" + m
                                                $("#subroutine_cycle_value").text($("#subroutine_cycle_h").val() + ":" + m)
                                                subroutine.hours = $("#subroutine_cycle_h").val();
                                                app.user.get("subroutine_list").get(subroutine_id).put(subroutine)
                                            })
                                            $("#subroutine_cycle_m").change(function() {
                                                var m = $("#subroutine_cycle_m").val();
                                                if (m < 10) m = "0" + m;
                                                $("#subroutine_cycle_value").text($("#subroutine_cycle_h").val() + ":" + m)
                                                subroutine.minutes = $("#subroutine_cycle_m").val();
                                                app.user.get("subroutine_list").get(subroutine_id).put(subroutine)
                                            })

                                            $(".range_rgb0").change(function() {
                                                var c = document.getElementById("canvas_rgb0");
                                                var ctx = c.getContext("2d");
                                                var r = $("#subroutine_cycle_rgb0_r").val();
                                                var g = $("#subroutine_cycle_rgb0_g").val();
                                                var b = $("#subroutine_cycle_rgb0_b").val();

                                                ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                                                ctx.fillRect(0, 0, $(c).width(), $(c).height());
                                                subroutine.rgb0 = r + "-" + g + "-" + b;
                                                app.user.get("subroutine_list").get(subroutine_id).put(subroutine);
                                                $(".range_rgb_r").change();
                                            })



                                            $(".range_rgb1").change(function() {
                                                var c = document.getElementById("canvas_rgb1");
                                                var ctx = c.getContext("2d");
                                                var r = $("#subroutine_cycle_rgb1_r").val();
                                                var g = $("#subroutine_cycle_rgb1_g").val();
                                                var b = $("#subroutine_cycle_rgb1_b").val();

                                                ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                                                ctx.fillRect(0, 0, $(c).width(), $(c).height());
                                                subroutine.rgb1 = r + "-" + g + "-" + b;
                                                app.user.get("subroutine_list").get(subroutine_id).put(subroutine);
                                                $(".range_rgb_r").change();
                                            });


                                            $(".range_rgb_a").change(function() {
                                                var c = document.getElementById("canvas_rgb_a");
                                                var ctx = c.getContext("2d");
                                                var a = $("#subroutine_cycle_rgb_a").val();
                                                ctx.fillStyle = "rgb(" + a + "," + a + "," + a + ")";
                                                ctx.fillRect(0, 0, $(c).width(), $(c).height());
                                                subroutine.rgb_a = a + "-0-0";
                                                app.user.get("subroutine_list").get(subroutine_id).put(subroutine)
                                                $(".range_rgb_r").change();
                                            });

                                            $(".range_rgb_r").change(function() {

                                                var c = document.getElementById("canvas_rgb_r");
                                                var ctx = c.getContext("2d");
                                                var r = $("#subroutine_cycle_rgb_r").val();
                                                var secetionWidth = $(c).width() / RGB_R_MAX;
                                        
                                                ctx.fillStyle = "rgb(0,0,0)";
                                                ctx.fillRect(0, 0, $(c).width(), $(c).height());


                                                var r0 = $("#subroutine_cycle_rgb0_r").val();
                                                var g0 = $("#subroutine_cycle_rgb0_g").val();
                                                var b0 = $("#subroutine_cycle_rgb0_b").val();
                                                
                                                var r1 = $("#subroutine_cycle_rgb1_r").val();
                                                var g1 = $("#subroutine_cycle_rgb1_g").val();
                                                var b1 = $("#subroutine_cycle_rgb1_b").val();
                                                
                                                
                                                var a = $("#subroutine_cycle_rgb_a").val();
                                                
                                                var j = 1;
                                                for (var i = 0; i < RGB_R_MAX; i++) {
                                                    
                                                    if (j == 1) {
                                                        ctx.fillStyle = "rgba(" + r0 + "," + g0 + "," + b0 + "," + (a/255) + ")";
                                                        ctx.fillRect(secetionWidth * i, 0, secetionWidth, $(c).height());
                                                    }else{
                                                        ctx.fillStyle = "rgba(" + r1 + "," + g1 + "," + b1 + "," + (a/255) + ")";
                                                        ctx.fillRect(secetionWidth * i, 0, secetionWidth, $(c).height());
                                                    }
                                                    if (j == r) {
                                                        j = 1;
                                                    }
                                                    else {
                                                        j++;
                                                    }
                                                }


                                                subroutine.rgb_r = r + "-0-0";
                                                $("#subroutine_rgb_r_value").text(subroutine.rgb_r);
                                                app.user.get("subroutine_list").get(subroutine_id).put(subroutine)
                                            });


                                            (function() {

                                                var c = document.getElementById("canvas_rgb0");
                                                var ctx = c.getContext("2d");
                                                var r0 = $("#subroutine_cycle_rgb0_r").val();
                                                var g0 = $("#subroutine_cycle_rgb0_g").val();
                                                var b0 = $("#subroutine_cycle_rgb0_b").val();
                                                ctx.fillStyle = "rgb(" + r0 + "," + g0 + "," + b0 + ")";
                                                ctx.fillRect(0, 0, $(c).width(), $(c).height());

                                                c = document.getElementById("canvas_rgb1");
                                                ctx = c.getContext("2d");
                                                var r1 = $("#subroutine_cycle_rgb1_r").val();
                                                var g1 = $("#subroutine_cycle_rgb1_g").val();
                                                var b1 = $("#subroutine_cycle_rgb1_b").val();
                                                ctx.fillStyle = "rgb(" + r1 + "," + g1 + "," + b1 + ")";
                                                ctx.fillRect(0, 0, $(c).width(), $(c).height());

                                                c = document.getElementById("canvas_rgb_a");
                                                ctx = c.getContext("2d");
                                                var a = $("#subroutine_cycle_rgb_a").val();
                                                ctx.fillStyle = "rgb(" + a + "," + a + "," + a + ")";
                                                ctx.fillRect(0, 0, $(c).width(), $(c).height());



                                                c = document.getElementById("canvas_rgb_r");
                                                ctx = c.getContext("2d");
                                                var r = $("#subroutine_cycle_rgb_r").val();
                                                var secetionWidth = $(c).width() / RGB_R_MAX;

                                                ctx.fillStyle = "rgb(0,0,0)";
                                                ctx.fillRect(0, 0, $(c).width(), $(c).height());

                                                var j = 1;
                                                for (var i = 0; i < RGB_R_MAX; i++) {
                                                    
                                                    if (j == 1) {
                                                        ctx.fillStyle = "rgba(" + r0 + "," + g0 + "," + b0 + "," + (a/255) + ")";
                                                        ctx.fillRect(secetionWidth * i, 0, secetionWidth, $(c).height());
                                                    }else{
                                                        ctx.fillStyle = "rgba(" + r1 + "," + g1 + "," + b1 + "," + (a/255) + ")";
                                                        ctx.fillRect(secetionWidth * i, 0, secetionWidth, $(c).height());
                                                    }
                                                    if (j == r) {
                                                        j = 1;
                                                    }
                                                    else {
                                                        j++;
                                                    }
                                                }

                                            })()


                                            var m = $("#subroutine_cycle_m").val();
                                            if (m < 10) m = "0" + m;
                                            $("#subroutine_cycle_value").text($("#subroutine_cycle_h").val() + ":" + m)

                                            app.on("sensor_data", function() {

                                            })
                                        });
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