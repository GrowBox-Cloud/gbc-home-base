if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["settings"];


    var parameters = {
        id: false
    };

    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            settings: {
                init: function(app, app_type, app_arguments) {

                    app.on("start", async function() {
                        if (app_type == "node") {

                            var fs = require('fs');

                            if (!parameters.id) {

                                try {
                                    var baseinfo = fs.readFileSync(require("path").join(__dirname, 'baseinfo.json'));
                                    baseinfo = JSON.parse(baseinfo);
                                    parameters = baseinfo;
                                }
                                catch (e) {
                                    parameters.id = app.uuidv4();
                                    parameters.pair = await app.Gun.SEA.pair(); // generate a new key pair
                                }
                                if (!parameters.name) parameters.name = "unnamed";
                                fs.writeFileSync(require("path").join(__dirname, 'baseinfo.json'), JSON.stringify(parameters));
                                app.emit("settings", parameters);
                            }

                            app.io.on('connection', (socket) => {
                                // console.log('a user connected');
                                socket.on("settings", function(cb) {
                                    cb(parameters);
                                });

                            });

                            app.on("get_settings", function(cb) {
                                cb(parameters);
                            });
                            app.on("set_settings", function(key, value, cb) {
                                cb(parameters);
                                fs.writeFileSync(require("path").join(__dirname, 'baseinfo.json'), JSON.stringify(parameters));
                            });


                        }
                        if (app_type == "browser") {

                            if (!parameters.id) {
                                app.io.emit("settings", function(baseinfo) {
                                    parameters = baseinfo;
                                    console.log("settings loaded", parameters);
                                    app.emit("settings", parameters)
                                });
                            }


                            // app.io.emit("info_base_set", function(base_information_key,base_information_value) {

                            // });
                        }
                    });

                }
            }
        });

    }

});