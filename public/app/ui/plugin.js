if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["ui"];


    return appPlugin;

    function appPlugin(options, imports, register) {
        var ui = {
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



                    ui.selectDialog = function(title, question, list, autoclose, cb) {

                        var html = `<div class="modal fade" id="dialogModal" tabindex="-1" role="dialog" aria-labelledby="dialogModalLabel" aria-hidden="true">
                              <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5 class="modal-title" id="dialogModalLabel">${title}</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                      <span aria-hidden="true">&times;</span>
                                    </button>
                                  </div>
                                  <div class="modal-body">
                                    ${question}
                                    <select class="custom-select">`;

                        for (var i in list) {
                            html += `<option value="${i}">${list[i].name ? list[i].name + " -": ""} ${list[i].id}</option>`;
                        }

                        html += `</select>
                                  </div>
                                  <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" class="btn btn-primary">Save changes</button>
                                  </div>
                                </div>
                              </div>
                        </div>`;


                        var dialog = $(html);

                        dialog.find(".btn-primary").click(function() {
                            var val = dialog.find(".custom-select").val();
                            cb(val);
                            if (autoclose)
                                dialog.modal("hide");
                        });

                        dialog.on("hidden.bs.modal", function() {
                            dialog.modal("dispose");
                            dialog.remove();
                        })

                        dialog.modal("show");
                    }
                    ui.inputDialog = function(title, question, autoclose, cb) {
                        var dialog = $(`<div class="modal fade" id="dialogModal" tabindex="-1" role="dialog" aria-labelledby="dialogModalLabel" aria-hidden="true">
                              <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5 class="modal-title" id="dialogModalLabel">${title}</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                      <span aria-hidden="true">&times;</span>
                                    </button>
                                  </div>
                                  <div class="modal-body">
                                    ${question}
                                    <input />
                                  </div>
                                  <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" class="btn btn-primary">Save changes</button>
                                  </div>
                                </div>
                              </div>
                        </div>`);

                        dialog.find(".btn-primary").click(function() {
                            var val = dialog.find("input").val();
                            cb(val);
                            if (autoclose)
                                dialog.modal("hide");
                        });

                        dialog.on("hidden.bs.modal", function() {
                            dialog.modal("dispose");
                            dialog.remove();
                        })

                        dialog.modal("show");
                    }
                }
            }
        };


        register(null, {
            ui: ui
        });

    }

});