window.requirejs = window.requirejs || {};
(function(requirejs) {
    "use strict";
    
    // Setting up the third-party libraries
    requirejs.config({
        baseUrl: "scripts/"
        ,paths: {
            "jquery": [
                "//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min"
                ,"lib/jquery.min"
            ]
            ,"underscore": [
                "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min"
                ,"lib/underscore-min"
            ]
            ,"backbone": [
                "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min"
                ,"lib/backbone-min"
            ]
            ,"jquery-bootstrap": [
                "//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/js/bootstrap.min"
                ,"lib/bootstrap.min"
            ]
            ,"jquery-jsonp": "lib/jquery-jsonp.min"
            ,"jquery-cookie": "lib/jquery.cookie"
        }
        ,shim: {
            "underscore": {
                exports: "_"
            }
            ,"backbone": {
                exports: "Backbone"
                ,deps: ["jquery", "underscore"]
            }
            ,"jquery-jsonp": {
                deps: ["jquery"]
            }
            ,"jquery-bootstrap": {
                deps: ["jquery"]
            }
            ,"jquery-cookie": {
                deps: ["jquery"]
            }
        }
    });
    
    // Starting the application
    require([
        "app"
    ], function(app) {
        app.init();
    });
})(window.requirejs);