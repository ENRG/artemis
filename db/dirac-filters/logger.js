module.exports = function( options ){
  return function( dirac ){
    var _oldRaw = dirac.DAL.prototype.raw;
    dirac.DAL.prototype.raw = function( query, values ){
      console.log( query, values );
      return _oldRaw.apply( this, arguments );
    };

    var _oldQuery = dirac.DAL.prototype.query;
    dirac.DAL.prototype.query = function( query ){
      console.log( JSON.stringify(query, true, '  ') );
      return _oldQuery.apply( this, arguments );
    };
  }
};