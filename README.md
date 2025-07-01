# NPM Stats Toolkit

A comprehensive toolkit for tracking NPM package statistics with CLI, MCP server, and macOS menu bar integration.

## Features

### 🖥️ CLI Tool
- Get total downloads and GitHub stars for NPM packages
- Support for user-specific package aggregation
- Simple command-line interface

### 🔌 MCP Server
- Model Context Protocol server for Claude Code integration
- Fetch NPM statistics programmatically
- Structured data responses

### 📊 macOS Menu Bar Integration
- Real-time display of total downloads and stars using SwiftBar
- Shell script-based integration (recommended over xbar)
- Auto-refresh capabilities every 5 minutes

## Project Structure

```
npm-stats-toolkit/
├── cli/                    # Node.js CLI tool
├── mcp-server/            # MCP server implementation
├── xbar-scripts/          # SwiftBar/xbar shell scripts
├── shared/                # Shared utilities and types
└── docs/                  # Documentation
```

## Installation

### CLI Tool
```bash
# Install globally
npm install -g @kazuph/npmstat-cli

# Or use with npx
npx @kazuph/npmstat-cli kazuph
```

### Menu Bar Integration (SwiftBar)
**Recommended**: Use SwiftBar instead of xbar for better stability and performance.

```bash
# Install SwiftBar
brew install swiftbar

# Copy the shell script to SwiftBar's plugin directory
cp xbar-scripts/npm-stats.5m.sh ~/Library/Application\ Support/SwiftBar/

# Configure the username in the script
# Edit the USERNAME variable in npm-stats.5m.sh
```

SwiftBar is actively maintained and provides better compatibility with modern macOS versions compared to the original xbar.

## Usage

### CLI
```bash
# Get user statistics (default command)
npmstat kazuph

# Short summary (perfect for menu bar)
npmstat kazuph --short

# Show package rankings
npmstat kazuph --rankings

# Include GitHub stats (slower)
npmstat kazuph --github

# Get specific package stats
npmstat package react

# JSON output
npmstat kazuph --json
```

### MCP Server
Add to Claude Code configuration to enable NPM statistics queries.

### Menu Bar Integration
The SwiftBar script automatically refreshes every 5 minutes and displays your total monthly downloads in the menu bar. Click to see detailed statistics.

## Development

This toolkit is built with:
- **CLI**: Node.js + TypeScript
- **MCP Server**: Node.js + TypeScript  
- **Menu Bar Integration**: Shell script for SwiftBar/xbar
- **Shared**: TypeScript definitions

## License

MIT License