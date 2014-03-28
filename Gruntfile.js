module.exports = function (grunt) {

  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          name: 'main',
          baseUrl: './app/scripts',
          mainConfigFile: './app/scripts/main.js',
          out: './app/build/scripts/main.js',
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
        src: ['app/styles/styles.css', 'app/styles/loop.css', 'app/styles/lib/widget.css', 'app/styles/lib/bootstrap-philagov/bootstrap-philagov.css'],
        dest: 'app/temp/styles/',
        ext: '.min.css'
      },
      combine: {
        files: {
          'app/build/styles/opa.min.css': [
            'app/temp/styles/app/styles/lib/bootstrap-philagov/bootstrap-philagov.min.css',
            'app/temp/styles/app/styles/lib/widget.min.css',
            'app/temp/styles/app/styles/styles.min.css',
            'app/temp/styles/app/styles/loop.min.css'
          ]
        }
      }
    },
    clean: {
      build: ['app/build/**/*', '!app/build/.git', '!app/build/CNAME'],
      temp: ['app/temp/']
    },
    copy: {
      main: {
        files: [
          {expand: true, src: 'app/images/*', dest: 'app/build/images/', flatten: true},
          {expand: true, src: 'app/scripts/lib/**', dest: 'app/build/scripts/lib/', flatten: true, filter: 'isFile'},
          {cwd: 'app/scripts/nls/', src: ['**'], dest: 'app/build/scripts/nls/', expand: true}
        ]
      }
    },
    processhtml: {
      dist: {
        files: {
          'app/temp/index.html': ['app/index.html']
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
          'app/build/index.html': 'app/temp/index.html'
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