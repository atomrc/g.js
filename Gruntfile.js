module.exports = function(grunt) {

  grunt.initConfig({
    uglify: {
      dist: {
        files: {
          "build/g.min.js": ["src/g.js"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("default", ["uglify"]);

};
