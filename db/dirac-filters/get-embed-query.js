module.exports = function( options ){
  return function( dirac ){
    dirac.DAL.prototype.getEmbedQuery = function( options ){
      return {
        type: 'expression'
      , alias: options.alias
      , expression: {
          type: 'expression'
        , parenthesis: true
        , expression: {
            type: 'select'
          , table: this.table
          , alias: 'r'
          , columns: [
              { type: 'row_to_json', expression: 'r' }
            ]
          , where: options.where
          }
        }
      };
    };
  };
};