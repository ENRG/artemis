var config = {
  apiUrl: ''
, tickInterval: 500
};

var utils = {};
utils.ajax = function(method, url, data, callback){
  switch (method){
    case "get":     method = "GET";     break;
    case "post":    method = "POST";    break;
    case "del":     method = "DELETE";  break;
    case "put":     method = "PUT";     break;
    case "patch":   method = "PUT";     break;
  }

  if (typeof data === "function"){
    callback = data;
    data = null;
  }

  if (method === "GET" || method === "get"){
    url += utils.queryParams(data);
    data = null;
  }

  var ajax = {
    type: method
  , method: method
  , url: url
  , xhrFields: { withCredentials: true }
  , crossDomain: true
  , success: function(results){
      if (typeof results == 'string' && results) results = JSON.parse(results);
      results = results || {};
      callback && callback(results.error, results.data, results.meta);
    }
  , error: function(error, results, res, r){
      callback && callback(error.responseText ? JSON.parse(error.responseText).error : error);
    }
  };


  if (data) ajax.data = data;

  $.ajax(ajax);
};

utils.get = function(url, params, callback){
  utils.ajax('get', url, params, callback);
  return utils;
};

utils.post = function(url, data, callback){
  utils.ajax('post', url, data, callback);
  return utils;
};

utils.put = function(url, data, callback){
  utils.ajax('put', url, data, callback);
  return utils;
};

 utils.patch = function(url, data, callback){
  utils.ajax('patch', url, data, callback);
  return utils;
};

utils.del = function(url, data, callback){
  utils.ajax('delete', url, data, callback);
  return utils;
};

utils.queryParams = function(data){
  if (typeof data !== "object") return "";
  var params = "?";
  for (var key in data){
    if (Array.isArray(data[key])){
      for (var i = 0, l = data[key].length; i < l; ++i){
        params += key + "[]=" + data[key][i] + "&";
      }
    } else {
      params += key + "=" + data[key] + "&";
    }
  }
  return params.substring(0, params.length - 1);
};

utils.noop = function(){};

utils.api = {};

utils.api.get = function(url, data, callback){
  utils.get(config.apiUrl + url, data, callback);
};

utils.api.post = function(url, data, callback){
  utils.post(config.apiUrl + url, data, callback);
};

utils.api.patch = function(url, data, callback){
  utils.put(config.apiUrl + url, data, callback);
};

utils.api.update = function(url, data, callback){
  utils.put(config.apiUrl + url, data, callback);
};

utils.api.put = function(url, data, callback){
  utils.put(config.apiUrl + url, data, callback);
};

utils.api.del = function(url, data, callback){
  utils.del(config.apiUrl + url, data, callback);
};

$(function() {
  var lastId;

  var startDate = moment().subtract('minutes', 5).format('YYYY-MM-DD HH:mm:ss');

  utils.api.get('/api/jobs/1/leqs', { start: startDate, limit: 5000 }, function(error, results){
    if (error) return console.error(error), setTimeout(onTick, config.tickInterval);

    lastId = results[0].id;

    var data = [];
    for (var i = results.length - 1; i >= 0; --i){
      data.push( [ (new Date(results[i].createdAt)).getTime(), results[i].db ] );
    }

    Highcharts.setOptions({
      global : {
        useUTC : false
      }
    , lang: {
        rangeSelectorZoom: ''
      }
    });
    
    // Create the chart
    $('#container').highcharts('StockChart', {
      chart : {
        events : {
          load : function(){
            var _stop = false, series = this.series[0];

            function onTick(){
              if (_stop) return;

              var params = {};

              if (lastId) params.drain = lastId;

              utils.api.get('/api/jobs/1/leqs', params, function(error, results){
                if (error) return console.error(error), setTimeout(onTick, config.tickInterval);

                if (results.length == 0) return setTimeout(onTick, config.tickInterval);

                lastId = results[0].id;

                for (var i = results.length - 1; i >= 0; --i){
                  series.addPoint(
                    [ (new Date(results[i].createdAt)).getTime(), results[i].db ]
                  , true
                  , true
                  )
                }

                setTimeout(onTick, config.tickInterval)
              });
            }

            onTick();
          }
        }
      , zoomType: 'x'
      , plotShadow: true
      },

      plotOptions: {
        series: {
          enableMouseTracking: false
        }
      },

      // colors: ['#339ADA'],
      
      rangeSelector: {
        buttons: [],
        inputEnabled: false,
        selected: 0
      },
      
      // title : {
      //   text : 'Drill Site #4'
      // },
      
      exporting: {
        enabled: false
      },

      yAxis : {
        title : {
          text : 'dB'
        },
        // max: 58,
        plotLines : [{
          value : 55,
          color : '#0C8137',
          dashStyle : 'shortdash',
          width : 2,
          label : {
            text : 'Allowable',
            x: 20,
            y: 30,
            style: {
              color: '#404041'
            }
          }
        }, {
          value : 60,
          color : 'orange',
          dashStyle : 'shortdash',
          width : 2,
          label : {
            text : 'Threshold 1',
            x: 20,
            y: 30,
            style: {
              color: '#404041'
            }
          }
        }, {
          value : 65,
          color : 'orange',
          dashStyle : 'shortdash',
          width : 2,
          label : {
            text : 'Threshold 2',
            x: 20
          }
        }, {
          value : 70,
          color : 'red',
          dashStyle : 'shortdash',
          width : 2,
          label : {
            text : 'Threshold 3',
            x: 20
          }
        }],

        plotBands: [{
          from: 0,
          to: 50,
          color: 'rgba(186, 196, 214, 0.2)' 
        }, {
          from: 50,
          to: 55,
          color: 'rgba(12, 129, 55, 0.1)' 
        }, {
          from: 55,
          to: 60,
          color: 'rgba(242, 120, 6, 0.1)' 
        }, {
          from: 60,
          to: 65,
          color: 'rgba(242, 60, 6, 0.1)' 
        }, {
          from: 65,
          to: 70,
          color: 'rgba(255, 20, 6, 0.1)' 
        }]
      },
      
      series : [{
        name : 'dB',
        data : data
      }]
    });
  });
});