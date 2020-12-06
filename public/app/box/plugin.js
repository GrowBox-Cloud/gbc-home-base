if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["box"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var app = imports.app;

        var box = {
            init: function($app, app_type, app_arguments) {

                app.on("start", function() {
                    if (app_type == "node") {
                        console.log("node boxed");

                        app.on("user_ready", function() {
                            // app.user.get("box_list").on(function(){});
                            // app.user.get("subroutine_list").on(function(){});
                            
                            // lastMID
                            app.on("sensor_data", function(data) {
                                if (data.ID) {

                                    app.gun.listSet(app.user.get("box_list"), function(err, box_list, from) {
                                        for (var i in box_list) (function(i){
                                            app.gun.listSet(app.user.get("box_list").get(i).get("sensors"), function(err, box_sensors_list, from) {
                                                for(var j in box_sensors_list)  (function(j){
                                                    if(data.ID == j && box_sensors_list[j].enabled){
                                                        app.gun.listSet(app.user.get("box_list").get(i).get("subroutines"), function(err, box_subroutine_list, from) {
                                                            for(var k in box_subroutine_list) (function(k){ 
                                                                    if(box_subroutine_list[k].enabled){
                                                                        app.user.get("subroutine_list").get(k).once(function(subroutine){
                                                                            if(!subroutine) return;
                                                                            // console.log(k,subroutine)
                                                                            // console.log(data.RGB_A != undefined && (data.RGB_A +"-0-0") != subroutine.rgb_a)
                                                                            // if(data.RGB0)
                                                                            // console.log(data.RGB0.join("-") , subroutine.rgb0)
                                                                            if(data.RGB0 != undefined && data.RGB0.join("-") != subroutine.rgb0)
                                                                                // console.log({id:data.ID,data:"rgb0="+subroutine.rgb0})
                                                                                app.emit("send_sensor_data",{id:data.ID,data:"rgb0="+subroutine.rgb0.replace(/-/g,",")});
                                                                                
                                                                            
                                                                            if(data.RGB1 != undefined && data.RGB1.join("-") != subroutine.rgb1)
                                                                                // console.log({id:data.ID,data:"rgb1="+subroutine.rgb1})
                                                                                app.emit("send_sensor_data",{id:data.ID,data:"rgb1="+subroutine.rgb1.replace(/-/g,",")});
                                                                            
                                                                            
                                                                            if(data.RGB_R != undefined && (data.RGB_R +"-0-0") != subroutine.rgb_r)
                                                                                // console.log({id:data.ID,data:"rgb_r="+subroutine.rgb_r})
                                                                                app.emit("send_sensor_data",{id:data.ID,data:"rgb_r="+subroutine.rgb_r});
                                                                            
                                                                            if(data.RGB_A != undefined && (data.RGB_A +"-0-0") != subroutine.rgb_a)
                                                                                // console.log({id:data.ID,data:"rgb_a="+subroutine.rgb_a})
                                                                                app.emit("send_sensor_data",{id:data.ID,data:"rgb_a="+subroutine.rgb_a});
                                                                                    
                                                                                
                                                                        //     rgb0: '0-0-255',
                                                                        //   rgb1: '255-0-0',
                                                                        //   rgb_a: '184-0-0',
                                                                        //   rgb_r: '10-0-0' }
                                                                        })
                                                                    }
                                                                })(k);
                                                        });
                                                    }
                                                })(j);
                                            })
                                        })(i);
                                    })
                                }

                            })

                        })


                    }
                    if (app_type == "browser") {
                        var $ = require("$");
                        if (app_arguments.page == "home") {


                            app.on("user_ready", function() {

                                app.gun.listSet(app.user.get("box_list"), function(err, list, from) {

                                    for (var i in list) {
                                        $(`<div id="box-"class="card  mb-3 mr-3" style="max-width: 20rem;">
                                                <div class="card-header">${list[i].name}</div>
                                                <div class="card-body">
                                                    <h4 class="card-title"><a href="/?page=box&box=${i}">${list[i].name}</a></h4>
                                                    <div>Temp: *******</div>
                                                    <div>pH: *******</div>
                                                    <div>Current Subroutine: *******</div>
                                                    <div>Last Sensor Update: *******</div>
                                                </div>
                                            </div>`).click(function() {

                                        }).appendTo(app.$head);
                                    }
                                });
                            });
                        }
                        else
                        if (app_arguments.page == "box" && app_arguments.box) {

                            $(`<h2>Box Settings</h2>`).appendTo(app.$head);
                            $(`<hr/>`).appendTo(app.$head);

                            app.on("user_ready", function() {
                                app.user.get("box_list").get(app_arguments.box).once(function(box) {
                                    $(`<div id="box_name"><h3>${box.name}</h3><br/>
                                    <button class="btn mb-2">change box name</buton></div>`).appendTo(app.$head);

                                    $(`<hr/>`).appendTo(app.$head);

                                    $(`<div id="box_schedule"><h3>Schedule</h3>
                                     
                                        <table class="table subroutine_stage_table">
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
                                        
                                         <div class="mx-auto"><button class="btn btn-primary mb-2 add_subroutine">Add Subroutine</buton></div>
                                         
                                         
                                        <table class="table sensor_table">
                                          <thead>
                                            <tr>
                                              <th scope="col">Sensor Id</th>
                                              <th scope="col">Status</th>
                                              <th scope="col">Last Update</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                          </tbody>
                                        </table>
                                        
                                         <div class="mx-auto"><button class="btn btn-primary mb-2 add_sensor">Add Sensor</buton></div>
                                         
                                         
                                        </div>`).appendTo(app.$head);


                                    var c_subroutines = 0;

                                    if (!box.subroutines) {
                                        $(".subroutine_stage_table").hide()
                                        $(`.subroutine_stage_table`).before("<div class='mb-2'>No Subroutines Found</div>")

                                    }
                                    else {

                                        app.gun.listSet(app.user.get("box_list").get(app_arguments.box).get("subroutines"), function(err, list, from) {
                                            var subroutine_stage_table = $(".subroutine_stage_table tbody");
                                            subroutine_stage_table.sortable({
                                                placeholder: "bg-warning",
                                                change: function(event, ui) {

                                                }
                                            });
                                            for (var i in list) {
                                                c_subroutines++;
                                            }
                                            if (c_subroutines == 0) {
                                                $(".subroutine_stage_table").hide();
                                                $(`.subroutine_stage_table`).before("<div class='mb-2'>No Subroutines Found</div>");
                                            }
                                            else {


                                                app.gun.listSet(app.user.get("subroutine_list"), function(err, sr_list, from) {
                                                    console.log(list)


                                                    for (var i in list) {
                                                        (function(i) {
                                                            $(`<tr id="sr_${sr_list[i].id}">
                                                            <td><a href='/?page=subroutine&subroutine=${sr_list[i].id}'>${sr_list[i].name}</a></td>
                                                            ${ (list[i].enabled ? "<td class='text-success'>Active</td>" : "<td class='text-danger'>Inactive</td>") }
                                                            <td></td>
                                                            
                                                        </tr>`).appendTo(subroutine_stage_table);
                                                        })(i);
                                                    }
                                                });
                                            }
                                        });
                                    }

                                    $(".add_subroutine").click(function() {

                                        app.gun.listSet(app.user.get("subroutine_list"), function(err, list, from) {
                                            console.log(err, list, from);
                                            for (var i in list) {
                                                if ($("#sr_" + i)[0]) {
                                                    delete list[i];
                                                }
                                            }
                                            app.ui.selectDialog("Add Subroutine", "Select Subroutine", list, true, function(val) {
                                                console.log(val)
                                                // var id = imports.app.makeid("16");
                                                if (!box.subroutines)
                                                    box.subroutines = {};

                                                box.subroutines[val] = { order: c_subroutines, enabled: true };

                                                app.user.get("box_list").get(app_arguments.box).put(box, function() {
                                                    window.document.location = window.document.location.toString();
                                                })
                                            })
                                        });

                                        // app.user.get("subroutine_list").map().once(function(list) {
                                        //     console.log(list);
                                        // });

                                    })


                                    var c_sensors = 0;

                                    if (!box.sensors) {
                                        $(".sensor_table").hide()
                                        $(`.sensor_table`).before("<div class='mb-2'>No Sensors Found</div>")

                                    }
                                    else {

                                        app.gun.listSet(app.user.get("box_list").get(app_arguments.box).get("sensors"), function(err, list, from) {
                                            var sensor_table = $(".sensor_table tbody");

                                            for (var i in list) {
                                                c_sensors++;
                                            }
                                            if (c_sensors == 0) {
                                                $(".sensor_table").hide();
                                                $(`.sensor_table`).before("<div class='mb-2'>No Sensors Found</div>");
                                            }
                                            else {

                                                console.log(list)

                                                for (var i in list) {
                                                    (function(i) {
                                                        $(`<tr id="sr_${i}">
                                                            <td><a href='/?page=sensors&id=${i}'>${i}</a></td>
                                                            ${ (list[i].enabled ? "<td class='text-success'>Active</td>" : "<td class='text-danger'>Inactive</td>") }
                                                            <td></td>
                                                            
                                                        </tr>`).appendTo(sensor_table);
                                                    })(i);
                                                }

                                                /*app.gun.listSet(app.user.get("sensor_list"), function(err, sr_list, from) {
                                                    console.log(list)


                                                    for (var i in list) {
                                                        (function(i) {
                                                            $(`<tr id="sr_${sr_list[i].id}">
                                                            <td><a href='/?page=sensor&sensor=${sr_list[i].id}'><h2>${sr_list[i].name}</h2></a></td>
                                                            ${ (list[i].enabled ? "<td class='text-success'>Active</td>" : "<td class='text-success'>Active</td>") }
                                                            <td></td>
                                                            
                                                        </tr>`).appendTo(sensor_table);
                                                        })(i);
                                                    }
                                                });*/
                                            }
                                        });
                                    }

                                    $(".add_sensor").click(function() {

                                        app.gun.listSet(app.user.get("my_sensors"), function(err, list, from) {
                                            console.log(err, list, from);
                                            for (var i in list) {
                                                if ($("#sr_" + i)[0]) {
                                                    delete list[i];
                                                }
                                            }
                                            app.ui.selectDialog("Add Sensor", "Select Sensor", list, true, function(val) {
                                                console.log(val)
                                                // var id = imports.app.makeid("16");
                                                if (!box.sensors)
                                                    box.sensors = {};

                                                box.sensors[val] = { order: c_sensors, enabled: true };

                                                app.user.get("box_list").get(app_arguments.box).put(box, function() {
                                                    window.document.location = window.document.location.toString();
                                                })
                                            })
                                        });

                                        // app.user.get("sensor_list").map().once(function(list) {
                                        //     console.log(list);
                                        // });

                                    })
                                });
                            });
                        }
                        else if (app_arguments.page == "boxs") {
                            $(`<h2>Grow Boxes</h2>`).appendTo(app.$head);


                            app.on("user_ready", function() {

                                $(`<div class="mx-auto mb-2"><button class="btn btn-primary add_box">Add</button></div>`).appendTo(app.$head);

                                $(".add_box").click(function() {
                                    app.ui.inputDialog("Add Box", "Box Name", true, function(val) {
                                        console.log(val)
                                        var id = imports.app.makeid("16");
                                        app.user.get("box_list").get(id).put({ name: val, id: id }, function() {
                                            window.document.location = window.document.location.toString();
                                        })
                                    })
                                })

                                // app.user.get("scheduler_list").put({c:"test3"})
                                app.user.get("box_list").once(function(list) {

                                    if (!list) {

                                    }
                                    else {

                                        $(`<table class="table boxs_table">
                                          <thead>
                                            <tr>
                                              <th scope="col">Box Name</th>
                                              <th scope="col">Status</th>
                                              <th scope="col">Current Subroutine</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                          </tbody>
                                        </table>`).appendTo(app.$head);


                                        var boxs_table = $(".boxs_table tbody");

                                        for (var i in list) {
                                            if (i.indexOf("_") == -1) {
                                                app.user.get("box_list").get(i).once(function(box) {
                                                    if (box) {
                                                        console.log(box)
                                                        $(`<tr>
                                                            <td><a href="/?page=box&box=${box.id}">${box.name}</a></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>`).appendTo(boxs_table);
                                                    }
                                                })

                                            }
                                        }
                                    }
                                });
                            });

                        }
                    }
                });

            }
        };

        register(null, {
            box: box
        });

    }

});