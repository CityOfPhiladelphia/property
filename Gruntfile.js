module.exports = function (grunt) {

  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          name: 'main',
          baseUrl: './scripts',
          mainConfigFile: './scripts/main.js',
          out: './build/scripts/main.js',
          optimize: 'uglify',
          //findNestedDependencies: true,
          //generateSourceMaps: true,
          preserveLicenseComments: false,
          include: ['i18n'],
          paths: {
            'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min',
            'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min',
            'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
            'jquery-bootstrap': '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/js/bootstrap.min'
          }
        }
      }
    },
    cssmin: {
      minify: {
        expand: true,
        src: ['styles/styles.css', 'styles/loop.css', 'styles/lib/widget.css', 'styles/lib/bootstrap-philagov/bootstrap-philagov.css'],
        dest: 'temp/styles/',
        ext: '.min.css'
      },
      combine: {
        files: {
          'build/styles/opa.min.css': [
            'temp/styles/styles/lib/bootstrap-philagov/bootstrap-philagov.min.css',
            'temp/styles/styles/lib/widget.min.css',
            'temp/styles/styles/styles.min.css',
            'temp/styles/styles/loop.min.css'
          ]
        }
      }
    },
    clean: {
      build: ['build/**/*', '!build/.git', '!build/CNAME'],
      temp: ['temp/']
    },
    copy: {
      main: {
        files: [
          {expand: true, src: 'images/*', dest: 'build/'},
          {expand: true, src: 'scripts/lib/**', dest: 'build/scripts/lib/', flatten: true, filter: 'isFile'},
          {src: 'scripts/nls/**', dest: 'build/'}
        ]
      }
    },
    processhtml: {
      dist: {
        files: {
          'temp/index.html': ['index.html']
        }
      }
    },
    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'build/index.html': 'temp/index.html'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  grunt.registerTask('default', ['clean:build', 'clean:temp', 'requirejs', 'cssmin', 'copy:main', 'processhtml', 'htmlmin', 'clean:temp']);
};