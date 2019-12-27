const path = require('path')
const bodyParser = require('body-parser')
const { mixProxy } = require('./lib/proxy')
const setup = require('./lib/mock')

const PLUGIN_OPTION_NAME = 'syncMock'
const ROOT_PATH = path.resolve(__dirname).split('/node_modules')[0]
const DEFAULT_CACHE_PATH = path.resolve(ROOT_PATH, './node_modules/.cache/vue-cli-plugin-sync-mock-data/')

module.exports = (api, projectConfig) => {
  /**
   * 不能使用 api.chainWebpack 和 api.configureWebpack 修改 devServer 选项，会被用户配置覆盖
   * @vue/cli-service/lib/commands/serve.js line82-85 使用Object.assign直接用用户配置覆盖devServer，导致配置不生效
   */

  if (!projectConfig.pluginOptions || !projectConfig.pluginOptions[PLUGIN_OPTION_NAME]) {
    return
  }

  const {
    devServer: { before: _before, proxy: _proxy },
    pluginOptions: { [PLUGIN_OPTION_NAME]: config }
  } = projectConfig

  const syncConfig = config || {}
  // 是否开启mock，从本地存储的数据中获取
  const isMock = !!syncConfig.mock
  // 是否开启同步数据
  const isSync = !!syncConfig.sync
  const cachePath = config.cachePath || DEFAULT_CACHE_PATH

  projectConfig.devServer.before = (app, server) => {
    if (isMock) {
      setup(app, cachePath)
    }

    _before(app, server)

    if (isSync) {
      app.use(bodyParser.urlencoded({ extended: false }))
      app.use(bodyParser.json())
    }
  }

  projectConfig.devServer.proxy = mixProxy(_proxy, isSync, cachePath)
}
