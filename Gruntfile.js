module.exports = function( grunt ){
  grunt.loadTasks('./tasks');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var config = {
    pkg: grunt.file.readJSON('package.json')

  // Actually, this task is shit
  // , bower: {
  //     panel: {
  //       rjsConfig: 'public/apps/business-panel/require.config.js'
  //     }
  //   }

  , requireGrouper: {
      components: {
        dirs: [
          './public/apps/business-panel/components'
        , './public/apps/business-panel/pages'
        ]
      }
    }

  , watch: {
      scripts: {
        // Concat jshint.all
        files: [],
        tasks: ['jshint'],
        options: {
          spawn: false,
        }
      },

      grouper: {
        files: [],
        tasks: ['requireGrouper'],
        options: {
          spawn: false,
        }
      }

      // Actually, this task is shit
      // bower: {
      //   files: ['public/components/**'],
      //   tasks: ['bower'],
      //   options: {
      //     spawn: false,
      //   },
      // }
    }

  , jshint: {
      // define the files to lint
      all: ['*.js', 'lib/*.js', 'routes/*.js', 'public/**/*.js'],
      options: {
        ignores: ['node_modules', 'public/components/**/*.js', 'public/js/*.js'],
        laxcomma: true,
        sub: true,
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    }
  };

  config.watch.scripts.files = config.watch.scripts.files.concat(
    config.jshint.all
  );

  config.watch.grouper.files = config.watch.grouper.files.concat(
    config.requireGrouper.components.dirs.map( function( dir ){
      return dir + '/*/*.js';
    })
  );

  grunt.initConfig( config );

  grunt.registerTask('default', [ 'jshint' ]);
};
