const { exec } = require('child_process');

module.exports = {
  cst_openosk: function () {
    exec("osk")
  },

  cst_getString: function () {
    return "string"
  },

};