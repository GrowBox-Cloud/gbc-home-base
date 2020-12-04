if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["box"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            box: {
                init: function(app, app_type, app_arguments) {

                    app.on("box", function() {
                        if (app_type == "node") {
                            console.log("node boxed");

                            app.io.on('connection', (socket) => {
                                // console.log('a user connected');
                            });


                        }
                        if (app_type == "browser") {
                            var $ = require("$");


                            if (app_arguments.page == "boxs") {
                            }
                        }
                    });

                }
            }
        });

    }

});