const webpack = require('webpack')
module.exports = (webpackConfig, env) => {
  // moment语言包打包优化
  webpackConfig.plugins.push(
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/)
  )

  // antd组件打包优化
  webpackConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      minChunks: 2,
      minSize: 0,
      children: true,
      deepChildren: true,
      async: true
    })
  )

  // 别名配置
  webpackConfig.resolve.alias = {
    '@': `${__dirname}/src`,
    '@a': `${__dirname}/src/assets`,
    '@c': `${__dirname}/src/components`,
    '@u': `${__dirname}/src/utils`
  }
  return webpackConfig
}
