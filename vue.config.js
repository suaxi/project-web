const path = require('path')
const {defineConfig} = require('@vue/cli-service')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = defineConfig({
    transpileDependencies: [
        '@riophae/vue-treeselect'
    ],
    lintOnSave: false,
    devServer: {
        proxy: {
            [process.env.VUE_APP_BASE_API]: {
                target: 'http://localhost:8088',
                //路径重写
                pathRewrite: {['^' + process.env.VUE_APP_BASE_API]: ''},
                ws: true,
                //用于空值请求头中的host值（默认值为true）
                changeOrigin: true
            }
        }
    },
    configureWebpack: {
        plugins: [new NodePolyfillPlugin()]
    },
    chainWebpack(config) {
        config.module
            .rule('svg')
            .exclude.add(resolve('src/assets/icons'))
            .end();
        config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(resolve('src/assets/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
            .end();
    }
})
