window.requirejs = window.requirejs || {};
(function(requirejs) {
    "use strict";

    // Special code to stop the app if it's the browser that the
    // scraperbots are using. This var is set in GTM, globally.
    if (window.userAgentMozilla36) {
        return;
    }

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
            ,"underscore": "lib/underscore-min"
            ,"backbone": "lib/backbone-min"
            ,"jquery-bootstrap": "lib/bootstrap.min"
            ,"jquery-cookie": "lib/jquery.cookie"
            ,"jquery-serializeObject": "lib/jquery.serializeObject"
            ,"jquery-inputmask": "lib/jquery.inputmask"
            ,"jquery-validate": "lib/jquery.validate"
            ,"underscore-template-helpers": "lib/underscore.template-helpers"
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
            ,"jquery-validate": ["jquery"]
        }
        //,config: { i18n: { locale: "rev" } }
    });

    /**
     * Set the language first so require.js knows which strings.js file to fetch
     */
    require([
        "jquery"
        ,"underscore"
        ,"backbone"
        ,"router"
        ,"jquery-bootstrap"
        ,"jquery-cookie"
        ,"underscore-template-helpers"
        //,"i18n"
    ], function($, _, Backbone, Router) {
        requirejs.config({config: { i18n: { locale: $.cookie("language") || "en" } }});

        /**
         * Configure and initialize the application
         */
        require(["i18n!nls/strings"], function(strings) {

            /**
             * Global configs
             */
            window.DEBUG = false; // Global
            _.templateSettings.variable = "data"; // Namespace for template data
            $.ajaxSetup({
                cache: true // Cache ajax requests
                ,timeout: 15000 // Set timeout
                ,beforeSend: function(xhr, settings) { xhr.url = settings.url; } // Store URL in XHR object
            });

            /**
             * Add dictionary helper
             * sprintf style logic from http://stackoverflow.com/a/4673436/633406
             */
            _.addTemplateHelpers({
                D: function(key) {
                    var args = [].slice.call(arguments,1)
                        ,string = strings[key] || key;
                    return string.replace(/{(\d+)}/g, function(match, number) {
                        return typeof args[number] != 'undefined' ? args[number] : match;
                    });
                }
            });

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
             * TODO: Determine if it's necessary to wrap this in document.ready
             */
            $(document).ready(function() {
                new Router();
                Backbone.history.start();
            });
        });
    });

})(window.requirejs);
