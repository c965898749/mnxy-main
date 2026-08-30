
const Request = require('request');

module.exports = {

  requestFunc: function (url, params) {
    return new Promise((resolve, reject) => {
      Request({ url, qs: params, json: true }, (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }
        if (body && body.response) {
          resolve(body.response);
        } else {
          reject(new Error('Unexpected response format'));
        }
      });
    });
  }

}