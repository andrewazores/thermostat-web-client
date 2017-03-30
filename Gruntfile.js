module.exports = function (grunt) {
  'use strict';

  // Load grunt tasks automatically
  require( 'load-grunt-tasks' )( grunt );

  grunt.loadNpmTasks('grunt-karma');

  // Define the configuration for all the tasks
  grunt.initConfig( {
    // Project settings
    projectSettings: {
      // configurable paths
      src:      require( './bower.json' ).appPath || 'src',
      test:     'test',
      fonts:    'fonts',
      content:  'content',
      images:   'content/images',
      styles:   'styles',
      templates:'templates',
      dist:     'dist',
      deploy:   'deploy',
      serverDir:'.tmp',
      mockData: 'mock_data',
      pkg:      grunt.file.readJSON( 'package.json' )
    },

    angularFileLoader: {
      options: {
        scripts: ['<%= projectSettings.src %>/**/*.js']
      },
      index: {
        src: 'index.html'
      },
    },
    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= projectSettings.src %>/index.html'],
        ignorePath:  /\.\.\//
      },
      sass: {
        src: ['<%= projectSettings.src %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      continuous: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS'],
        autoWatch: true,
        singleRun: false,
        background: true
      }
    },
    // Watches files for changes and runs tasks based on the changed files
    // Live Reload is too slow, need to figure out how to stop reloading of npm modules
    watch:    {
      all: {
        files: [
          'Gruntfile.js',
          'template.html',
          '<%= projectSettings.src %>/**/*.js',
          '<%= projectSettings.src %>/**/*.html',
          '<%= projectSettings.src %>/styles/**/*.css',
          '<%= projectSettings.test %>/**/*.test.js'
        ],
        tasks: ['build'],
        options: {
          livereload: 37830
        }
      },
      mockData: {
        files: ['<%= projectSettings.mockData %>/**/*'],
        tasks: ['copy:mockdata'],
        options: {
          livereload: 37830
        }
      },
      livereload: {
        options: {
          livereload: 37830
        },
        files:   [
          '<%= projectSettings.src %>**/*',
          '<%= projectSettings.serverDir %>/bower_components/{,*/}*.css',
          '<%= projectSettings.serverDir %>/styles/{,*/}*.css',
          '<%= projectSettings.mockData %>/**/*'
        ]
      }
    },

    // The actual grunt server settings
    connect:  {
      options:    {
        base: '<%= projectSettings.src %>',
        port: grunt.option("port") || 8003,
        hostname:   'localhost', // 0.0.0.0 allows access from outside
        livereload: 37830
      },
      livereload: {
        options: {
          open:       true,
          base:       [
            '<%= projectSettings.serverDir %>',
            '<%= projectSettings.dist %>'
          ]
        }
      },
      test:       {
        options: {
          port: 9001,
          base: [
            '<%= projectSettings.serverDir %>',
            '<%= projectSettings.dist %>'
          ]
        }
      },
      deploy:     {
        options: {
          base: '<%= projectSettings.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint:   {
      options: {
        jshintrc: '.jshintrc'
      },
      src:     [
        'Gruntfile.js',
        '<%= projectSettings.src %>/**/*.js',
        '<%= projectSettings.test %>/**/*.test.js'
      ]
    },

    // Template
    ngtemplates:     {
      options:               {
        module: 'tms.appModule',
        htmlmin: {
          collapseWhitespace:        true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA:   true,
          removeOptionalTags:        true
        }
      },
      appModule:             {
        // this is the part we want to strip from the URL, though not the path
        cwd:  '.',
        // this is the part we want actually in the URL (i.e. modules/foo/bar)
        src:  '<%= projectSettings.src %>/**/*.html',
        // this is where it goes
        dest: '<%= projectSettings.src %>/<%= projectSettings.templates %>/appModuleTemplates.js'
      }
    },
    // Empties folders to start fresh
    clean:           {
      dist:   {
        files: [{
          dot: true,
          src: [
            '<%= projectSettings.serverDir %>',
            '<%= projectSettings.dist %>/*'
          ]
        }]
      },
      deploy: {
        files: [{
          dot: true,
          src: [
            '<%= projectSettings.deploy %>/*'
          ]
        }]
      },
      server: '<%= projectSettings.serverDir %>'
    },

    // Copies remaining files to places other tasks can use
    copy: {
      indexHtml: {
        cwd: '.',
        src: ['template.html'],
        dest: 'index.html'
      },
      html: {
        expand: true,
        cwd: '.',
        src: ['index.html'],
        dest: '<%= projectSettings.dist %>/'
      },
      js: {
        cwd:  '.',
        src:  ['<%= projectSettings.src %>/**/*.js'],
        dest: '<%= projectSettings.dist %>/'
      },
      fonts: {
        expand: true,
        cwd: 'bower_components/patternfly/dist/',
        src: ['<%= projectSettings.fonts %>/**'],
        dest: '<%= projectSettings.dist %>/styles/'
      },
      fontawesome: {
        expand: true,
        cwd: 'bower_components/patternfly/components/font-awesome',
        src: ['<%= projectSettings.fonts %>/**'],
        dest: '<%= projectSettings.dist %>/components/font-awesome/'
      },
      img: {
        expand: true,
        cwd: '<%= projectSettings.src %>',
        src: ['<%= projectSettings.images %>/**'],
        dest: '<%= projectSettings.dist %>/'
      },
      styles: {
        expand: true,
        cwd: '<%= projectSettings.src %>',
        src: ['<%= projectSettings.styles %>/**'],
        dest: '<%= projectSettings.dist %>/'
      },
      bower: {
        expand: true,
        cwd: '.',
        src: ['bower_components/**/*'],
        dest: '<%= projectSettings.dist %>/'
      },
      templates: {
        expand: true,
        cwd: '<%= projectSettings.src %>',
        src: ['<%= projectSettings.templates %>/appModuleTemplates.js'],
        dest: '<%= projectSettings.dist %>/'
      },
      mockdata: {
        expand: true,
        cwd: '<%= projectSettings.mockData %>',
        src: ['**'],
        dest: '<%= projectSettings.dist %>/<%= projectSettings.mockData %>'
      }
    },
    htmlhint: {
      html: {
        src: ['<%= projectSettings.src %>/**/*.html'],
        options: {
          htmlhintrc: '.htmlhintrc'
        }
      }
    },
    eslint: {
      options: {
        configFile: 'eslint.yaml'
      },
      target: [
        'Gruntfile.js',
        '<%= projectSettings.src %>/**/*.js',
        '<%= projectSettings.test %>/**/*.test.js'
      ]
    }
  } );

  grunt.registerTask( 'jshintRun', [
    'jshint'
  ] );

  grunt.registerTask( 'server', function (target) {
    grunt.task.run( [
      'clean:server',
      'build',
      'configureProxies:server', // added just before connect
      'connect:livereload',
      'karma:continuous',
      'watch',
    ] );
  } );

  grunt.registerTask('lint', ['eslint', 'htmlhint']);

  grunt.registerTask( 'build', function (target) {

    var buildTasks = [
      'clean:dist',
      'lint',
      'ngtemplates',
      'copy:indexHtml',
      'angularFileLoader',
      'copy:html',
      'copy:js',
      'copy:fonts',
      'copy:fontawesome',
      'copy:img',
      'copy:styles',
      'copy:bower',
      'copy:templates',
      'copy:mockdata'
    ];

    grunt.task.run( buildTasks );

  } );

  grunt.registerTask( 'default', [
    'build'
  ] );

};
