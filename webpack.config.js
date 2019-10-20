var webpack = require("webpack");

module.exports = {
  mode: "production",

  entry: {
    "jquery-simple-upload": "./src/jquery-simple-upload.js"
  },

  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
    publicPath: "/dist"
  },

  externals: {
    jquery: "jQuery"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }, {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ],
      }
    ]
  },

  watchOptions: {
    poll: 1000
  },

  devServer: {
    host: "0.0.0.0",
    port: 3000,
    disableHostCheck: true,
    before: function(app, server) {
      var multiparty = require('multiparty');
      app.post('/post', (req, res) => {
        console.log(req.headers);
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
          console.log(fields);
          console.log(files);
        });
        res.json({ status: 'ok' });
      });
    }
  }
};
