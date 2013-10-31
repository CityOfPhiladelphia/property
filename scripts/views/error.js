define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"text!templates/error.html"
], function($, _, Backbone, ErrorTemplate) {
    "use strict";
    
    var errorMessages = {
        "account-fail": "An error occurred while finding the property in the database. Please try again."
        ,"address-fail": "An error occurred while verifying the address. Please try again."
        ,"default": "An error occurred. Please try again."
    }

    var Error_ = Backbone.View.extend({ // `Error` is reserved word (I think)
        className: "error"
        ,initialize: function(options) {
            this.template = _.template(ErrorTemplate);
            this.message = options.message;
            this.title = "Error";
        }
        ,events: {
            "click [rel=\"reload\"]": "reload"
        }
        ,render: function() {
            this.$el.html(this.template({message: errorMessages[this.message] || errorMessages.default}));
            return this;
        }
        ,reload: function(e) {
            e.preventDefault();
            window.location.reload();
        }
    });
    
    return Error_;
});