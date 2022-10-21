const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = defineConfig({
  lintOnSave: false,
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()]
  },
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        //路径重写
        pathRewrite: {'^/api': ''},
        ws: true,
        //用于空值请求头中的host值（默认值为true）
        changeOrigin: true
      }
    }
  }
})
