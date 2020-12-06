var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});




// var architect = requirejs("./public/libs/architect.node.js");
var architect = requirejs("./public/libs/architect.js");



var events = require("events");

var enabled_plugins = require("./public/enabled_plugins");
var config = [];

for (var i = 0; i < enabled_plugins.length; i++) {
    config.push(require("./public/app/" + enabled_plugins[i]));
}
// var config = [

//     // require("./public/app/server/plugin"),
//     require("./public/app/start/start"),
//     // require("./public/app/gun/plugin"),

// ];

setTimeout(function() {

    (function() {

        appPlugin.consumes = ["hub"];
        appPlugin.provides = ["app"];

        function appPlugin(options, imports, register) {
            var app = new events.EventEmitter();

            app.uuidv4 = function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }


            app.makeid = function(length) {
                var result = '';
                var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                var charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            }


            register(null, {
                app: app
            });
        }

        config.push(appPlugin);
    })();


    architect(config, function(err, app) {
        if (err) return console.error(err.message);
        for (var i in app.services) {
            if (app.services[i].init) app.services[i].init(app.services.app, "node", process.argv);
            app.services.app[i] = app.services[i];
        }

        app.services.app.emit("start");
        // setTimeout(function(){ console.log("start end")},1000);
    });

    // architect(config, function(err, app) {
    //     if (err) return console.error(err.message);
    //     for (var i in app.services) {
    //         if (app.services[i].init) app.services[i].init(app);
    //         app.services.app[i] = app.services[i];
    //     }

    //     app.services.app.emit("start");


    // });
}, 500)
