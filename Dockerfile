# 第一个阶段：使用 Go 官方镜像构建 Go 可执行文件
FROM golang:1.22 as builder

# 设置工作目录
WORKDIR /app

# 复制go.mod和go.sum文件并下载依赖
COPY backend/UPC-GO/go.mod backend/UPC-GO/go.sum ./
RUN go mod download

# 复制其余源代码
COPY backend/UPC-GO/ ./

# 编译Go应用为静态可执行文件
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o upc-go

# 第二个阶段：使用 Node.js 官方镜像
FROM node:20-alpine

# 设置Go环境变量
ENV PATH="/usr/local/go/bin:${PATH}"

# 安装必要的包
RUN apk update && apk add --no-cache docker-cli curl git zsh python3 make g++ zip

# 安装 oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 安装 zsh-autosuggestions 并将其添加到 .zshrc
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions && echo "source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ~/.zshrc

# 安装 pack
RUN (curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.32.1/pack-v0.32.1-linux.tgz" | tar -C /usr/local/bin/ --no-same-owner -xzv pack)

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 文件
COPY package*.json ./

# 复制项目文件到 Docker 镜像中
COPY . .

# 安装全局依赖
RUN npm install -g concurrently

# 安装项目依赖
RUN npm install --prefix ./frontend/upc-react
RUN npm install --prefix ./backend/UPC-API
RUN npm install --prefix ./register-server

# 从构建阶段复制 Go 可执行文件
COPY --from=builder /app/upc-go /usr/local/bin/upc-go

# 启动 frp 客户端
RUN chmod +x /usr/src/app/backend/UPC-API/frpc

# 暴露端口
EXPOSE 3000 4000 8000

# 定义容器启动时运行的命令
# 如果要使用云服务器作为注册服务器，请将最后一步改为：CMD sh -c "npm start & /usr/src/app/backend/UPC-API/frpc -c /usr/src/app/backend/UPC-API/frpc.toml"
CMD sh -c "npm start && ./usr/src/app/backend/UPC-GO/upc-go"
