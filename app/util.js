var dateFormat = require('dateformat');

var Util = {};

Util.formatDate =  function(date){
    return dateFormat(date, "yyyy-mm-dd HH:MM:ssZ");
};

module.exports = Util;
