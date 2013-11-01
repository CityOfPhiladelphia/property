window.requirejs = window.requirejs || {};
(function(requirejs) {
    "use strict";
    
    /**
     * Set up the third-party libraries
     */
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
                "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min"
                ,"lib/backbone-min"
            ]
            ,"jquery-bootstrap": [
                "//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/js/bootstrap.min"
                ,"lib/bootstrap.min"
            ]
            ,"jquery-cookie": "lib/jquery.cookie"
            ,"jquery-serializeObject": "lib/jquery.serializeObject"
            ,"jquery-inputmask": "lib/jquery.inputmask"
            ,"jquery-validate": "lib/jquery.validate"
        }
        ,shim: {
            "underscore": {
                exports: "_"
            }
            ,"backbone": {
                exports: "Backbone"
                ,deps: ["jquery", "underscore"]
            }
            ,"jquery-bootstrap": ["jquery"]
            ,"jquery-cookie": ["jquery"]
            ,"jquery-serializeObject": ["jquery"]
            ,"jquery-inputmask": ["jquery"]
            ,"jquery-validate": {
                exports: "jquery.validate"
                ,deps: ["jquery"]
            }
        }
        //,config: { i18n: { locale: "es" } }
    });
    
    require(["jquery", "jquery-cookie"], function($) {
        requirejs.config({config: { i18n: { locale: $.cookie("language") || "en" } }});
    });
    
    /**
     * Configure and initialize the application
     */
    require([
        "jquery"
        ,"underscore"
        ,"backbone"
        ,"router"
        ,"jquery-bootstrap"
        ,"jquery-cookie"
        //,"jquery-serializeObject"
        //,"jquery-inputmask"
    ], function($, _, Backbone, Router) {
        
        /**
         * Global configs
         */
        window.DEBUG = false; // Global
        _.templateSettings.variable = "data"; // Namespace for template data
        $.ajaxSetup({cache: true, timeout: 15000}); // Cache ajax requests
        
        /**
         * If no CORS support, use jsonp
         */
        Backbone.ajax = function() {
            if( ! $.support.cors && arguments.length) {
                arguments[0].cache = "true";
                arguments[0].timeout = 15000;
                arguments[0].dataType = "jsonp";
                return Backbone.$.ajax.apply(Backbone.$, arguments);
            }
            return Backbone.$.ajax.apply(Backbone.$, arguments);
        };
        
        /**
         * Initialize the application
         */
        new Router();
        Backbone.history.start();
    });
    
})(window.requirejs);