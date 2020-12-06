if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}


define(function(require, exports, module) {

    var enabled_plugins = [
        "subroutines/plugin",
        // "dashboard/plugin",
        "box/plugin",
        "sensor/plugin",
        "ui/plugin",
        "settings/plugin",
        "start/plugin"
    ];

    return enabled_plugins;
});