define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"util"
    // Models
    ,"models/property"
    ,"models/loop"
    // Collections
    ,"collections/search-results"
    // Views
    ,"views/home"
    ,"views/disclaimer"
    ,"views/property"
    ,"views/loop"
    ,"views/search-results"
    ,"views/search-results-row"
    ,"views/error"
], function($, _, Backbone, util, Property, Loop, SearchResults, HomeView, DisclaimerView, PropertyView, LoopView, SearchResultsView, SearchResultsRowView, ErrorView) {
    "use strict";

    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "home"
            ,"account/:account(/*path)": "account"
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
            this.cache = {id: null, model: null};
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
                Backbone.history.navigate("disclaimer", {trigger: true, replace: true});
            }
        }
        /**
         * View a specific property by OPA Account Number
         * Called when a user enters an Account # or when the address they enter finds one account # from ulrs311
         */
        ,account: function(account, path) {
            var self = this
                ,promises = []
                ,view
                ,input = {account: decodeURIComponent(account)};
            path = path ? path.toLowerCase() : "";

            // If we've already fetched this model, reuse it rather than fetching again
            var property;
            if(this.cache.id === input.account) {
                property = this.cache.model;
            } else {
                property = new Property({input: input});
                promises.push(property.fetch());
                this.cache.id = input.account;
                this.cache.model = property;
            }

            // If path specified
            if(path === "loop") {
                var loop = new Loop({input: input});
                promises.push(loop.fetch());

                view = new LoopView({model: property, loop: loop});
            } else {
                view = new PropertyView({model: property});
            }

            util.loading(true);
            $.when.apply($, promises)
            .done(function() {
                util.loading(false);
                self.showView(view);
            })
            .fail(function(xhr) {
                util.loading(false);

                // If response is 400-499, it means the account couldn't be found; go back to search page
                // TODO: Ensure this works with JSONP
                if(xhr.status !== undefined && xhr.status >= 400 && xhr.status < 500) {
                    var homeView = new HomeView({method: "account", input: input, noresults: true});
                    self.showView(homeView);
                }
                // Otherwise, something went wrong; go to error page
                else {
                    // If the XHR that failed is the LOOP XHR, show the LOOP error
                    if(xhr.url && xhr.url === loop.url()) {
                        self.error(xhr, "error-loop-fail");
                    } else {
                        self.error(xhr, "error-account-fail");
                    }
                }
            });
        }
        /**
         * Find an OPA Account Number by address
         * If 1 result, view it; If multiple results, show list
         */
        ,address: function(address, unit) {
            var self = this
                ,promises = []
                ,input = {address: decodeURIComponent(address), unit: unit ? decodeURIComponent(unit) : null};

            var searchResults = new SearchResults(null, {input: input, method: "address"});
            promises.push(searchResults.fetch());

            util.loading(true);
            $.when.apply($, promises)
            .done(function() {
                util.loading(false);

                // If no results found, go back to search page
                if( ! searchResults.length) {
                    var homeView = new HomeView({method: "address", input: input, noresults: true});
                    self.showView(homeView);
                }
                // If we found 1 account number, go to that account page
                else if(searchResults.length === 1) {
                    self.navigate("account/" + searchResults.at(0).get("account_number"), {trigger: true, replace: true});
                }
                // If we found multiple account numbers, go to multiple results page
                else {
                    var searchResultsView = new SearchResultsView({collection: searchResults});
                    self.showView(searchResultsView);
                }
            })
            .fail(function(collection, xhr, options) {
                util.loading(false);
                self.error(xhr, "error-address-fail");
            });
        }
        /**
         * Find properties by block
         */
        ,block: function(hundred, street) {
            var self = this
                ,promises = []
                ,input = {hundred: decodeURIComponent(hundred), street: decodeURIComponent(street)};

            var searchResults = new SearchResults(null, {input: input, method: "block"});
            promises.push(searchResults.fetch());

            util.loading(true);
            $.when.apply($, promises)
            .done(function() {
                util.loading(false);

                // If no results found, go back to search page
                if( ! searchResults.length) {
                    var homeView = new HomeView({method: "block", input: input, noresults: true});
                    self.showView(homeView);
                }
                // Otherwise, go to multiple results page
                else {
                    var searchResultsView = new SearchResultsView({collection: searchResults});
                    self.showView(searchResultsView);
                }
            })
            .fail(function(collection, xhr, options) {
                util.loading(false);
                self.error(xhr, "error-address-fail");
            });
        }
        /**
         * Find properties by intersection
         */
        ,intersection: function(street1, street2) {
            var self = this
                ,promises = []
                ,input = {street1: decodeURIComponent(street1), street2: decodeURIComponent(street2)};

            var searchResults = new SearchResults(null, {input: input, method: "intersection"});
            promises.push(searchResults.fetch());

            util.loading(true);
            $.when.apply($, promises)
            .done(function() {
                util.loading(false);

                // If no results found, go back to search page
                if( ! searchResults.length) {
                    var homeView = new HomeView({method: "intersection", input: input, noresults: true});
                    self.showView(homeView);
                }
                // Otherwise, go to multiple results page
                else {
                    var searchResultsView = new SearchResultsView({collection: searchResults});
                    self.showView(searchResultsView);
                }
            })
            .fail(function(collection, xhr, options) {
                util.loading(false);
                self.error(xhr, "error-address-fail");
            });
        }
        /**
         * Common error handling. Optionally brings user back to search/home page on a 404 if home404data is provided
         */
        ,error: function(xhr, message) {
            this.logError(message);
            var errorView = new ErrorView({message: message});
            this.showView(errorView);
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
        ,logError: function(error) {
            window._gaq.push(["_trackEvent", "ErrorCaught", error + "", Backbone.history.fragment]);
            if(window.DEBUG) console.log("Google Analytics Error", error, Backbone.history.fragment);
        }
    });

    return AppRouter;
});