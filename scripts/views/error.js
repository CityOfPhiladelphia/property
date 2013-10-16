define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"text!templates/error.html"
], function($, _, Backbone, ErrorTemplate) {
    "use strict";

    var Error_ = Backbone.View.extend({ // `Error` is reserved word (I think)
        className: "error"
        ,initialize: function() {
            this.template = _.template(ErrorTemplate);
            this.message = this.options.message;
            this.title = "Error";
        }
        ,events: {
            "click [rel=\"reload\"]": "reload"
        }
        ,render: function() {
            this.$el.html(this.template({message: this.message || ""}));
            return this;
        }
        ,reload: function(e) {
            e.preventDefault();
            window.location.reload();
        }
    });
    
    return Error_;
});