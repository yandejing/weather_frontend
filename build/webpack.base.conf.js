let path = require('path')
let utils = require('./utils')
let webpack = require('webpack')
let fs = require('fs')
let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var merge = require('webpack-merge')
let config = require('../config')
let vueLoaderConfig = require('./vue-loader.conf')
const vuxLoader = require('vux-loader')
const TransformModulesPlugin = require('webpack-transform-modules-plugin')
const PostCompilePlugin = require('webpack-post-compile-plugin')

let entries = utils.getMultiEntry(`./src/${config.moduleName}/${config.appName}/${config.viewName}/*/*.js`,config.subAppName); // 获得入口js文件
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

let webpackConfig = {
  entry: entries,
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      '/src': path.resolve(__dirname, '../src'),
      '/static': path.resolve(__dirname, '../static'),
      'jquery': 'jquery'
    }
  },

  externals: {
    "CKEDITOR": "window.CKEDITOR"
  },
  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery'
        },
          {
            loader: 'expose-loader',
            options: '$'
          }]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {test: /iview.src.*?js$/, loader: 'babel-loader?cacheDirectory=true'},
      {test: /element-ui.src.*?js$/, loader: 'babel-loader?cacheDirectory=true'},
      {test: /vue-echarts-v3.src.*?js$/, loader: 'babel-loader?cacheDirectory=true'},
      {test: /element-tree-grid.src.*?js$/, loader: 'babel-loader?cacheDirectory=true'},
      {
        test: /\.(js|ts)$/,
        loader: 'babel-loader?cacheDirectory=true',
        include: [resolve('src'), resolve('test')],
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [resolve('src/modules/aiyi_admin/icons')],
        options: {
          symbolId: 'icon-[name]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg|mp3)(\?.*)?$/,
        loader: 'url-loader',
        exclude: [resolve('src/modules/aiyi_admin/icons')],
        options: {
          limit: 1,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test : /\.(template.html)(\?.*)?$/,
        loader : 'url-loader',
        options : {
          limit : 1,
          name : utils.assetsPath ( 'template/[name].[hash:7].[ext]' )
        }
      },
    ]
  },
  plugins: [
    new PostCompilePlugin(),
    new TransformModulesPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      jquery: 'jquery'
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: { discardComments: { removeAll: true },safe : true, zindex : false },
      canPrint: true
    }),
  ]
}

//模块特殊配置
let webpackModuleConfig = {}
if(fs.existsSync('src/modules/'+config.appName+'/webpack.module.conf.js')){
  webpackModuleConfig = require('../src/modules/'+config.appName+'/webpack.module.conf')
}

webpackConfig =  merge(webpackConfig,webpackModuleConfig);


//vux-loader 配置
let webpackVuxConfig = {}
if(fs.existsSync('src/modules/'+config.appName+'/webpack.vux.conf.js')){
  webpackVuxConfig = require('../src/modules/'+config.appName+'/webpack.vux.conf')
}

webpackConfig = vuxLoader.merge(webpackConfig, merge({
  plugins: [
    'vux-ui',
    'progress-bar',
  ]
},webpackVuxConfig))


module.exports = webpackConfig
