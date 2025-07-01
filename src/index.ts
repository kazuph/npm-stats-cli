#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { NPMStatsAPI, formatNumber } from './npm-api.js';
import { UserPackageStats, PackageStatsWithRanking } from './types.js';
import { startMCPServer } from './mcp-server.js';

const program = new Command();
const api = new NPMStatsAPI();

program
  .name('npm-stats')
  .description('CLI tool for NPM package statistics')
  .version('1.0.0');

// Default command (no subcommand) - treat as user command
program
  .argument('[username]', 'NPM username to get statistics for')
  .option('-j, --json', 'Output as JSON')
  .option('-s, --short', 'Show short summary only')
  .option('-r, --rankings', 'Show package rankings')
  .option('--github', 'Include GitHub stats (slower, may hit rate limits)')
  .action(async (username?: string, options?: any) => {
    if (!username) {
      program.help();
      return;
    }
    
    const spinner = ora(`Fetching statistics for ${chalk.blue(username)}...`).start();
    
    try {
      const stats = await api.getUserPackageStats(username, options?.github === true);
      
      if (options?.short) {
        spinner.stop();
        console.log(chalk.bold.green(`📦 ${username}'s NPM Stats:`));
        console.log(`Monthly Downloads: ${chalk.yellow(formatNumber(stats.totalMonthlyDownloads))}`);
        console.log(`Weekly Downloads: ${chalk.yellow(formatNumber(stats.totalWeeklyDownloads))}`);
        console.log(`Total Stars: ${chalk.yellow(formatNumber(stats.totalStars))}`);
        console.log(`Total Packages: ${chalk.yellow(stats.packageCount)}`);
        return;
      }
      
      spinner.succeed(`Found ${stats.packageCount} packages for ${chalk.blue(username)}`);
      
      if (options?.json) {
        console.log(JSON.stringify(stats, null, 2));
        return;
      }
      
      displayUserStats(stats, false, options?.rankings, options?.github === true);
    } catch (error) {
      spinner.fail(`Failed to fetch statistics: ${error}`);
      process.exit(1);
    }
  });

program
  .command('user <username>')
  .description('Get comprehensive statistics for a user\'s NPM packages')
  .option('-j, --json', 'Output as JSON')
  .option('-s, --short', 'Show short summary only')
  .option('-r, --rankings', 'Show package rankings')
  .option('--github', 'Include GitHub stats (slower, may hit rate limits)')
  .action(async (username: string, options) => {
    const spinner = ora(`Fetching statistics for ${chalk.blue(username)}...`).start();
    
    try {
      const stats = await api.getUserPackageStats(username, options.github === true);
      
      if (options.short) {
        spinner.stop();
        console.log(chalk.bold.green(`📦 ${username}'s NPM Stats:`));
        console.log(`Monthly Downloads: ${chalk.yellow(formatNumber(stats.totalMonthlyDownloads))}`);
        console.log(`Weekly Downloads: ${chalk.yellow(formatNumber(stats.totalWeeklyDownloads))}`);
        console.log(`Total Stars: ${chalk.yellow(formatNumber(stats.totalStars))}`);
        console.log(`Total Packages: ${chalk.yellow(stats.packageCount)}`);
        return;
      }
      
      spinner.succeed(`Found ${stats.packageCount} packages for ${chalk.blue(username)}`);
      
      if (options.json) {
        console.log(JSON.stringify(stats, null, 2));
        return;
      }
      
      displayUserStats(stats, false, options.rankings, options.github === true);
    } catch (error) {
      spinner.fail(`Failed to fetch statistics: ${error}`);
      process.exit(1);
    }
  });

program
  .command('package <packageName>')
  .description('Get statistics for a specific package')
  .option('-j, --json', 'Output as JSON')
  .option('-h, --history', 'Show download history')
  .action(async (packageName: string, options) => {
    const spinner = ora(`Fetching statistics for ${chalk.blue(packageName)}...`).start();
    
    try {
      if (options.history) {
        const history = await api.getPackageDownloadHistory(packageName);
        spinner.succeed(`Statistics retrieved for ${chalk.blue(packageName)}`);
        
        if (options.json) {
          console.log(JSON.stringify(history, null, 2));
          return;
        }
        
        displayPackageHistory(packageName, history);
      } else {
        const [downloads, info] = await Promise.all([
          api.getPackageDownloads(packageName),
          api.getPackageInfo(packageName)
        ]);
        
        spinner.succeed(`Statistics retrieved for ${chalk.blue(packageName)}`);
        
        if (options.json) {
          console.log(JSON.stringify({ downloads, info }, null, 2));
          return;
        }
        
        displayPackageStats(packageName, downloads, info);
      }
    } catch (error) {
      spinner.fail(`Failed to fetch statistics: ${error}`);
      process.exit(1);
    }
  });


