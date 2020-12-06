if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["dashboard"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            dashboard: {
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
                            if (app_arguments.page == "home") {
                                $(`<div id="box-"class="card  mb-3 mr-3" style="max-width: 20rem;">
                                                        <div class="card-header">Box Name</div>
                                                        <div class="card-body">
                                                            <h4 class="card-title">Box Status</h4>
                                                        </div>
                                                    </div>`).click(function() {
                                    
                                }).appendTo(app.$head);
                            }
                        }
                    });

                }
            }
        });

    }

});