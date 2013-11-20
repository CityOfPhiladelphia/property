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
    ,"jquery-validate"
], function($, _, Backbone, util, LoopTemplate) {
    "use strict";

    var Loop = Backbone.View.extend({
        className: "property"
        ,initialize: function(options) {
            this.template = _.template(LoopTemplate);
            _.bindAll(this, "onSubmit");
            this.loop = options.loop || {};
            window.loop = this.loop;
            
            // Max income depending on size of household
            this.incomeRequirements = [
                83200   // 1
                ,95050  // 2
                ,106950 // 3
                ,118800 // 4
                ,128350 // 5
                ,137850 // 6
                ,147350 // 7
                ,156850 // 8
            ];
        }
        ,events: {
            "submit form": "onSubmit"
        }
        ,render: function() {
            this.$el.html(this.template({property: this.model.toJSON(), loop: this.loop.toJSON(), util: util, incomeRequirements: this.incomeRequirements}));
            this.title = this.model.get("full_address");
            //this.$(":input").inputmask(); // Activate input masks defined in markup
            this.$("form").validate();
            return this;
        }
        ,onSubmit: function(e) {
            e.preventDefault();
            var form = $(e.currentTarget)
                ,data = {
                    taxstatus: $("input[name=\"taxstatus\"]:checked", form).val()
                    ,ownocc: $("input[name=\"ownocc\"]:checked", form).val()
                    ,count: parseInt(e.currentTarget.count.value, 10)
                    ,income: parseInt(e.currentTarget.income.value, 10)
                };
            // Income requirements not required until legislation passes
            if(data.taxstatus === "yes" && data.ownocc === "yes" && data.count > 0 && this.checkIncomeRequirements(data.count, data.income)) {
                this.$(".eligibility-answer.alert-error").hide();
                this.$(".eligibility-answer.alert-success").show();
            } else {
                this.$(".eligibility-answer.alert-success").hide();
                this.$(".eligibility-answer.alert-error").show();
            }
        }
        ,checkIncomeRequirements: function(householdSize, income) {
            return income <= this.incomeRequirements[householdSize-1] || 0;
        }
    });
    
    return Loop;
});