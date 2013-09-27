var hbs = require('hbs');

hbs.registerHelper('json', function(obj){
  return JSON.stringify( obj, true, '  ' );
});

hbs.registerHelper('ifAdmin', function(user, options){
  return options[user.permissions == 1 ? 'fn' : 'inverse'](this);
});