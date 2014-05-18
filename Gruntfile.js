module.exports = function(grunt) {

  grunt.initConfig({
    uglify: {
      dist: {
        files: {
          "js/build/g.min.js": ["js/src/g.js"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("default", ["uglify"]);

};
