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
