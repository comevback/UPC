<div align="center">
<img src='./UPC-logo-rm.png' alt='UPC logo' width='300px' height='300px'/>
</div>
<h1 align="center">UPC-node</h1>
<p align="center">（User-PC Computing System）</p>

Docker、ビルドパックを使用した全タイプのタスク処理を簡素化するフルスタック計算システムです。

---

### Dockerを使用したクイックスタート

```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-docker.sh -o start-docker.sh &&
chmod +x start-docker.sh &&
./start-docker.sh
```

<img src='./UPC-script-demo.gif' alt='UPC logo' width='600px'/>

---

## 特徴

- **ジョブ処理**: システム内の様々なバックエンドホストで異なる種類のジョブを処理します。
- **ファイル管理**: バックエンドサーバーでファイルをアップロード／削除。
- **Dockerイメージ生成**: アップロードされたzipファイルを使ってBuildpackを通じてDockerイメージを生成。
- **ターミナル統合**: ユーザーがコマンドを実行できるようにバックエンドホストターミナルをフロントエンドに公開。
- **サーバー登録**: Register-Server（ローカルまたはクラウド）によるバックエンドAPIサーバー／フロントエンドReactサーバーの登録と管理。
- **データベース統合**: MongoDB（クラウド）でデータを保存・管理。
- **Dockerを使用したデプロイ（シェルスクリプトによる）**: コマンドを実行することでシステム全体をデプロイ。

---

# 概念

---

## UPCシステムのアーキテクチャ
![UPCシステムのアーキテクチャ](./architecture.png)
UPCシステムは三つの主要コンポーネントで構成されています：
1. **UPC-Worker** （バックエンドサーバー）
2. **ユーザーインターフェース** （Reactフロントエンド）
3. **Register Server** （システムを管理するクラウドまたはローカルの中央サーバー）

--- 

## UPCシステムのワークフロー
![UPCシステムのワークフロー](./workflow.png)

---

## 外部からのアクセス原理 by Frp
![Frp](./Frp_Prin.png)
Frpはローカルネットワークからサーバー（サービス）を公開できる高速リバースプロキシです。

Frpは内部サービスへのリクエストを公共IPを持つサーバー経由で転送します。

![Frp](./Frp_Imp.png)

---

## Dockerイメージ自動生成プロセス
![Dockerイメージ自動生成プロセス](./Docker_gene_pro.png)

UPCシステムでDockerイメージを生成する手順：
![Dockerイメージ生成デモ](./Docker_gene.png)

---

# 使用方法

---

## Dockerを使用したデプロイと実行（推奨）

<img src='./UPC-script-demo.gif' alt='UPC logo' width='600px'/>

### スクリプト（ターミナルにコピーアンドペーストして実行）:


- 全体のUPCシステム：
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-docker.sh -o start-docker.sh &&
chmod +x start-docker.sh &&
./start-docker.sh
```

- （

バックエンドのみ）APIサービス：
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-api-docker.sh -o start-api-docker.sh &&
chmod +x start-api-docker.sh &&
./start-api-docker.sh
```
- x86アーキテクチャホスト用：
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-x86-api-docker.sh -o start-x86-api-docker.sh &&
chmod +x start-x86-api-docker.sh &&
./start-x86-api-docker.sh
```

- （フロントエンドのみ）フロントエンドサービス：
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-react-docker.sh -o start-react-docker.sh &&
chmod +x start-react-docker.sh &&
./start-react-docker.sh
```

