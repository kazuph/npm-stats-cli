#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { NPMStatsAPI, formatNumber } from './npm-api.js';
class NPMStatsMCPServer {
    constructor() {
        this.server = new Server({
            name: 'npm-stats-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.npmAPI = new NPMStatsAPI();
        this.setupToolHandlers();
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_user_npm_stats',
                        description: 'Get comprehensive NPM statistics for a user including total downloads, stars, and package details',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                username: {
                                    type: 'string',
                                    description: 'NPM username to get statistics for',
                                },
                                format: {
                                    type: 'string',
                                    enum: ['summary', 'detailed', 'json'],
                                    description: 'Output format (default: summary)',
                                    default: 'summary'
                                }
                            },
                            required: ['username'],
                        },
                    },
                    {
                        name: 'get_package_stats',
                        description: 'Get statistics for a specific NPM package including downloads and GitHub stats',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                packageName: {
                                    type: 'string',
                                    description: 'NPM package name to get statistics for',
                                },
                                includeHistory: {
                                    type: 'boolean',
                                    description: 'Include download history (daily, weekly, monthly)',
                                    default: false
                                }
                            },
                            required: ['packageName'],
                        },
                    },
                    {
                        name: 'get_quick_user_summary',
                        description: 'Get quick summary of user\'s total downloads and stars',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                username: {
                                    type: 'string',
                                    description: 'NPM username to get quick summary for',
                                }
                            },
                            required: ['username'],
                        },
                    },
                    {
                        name: 'search_packages_by_author',
                        description: 'Search for all packages published by a specific author',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                username: {
                                    type: 'string',
                                    description: 'NPM username to search packages for',
                                }
                            },
                            required: ['username'],
                        },
                    }
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'get_user_npm_stats':
                        return await this.handleGetUserStats(args);
                    case 'get_package_stats':
                        return await this.handleGetPackageStats(args);
                    case 'get_quick_user_summary':
                        return await this.handleGetQuickUserSummary(args);
                    case 'search_packages_by_author':
                        return await this.handleSearchPackagesByAuthor(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
            }
        });
    }
    async handleGetUserStats(args) {
        const { username, format = 'summary' } = args;
        if (!username) {
            throw new McpError(ErrorCode.InvalidParams, 'Username is required');
        }
        const stats = await this.npmAPI.getUserPackageStats(username);
        if (format === 'json') {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(stats, null, 2),
                    },
                ],
            };
        }
        const summary = this.formatUserStatsSummary(stats);
        if (format === 'detailed') {
            const detailed = this.formatUserStatsDetailed(stats);
            return {
                content: [
                    {
                        type: 'text',
                        text: summary + '\n\n' + detailed,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: summary,
                },
            ],
        };
    }
    async handleGetPackageStats(args) {
        const { packageName, includeHistory = false } = args;
        if (!packageName) {
            throw new McpError(ErrorCode.InvalidParams, 'Package name is required');
        }
        if (includeHistory) {
            const history = await this.npmAPI.getPackageDownloadHistory(packageName);
            return {
                content: [
                    {
                        type: 'text',
                        text: this.formatPackageHistory(packageName, history),
                    },
                ],
            };
        }
        const [downloads, info] = await Promise.all([
            this.npmAPI.getPackageDownloads(packageName),
            this.npmAPI.getPackageInfo(packageName),
        ]);
        return {
            content: [
                {
                    type: 'text',
                    text: this.formatPackageStats(packageName, downloads, info),
                },
            ],
        };
    }
    async handleGetQuickUserSummary(args) {
        const { username } = args;
        if (!username) {
            throw new McpError(ErrorCode.InvalidParams, 'Username is required');
        }
        const stats = await this.npmAPI.getUserPackageStats(username);
        const summary = `📦 ${username}'s NPM Stats:\n` +
            `Total Downloads: ${formatNumber(stats.totalDownloads)}\n` +
            `Total Stars: ${formatNumber(stats.totalStars)}\n` +
            `Total Packages: ${stats.packageCount}`;
        return {
            content: [
                {
                    type: 'text',
                    text: summary,
                },
            ],
        };
    }
    async handleSearchPackagesByAuthor(args) {
        const { username } = args;
        if (!username) {
            throw new McpError(ErrorCode.InvalidParams, 'Username is required');
        }
        const packages = await this.npmAPI.searchPackagesByAuthor(username);
        const result = `📦 Packages by ${username}:\n` +
            packages.map(pkg => `• ${pkg}`).join('\n') +
            `\n\nTotal: ${packages.length} packages`;
        return {
            content: [
                {
                    type: 'text',
                    text: result,
                },
            ],
        };
    }
    formatUserStatsSummary(stats) {
        return `📊 NPM Statistics for ${stats.username}\n` +
            `${'='.repeat(50)}\n` +
            `📦 Total Packages: ${stats.packageCount}\n` +
            `⬇️  Total Downloads: ${formatNumber(stats.totalDownloads)}\n` +
            `⭐ Total Stars: ${formatNumber(stats.totalStars)}\n` +
            `🍴 Total Forks: ${formatNumber(stats.totalForks)}`;
    }
    formatUserStatsDetailed(stats) {
        const topPackages = stats.packages
            .sort((a, b) => b.totalDownloads - a.totalDownloads)
            .slice(0, 10);
        let detailed = 'Top Packages by Downloads:\n';
        topPackages.forEach((pkg, index) => {
            detailed += `${index + 1}. ${pkg.name}\n`;
            detailed += `   Monthly Downloads: ${formatNumber(pkg.monthlyDownloads)}\n`;
            if (pkg.githubStats) {
                detailed += `   Stars: ${formatNumber(pkg.githubStats.stars)} | Forks: ${formatNumber(pkg.githubStats.forks)}\n`;
            }
            detailed += '\n';
        });
        return detailed;
    }
    formatPackageStats(packageName, downloads, info) {
        let result = `📦 ${packageName}\n${'='.repeat(50)}\n`;
        result += `📝 Description: ${info.description || 'N/A'}\n`;
        result += `📅 Version: ${info.version}\n`;
        result += `📊 Downloads (${downloads.start} to ${downloads.end}): ${formatNumber(downloads.downloads)}\n`;
        if (info.repository?.url) {
            result += `🔗 Repository: ${info.repository.url}\n`;
        }
        if (info.keywords?.length) {
            result += `🏷️  Keywords: ${info.keywords.join(', ')}\n`;
        }
        return result;
    }
    formatPackageHistory(packageName, history) {
        return `📈 Download History for ${packageName}\n` +
            `${'='.repeat(50)}\n` +
            `📅 Daily Downloads: ${formatNumber(history.daily.downloads)}\n` +
            `📅 Weekly Downloads: ${formatNumber(history.weekly.downloads)}\n` +
            `📅 Monthly Downloads: ${formatNumber(history.monthly.downloads)}`;
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
export async function startMCPServer() {
    const server = new NPMStatsMCPServer();
    await server.run();
}
// If this file is run directly (not imported), start the server
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new NPMStatsMCPServer();
    server.run().catch(console.error);
}
//# sourceMappingURL=mcp-server.js.map