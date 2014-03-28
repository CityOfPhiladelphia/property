define([
    "jquery"
    ,"underscore"
    ,"backbone"
], function($, _, Backbone) {
    "use strict";

    /*var Loop = Backbone.Model.extend({
        settings: {
            apiHost: "https://api.parse.com/1/"
            ,appId: "ZGJE4CIHiZxKTqdxFTPsCcf5xoRe0mlFMFsEvS3m" // Application ID
            ,apiKey: "Kxf4cXOJEQPi2OMW6P6jqcv71dUWa9Lykbku5zaY" // Javascript Key
        }
        ,initialize: function(options) {
            options = options || {};
            this.input = options.input || "";
        }
        ,url: function() {
            return this.settings.apiHost + "classes/Account";
        }
        // Override sync to add data and customize request for parse.com
        ,sync: function(method, model, options) {
            options.data = options.data || {};
            _.extend(options.data, {
                "_ApplicationId": this.settings.appId
                ,"_JavaScriptKey": this.settings.apiKey
                ,"_method": "GET"
                ,"where": {account_number: this.input.account}
            });
            options.data = JSON.stringify(options.data);
            options.contentType = "application/json";
            options.method = "POST";
            return Backbone.sync(method, model, options);
        }
        ,parse: function(response, options) {
            return response.results.length ? response.results[0] : {};
        }
    });*/

    var Loop = Backbone.Model.extend({
        settings: {
            apiHost: "http://phlloop.herokuapp.com/"
        }
        ,initialize: function(options) {
            options = options || {};
            this.input = options.input || "";
        }
        ,url: function() {
            return this.settings.apiHost + "account/" + this.input.account;
        }
        ,sync: function(method, model, options) {
            return Backbone.sync(method, model, options);
        }
        ,parse: function(response, options) {
            return response.response.result;
        }
    });
    
    return Loop;
});