/**
 * Property View
 * Renders the property details
 */
define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"util"
    ,"text!templates/property.html"
], function($, _, Backbone, util, PropertyTemplate) {
    "use strict";

    var Property = Backbone.View.extend({
        className: "property"
        ,initialize: function() {
            this.template = _.template(PropertyTemplate);
        }
        ,render: function() {
            this.$el.html(this.template({property: this.model.toJSON(), util: util}));
            this.title = this.model.get("full_address");
            return this;
        }
    });
    
    return Property;
});