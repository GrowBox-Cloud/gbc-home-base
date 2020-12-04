if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["start"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            start: {
                init: function(app, app_type, app_arguments) {

                    app.on("start", function() {
                        if (app_type == "node") {
                            // console.log("node started");

                            app.io.on('connection', (socket) => {
                                // console.log('a user connected');
                            });


                        }
                        if (app_type == "browser") {
                            // console.log("browser started");
                            
                            var $ = require("$");
                        }
                    });

                }
            }
        });

    }

});