define(function(require, exports, module) {

	var architect = require("./libs/architect");
	var events = require("./libs/events");

	require("./libs/native.history.js");

	var provable = require("./libs/provable.min");
	window.jQuery = require("./libs/jquery");
	window.$ = window.jQuery;


	// var config = [
	// 	// require("./welcome/plugin"),

	// 	require("start/start"),
	// 	require("gun/plugin"),

	// 	// require("./state/plugin"),
	// 	// require("./layout/plugin"),
	// 	// require("./gun/plugin"),
	// 	// require("./user/plugin"),
	// 	// require("./profile/plugin"),
	// 	// require("./peers/plugin"),
	// 	// //"peerapp/plugin",
	// 	// require("./peerapp_v2/plugin"),
	// 	// require("./gun-fs/plugin"),


	// ];


	var enabled_plugins = require("./enabled_plugins");
	var config = [];

	for (var i = 0; i < enabled_plugins.length; i++) {
		config.push(enabled_plugins[i]);
	}

	function parseQuery(queryString) {
		var query = {};
		var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split('=');
			query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
		}
		return query;
	}

	require(config, function() {
		config = [];
		for (var i = 0; i < enabled_plugins.length; i++) {
			config.push(arguments[i]);
		}
		// if (window.nw_app_core) {
		// 	config.push(require("./nw_app/nw_app"));
		// }

		(function() {

			appPlugin.consumes = ["hub"];
			appPlugin.provides = ["app", "provable"];

			function appPlugin(options, imports, register) {
				var app = new events.EventEmitter();
				app.nw = window.nw;
				register(null, {
					app: app,
					provable: provable,
				});
			}

			config.push(appPlugin);
		})();

		architect(config, function(err, app) {
			if (err) return console.error(err.message);
			var query = parseQuery(window.location.search);
			if(!query.page) query.page = "home";
			for (var i in app.services) {
				if (app.services[i].init) app.services[i].init(app.services.app, "browser", query);
				app.services.app[i] = app.services[i];
			}

			app.services.app.emit("start");


		});
	}, 500)
});