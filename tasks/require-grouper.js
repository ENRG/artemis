/**
 * Require Grouper
 */

var config = {
  name: 'requireGrouper'
, description: [
    'Groups directories of requirejs modules into a single module'
  ].join('')
};

var fs    = require('fs');
var path  = require('path');

var tmpl = [
  'define( function( require ){'
, '  return {'
, '    {json}'
, '  };'
, '});'
].join('\n');

var itemTmpl = "{key}: require('./{path}')";

// Make a global leak noop to quell requirejs module loading errors
define = function(){};


module.exports = function( grunt ){
  var logStats = function( stats ){
    for ( var key in stats ){
      grunt.log.writeln( stats[ key ].title + ':', stats[ key ].value );
    }
  };

  grunt.registerMultiTask( config.name, config.description, function(){
    var stats = {
      numComplete: { value: 0, title: 'Groups Made' }
    };

    this.data.dirs.forEach( function( dir ){

      // Holds the final exports->path structure to be wrriten
      var out = {};

      // Filter out non-directories
      fs.readdirSync( dir ).filter( function( file ){
        return fs.statSync( path.resolve( dir, file ) ).isDirectory();
      }).forEach( function( dirPath ){
        var index = require( path.resolve( dir, dirPath ) );
        
        // Did not specify exports, do not write
        if ( !('exports' in index) ) return;
        // The key of the output is the exports value on the module
        out[ index.exports ] = dirPath + '/index';

        // Unload the module
        delete require.cache[
          require.resolve( path.resolve( dir, dirPath ) )
        ];
      });

      // Write/render
      fs.writeFileSync(
        path.resolve( dir, 'index.js')
      , tmpl.replace( '{json}', Object.keys( out ).map( function( key ){
          return itemTmpl.replace( '{key}', key ).replace( '{path}', out[ key ] );
        }).join('\n  , '))
      );

      stats.numComplete.value++;
    });

    logStats( stats );
  });
};