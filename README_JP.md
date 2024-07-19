<div align="center">
<img src='./UPC-logo-rm.png' alt='UPC logo' width='300px' height='300px'/>
</div>
<h1 align="center">UPC-node</h1>
<p align="center">（User-PC Computing System）</p>

このシステムは、異なるホスト上で同じタスクを簡単に実行できるように設計されています。Docker の機能を活用し、Docker についての知識がない人でも容易に使用できるようにしています。

このシステムは三つの部分に分かれています。

```
UPC
├── backend
│   ├── UPC-Node
│   └── UPC-GO
├── frontend
│   └── upc-react
└── register-server
```

1. **React フロントエンド**: ユーザーインターフェースを提供し、ユーザーが直感的にシステムを操作できるようにします。
2. **Go または Node バックエンド**: ホストの Docker デーモンと接続し、フロントエンドからのリクエストを受け取り、ファイルや Docker の操作を行います。
3. **登録サーバー**: 中央サーバーとして機能し、すべてのフロントエンドとバックエンドを管理し、情報を集計して、フロントエンドが異なるバックエンドに切り替えるのを容易にします。

---

## 開発背景

現代の研究と作業環境では、計算リソースが不可欠な資産となっています。増加する計算負荷の要求に応えるために、CPU のクロック速度、コア数、メモリサイズの急速な進歩があり、個人のコンピュータの継続的なアップグレードと交換が行われています。リソースの無駄を省くために、全体的な計算能力を向上させるシステムとして、「ユーザー PC コンピューティング（UPC）システム」と呼ばれるシステムが提案され、実装されています。
「UPC システム」の設計は、アイドル状態のハードウェアリソースを効率的に利用し、Docker を使用して計算効率を向上させることを目指しています。UPC システムは、ウェブサーバー、UPC マスター、UPC ワーカーの 3 つのコンポーネントから構成されています。ユーザーはジョブファイルを UPC マスターにアップロードし、これらのファイルは UPC ワーカーに割り当てられ、すべてのデバイスで一貫した環境を迅速に確立する Docker がインストールされています。これにより、設定プロセスが大幅に簡素化され、計算のための同じ実行環境が提供されます。計算後、結果は UPC マスターとユーザーに返送されます。しかし、既存の UPC システムには、使いにくさ、効率の低さ、柔軟性の欠如といったいくつかの欠点があり、UPC システムをスケールアウトするのが難しくなっています。
この研究では、UPC システムのアーキテクチャの再設計と実装を通じて、使いやすさ、柔軟性、効率を大幅に向上させることにより、元の概念を大きく前進させました。再設計は、以前に特定された欠点に対処するだけでなく、効率的に計算リソースをスケーリングおよび統合するための新しい可能性も開きます。

---

### クイックスタート（Docker の起動が必要です）：

```bash
curl -sSL https://raw.githubusercontent.com/comevback/UPC-node/main/start-docker.sh -o start-docker.sh &&
chmod +x start-docker.sh &&
./start-docker.sh
```

脚本の指令に従って入力してください、そしたらは WEB ブラウザで<http://localhost:3000>にアクセスできます。

<img src='./UPC-script-demo.gif' alt='UPC logo' width='600px'/>

- 全体の UPC システム（Go バックエンド、React フロントエンド、Express 登録サーバー）を起動します。

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
2. タスクのディレクトリを.zip ファイルに圧縮します。
3. React のウェブサイトで圧縮ファイルをアップロードします。
4. この種のタスク用のイメージを生成します。
5. ファイルをアップロードして処理します。
6. 結果をダウンロードします。

<img src='./docker-run-command.gif' alt='docker run command' width='1000px'/>

---

## 特徴

このシステムは、ウェブブラウザで Docker を簡単に操作できるようにするものです。以下がその主な機能です：

- **ファイル管理**: ファイルをアップロードしたり削除したりします。
- **Docker イメージ生成**: アップロードしたファイルから Docker イメージを作ります。
- **タスク処理**: 様々な作業をバックエンドで行います。
- **ターミナル操作**: ウェブブラウザから直接コマンドを実行できます。
- **サーバー管理**: ローカルやクラウドのサーバーを登録して管理します。
- **Docker デプロイ**: コマンド一つでシステム全体をデプロイします。

つまり、このシステムを使うと、ウェブ画面から Docker を操作して、Docker イメージを作成、取得（pull）、削除できます。また、パネルを通じて、ユーザーが Docker コンテナをより迅速かつ簡単に利用できるようサポートします。

---

# 概念

---

## UPC システムのアーキテクチャ

![UPCシステムのアーキテクチャ](./architecture.png)
UPC システムは三つの主要コンポーネントで構成されています：

1. **UPC-Worker** （バックエンドサーバー）
2. **ユーザーインターフェース** （React フロントエンド）
3. **Register Server** （システムを管理するクラウドまたはローカルの中央サーバー）

---

## UPC システムのワークフロー

![UPCシステムのワークフロー](./workflow.png)

---

## Frp を利用して外部からのアクセス原理

![Frp](./Frp_Prin.png)
Frp はローカルネットワークからサーバー（サービス）を公開できる高速リバースプロキシです。

Frp は内部サービスへのリクエストを公共 IP を持つサーバー経由で転送します。

![Frp](./Frp_Imp.png)

---

## Docker イメージ自動生成プロセス

![Dockerイメージ自動生成プロセス](./Docker_gene_pro.png)

UPC システムで Docker イメージを生成する手順：
![Dockerイメージ生成デモ](./Docker_gene.png)

---

# 使用方法

---

## Docker を使用したデプロイと実行（推奨）

<img src='./UPC-script-demo.gif' alt='UPC logo' width='600px'/>

### スクリプト（ターミナルにコピーアンドペーストして実行）:

---

## Node.js でプロジェクトをデプロイする方法

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
  （Windows を使用している場合は、*git bash*または他の bash を使用してください）

```bash
chmod +x install.sh
./install.sh
```

3. **バックエンドサーバーの IP アドレスをホストの IP アドレスに変更するための設定スクリプトを実行**:

```bash
chmod +x setArgs.sh
./setArgs.sh
```

## Node.js で起動する

_データベースを使用して登録サービスのデータを保存したい場合は、register-server フォルダに.env ファイルを作成し、以下のように行を追加してください：_

```.env
MongoURL={your-mongoDB-URL}
```

_それ以外の場合は、データはローカルに保存されます。_

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

このプロジェクトは MIT ライセンスのもとでライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。
