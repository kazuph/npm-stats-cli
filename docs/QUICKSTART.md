# Quick Start Guide

## ✅ プロジェクトが動作確認済み

### CLI使用方法

```bash
# 依存関係のインストール
pnpm install

# プロジェクトのビルド
pnpm run build

# CLI使用例
cd cli
node dist/index.js quick kazuph           # 簡易統計
node dist/index.js user kazuph            # 詳細統計
node dist/index.js package express        # 個別パッケージ
```

### MCP Server設定

Claude Codeの設定ファイル (`~/.claude.json`) に追加：

```json
{
  "mcpServers": {
    "npm-stats": {
      "command": "node",
      "args": ["/Users/kazuph/npm-stats-toolkit/mcp-server/dist/index.js"]
    }
  }
}
```

Claude Code再起動後、以下のコマンドが使用可能：
```
mcp__npm-stats__get_quick_user_summary --username kazuph
```

### Menu Bar App

```bash
open menubar-app/NPMStatsMenuBar.xcodeproj
```

1. Xcodeで開く
2. 開発チーム設定
3. ビルド & 実行 (⌘+R)
4. メニューバーに📦アイコンが表示される

## 実際のテスト結果

```bash
$ cd cli && node dist/index.js quick kazuph
📦 kazuph's NPM Stats:
Total Downloads: 12.3K
Total Stars: 208
Total Packages: 11
```

## 次のステップ

1. **ユーザー名変更**: CLI/アプリでkazuphを自分のユーザー名に変更
2. **MCP連携**: Claude CodeでNPM統計をリアルタイム取得
3. **メニューバー**: 常時表示でダウンロード数を監視

## トラブルシューティング

### 一般的な問題
- **Node.js 18+必須**: `node --version`で確認
- **ネットワーク**: NPM APIアクセス要
- **レート制限**: 大量パッケージ時は時間をおく

### MCP接続エラー
- Claude Code設定の絶対パス確認
- Claude Code再起動必須

このツールキットで、NPMパッケージ統計の完全なトラッキングが可能になります。