if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["settings"];


    var parameters = {
        id: false
    };

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    function makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:"<>?[]\\;\',./';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

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
                                    parameters.id = uuidv4();
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