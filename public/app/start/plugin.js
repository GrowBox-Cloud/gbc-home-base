if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["start"];


    // var startPlugin = {};

    function startHTTP(imports) {

    }

    function startCLIENT(imports) {

    }

    /*
    var spawn = require('child_process').spawn;

    var SerialPort = require('serialport')
    var Readline = require('@serialport/parser-readline')

    var sensor = function($path) {

        var self = this;
        var path = $path || "/dev/ttyACM0"

        var port = new SerialPort(path, { baudRate: 115200 })

        var parser = new Readline()
        port.pipe(parser)

        parser.on('data', function(line) {
            console.log(line.toString("utf8"))
        });

        self.port = port;
        self.parser = false;
    }

    function base64_encode(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    }

    sensor.prototype.getSensorData = function() {

        snapPicture(function(base64_encoded_picture) {

            port.write('\n');
            setTimeout(function() {
                console.log(base64_encoded_picture)
            }, 1000);
        });


    }



    function snapPicture(done) {
        //raspistill -t 2000 -o image.jpg -w 640 -h 480

        var raspistill = spawn('raspistill', ["-o", "image.jpg", "-w", "800", "-h", "600"]);

        raspistill.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        raspistill.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        raspistill.on('close', (code) => {
            if (code !== 0)
                console.log(`raspistill exited with code ${code}`);


            if (done) done(base64_encode("image.jpg"));
        });

    }
    */
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            start: {
                init: function(app, app_type, app_arguments) {
                    var Gun;

                    if (app_type == "node") {
                        var resourcePath = require("path").join(__dirname, "../.."); //public_root

                        var port = process.env.PORT || 8765;
                        var fs = require('fs');
                        var http = require('https');
                        var options = {
                            key: fs.readFileSync(require("path").join(__dirname, 'key.pem')),
                            cert: fs.readFileSync(require("path").join(__dirname, 'cert.pem'))
                        };

                        // console.log("server started", imports.app)

                        Gun = require('gun');
                        require("gun/sea");

                        require('gun/axe'); // is there a GUN BUG with this?
                        require('gun/lib/webrtc');

                        var casheControl = process.env.HTTP_MAXAGE || 0; //1000 * 60 * 60;
                        var express = require('express');


                        var espress_app = express();
                        app.http = espress_app;
                        espress_app.use(express.static(resourcePath, { maxAge: casheControl }));

                        // app.use("/gun", express.static(require('path').dirname(require.resolve("gun")), { maxAge: casheControl }));
                        // app.use(Gun.serve);

                        var server = http.createServer(options, espress_app)
                        //startPlugin.httpServer = server;

                        espress_app.get("/libs/socket.io.js", function(req, res, next) {
                            res.sendFile(require("path").join(resourcePath, "../node_modules/socket.io-client/dist/", 'socket.io.js'));
                        });

                        var io = require('socket.io')(server, { serveClient: false });
                        app.io = io;

                        // io.on('connection', function(socket) {
                        //     console.log("socket.io connection");
                        // });
                        app.Gun = Gun;
                        
                        app.gun = Gun({
                            peers: [],
                            file: 'radata',
                            web: server
                        });

                        app.on("settings", function(parameters) {

                            imports.app.user = app.gun.user();

                            imports.app.user.auth(parameters.pair, function(ack) {
                                
                                if (ack.err == "User cannot be found!") {
                                    // app.user.create(parameters.pair, function(ack) {
                                    //     console.log(ack)
                                    // })
                                }else{
                                    console.log("user_ready")
                                    app.emit("user_ready")
                                }
                            })
                        });


                        espress_app.use(function(req, res, next) {
                            res.sendFile(require("path").join(resourcePath, 'index.html'));
                        });

                        // console.log('Server started on port ' + port + ' with /gun');


                        imports.app.on("start", function(app_type, app_arguments) {
                            server.listen(port);
                        });

                    }
                    if (app_type == "browser") {

                        app.io = require("socket.io")();

                        app.Gun = require("gun");
                        app.gun = app.Gun(['https://' + window.location.host + '/gun']);
                        
                        app.on("settings", function(parameters) {

                            imports.app.user = app.gun.user();

                            imports.app.user.auth(parameters.pair, function(ack) {
                                
                                if (ack.err == "User cannot be found!") {
                                    // app.user.create(parameters.pair, function(ack) {
                                    //     console.log(ack)
                                    // })
                                }else{
                                    console.log("user_ready")
                                    app.emit("user_ready")
                                }
                            })
                        });
                    }


                }
            }
        });

    }

});