- 登録サービス：
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-register-docker.sh -o start-register-docker.sh &&
chmod +x start-register-docker.sh &&
./start-register-docker.sh
```

### Dockerコマンド:

- 全体のUPCシステム：
```bash
docker run -it --rm -e HOST_URL={http://your_API_host:4000} -e CENTRAL_SERVER={http://your_central_server:8000} -e INITIAL_API_URL={http://your_API_host:4000} -e INITIAL_CENTRAL_SERVER_URL={http://your_central_server:8000} -v /var/run/docker.sock:/var/run/docker.sock -p 3000:3000 -p 4000:4000 -p 8000:8000 afterlifexx/upc-system
```

例：
```bash
docker run -it --rm -e HOST_URL=http://192.168.0.103:4000 -e CENTRAL_SERVER=http://192.168.0.103:8000 -e INITIAL_API_URL=http://192.168.0.103:4000 -e INITIAL_CENTRAL_SERVER_URL=http://192.168.0.103:8000 -v /var/run/docker.sock:/var/run/docker.sock -p 3000:3000 -p 4000:4000 -p 8000:8000 afterlifexx/upc-system
```

```bash
docker run -it --rm -e HOST_URL=http://172.28.235.225:4000 -e CENTRAL_SERVER=http://172.28.235.225:8000 -e INITIAL_API_URL=http://172.28.235.225:4000 -e INITIAL_CENTRAL_SERVER_URL=http://172.28.235.225:8000 -v /var/run/docker.sock:/var/run/docker.sock -p 3000:3000 -p 4000:4000 -p 8000:8000 afterlifexx/upc-system
```

- （バックエンドのみ）APIサービス：
```bash
docker run -it --rm -e HOST_URL={http://your_API_host:4000} -e CENTRAL_SERVER={http://your_central_server:8000} -v /var/run/docker.sock:/var/run/docker.sock -p 4000:4000 afterlifexx/upc-api
```
- 例（APIサービス）：
```bash
docker run -it --rm -e HOST_URL=http://172.28.235.64:4000 -e CENTRAL_SERVER=http://172.28.235.225:8000 -v /var/run/docker.sock:/var/run/docker.sock -p 4000:4000 afterlifexx/upc-api
```

- （フロントエンドのみ）フロントエンドサービス：
```bash
docker run  -e REACT_APP_INITIAL_API_URL={http://your_API_host:4000} -e REACT_APP_INITIAL_CENTRAL_SERVER_URL={http://your_central_server:8000} -p 3000:3000 afterlifexx/upc-react
```

- 登録サービス：
```bash
docker run  -it --rm -p 8000:8000 afterlifexx/upc-register
```



---

## Node.jsでプロジェクトをデプロイする方法

これらの指示に従えば、開発用のローカルマシンでプロジェクトのコピーを起動して実行で

きます。

### 前提条件

- Node.js: https://nodejs.org/en/download
- Docker: https://www.docker.com
- buildpack: https://buildpacks.io/docs/tools/pack
- MongoDB（任意）: https://www.mongodb.com

## インストール方法

1. **リポジトリをクローン**：

```bash
git clone https://github.com/comevback/UPC-node.git
cd UPC-node
```

2. **すべての依存関係をインストール**：

- Linux/MacOS:
```bash
npm run install-all
```
または
```bash
chmod +x install.sh
./install.sh
```

- Windows:
（Windowsを使用している場合は、*git bash*または他のbashを使用してください）
```bash
chmod +x install.sh
./install.sh
```

3. **バックエンドサーバーのIPアドレスをホストのIPアドレスに変更するための設定スクリプトを実行**:
```bash
chmod +x setArgs.sh
./setArgs.sh
```

## Node.jsで起動する

*データベースを使用して登録サービスのデータを保存したい場合は、register-serverフォルダに.envファイルを作成し、以下のように行を追加してください：*
```.env
MongoURL={your-mongoDB-URL}
```

*それ以外の場合は、データはローカルに保存されます。*

**フロントエンドサーバー、バックエンドサーバー、登録サーバーを同時に実行**：

```bash
npm start
```

**または個別に実行**：

- 登録サーバー：
```bash
cd register-server
npm start
```

- バックエンドサーバー：
```bash
cd backend/UPC-nodejs
npm start
```

- フロントエンドサーバー：
```bash
cd frontend/upc-react
npm start
```

## デモ

<img src='./docker-run-command.gif' alt='docker run command' width='1000px'/>

1. React（フロントエンド）、API（バックエンド）サーバーおよび登録サーバーを起動します。
2. タスクのディレクトリを.zipファイルに圧縮します。
3. Reactのウェブサイトで圧縮ファイルをアップロードします。
4. この種のタスク用のイメージを生成します。
5. ファイルをアップロードして処理します。
6. 結果をダウンロードします。

## 貢献

Xu Xiang

## ライセンス

このプロジェクトはMITライセンスのもとでライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。