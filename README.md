# vue-cli-plugin-sync-mock

:truck: 实现离线调试后台接口：通过代理缓存接口响应数据到本地，并开启本地文件代理服务。

## 安装

首先你需要先全局安装 `@vue/cli` 。

然后在你的项目根目录执行以下命令：

``` bash
vue add sync-mock
```

## 配置

在项目根目录下的文件 `vue.config.js` （如果没有请创建）中添加：

``` javascript
module.exports = {
  devServer: {
    proxy: {
      // ...在这里设置你的代理配置
    }
  },
  pluginOptions: {
    // 该插件对应的配置
    syncMock: {
      sync: true
    }
  }
}
```

## 配置项说明

| 配置名 | 类型 | 描述 |
|---|---|---|
| sync | Boolean | 为 `true` 时开启接口代理离线缓存，否则不会缓存接口响应数据。 |
| mock | Boolean | 开启后如果本地已经缓存有该接口的响应值，则会直接取本地缓存并返回，否则会继续走原代理接口 |
| cachePath | String | 离线缓存文件存放地址。默认值：`"project-root/node_modules/.cache/vue-cli-plugin-sync-cache/"`|

注意:

该插件是通过代理实现离线缓存的，所以如果你没有配置任何代理，则不会生效。

## 补充说明

在后台服务可用的情况下开启 `sync` ，调试过程中自动缓存数据。

在后台服务由于某种原因不可用的情况下，开启 `mock` ，则调试过程中请求过的接口会从缓存中获取，不影响正常调试，同时保证数据为后台相对真实数据（虽然不实时）。

