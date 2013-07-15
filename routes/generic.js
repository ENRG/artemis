var generic = module.exports = {};

generic.view = function(name){
  return function(req, res){
    res.render(name);
  };
}

generic.find = function(collection){
  return function(req, res){
    collection.find(req.queryObj, req.queryOptions, function(error, results){
      if (error) return console.log(error), res.error(400);

      res.json({ data: results });
    });
  };
};

generic.findOne = function(collection){
  return function(req, res){
    collection.findOne(req.queryObj, req.queryOptions, function(error, result){
      if (error) return res.error(400);

      if (!result) return res.status(404).end();

      res.json({ data: result });
    });
  }
};

generic.insert = function(collection){
  return function(req, res){
    if (!req.queryOptions.returning)
      req.queryOptions.returning = ['id'];

    collection.insert(req.body, req.queryOptions, function(error, results){
      if (error) return console.log(error), res.error(400);

      if (!req.queryOptions.returning || req.queryOptions.returning.length == 0)
        return res.status(204).end();

      res.json({ data: results.length > 0 ? results[0] : null });
    })
  };
};

generic.update = function(collection, options){
  options = options || {};

  return function(req, res){
    collection.update(req.queryObj, req.body, req.queryOptions, function(error, results, result){
      if (error) return console.log(error), res.error(400);

      if (result.rowCount == 0) return res.status(404).end();

      if (!req.queryOptions.returning || req.queryOptions.returning.length == 0)
        return res.status(204).end();

      res.status(200).json({ data: !options.isMultiple ? results[0] : results });
    })
  };
};

generic.remove = function(collection){
  return function(req, res){
    collection.remove(req.queryObj, req.queryOptions, function(error, results, result){
      if (error) return res.error(400);

      if (result.rowCount == 0) return res.status(404).end();

      if (!req.queryOptions.returning || req.queryOptions.returning.length == 0)
        return res.status(204).end();

      res.status(200).json({ data: results });
    })
  };
};