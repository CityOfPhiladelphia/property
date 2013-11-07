/**
 * Utilities / Helper Functions
 */
define([
    "jquery"
    ,"underscore"
], function($, _) {
    "use strict";

    var util = {};
    
    util.loading = function(status) {
        $("body").toggleClass("loading", status);
    };

    util.scrollToTop = function() {
        $(window).scrollTop(0);
    };
    
    /**
     * Add commas to numbers in thousands place etc.
     * http://stackoverflow.com/a/2901298/633406
     */
    util.formatNumber = function(x, decimals) {
        if(isNaN(x) || x === null) return x;
        if(decimals !== undefined) x = (decimals ? (Math.round(x * 100) / 100).toFixed(2) : Math.round(x));
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    util.friendlyDate = function(timestamp) {
        var date = new Date(timestamp);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    };
    
    return util;
});