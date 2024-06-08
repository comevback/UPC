# 使用官方的 Node.js 运行时作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安装项目依赖并清理 npm 缓存
RUN npm install && npm cache clean --force

# 复制项目文件到 Docker 镜像中
COPY . .

# 暴露端口 8000
EXPOSE 8000

# 定义容器启动时运行的命令
CMD ["npm", "start"]
