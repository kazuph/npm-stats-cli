# 使用方法 / Usage

## CLI コマンド

### 基本コマンド（推奨：高速）

```bash
# クイック統計（デフォルト：GitHubスターなし）
node cli/dist/index.js quick kazuph

# 詳細統計（デフォルト：GitHubスターなし）
node cli/dist/index.js user kazuph

# ランキング表示（デフォルト：GitHubスターなし）
node cli/dist/index.js rankings kazuph

# 個別パッケージ統計
node cli/dist/index.js package express
```

### GitHubスター込みの統計（オプション：時間がかかります）

```bash
# GitHubスター込みのクイック統計
node cli/dist/index.js quick kazuph --github

# GitHubスター込みの詳細統計
node cli/dist/index.js user kazuph --github

# GitHubスター込みのランキング
node cli/dist/index.js rankings kazuph --github
```

## オプション

### `--no-github`
- **用途**: GitHubスター数の取得をスキップ
- **メリット**: 
  - 高速実行（レート制限回避）
  - エラーなし
  - NPMダウンロード統計に集中
- **推奨**: 日常的な利用時

### `-j, --json`
- **用途**: JSON形式で出力
- **例**: `node cli/dist/index.js user kazuph -j --no-github`

### `-s, --summary`
- **用途**: サマリーのみ表示
- **例**: `node cli/dist/index.js user kazuph -s --no-github`

### `-r, --rankings`
- **用途**: ランキング表示
- **例**: `node cli/dist/index.js user kazuph -r --no-github`

## レート制限について

### GitHub API制限
- **問題**: 1時間あたり60リクエストまで
- **解決策**: `--no-github` オプションを使用
- **代替案**: 時間をあけて再実行
- **自動検出**: 最初のパッケージでレート制限を検出したら残りのパッケージはGitHub APIをスキップ

### NPM API
- **制限**: 特になし（適度な間隔で使用推奨）
- **安定性**: 高い

## パフォーマンス比較

| コマンド | 実行時間 | GitHub スター | エラー | GitHub API呼び出し |
|---------|---------|--------------|--------|-------------------|
| `--no-github` | ~3秒 | ❌ | なし | 0回 |
| デフォルト | ~3-5秒 | ❌ (レート制限) | なし | 1回のみ（自動検出停止） |
| デフォルト（制限なし） | ~20-30秒 | ✅ | なし | パッケージ数分 |

## 実際のデータ例

```bash
$ node cli/dist/index.js quick kazuph --no-github
📦 kazuph's NPM Stats:
Monthly Downloads: 12.3K
Weekly Downloads: 5.2K
Total Stars: 0 (スキップ)
Total Packages: 11
```

## トラブルシューティング

### レート制限エラー
```
Failed to get GitHub stats: rate limit exceeded
```
**解決策**: `--no-github` オプションを使用

### ネットワークエラー
```
Failed to fetch package info
```
**解決策**: インターネット接続を確認

### パッケージが見つからない
```
No packages found for user
```
**解決策**: ユーザー名のスペルを確認