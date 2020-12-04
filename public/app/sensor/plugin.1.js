if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["sensor"];

    function Remap(value, from1, to1, from2, to2) {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }
    return appPlugin;

    function appPlugin(options, imports, register) {

        register(null, {
            sensor: {
                init: function(app, app_type, app_arguments) {

                    imports.app.on("start", function() {
                        return;

                        var fs = require("fs");

                        var spawn = require('child_process').spawn;

                        var SerialPort = require('serialport')
                        var Readline = require('@serialport/parser-readline')

                        var path = "/dev/ttyACM0"

                        var port = new SerialPort(path, { baudRate: 115200 })

                        var parser = new Readline()
                        port.pipe(parser)

                        var dataRecCount = 0;
                        var output = {};
                        parser.on('data', function(line) {
                            var L = line.toString("utf8");
                            var i = L.split(": ")[0];
                            var v = L.split(": ")[1];
                            // if(i == "water1a"){
                            //     output[i] = Remap(v,3292,1500,1,100)
                            // }else
                                output[i] = parseFloat(v);
                            console.log(i, output[i]);

                            running = false;
                        });

                        function base64_encode(file) {
                            // read binary data
                            var bitmap = fs.readFileSync(file);
                            // convert binary data to base64 encoded string
                            return new Buffer(bitmap).toString('base64');
                        }

                        var running = false;
                        setInterval(function() {
                            if (!running) running = true;
                            else return;

                            snapPicture(function(base64_encoded_picture) {

                                output.image = base64_encoded_picture;
                                port.write('\n');
                                setTimeout(function() {
                                    // console.log(base64_encoded_picture)
                                }, 1000);
                            });


                        }, 15000);



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

                    });

                }
            }
        });

    }

});