const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin')

module.exports = ({
  resolve: {
    plugins: [new DirectoryNamedWebpackPlugin()]
  },
  compiler: {
    styledComponents: true
  },
  swcMinify: true
})
