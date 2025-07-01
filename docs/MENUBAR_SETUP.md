# メニューバーアプリセットアップガイド

## 📦 NPM Stats Menu Bar App

### 🚀 セットアップ手順

#### 1. Xcodeでプロジェクトを開く

```bash
cd /Users/kazuph/npm-stats-toolkit
open menubar-app/NPMStatsMenuBar.xcodeproj
```

#### 2. Xcodeの設定

1. **Xcodeが起動**したら、左側のプロジェクトナビゲーターで`NPMStatsMenuBar`を選択
2. **TARGETS > NPMStatsMenuBar**を選択
3. **Signing & Capabilities**タブをクリック
4. **Team**で自分の開発者アカウントを選択
   - Apple IDでサインインしていれば、個人チームが表示されます
   - 「Personal Team」を選択すれば十分です

#### 3. ビルド & 実行

1. **⌘+R** を押すか、**Product > Run**を選択
2. ビルドが成功すると、アプリが起動します
3. **メニューバーに📦アイコンが表示**されます

### 🎯 アプリの機能

#### メニューバーアイコン
- **📦**: NPMパッケージを表すアイコン
- **クリック**: ドロップダウンメニューが表示

#### 表示される情報
- **Total Downloads**: 月間ダウンロード合計
- **Total Packages**: パッケージ数
- **Weekly Downloads**: 週間ダウンロード数
- **Auto Refresh**: 定期的な自動更新

#### メニュー項目
- **Refresh Now**: 手動で統計を更新
- **Settings**: 設定画面（将来実装予定）
- **Quit**: アプリを終了

### ⚙️ 設定とカスタマイズ

#### ユーザー名の変更

メニューバーアプリでは現在`kazuph`がハードコードされています。自分のユーザー名に変更するには：

1. **ContentView.swift**を編集
2. 以下の行を変更：

```swift
// 変更前
api.getUserPackageStats(username: "kazuph") { result in

// 変更後
api.getUserPackageStats(username: "YOUR_USERNAME") { result in
```

#### 更新間隔の調整

デフォルトでは5分ごとに更新されます。間隔を変更するには：

```swift
// MenuBarApp.swift内
Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
    // 300秒 = 5分
    // 他の値に変更可能（秒単位）
}
```

### 🔧 トラブルシューティング

#### ビルドエラーが発生する場合

1. **Clean Build Folder**: **Product > Clean Build Folder**
2. **Derived Data削除**: **Xcode > Preferences > Locations > Derived Data** で「Delete」
3. **再ビルド**: **⌘+R**

#### メニューバーに表示されない場合

1. **システム設定確認**: **System Settings > Control Center > Menu Bar Only**
2. **アプリの許可**: セキュリティ設定でアプリの実行を許可
3. **再起動**: アプリを一度終了して再実行

#### データが表示されない場合

1. **ネットワーク接続**を確認
2. **ユーザー名**が正しく設定されているか確認
3. **API制限**に引っかかっていないか確認

### 📱 使用例

```
📦 Click to view stats
┌─────────────────────┐
│ NPM Stats - kazuph  │
├─────────────────────┤
│ 📦 Total: 12.3K DL  │
│ 📅 Weekly: 5.2K DL  │
│ 🎯 Packages: 11     │
├─────────────────────┤
│ 🔄 Refresh Now      │
│ ⚙️  Settings         │
│ ❌ Quit             │
└─────────────────────┘
```

### 🎨 カスタマイズオプション

- **アイコン変更**: Assets.xcassetsでアイコンを変更可能
- **色テーマ**: SwiftUIのColor設定で色をカスタマイズ
- **表示項目**: 表示する統計項目を追加/削除可能
- **通知**: ダウンロード数の大幅な変化時に通知を追加可能

### 🚀 本番利用

1. **Archive**: **Product > Archive**でリリースビルド作成
2. **Export**: アプリを書き出し
3. **Applications**フォルダに配置
4. **自動起動**: **System Settings > General > Login Items**で自動起動設定

これで、常時メニューバーからNPM統計を監視できます！