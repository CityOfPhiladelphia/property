define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"text!templates/search-results.html"
    ,"views/search-results-row"
], function($, _, Backbone, SearchResultsTemplate, SearchResultsRowView) {
    "use strict";

    var SearchResults = Backbone.View.extend({
        className: "search-results"
        ,initialize: function() {
            _.bindAll(this, "onClickMore");
            this.template = _.template(SearchResultsTemplate);
            this.collection.on("add", this.addRow, this);
            this.title = "Multiple Properties Found";
        }
        ,events: {
            "click .more": "onClickMore"
        }
        ,render: function() {
            var list;
            this.$el.html(this.template({searchResults: this.collection.toJSON(), total: this.collection.total}));
            list = this.$(".results");
            this.collection.each(function(model) {
                // TODO: Ideally I'd only call append() once to limit DOM insertions, but how do I append an array of el's?
                list.append((new SearchResultsRowView({model: model})).render().el);
            });
            this.checkMoreButton();
            return this;
        }
        ,addRow: function(model) {
            this.$(".results tbody").append((new SearchResultsRowView({model: model})).render().el);
            this.checkMoreButton();
        }
        ,onClickMore: function(e) {
            e.preventDefault();
            var button = $(e.currentTarget);
            button.button("loading");
            this.collection.skip = this.collection.skip + this.collection.limit;
            this.collection.fetch({
                remove: false // Add new models to collection instead of replacing
                ,success: function() {
                    button.button("reset");
                }
                ,error: function() {
                    button.button("error");
                }
            });
        }
        ,checkMoreButton: function() {
            this.$(".more").toggle(this.collection.moreAvailable);
        }
    });
    
    return SearchResults;
});