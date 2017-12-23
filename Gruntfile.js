module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    'ftp-deploy': {
      default: {
        auth: {
          host: 'ftp.leeds-ebooks.co.uk',
          port: 21,
          authKey: 'ben',
        },
        src: '_site',
        dest: 'public_html',
      },
    },
  })

  grunt.registerTask('default', ['ftp-deploy'])
}
