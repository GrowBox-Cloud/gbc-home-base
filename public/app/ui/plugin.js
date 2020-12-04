if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["ui"];


    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            ui: {
                init: function(app, app_type, app_arguments) {
                    if (app_type == "browser") {
                        var $ = require("$");

                        $('[data-toggle="offcanvas"]').on('click', function() {
                            $('.offcanvas-collapse').toggleClass('open')
                        })

                        app.$head = $("<div/>");
                        app.$head.css("text-align", "center");

                        app.$page_name = $("<h1 id='page-name'>");
                        app.$page_name.appendTo(app.$head);
                        $("<hr/>").appendTo(app.$head);
                        app.$head.appendTo("div#main-container");

                        // app.on("settings", function(parameters) {
                        //     app.$settings_name.text(parameters.name);
                        // });
                    }
                }
            }
        });

    }

});