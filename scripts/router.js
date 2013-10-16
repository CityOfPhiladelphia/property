define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"util"
    // Models
    ,"models/property"
    // Collections
    ,"collections/search-results"
    // Views
    ,"views/home"
    ,"views/disclaimer"
    ,"views/property"
    ,"views/search-results"
    ,"views/search-results-row"
    ,"views/error"
], function($, _, Backbone, util, Property, SearchResults, HomeView, DisclaimerView, PropertyView, SearchResultsView, SearchResultsRowView, ErrorView) {
    "use strict";
    
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "home"
            ,"account/:account": "account"
            ,"address/:address(/:unit)": "address"
            ,"block/:hundred/:street": "block"
            ,"intersection/:street1/:street2": "intersection"
            ,"comparable/:eqid/:bldgcd": "comparable"
            ,"disclaimer": "disclaimer"
            ,"*path": "home"
        }
        /**
         * Ensure Google Analytics array has been created
         * Should be done in index.html but just in case
         */
        ,initialize: function() {
            window._gaq = window._gaq || [];
        }
        /**
         * Switch pages while preserving events
         * Also sets title
         * See: http://coenraets.org/blog/2012/01/backbone-js-lessons-learned-and-improved-sample-app/
         */
        ,showView: function(view) {
            if(this.currentView) {
                this.currentView.$el.detach();
            }
            $("#main").empty().append(view.render().el);
            document.title = view.title !== undefined && view.title ? view.title : $("title").text();
            this.currentView = view;
            util.scrollToTop();
            this.logPageView();
        }
        ,home: function() {
            if($.cookie("accepted-disclaimer")) {
                var homeView = new HomeView();
                this.showView(homeView);
            } else {
                Backbone.history.navigate("disclaimer", {trigger: true});
            }
        }
        /**
         * View a specific property by OPA Account Number
         * Called when a user enters an Account # or when the address they enter finds one account # from ulrs311
         */
        ,account: function(account) {
            var self = this
                ,input = {account: decodeURIComponent(account)};
            //app.properties = new app.Collections.Properties(null, {actnum: actnum});
            var property = new Property({input: input});
            util.loading(true);
            property.fetch({
                success: function(model, response, options) {
                    util.loading(false);
                    var propertyView = new PropertyView({model: model});
                    self.showView(propertyView);
                }
                ,error: function(model, xhr, options) {
                    util.loading(false);
                    self.error(model, xhr, options
                        ,"An error occurred while finding the property in the database. Please try again."
                        ,{method: "account", input: input, noresults: true}
                    );
                }
            });
        }
        /**
         * Find an OPA Account Number by address
         * If 1 result, view it; If multiple results, show list
         */
        ,address: function(address, unit) {
            var self = this
                ,input = {address: decodeURIComponent(address), unit: unit ? decodeURIComponent(unit) : null};
            var searchResults = new SearchResults(null, {input: input, method: "address"});
            util.loading(true);
            searchResults.fetch({
                success: function(collection, response, options) {
                    util.loading(false);
                    if(collection.length === 1) {
                        // If we found 1 account number, view it
                        self.navigate("account/" + collection.at(0).get("account_number"), {trigger: true, replace: true});
                    } else {
                        // If we found multiple account numbers, get the addresses of each
                        //self.multiple(collection.pluck("TopicID"));
                        var searchResultsView = new SearchResultsView({collection: collection});
                        self.showView(searchResultsView);
                    }
                }
                ,error: function(collection, xhr, options) {
                    util.loading(false);
                    self.error(collection, xhr, options
                        ,"An error occurred while verifying the address. Please try again."
                        ,{method: "address", input: input, noresults: true}
                    );
                }
            });
        }
        /**
         * Find properties by block
         */
        ,block: function(hundred, street) {
            var self = this
                ,input = {hundred: decodeURIComponent(hundred), street: decodeURIComponent(street)};
            var searchResults = new SearchResults(null, {input: input, method: "block"});
            util.loading(true);
            searchResults.fetch({
                success: function(collection, response, options) {
                    util.loading(false);
                    var searchResultsView = new SearchResultsView({collection: collection});
                    self.showView(searchResultsView);
                }
                ,error: function(collection, xhr, options) {
                    util.loading(false);
                    self.error(collection, xhr, options
                        ,"An error occurred while verifying the address. Please try again."
                        ,{method: "block", input: input, noresults: true}
                    );
                }
            });
        }
        /**
         * Find properties by intersection
         */
        ,intersection: function(street1, street2) {
            var self = this
                ,input = {street1: decodeURIComponent(street1), street2: decodeURIComponent(street2)};
            var searchResults = new SearchResults(null, {input: input, method: "intersection"});
            util.loading(true);
            searchResults.fetch({
                success: function(collection, response, options) {
                    util.loading(false);
                    var searchResultsView = new SearchResultsView({collection: collection});
                    self.showView(searchResultsView);
                }
                ,error: function(collection, xhr, options) {
                    util.loading(false);
                    self.error(collection, xhr, options
                        ,"An error occurred while verifying the address. Please try again."
                        ,{method: "intersection", input: input, noresults: true}
                    );
                }
            });
        }
        /**
         * Find comparable properties by EqID and Building Code
         */
        ,comparable: function(eqid, bldgcd) {
            var self = this
                ,input = {eqid: decodeURIComponent(eqid), bldgcd: decodeURIComponent(bldgcd)};
            var searchResults = new SearchResults(null, {input: input, method: "comparable"});
            util.loading(true);
            searchResults.fetch({
                success: function(collection, response, options) {
                    util.loading(false);
                    var searchResultsView = new SearchResultsView({collection: collection});
                    self.showView(searchResultsView);
                }
                ,error: function(collection, xhr, options) {
                    util.loading(false);
                    self.error(collection, xhr, options
                        ,"An error occurred while verifying the address. Please try again."
                        ,{method: "comparable", input: input, noresults: true}
                    );
                }
            });
        }
        /**
         * Common error handling. Optionally brings user back to search/home page on a 404 if home404data is provided
         * TODO: Add Google Analytics/Muscula error logging here
         */
        ,error: function(collection, xhr, options, message, home404data) {
            var url = typeof collection.url === "function" ? collection.url() : collection.url;
            this.logError(typeof xhr === "object" && xhr.status !== undefined ? xhr.status : "N/A", url);
            if(typeof home404data === "object" && typeof xhr === "object" && xhr.status >= 400 && xhr.status < 500) {
                var homeView = new HomeView(home404data);
                this.showView(homeView);
            } else {
                var errorView = new ErrorView({message: message || "An error occurred. Please try again."});
                this.showView(errorView);
            }
        }
        /**
         * Disclaimer / Terms of Use page
         */
        ,disclaimer: function() {
            var disclaimerView = new DisclaimerView();
            this.showView(disclaimerView);
        }
        /**
         * Google Analytics, called on every route if on production domain (see initialize)
         */
        ,logPageView: function() {
            var url = Backbone.history.getFragment();
            window._gaq.push(["_trackPageview", "/" + url]);
            if(window.DEBUG) console.log("Google Analytics", url);
        }
        ,logError: function(error, url) {
            window._gaq.push(["_trackEvent", "ErrorCaught", error + "", url]);
            if(window.DEBUG) console.log("Google Analytics Error", error, url);
        }
    });
    
    return AppRouter;
});