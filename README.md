# Refinity
The frontend for Refinity: a multimodal creative stimulus system.

## Intro

### 主要依赖

- `node`。运行 `node -v` 来检查是否已经安装 `node`。 开发环境中的 node 版本为 v16.16.0，但是在服务器的 v18.18.2 版本下也可以成功运行。
- `react-sketch-canvas`。社区开源的画板库，用于画图功能的实现。该实现可能存在一些bug，但目前在使用时不存在问题。需要持续关注该库的升级和功能更新。参考资料见：https://github.com/vinothpandian/react-sketch-canvas
- `tailwindcss`。一个常用的CSS库。
- `next.js`。项目使用 next.js 13 进行开发。使用了最新的 App Router 模式。文档见：https://nextjs.org/docs/app

### 项目架构

项目结构如下：

``` sh
├── LICENSE
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── public
│   ├── fonts
│   ├── icons
│   └── images
├── README.md
├── src
│   ├── app
│   ├── components
│   ├── configs
│   ├── lib
│   ├── mocks
│   ├── services
│   ├── styles
│   ├── theme
│   └── types.d.ts
├── tailwind.config.ts
├── tsconfig.json
└── typings.d.ts
```

配置文件位于 `./src/configs` 中，包括：

- `env.ts`：API服务配置。
- `routes.ts`：页面路由配置。当需要增加新的页面时，首先需要在 `app` 文件夹下加入新的页面文件，然后在 `routes.ts` 中配置对应的页面名称等信息（否则无法进行导航）。
- `site.ts`：站点信息配置。可以配置如网站名称，网站logo，网站介绍等信息。

## Quick start

### 本地运行

1. 运行之前请启动首先API服务（URL配置位于 `./src/configs/env.ts` 中）。

2. 运行指令 `npm install` 或者 `yarn` 来安装项目所需的依赖 (`node_modules`)。

3. 运行命令 `npm run dev` 在指定端口（默认3000）启动项目。

在浏览器上可以看到前端页面 `localhost:port`.

### 生产环境运行

1. 运行之前请启动首先API服务（URL配置位于 `./src/configs/env.ts` 中）。

2. 运行指令 `npm install` 或者 `yarn` 来安装项目所需的依赖 (`node_modules`)。

3. 在项目目录中运行以下命令来构建：`npm run build`。

4. 构建完成后，运行以下命令来启动生产服务器：`npm run start`。

5. 在生产环境中运行时，建议使用进程管理器（如 PM2）和监控工具来保持应用稳定并及时处理任何可能出现的问题。