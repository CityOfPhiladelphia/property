/**
 * Loop View
 * Renders the property's loop eligibility
 */
define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"util"
    ,"text!templates/loop.html"
], function($, _, Backbone, util, LoopTemplate) {
    "use strict";

    var Loop = Backbone.View.extend({
        className: "property"
        ,initialize: function(options) {
            this.template = _.template(LoopTemplate);
            _.bindAll(this, "onSubmit");
            this.loop = options.loop || {};
            window.loop = this.loop;
        }
        ,events: {
            "submit form": "onSubmit"
        }
        ,render: function() {
            this.$el.html(this.template({property: this.model.toJSON(), loop: this.loop.toJSON(), util: util}));
            this.title = this.model.get("full_address");
            //this.$(":input").inputmask(); // Activate input masks defined in markup
            return this;
        }
        ,onSubmit: function(e) {
            e.preventDefault();
            var data = {};//$(e.currentTarget).serializeObject();
            console.log("Submitted", data);
            
            // Ensure all questions answered
            if(_.contains(_.values(data), "") || _.size(data) < 4) {
                console.log("Error");
            }
        }
    });
    
    return Loop;
});