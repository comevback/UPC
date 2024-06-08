# 第一个阶段：使用 Go 官方镜像构建 Go 可执行文件
FROM golang:1.22-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制go.mod和go.sum文件并下载依赖
COPY backend/UPC-GO/go.mod backend/UPC-GO/go.sum ./
RUN go mod download

# 复制其余源代码
COPY backend/UPC-GO/ ./

# 编译Go应用为静态可执行文件
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o upc-go .

# 第二个阶段：使用最小化的基础镜像
FROM node:20.04-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 安装必要的包
RUN apk update && apk add --no-cache \
    docker-cli \
    curl \
    git \
    zsh \
    python3 \
    make \
    g++ \
    zip

# 安装 oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 安装 zsh-autosuggestions 并将其添加到 .zshrc
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions && echo "source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ~/.zshrc

# 安装 pack
RUN (curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.32.1/pack-v0.32.1-linux.tgz" | tar -C /usr/local/bin/ --no-same-owner -xzv pack)

# 复制前端、后端和注册服务器文件
COPY frontend/upc-react /usr/src/app/frontend/upc-react
COPY backend/UPC-API /usr/src/app/backend/UPC-API
COPY register-server /usr/src/app/register-server

# 安装项目依赖
RUN npm install -g concurrently && \
    npm install --prefix ./frontend/upc-react && \
    npm install --prefix ./backend/UPC-API && \
    npm install --prefix ./register-server

# 从构建阶段复制 Go 可执行文件
COPY --from=builder /app/upc-go /usr/local/bin/upc-go

# 启动 frp 客户端
RUN chmod +x /usr/src/app/backend/UPC-API/frpc

# 暴露端口
EXPOSE 3000 4000 8000

# 定义容器启动时运行的命令
CMD sh -c "npm start & /usr/local/bin/upc-go"
