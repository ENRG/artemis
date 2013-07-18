var hbs = require('hbs');

hbs.registerHelper('ifAdmin', function(user, options){
  return options[user.permissions == 1 ? 'fn' : 'inverse'](this);
});