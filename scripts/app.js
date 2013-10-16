define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"router"
    ,"jquery-bootstrap"
    ,"jquery-cookie"
], function($, _, Backbone, Router) {
    "use strict";
    
    window.DEBUG = false; // Global
    _.templateSettings.variable = "data"; // Namespace for template data
    $.ajaxSetup({cache: true, timeout: 15000}); // Cache ajax requests
    
    /**
     * If no CORS support, use jsonp library for ajax
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
    
    var App = {
        init: function() {
            this.router = new Router();
            Backbone.history.start();
        }
    };
    
    return App;
});