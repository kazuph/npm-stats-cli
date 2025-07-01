# @kazuph/npmstat-cli

Advanced CLI tool for comprehensive NPM package statistics and analytics.

## 🚀 Features

- **User Statistics**: Get comprehensive stats for all packages by a specific NPM user
- **Package Rankings**: See which packages perform best by downloads
- **GitHub Integration**: Include GitHub stars and forks in statistics
- **Flexible Output**: JSON, table, or short summary formats
- **Menu Bar Integration**: Works with SwiftBar/xbar for live statistics

## 📦 Installation

```bash
# Install globally
npm install -g @kazuph/npmstat-cli

# Or use with npx (no installation required)
npx @kazuph/npmstat-cli kazuph
```

## 🛠️ Usage

### Basic Usage
```bash
# Get user statistics (default command)
npmstat kazuph

# Short summary (perfect for scripts/menu bar)
npmstat kazuph --short

# Show package rankings
npmstat kazuph --rankings

# Include GitHub stats (slower)
npmstat kazuph --github
```

### Package Statistics
```bash
# Get specific package stats
npmstat package react
npmstat package @types/node
```

### Output Formats
```bash
# JSON output for scripting
npmstat kazuph --json

# Combine options
npmstat kazuph --short --github --json
```

### Examples

**Basic user stats:**
```bash
$ npmstat kazuph

📊 NPM Statistics for kazuph
==================================================
Summary:
📦 Total Packages: 15
⬇️  Monthly Downloads: 125,432
📅 Weekly Downloads: 28,901
```

**Short summary:**
```bash
$ npmstat kazuph --short

📦 kazuph's NPM Stats:
Monthly Downloads: 125,432
Weekly Downloads: 28,901
Total Stars: 45
Total Packages: 15
```

## 🔧 Advanced Features

### Package Rankings
Show your top-performing packages:
```bash
npmstat kazuph --rankings
```

### GitHub Integration
Include GitHub stars and forks (requires additional API calls):
```bash
npmstat kazuph --github
```

### JSON Output for Automation
Perfect for scripts and integrations:
```bash
npmstat kazuph --json | jq '.totalDownloads'
```

## 📊 Menu Bar Integration

This tool works great with SwiftBar for live statistics in your menu bar:

```bash
# Install SwiftBar
brew install swiftbar

# Use the provided shell script
npx @kazuph/npmstat-cli kazuph --short
```

## 🤝 Contributing

Visit the [GitHub repository](https://github.com/kazuph/npm-stats-cli) for more information.

## 📄 License

MIT License