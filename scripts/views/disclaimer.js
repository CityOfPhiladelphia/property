define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"text!templates/disclaimer.html"
], function($, _, Backbone, DisclaimerTemplate) {
    "use strict";

    var Disclaimer = Backbone.View.extend({
        className: "disclaimer"
        ,initialize: function() {
            this.template = DisclaimerTemplate;
            this.title = "Disclaimer";
        }
        ,events: {
            "click .accept": "onAccept"
        }
        ,render: function() {
            this.$el.html(this.template);
            return this;
        }
        ,onAccept: function(e) {
            $.cookie("accepted-disclaimer", true);
        }
    });
    
    return Disclaimer;
});