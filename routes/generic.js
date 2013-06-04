var generic = module.exports = {};

generic.find = function(collection){
  return function(req, res){
    console.log(req.queryObj, req.queryOptions)
    collection.find(req.queryObj, req.queryOptions, function(error, results){
      if (error) return console.log(error), res.error(400);

      res.json(results);
    });
  };
};

generic.findOne = function(collection){
  return function(req, res){
    collection.findOne(req.queryObj, req.queryOptions, function(error, result){
      if (error) return res.error(400);

      if (!result) return res.status(404).end();

      res.json(result);
    });
  }
};

generic.insert = function(collection){
  return function(req, res){
    collection.insert(req.body, req.queryOptions, function(error, results){
      if (error) return console.log(error), res.error(400);

      if (!req.queryOptions.returning || req.queryOptions.returning.length == 0)
        return res.status(204).end();

      res.status(200).json(results);
    })
  };
};

generic.update = function(collection, options){
  options = options || {};

  return function(req, res){
    console.log(req.queryObj, req.body, req.queryOptions);
    collection.update(req.queryObj, req.body, req.queryOptions, function(error, results, result){
      if (error) return res.error(400);

      if (result.rowCount == 0) return res.status(404).end();

      if (!req.queryOptions.returning || req.queryOptions.returning.length == 0)
        return res.status(204).end();

      res.status(200).json(options.isSingle ? results[0] : results);
    })
  };
};

generic.remove = function(collection){
  return function(req, res){
    db.insults.remove(req.queryObj, req.queryOptions, function(error, results, result){
      if (error) return res.error(400);

      if (result.rowCount == 0) return res.status(404).end();

      if (!req.queryOptions.returning || req.queryOptions.returning.length == 0)
        return res.status(204).end();

      res.status(200).json(results);
    })
  };
};