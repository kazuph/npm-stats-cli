# NPM Stats MCP Server

This MCP server provides NPM package statistics through the Model Context Protocol.

## Configuration

Add to your Claude Code configuration (`~/.claude.json`):

```json
{
  "mcpServers": {
    "npm-stats": {
      "command": "node",
      "args": ["/path/to/npm-stats-toolkit/mcp-server/dist/index.js"]
    }
  }
}
```

## Available Tools

### `get_user_npm_stats`
Get comprehensive NPM statistics for a user.

**Parameters:**
- `username` (required): NPM username
- `format` (optional): Output format - "summary", "detailed", or "json"

### `get_package_stats`
Get statistics for a specific NPM package.

**Parameters:**
- `packageName` (required): NPM package name
- `includeHistory` (optional): Include download history

### `get_quick_user_summary`
Get quick summary of user's total downloads and stars.

**Parameters:**
- `username` (required): NPM username

### `search_packages_by_author`
Search for all packages published by an author.

**Parameters:**
- `username` (required): NPM username

## Usage Examples

```
Get user stats: mcp__npm-stats__get_user_npm_stats --username kazuph
Quick summary: mcp__npm-stats__get_quick_user_summary --username kazuph
Package stats: mcp__npm-stats__get_package_stats --packageName express
```