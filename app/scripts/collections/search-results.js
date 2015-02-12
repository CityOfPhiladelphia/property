define([
    "jquery"
    ,"underscore"
    ,"backbone"
], function($, _, Backbone) {
    "use strict";

    var SearchResults = Backbone.Collection.extend({
        settings: {
            apiHost: "http://api.phila.gov/OPA/v1.1/"
            ,skip: 0
            ,limit: 30
        }
        ,initialize: function(models, options) {
            this.method = options.method || "";
            this.input = options.input || {};
            this.skip = options.skip || this.settings.skip;
            this.limit = options.limit || this.settings.limit;
        }
        ,url: function() {
            var url = this.settings.apiHost;
            // Note that /account is handled by app.Models.Property
            switch(this.method) {
                case "address":
                    url += "address/" + encodeURIComponent(this.input.address) + "/" + (this.input.unit ? encodeURIComponent(this.input.unit) : ""); // Include the slash no matter what or API will redirect
                    break;
                case "block":
                    url += "block/" + encodeURIComponent(this.input.hundred + " " + this.input.street) + "/"; // Trailing slash as per API spec
                    break;
                case "intersection":
                    url += "intersection/" + encodeURIComponent(this.input.street1) + "/" + encodeURIComponent(this.input.street2);
                    break;
                case "comparable":
                    url += "comparable/" + encodeURIComponent(this.input.eqid) + "/" + encodeURIComponent(this.input.bldgcd);
                    break;
            }
            
            url += "?format=json&limit=" + this.limit + "&skip=" + this.skip;
            return url;
        }
        ,parse: function(response, options) {
            this.total = response.total;
            this.moreAvailable = response.total > this.length + response.data.properties.length;
            
            // Parse timestamp from API
            var i;
            for(i in response.data.properties) {
                response.data.properties[i].sales_information.sales_date = parseInt(response.data.properties[i].sales_information.sales_date.replace(/[^-\d]/g, ""), 0);
                
                // Temporary API bug fix - if valuation_history is empty, API doesn't show empty array
                if(response.data.properties[i].valuation_history === undefined) response.data.properties[i].valuation_history = [];
            }
            
            return response.data.properties;
        }
        /**
        * Override sync to return 404 if no records
        */
        ,sync: function(method, collection, options) {
            var collection = this // TODO: Inspect this. Redundancy?
                ,oldOptions = _.clone(options);
            options.success = function(response, status, options) {
                if(response.status === "error" || response.data === undefined || response.data.properties === undefined || ! response.data.properties.length) {
                    oldOptions.error({status: 404});
                } else {
                    oldOptions.success(response, options);
                }
            };
            return Backbone.sync(method, collection, options);
        }
    });
    
    return SearchResults;
});