program
  .command('rankings <username>')
  .description('Show package download rankings for a user')
  .option('-j, --json', 'Output as JSON')
  .option('--github', 'Include GitHub stats (slower, may hit rate limits)')
  .action(async (username: string, options) => {
    const spinner = ora(`Fetching rankings for ${chalk.blue(username)}...`).start();
    
    try {
      const stats = await api.getUserPackageStats(username, options.github === true);
      spinner.succeed(`Rankings retrieved for ${chalk.blue(username)}`);
      
      if (options.json) {
        console.log(JSON.stringify({
          topByMonthly: stats.topByMonthly,
          topByWeekly: stats.topByWeekly
        }, null, 2));
        return;
      }
      
      displayUserStats(stats, true, true, options.github === true); // summary + rankings
    } catch (error) {
      spinner.fail(`Failed to fetch rankings: ${error}`);
      process.exit(1);
    }
  });

program
  .command('mcp')
  .description('Start MCP (Model Context Protocol) server for Claude AI integration')
  .action(async () => {
    console.log(chalk.blue('🚀 Starting NPM Stats MCP Server...'));
    console.log(chalk.gray('This server enables Claude AI to access NPM statistics via MCP protocol.'));
    console.log(chalk.gray('Press Ctrl+C to stop the server.'));
    console.log();
    
    try {
      await startMCPServer();
    } catch (error) {
      console.error(chalk.red('Failed to start MCP server:'), error);
      process.exit(1);
    }
  });

