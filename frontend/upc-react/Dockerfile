# 第一阶段：构建应用程序
FROM node:20-alpine AS build

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安装项目依赖并清理 npm 缓存
RUN npm install && npm cache clean --force

# 将项目文件复制到 Docker 镜像中
COPY . .

# 构建应用程序
RUN npm run build

# 第二阶段：使用 serve 提供应用程序服务
FROM node:20-alpine

# 全局安装 serve 并清理 npm 缓存
RUN npm install -g serve && npm cache clean --force

# 将第一阶段的构建输出复制到最终镜像中
COPY --from=build /usr/src/app/build /usr/src/app/build

# 暴露端口 3000
EXPOSE 3000

# 定义运行 serve 的命令
CMD ["serve", "-s", "/usr/src/app/build", "-l", "3000"]
