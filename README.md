# mp-web-runtime-lite

__⚠️ 在使用项目前请注意检查项目中所有文件的内容，包括 yarn.lock__

## 开始使用

1. 在 `index.html` 中引入目标 `app-service.js` 和 `app-wxss.js`，如有分包需要全部引入

```html
<script src="/business/app-service.js"></script>
<script src="/business/app-wxss.js"></script>
```

2. 启动项目

```bash
yarn
yarn dev
```

## 项目结构

```
|- src
  |- business        # 小程序业务相关组件
  |- components      # 通用组件
    |- Component.tsx # 渲染小程序组件
    |- Element.tsx   # 渲染单个 WxmlElementVNode
  |- constants       # 业务相关配置文件
  |- App.tsx         # 项目入口
  |- index.less      # 全局样式表
```

## helpers

在浏览器 console 中可以运行 `copy(getComponent('components/component/index'))` 获取指定组件的 wxml、js、wxss 代码。相关逻辑在 `src/lib` 目录下，仅用于逆向推导相关业务逻辑，不保证 100% 准确率。
