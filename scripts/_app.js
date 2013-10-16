window.OPA = window.OPA || {Models: {}, Collections: {}, Views: {}, Routers: {}};
window.util = window.util || {};
window.jQuery = window.jQuery || {};
window._ = window._ || {};
window.Backbone = window.Backbone || {};
(function(window, $, _, Backbone, app, util) {
    
    /**
     * Config
     * TODO: Override backbone ajax with jquery-jsonp
     * TODO: AccountNumbers just 404s on jsonp, no way to tell if it's a server error or no results
     */
    window.DEBUG = false; // Global
    _.templateSettings.variable = "data"; // Namespace for template data
    $.ajaxSetup({cache: true, timeout: 15000}); // Cache ajax requests (used by typeahead)
    
    /**
     * If no CORS support, use jquery-jsonp library for ajax
     */
    Backbone.ajax = function() {
        if( ! $.support.cors && arguments.length) {
            arguments[0].callbackParameter = "callback";
            arguments[0].cache = "true";
            arguments[0].timeout = 15000;
            return Backbone.$.jsonp.apply(Backbone.$, arguments);
        }
        return Backbone.$.ajax.apply(Backbone.$, arguments);
    };
    
    app.Models.Property = Backbone.Model.extend({
        settings: {
            apiHost: "http://services.phila.gov/OPA/v1.0/"
        }
        ,initialize: function(options) {
            this.input = options.input || "";
        }
        ,url: function() {
            return this.settings.apiHost + "account/" + encodeURIComponent(this.input.account) + "?format=json";
        }
        ,parse: function(response, options) {
            var property = response.data.property;
            
            // Parse timestamp from API
            property.sales_information.sales_date = parseInt(property.sales_information.sales_date.replace(/[^-\d]/g, ""), 0);
            
            // DEBUG: Add proposed_valuation object for testing
            property.proposed_valuation = {
                market_value: property.valuation_history[0].market_value
                ,land_taxable: property.valuation_history[0].land_taxable
                ,land_exempt: property.valuation_history[0].land_exempt
                ,improvement_taxable: property.valuation_history[0].improvement_taxable
                ,improvement_exempt: property.valuation_history[0].improvement_exempt
                ,taxes: property.valuation_history[0].taxes
                ,certification_year: parseInt(property.valuation_history[0].certification_year, 10) + 1 // proposed_valuation has no year field, so we increment from previous_value's
            };
            
            // Property Conditions Lookup values
            var conditions = [
                "Not Applicable"
                ,"1"
                ,"New / Rehabbed"
                ,"Above Average"
                ,"Average"
                ,"Below Average"
                ,"Vacant"
                ,"Sealed / Structurally Compliant"
            ];
            property.characteristics.exterior_condition = conditions[property.characteristics.exterior_condition];
            
            return property;
        }
        //,sync: function(method, collection, options) {
    });
    
    app.Collections.SearchResults = Backbone.Collection.extend({
        settings: {
            apiHost: "http://services.phila.gov/OPA/v1.0/"
            ,skip: 0
            ,limit: 30
        }
        ,initialize: function(models, options) {
            this.method = options.method || "";
            this.input = options.input || {};
            this.skip = options.skip || this.settings.skip;
            this.limit = options.limit || this.settings.limit;
        }
        ,url: function() {
            var url = this.settings.apiHost;
            // Note that /account is handled by app.Models.Property
            switch(this.method) {
                case "address":
                    url += "address/" + encodeURIComponent(this.input.address) + "/" + (this.input.unit ? encodeURIComponent(this.input.unit) : ""); // Include the slash no matter what or API will redirect
                    break;
                case "block":
                    url += "block/" + encodeURIComponent(this.input.hundred + " " + this.input.street) + "/"; // Trailing slash as per API spec
                    break;
                case "intersection":
                    url += "intersection/" + encodeURIComponent(this.input.street1) + "/" + encodeURIComponent(this.input.street2);
                    break;
                case "comparable":
                    url += "comparable/" + encodeURIComponent(this.input.eqid) + "/" + encodeURIComponent(this.input.bldgcd);
                    break;
            }
            
            url += "?format=json&limit=" + this.limit + "&skip=" + this.skip;
            return url;
        }
        ,parse: function(response, options) {
            this.total = response.total;
            this.moreAvailable = response.total > this.length + response.data.properties.length;
            
            // Parse timestamp from API
            var i;
            for(i in response.data.properties) {
                response.data.properties[i].sales_information.sales_date = parseInt(response.data.properties[i].sales_information.sales_date.replace(/[^-\d]/g, ""), 0);
            }
            
            return response.data.properties;
        }
        /**
        * Override sync to return 404 if no records
        */
        ,sync: function(method, collection, options) {
            var collection = this
                ,oldOptions = _.clone(options);
            options.success = function(response, status, options) {
                if(response.status === "error" || response.data.properties === undefined || ! response.data.properties.length) {
                    oldOptions.error({status: 404});
                } else {
                    oldOptions.success(response, options);
                }
            };
            Backbone.sync(method, collection, options);
        }
    });
    
    /**
     * Home/Search View
     * Handles enhanced <select>, form submission
     * TODO: Add auto focus
     */
    app.Views.HomeView = Backbone.View.extend({
        className: "home"
        ,initialize: function() {
            _.bindAll(this, "render", "onSubmit");
            this.template = _.template($("#tmpl-home").html());
            this.title = "Property Search";
        }
        ,events: {
            "submit form": "onSubmit"
        }
        ,render: function() {
            this.$el.html(this.template({method: this.options.method || null, input: this.options.input || null, noresults: this.options.noresults || false}));
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
                    app.router.navigate("/address/" + address + (unit ? "/" + unit : ""), {trigger: true});
                    break;
                case "account":
                    var accountNode = e.currentTarget.account
                        ,account = accountNode.value;
                    if( ! account) return $(accountNode).focus();
                    app.router.navigate("/account/" + account, {trigger: true});
                    break;
                case "block":
                    var hundredNode = e.currentTarget.hundred
                        ,hundred = hundredNode.value
                        ,streetNode = e.currentTarget.street
                        ,street = streetNode.value;
                    if( ! hundred) return $(hundredNode).focus();
                    if( ! street) return $(streetNode).focus();
                    app.router.navigate("/block/" + hundred + "/" + street, {trigger: true}); // Combine to one field as per API spec
                    break;
                case "intersection":
                    var street1Node = e.currentTarget.street1
                        ,street1 = street1Node.value
                        ,street2Node = e.currentTarget.street2
                        ,street2 = street2Node.value;
                    if( ! street1) return $(street1Node).focus();
                    if( ! street2) return $(street2Node).focus();
                    app.router.navigate("/intersection/" + street1 + "/" + street2, {trigger: true}); // Combine to one field as per API spec
                    break;
            }
        }
        ,sanitize: function(input, type) { // TODO: Remove double spaces (should this allow hyphens?)
            return typeof input === "string" ? input.replace(type === "actnum" ? /[^\d]/g : /[^\w\d\s-]/g, "") : "";
        }
    });
    
    /**
     * Property View
     * Renders the property details
     */
    app.Views.PropertyView = Backbone.View.extend({
        className: "property"
        ,initialize: function() {
            this.template = _.template($("#tmpl-property").html());
        }
        ,render: function() {
            this.$el.html(this.template({property: this.model.toJSON()}));
            this.title = this.model.get("full_address");
            return this;
        }
    });
    
    /**
     * Search Results View
     * When multiple properties are found for the user's input, this renders a list
     */
    app.Views.SearchResultsView = Backbone.View.extend({
        className: "search-results"
        ,initialize: function() {
            _.bindAll(this, "onClickMore");
            this.template = _.template($("#tmpl-search-results").html());
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
                list.append((new app.Views.SearchResultsRowView({model: model})).render().el);
            });
            this.checkMoreButton();
            return this;
        }
        ,addRow: function(model) {
            this.$(".results tbody").append((new app.Views.SearchResultsRowView({model: model})).render().el);
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
    
    /**
     * Search Results Row View
     * The individual row in the list of multiple properties found in a search result
     * Separated in order to add the 'more' button with 'add' events
     */
    app.Views.SearchResultsRowView = Backbone.View.extend({
        tagName: "tr"
        ,initialize: function() {
            this.template = _.template($("#tmpl-search-results-row").html()); // This should be done at page load not on initialize
        }
        ,render: function() {
            this.$el.html(this.template({searchResultsRow: this.model.toJSON()}));
            return this;
        }
    })
    
    /**
     * Error View
     * Displayed when there is an ajax error
     */
    app.Views.ErrorView = Backbone.View.extend({
        className: "error"
        ,initialize: function() {
            this.template = _.template($("#tmpl-error").html());
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
    })
    
    /**
     * Disclaimer View
     * Shows terms of use and disclaimer
     */
    app.Views.DisclaimerView = Backbone.View.extend({
        className: "disclaimer"
        ,initialize: function() {
            this.template = $("#tmpl-disclaimer").html();
            this.title = "Disclaimer";
        }
        ,render: function() {
            this.$el.html(this.template);
            return this;
        }
    })
    
    /**
     * Application Router
     */
    app.Routers.AppRouter = Backbone.Router.extend({
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
        /**
         * Landing / Search page
         */
        ,home: function() {
            app.homeView = new app.Views.HomeView();
            this.showView(app.homeView);
        }
        /**
         * View a specific property by OPA Account Number
         * Called when a user enters an Account # or when the address they enter finds one account # from ulrs311
         */
        ,account: function(account) {
            var self = this
                ,input = {account: decodeURIComponent(account)};
            //app.properties = new app.Collections.Properties(null, {actnum: actnum});
            app.property = new app.Models.Property({input: input});
            util.loading(true);
            app.property.fetch({
                success: function(model, response, options) {
                    util.loading(false);
                    app.propertyView = new app.Views.PropertyView({model: model});
                    self.showView(app.propertyView);
                    
                    // Get Comparables
                    // TODO: Is there a better place for this? Kinda doing view logic here...
                    var limit = 3
                        ,comparableInput = {eqid: model.get("characteristics").eq_id, bldgcd: model.get("characteristics").building_code}
                        ,comparables = new app.Collections.SearchResults(null, {input: comparableInput, method: "comparable", limit: limit + 1}); // Get an extra one in case this property is one of the first 3
                    comparables.fetch({
                        success: function(collection, response, options) {
                            var i = 0
                                ,list = $(".results tbody");
                            collection.each(function(model) {
                                if(model.get("account_number") !== account && i < limit) { // Make sure we're not displaying this property in its list of comparables, but still only display 3
                                    // TODO: Ideally I'd only call append() once to limit DOM insertions, but how do I append an array of el's?
                                    list.append((new app.Views.SearchResultsRowView({model: model})).render().el);
                                    i++
                                }
                            });
                            $(".more-amount").text(collection.total - limit);
                            $(".more").toggle(collection.total - limit > 0);
                        }
                        ,error: function(collection, xhr, options) {
                            this.$(".results, .more").toggle(collection.total - limit > 0);
                        }
                    });
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
            app.searchResults = new app.Collections.SearchResults(null, {input: input, method: "address"});
            util.loading(true);
            app.searchResults.fetch({
                success: function(collection, response, options) {
                    util.loading(false);
                    if(collection.length === 1) {
                        // If we found 1 account number, view it
                        self.navigate("account/" + collection.at(0).get("account_number"), {trigger: true, replace: true});
                    } else {
                        // If we found multiple account numbers, get the addresses of each
                        //self.multiple(collection.pluck("TopicID"));
                        app.searchResultsView = new app.Views.SearchResultsView({collection: collection});
                        self.showView(app.searchResultsView);
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
            app.searchResults = new app.Collections.SearchResults(null, {input: input, method: "block"});
            util.loading(true);
            app.searchResults.fetch({
                success: function(collection, response, options) {
                    util.loading(false);
                    app.searchResultsView = new app.Views.SearchResultsView({collection: collection});
                    self.showView(app.searchResultsView);
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
            app.searchResults = new app.Collections.SearchResults(null, {input: input, method: "intersection"});
            util.loading(true);
            app.searchResults.fetch({
                success: function(collection, response, options) {
                    util.loading(false);
                    app.searchResultsView = new app.Views.SearchResultsView({collection: collection});
                    self.showView(app.searchResultsView);
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
            app.searchResults = new app.Collections.SearchResults(null, {input: input, method: "comparable"});
            util.loading(true);
            app.searchResults.fetch({
                success: function(collection, response, options) {
                    util.loading(false);
                    app.searchResultsView = new app.Views.SearchResultsView({collection: collection});
                    self.showView(app.searchResultsView);
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
                app.homeView = new app.Views.HomeView(home404data);
                this.showView(app.homeView);
            } else {
                app.errorView = new app.Views.ErrorView({message: message || "An error occurred. Please try again."});
                this.showView(app.errorView);
            }
        }
        /**
         * Disclaimer / Terms of Use page
         */
        ,disclaimer: function() {
            app.disclaimerView = new app.Views.DisclaimerView();
            this.showView(app.disclaimerView);
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
    
    /**
     * Initiate application
     */
    $(document).ready(function() {
        app.router = new app.Routers.AppRouter();
        Backbone.history.start();
    });
    
})(window, window.jQuery, window._, window.Backbone, window.OPA, window.util);