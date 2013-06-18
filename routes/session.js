var session = module.exports = {};

session.get = function(req, res){
  if (req.user) return res.json({ data: req.user });
  return res.status(204).end();
};

session.del = function(req, res){
  req.logout();
  res.status(204).end();
};