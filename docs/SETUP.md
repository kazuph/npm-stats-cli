# Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
cd npm-stats-toolkit
npm install
```

### 2. Build All Components
```bash
npm run build
```

### 3. CLI Usage
```bash
# Build CLI first
cd cli && npm run build && cd ..

# Basic usage
node cli/dist/index.js user kazuph
node cli/dist/index.js quick kazuph
node cli/dist/index.js package express

# Install globally (optional)
cd cli && npm link && cd ..
# Then use: npm-stats user kazuph
```

### 4. MCP Server Setup
```bash
# Build MCP server
cd mcp-server && npm run build && cd ..

# Add to Claude Code configuration (~/.claude.json):
{
  "mcpServers": {
    "npm-stats": {
      "command": "node",
      "args": ["/absolute/path/to/npm-stats-toolkit/mcp-server/dist/index.js"]
    }
  }
}

# Restart Claude Code to load the MCP server
```

### 5. Menu Bar App Setup
```bash
# Open in Xcode
open menubar-app/NPMStatsMenuBar.xcodeproj

# Build and run from Xcode (⌘+R)
# Or create archive for distribution (Product > Archive)
```

## Testing Each Component

### CLI Testing
```bash
cd cli
npm run build
node dist/index.js quick kazuph
```

### MCP Server Testing
```bash
cd mcp-server
npm run build
# Test with Claude Code after configuration
```

### Menu Bar App Testing
- Open Xcode project
- Set development team
- Build and run
- Check menu bar for 📦 icon

## Troubleshooting

### CLI Issues
- Ensure Node.js 18+ is installed
- Check network connectivity for NPM API access

### MCP Server Issues
- Verify absolute path in Claude Code configuration
- Check Claude Code logs for MCP server connection errors
- Restart Claude Code after configuration changes

### Menu Bar App Issues
- Requires macOS 14.0+
- Check Xcode development team settings
- Verify app permissions for network access

## Next Steps

1. **Customize Username**: Update default username in menu bar app or set via CLI
2. **Add to Startup**: Add menu bar app to Login Items in System Preferences
3. **Create Aliases**: Add CLI aliases to your shell profile for quick access
4. **Extend Functionality**: Add more NPM statistics or GitHub integrations

## API Rate Limits

The toolkit respects NPM and GitHub API rate limits:
- NPM API: No authentication required, reasonable rate limits
- GitHub API: 60 requests/hour without authentication
- Menu bar app includes delays between requests
- CLI tool processes packages sequentially to avoid rate limiting