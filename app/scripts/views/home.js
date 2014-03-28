/**
 * Home/Search View
 * Handles enhanced <select>, form submission
 */
define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"text!templates/home.html"
], function($, _, Backbone, HomeTemplate) {
    var HomeView = Backbone.View.extend({
        className: "home"
        ,initialize: function(options) {
            //_.bindAll(this, "render", "onSubmit", "onClickLanguage");
            this.template = _.template(HomeTemplate);
            this.title = "Property Search";
            options = options || {};
            this.method = options.method || "";
            this.input = options.input || {};
            this.noresults = options.noresults || false;
        }
        ,events: {
            "submit form": "onSubmit"
            ,"click #language a": "onClickLanguage"
        }
        ,render: function() {
            this.$el.html(this.template({method: this.method, input: this.input, noresults: this.noresults}));
            return this;
        }
        ,onSubmit: function(e) {
            e.preventDefault();
            var method = $(e.currentTarget).data("method");
            
            switch(method) {
                case "address":
                    var addressNode = e.currentTarget.address
                        ,address = addressNode.value
                        ,unit = e.currentTarget.unit.value;
                    if( ! address) return $(addressNode).focus();
                    Backbone.history.navigate("/address/" + address + (unit ? "/" + unit : ""), {trigger: true});
                    break;
                case "account":
                    var accountNode = e.currentTarget.account
                        ,account = accountNode.value;
                    if( ! account) return $(accountNode).focus();
                    Backbone.history.navigate("/account/" + account, {trigger: true});
                    break;
                case "block":
                    var hundredNode = e.currentTarget.hundred
                        ,hundred = hundredNode.value
                        ,streetNode = e.currentTarget.street
                        ,street = streetNode.value;
                    if( ! hundred) return $(hundredNode).focus();
                    if( ! street) return $(streetNode).focus();
                    Backbone.history.navigate("/block/" + hundred + "/" + street, {trigger: true}); // Combine to one field as per API spec
                    break;
                case "intersection":
                    var street1Node = e.currentTarget.street1
                        ,street1 = street1Node.value
                        ,street2Node = e.currentTarget.street2
                        ,street2 = street2Node.value;
                    if( ! street1) return $(street1Node).focus();
                    if( ! street2) return $(street2Node).focus();
                    Backbone.history.navigate("/intersection/" + street1 + "/" + street2, {trigger: true}); // Combine to one field as per API spec
                    break;
            }
        }
        ,sanitize: function(input, type) {
            return typeof input === "string" ? input.trim().replace(type === "number" ? /[^\d]/g : /[^\w\d\s-]/g, "") : "";
        }
        ,onClickLanguage: function(e) {
            e.preventDefault();
            var language = $(e.currentTarget).data("language") || "en";
            $.cookie("language", language);
            window.location.reload();
        }
    });
    
    return HomeView;
});