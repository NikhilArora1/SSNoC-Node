var dateFormat = require('dateformat');

var Util = {};

Util.formatDate =  function(date){
    return dateFormat(date, "yyyy-mm-dd HH:MM");
};

module.exports = Util;