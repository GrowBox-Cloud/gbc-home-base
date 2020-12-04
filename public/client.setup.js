requirejs.config({
    baseUrl: './app',
    paths: {
        libs: '../libs'
        
    }
});

define("path",function(){})
define("socket.io",function(){return window.io;})
define("express",function(){})
define("https",function(){})
define("fs",function(){})
define("child_process",function(){})

define("serialport",function(){})
define("@serialport/parser-readline",function(){})
define("@serialport/bindings",function(){})

define("gun",function(){return window.Gun;})
define("gun/sea",function(){})
define("gun/axe",function(){})
define("gun/lib/webrtc",function(){})
var jquery = window.$;
define("$",function(){
    return jquery;
});

requirejs(["../app"])