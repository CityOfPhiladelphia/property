define([
    "jquery"
    ,"underscore"
    ,"backbone"
], function($, _, Backbone) {
    "use strict";

    var Property = Backbone.Model.extend({
        settings: {
            apiHost: "http://api.phila.gov/OPA/v1.1/"
        }
        ,initialize: function(options) {
            this.input = options.input || "";
        }
        ,url: function() {
            return this.settings.apiHost + "account/" + encodeURIComponent(this.input.account) + "?format=json";
        }
        ,parse: function(response, options) {
            var property = response.data.property;
            
            // Parse timestamp from API
            property.sales_information.sales_date = parseInt(property.sales_information.sales_date.replace(/[^-\d]/g, ""), 0);
            
            // DEBUG: Add proposed_valuation object for testing
            /*property.proposed_valuation = {
                market_value: property.valuation_history[0].market_value
                ,land_taxable: property.valuation_history[0].land_taxable
                ,land_exempt: property.valuation_history[0].land_exempt
                ,improvement_taxable: property.valuation_history[0].improvement_taxable
                ,improvement_exempt: property.valuation_history[0].improvement_exempt
                ,taxes: property.valuation_history[0].taxes
                ,certification_year: parseInt(property.valuation_history[0].certification_year, 10) + 1 // proposed_valuation has no year field, so we increment from previous_value's
            };*/
            
            return property;
        }
        //,sync: function(method, collection, options) {
    });
    
    return Property;
});
