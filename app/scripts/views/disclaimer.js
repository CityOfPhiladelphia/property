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
            this.template = _.template(DisclaimerTemplate);
            this.title = "Disclaimer";
        }
        ,events: {
            "click .accept": "onAccept"
            ,"click #language a": "onClickLanguage"
        }
        ,render: function() {
            this.$el.html(this.template());
            return this;
        }
        ,onAccept: function(e) {
            $.cookie("accepted-disclaimer", true);
        }
        ,onClickLanguage: function(e) {
            e.preventDefault();
            var language = $(e.currentTarget).data("language") || "en";
            $.cookie("language", language);
            window.location.reload();
        }
    });
    
    return Disclaimer;
});