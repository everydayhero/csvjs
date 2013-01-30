/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '// ==========================================================================\n' +
              '// Project:   <%= pkg.title || pkg.name %> <%= pkg.version %>\n' +
              '// Copyright: ©<%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
              '//            See https://raw.github.com/everydayhero/csvjs/master/LICENSE\n' +
              '// =========================================================================='
    },
    lint: {
      files: ['grunt.js', 'src/*.js']
    },
    qunit: {
      files: ['test/*.html']
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');

};
