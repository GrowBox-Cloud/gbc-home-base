var resourcePath = "./public";

var port = process.env.PORT || 8765;
var fs = require('fs');
var http = require('https');
var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

var Gun = require('gun');

// require('gun/axe'); // is there a GUN BUG with this?
// require('gun/lib/webrtc');
require("gun/sea");

var casheControl = process.env.HTTP_MAXAGE || 0; //1000 * 60 * 60;
var express = require('express');


var app = express();

app.use("/gun", express.static(require('path').dirname(require.resolve("gun")), { maxAge: casheControl }));
app.use(express.static(require("path").join(__dirname, resourcePath), { maxAge: casheControl }));
app.use(Gun.serve);

var server = http.createServer(options, app).listen(port);

var gun = Gun({
    peers: [],
    file: 'radata',
    web: server
});

var io = require('socket.io')(http);

io.on('connection', function(socket) {
    console.log("socket.io connection");
});
if (process.env.ISMASTERPEER) {}
else {
    // var mesh = gun.back('opt.mesh'); // DAM;
    // mesh.say({ dam: 'opt', opt: { peers: 'https://www.peersocial.io/gun' } });
}
// require("../../server_api/gunfs/gunfs.js")(gun, app);

app.use(function(req, res, next) {
    res.sendFile(require("path").join(__dirname, resourcePath, 'index.html'));
});

console.log('Server started on port ' + port + ' with /gun');



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

// function to encode file data to base64 encoded string
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
        if(code !== 0)
            console.log(`raspistill exited with code ${code}`);


        if (done) done(base64_encode("image.jpg"));
    });

}