function displayUserStats(stats: UserPackageStats, summaryOnly = false, showRankings = false, includeGitHub = false) {
  if (summaryOnly && !showRankings) {
    // For summary only, show simple format without extra formatting
    console.log(chalk.bold.green(`📊 NPM Statistics for ${stats.username}`));
    console.log(chalk.gray('='.repeat(50)));
    console.log(chalk.bold('Summary:'));
    console.log(`📦 Total Packages: ${chalk.yellow(stats.packageCount)}`);
    console.log(`⬇️  Monthly Downloads: ${chalk.yellow(formatNumber(stats.totalMonthlyDownloads))}`);
    console.log(`📅 Weekly Downloads: ${chalk.yellow(formatNumber(stats.totalWeeklyDownloads))}`);
    if (includeGitHub) {
      console.log(`⭐ Total Stars: ${chalk.yellow(formatNumber(stats.totalStars))}`);
      console.log(`🍴 Total Forks: ${chalk.yellow(formatNumber(stats.totalForks))}`);
    }
    return;
  }
  
  if (showRankings) {
    // Monthly Download Rankings
    console.log(chalk.bold('🏆 Top Packages by Monthly Downloads:'));
    const monthlyHeaders = [
      chalk.cyan('Rank'),
      chalk.cyan('Package'),
      chalk.cyan('Monthly DL')
    ];
    const monthlyColWidths = [8, 30, 15];
    
    if (includeGitHub) {
      monthlyHeaders.push(chalk.cyan('Stars'));
      monthlyColWidths.push(10);
    }
    
    const monthlyTable = new Table({
      head: monthlyHeaders,
      colWidths: monthlyColWidths
    });
    
    stats.topByMonthly.forEach((pkg, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
      const row = [
        medal,
        pkg.name,
        formatNumber(pkg.monthlyDownloads)
      ];
      
      if (includeGitHub) {
        row.push(pkg.githubStats ? formatNumber(pkg.githubStats.stars) : 'N/A');
      }
      
      monthlyTable.push(row);
    });
    
    console.log(monthlyTable.toString());
    
    // Weekly Download Rankings
    console.log(chalk.bold('\n🚀 Top Packages by Weekly Downloads:'));
    const weeklyHeaders = [
      chalk.cyan('Rank'),
      chalk.cyan('Package'),
      chalk.cyan('Weekly DL')
    ];
    const weeklyColWidths = [8, 30, 15];
    
    if (includeGitHub) {
      weeklyHeaders.push(chalk.cyan('Stars'));
      weeklyColWidths.push(10);
    }
    
    const weeklyTable = new Table({
      head: weeklyHeaders,
      colWidths: weeklyColWidths
    });
    
    stats.topByWeekly.forEach((pkg, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
      const row = [
        medal,
        pkg.name,
        formatNumber(pkg.weeklyDownloads)
      ];
      
      if (includeGitHub) {
        row.push(pkg.githubStats ? formatNumber(pkg.githubStats.stars) : 'N/A');
      }
      
      weeklyTable.push(row);
    });
    
    console.log(weeklyTable.toString());
  }
  
  if (!showRankings) {
    // Main detailed package table
    const detailedHeaders = [
      chalk.cyan('Package'),
      chalk.cyan('Monthly DL'),
      chalk.cyan('Weekly DL'),
      chalk.cyan('M-Rank'),
      chalk.cyan('W-Rank')
    ];
    const detailedColWidths = [25, 12, 12, 8, 8];
    
    if (includeGitHub) {
      detailedHeaders.push(chalk.cyan('Stars'));
      detailedColWidths.push(8);
    }
    
    const table = new Table({
      head: detailedHeaders,
      colWidths: detailedColWidths
    });
    
    stats.packages
      .sort((a, b) => b.monthlyDownloads - a.monthlyDownloads)
      .forEach(pkg => {
        const row = [
          pkg.name,
          formatNumber(pkg.monthlyDownloads),
          formatNumber(pkg.weeklyDownloads),
          pkg.monthlyRank,
          pkg.weeklyRank
        ];
        
        if (includeGitHub) {
          row.push(pkg.githubStats ? formatNumber(pkg.githubStats.stars) : 'N/A');
        }
        
        table.push(row);
      });
    
    // Add packages without stats as dashed rows at the end
    if (stats.packagesWithoutStats && stats.packagesWithoutStats.length > 0) {
      stats.packagesWithoutStats.forEach(packageName => {
        const dashRow = [
          chalk.gray(packageName),
          chalk.gray('--'),
          chalk.gray('--'),
          chalk.gray('--'),
          chalk.gray('--')
        ];
        
        if (includeGitHub) {
          dashRow.push(chalk.gray('--'));
        }
        
        table.push(dashRow);
      });
    }
    
    console.log(table.toString());
    
    // Add totals row
    const totalRow = [
      chalk.bold('TOTAL'),
      chalk.bold.yellow(formatNumber(stats.totalMonthlyDownloads)),
      chalk.bold.yellow(formatNumber(stats.totalWeeklyDownloads)),
      '',
      ''
    ];
    
    if (includeGitHub) {
      totalRow.push(chalk.bold.yellow(formatNumber(stats.totalStars)));
    }
    
    const totalTable = new Table({
      head: [],
      colWidths: detailedColWidths
    });
    totalTable.push(totalRow);
    console.log(totalTable.toString());
    
    // Summary at the bottom
    console.log(chalk.bold.green(`\n📊 Summary for ${stats.username}`));
    console.log(chalk.gray('='.repeat(50)));
    const totalPackages = stats.packageCount + (stats.packagesWithoutStats?.length || 0);
    console.log(`📦 Total Packages: ${chalk.yellow(totalPackages)}`);
    console.log(`⬇️  Monthly Downloads: ${chalk.yellow(formatNumber(stats.totalMonthlyDownloads))}`);
    console.log(`📅 Weekly Downloads: ${chalk.yellow(formatNumber(stats.totalWeeklyDownloads))}`);
    if (includeGitHub) {
      console.log(`⭐ Total Stars: ${chalk.yellow(formatNumber(stats.totalStars))}`);
      console.log(`🍴 Total Forks: ${chalk.yellow(formatNumber(stats.totalForks))}`);
    }
    if (stats.packagesWithoutStats && stats.packagesWithoutStats.length > 0) {
      console.log(chalk.gray(`📋 Packages pending stats: ${stats.packagesWithoutStats.length} (newly published)`));
    }
  }
}

function displayPackageStats(packageName: string, downloads: any, info: any) {
  console.log(chalk.bold.green(`\n📦 ${packageName}`));
  console.log(chalk.gray('=' .repeat(50)));
  
  console.log(`📝 Description: ${info.description || 'N/A'}`);
  console.log(`📅 Version: ${info.version}`);
  console.log(`📊 Downloads (${downloads.start} to ${downloads.end}): ${chalk.yellow(formatNumber(downloads.downloads))}`);
  
  if (info.repository?.url) {
    console.log(`🔗 Repository: ${info.repository.url}`);
  }
  
  if (info.keywords?.length) {
    console.log(`🏷️  Keywords: ${info.keywords.join(', ')}`);
  }
}

function displayPackageHistory(packageName: string, history: any) {
  console.log(chalk.bold.green(`\n📈 Download History for ${packageName}`));
  console.log(chalk.gray('=' .repeat(50)));
  
  console.log(`📅 Daily Downloads: ${chalk.yellow(formatNumber(history.daily.downloads))}`);
  console.log(`📅 Weekly Downloads: ${chalk.yellow(formatNumber(history.weekly.downloads))}`);
  console.log(`📅 Monthly Downloads: ${chalk.yellow(formatNumber(history.monthly.downloads))}`);
}

program.parse();