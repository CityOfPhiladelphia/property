define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"util"
    ,"text!templates/search-results-row.html"
], function($, _, Backbone, util, SearchResultsRowTemplate) {
    "use strict";

    var SearchResultsRow = Backbone.View.extend({
        tagName: "tr"
        ,initialize: function() {
            this.template = _.template(SearchResultsRowTemplate); // This should be done at page load not on initialize
        }
        ,render: function() {
            this.$el.html(this.template({searchResultsRow: this.model.toJSON(), util: util}));
            return this;
        }
    });
    
    return SearchResultsRow;
});