<div align="center">
<img src='./UPC-logo-rm.png' alt='UPC logo' width='300px' height='300px'/>
</div>
<h1 align="center">UPC-node</h1>
<p align="center">（User-PC Computing System）</p>

このシステムは、異なるホスト上で同じタスクを簡単に実行できるように設計されています。Dockerの機能を活用し、Dockerについての知識がない人でも容易に使用できるようにしています。

簡単に言うと、このシステムは三つの部分に分かれています。

```
UPC
├── backend
│   ├── UPC-Node
│   └── UPC-GO
├── frontend
│   └── upc-react
└── register-server
```

1. **Reactフロントエンド**: ユーザーインターフェースを提供し、ユーザーが直感的にシステムを操作できるようにします。
2. **GoまたはNodeバックエンド**: ホストのDockerデーモンと接続し、フロントエンドからのリクエストを受け取り、ファイルやDockerの操作を行います。
3. **登録サーバー**: 中央サーバーとして機能し、すべてのフロントエンドとバックエンドを管理し、情報を集計して、フロントエンドが異なるバックエンドに切り替えるのを容易にします。

---

### クイックスタート（Dockerの起動が必要です）：

```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-docker.sh -o start-docker.sh &&
chmod +x start-docker.sh &&
./start-docker.sh
```

脚本の指令に従って入力してください、そしたらはWEBブラウザで<http://localhost:3000>にアクセスできます。


<img src='./UPC-script-demo.gif' alt='UPC logo' width='600px'/>

- 全体のUPCシステム（Go バックエンド、React フロントエンド、Express 登録サーバー）を起動します。
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-docker.sh -o start-docker.sh &&
chmod +x start-docker.sh &&
./start-docker.sh
```

- Go-サーバー :
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-go-docker.sh -o start-go-docker.sh &&
chmod +x start-go-docker.sh &&
./start-go-docker.sh
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

- Node-Server（非推奨）：
```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-api-docker.sh -o start-api-docker.sh &&
chmod +x start-api-docker.sh &&
./start-api-docker.sh
```

---

## デモ

1. React（フロントエンド）、API（バックエンド）サーバーおよび登録サーバーを起動します。
2. タスクのディレクトリを.zipファイルに圧縮します。
3. Reactのウェブサイトで圧縮ファイルをアップロードします。
4. この種のタスク用のイメージを生成します。
5. ファイルをアップロードして処理します。
6. 結果をダウンロードします。

<img src='./docker-run-command.gif' alt='docker run command' width='1000px'/>

---

## 特徴

このシステムは、ウェブブラウザでDockerを簡単に操作できるようにするものです。以下がその主な機能です：

- **ファイル管理**: ファイルをアップロードしたり削除したりします。
- **Dockerイメージ生成**: アップロードしたファイルからDockerイメージを作ります。
- **タスク処理**: 様々な作業をバックエンドで行います。
- **ターミナル操作**: ウェブブラウザから直接コマンドを実行できます。
- **サーバー管理**: ローカルやクラウドのサーバーを登録して管理します。
- **Dockerデプロイ**: コマンド一つでシステム全体をデプロイします。

つまり、このシステムを使うと、ウェブ画面からDockerを操作して、Dockerイメージを作成、取得（pull）、削除できます。また、パネルを通じて、ユーザーがDockerコンテナをより迅速かつ簡単に利用できるようサポートします。

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

## Frpを利用して外部からのアクセス原理
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

## 貢献

Xu Xiang

## ライセンス

このプロジェクトはMITライセンスのもとでライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。