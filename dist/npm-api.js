import fetch from 'node-fetch';
// Utility functions
export const formatNumber = (num) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};
export const calculateGrowthRate = (current, previous) => {
    if (previous === 0)
        return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};
export class NPMStatsAPI {
    constructor() {
        this.baseURL = 'https://api.npmjs.org';
        this.registryURL = 'https://registry.npmjs.org';
        this.githubAPI = 'https://api.github.com';
    }
    /**
     * Get package download statistics for a specific period
     */
    async getPackageDownloads(packageName, period = 'last-month') {
        const url = `${this.baseURL}/downloads/point/${period}/${packageName}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch download stats for ${packageName}: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Get package information from NPM registry
     */
    async getPackageInfo(packageName) {
        const url = `${this.registryURL}/${packageName}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch package info for ${packageName}: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Extract GitHub repository information from package.json
     */
    extractGitHubRepo(packageInfo) {
        const repository = packageInfo.repository;
        if (!repository || typeof repository === 'string')
            return null;
        const url = repository.url;
        if (!url)
            return null;
        // Match various GitHub URL formats
        const match = url.match(/github\.com[\/:]([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/)?$/i);
        if (!match)
            return null;
        return {
            owner: match[1],
            repo: match[2]
        };
    }
    /**
     * Get GitHub repository statistics
     */
    async getGitHubStats(owner, repo, token) {
        const url = `${this.githubAPI}/repos/${owner}/${repo}`;
        const headers = {};
        // Add Authorization header if token is provided (increases rate limit to 5000/hour)
        if (token) {
            headers['Authorization'] = `token ${token}`;
        }
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch GitHub stats for ${owner}/${repo}: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            stars: data.stargazers_count,
            forks: data.forks_count,
            openIssues: data.open_issues_count,
            watchers: data.watchers_count,
            owner,
            repo
        };
    }
    /**
     * Search for packages by author/maintainer
     */
    async searchPackagesByAuthor(username) {
        const url = `${this.registryURL}/-/v1/search?text=author:${username}&size=250`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to search packages for ${username}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.objects.map(obj => obj.package.name);
    }
    /**
     * Get comprehensive stats for a user's packages
     */
    async getUserPackageStats(username, includeGitHub = false, githubToken) {
        // Search for packages by this user
        const packageNames = await this.searchPackagesByAuthor(username);
        // Process packages sequentially to avoid rate limiting
        const packageStats = [];
        const packagesWithoutStats = []; // Track packages without download stats
        let gitHubRateLimited = false; // Track if we hit rate limit
        for (let i = 0; i < packageNames.length; i++) {
            const packageName = packageNames[i];
            try {
                // Get download stats for different periods
                const [monthlyDownloads, weeklyDownloads, packageInfo] = await Promise.all([
                    this.getPackageDownloads(packageName, 'last-month'),
                    this.getPackageDownloads(packageName, 'last-week'),
                    this.getPackageInfo(packageName)
                ]);
                // Try to get GitHub stats if repository is available and not rate limited
                let githubStats;
                if (includeGitHub && !gitHubRateLimited) {
                    const githubRepo = this.extractGitHubRepo(packageInfo);
                    if (githubRepo) {
                        try {
                            // Add delay between GitHub API calls to avoid rate limiting
                            if (i > 0) {
                                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
                            }
                            githubStats = await this.getGitHubStats(githubRepo.owner, githubRepo.repo, githubToken);
                        }
                        catch (error) {
                            // Check for rate limit error and stop future GitHub API calls
                            if (error instanceof Error && error.message.includes('rate limit')) {
                                console.warn(`GitHub rate limit detected at ${packageName}. Skipping GitHub stats for remaining packages.`);
                                gitHubRateLimited = true; // Stop calling GitHub API for remaining packages
                            }
                            else {
                                console.warn(`Failed to get GitHub stats for ${packageName}:`, error);
                            }
                        }
                    }
                }
                packageStats.push({
                    name: packageName,
                    weeklyDownloads: weeklyDownloads.downloads,
                    monthlyDownloads: monthlyDownloads.downloads,
                    githubStats,
                    monthlyRank: 0, // Will be set after sorting
                    weeklyRank: 0 // Will be set after sorting
                });
            }
            catch (error) {
                // Handle packages that don't have download stats (newly published, etc.)
                if (error instanceof Error && (error.message.includes('Not Found') || error.message.includes('404'))) {
                    packagesWithoutStats.push(packageName);
                }
                else {
                    console.warn(`Failed to get stats for ${packageName}:`, error);
                }
            }
        }
        // Use the successfully collected stats
        const successfulStats = packageStats;
        // Sort by monthly downloads and assign ranks
        const sortedByMonthly = [...successfulStats].sort((a, b) => b.monthlyDownloads - a.monthlyDownloads);
        sortedByMonthly.forEach((pkg, index) => {
            const originalPkg = successfulStats.find(p => p.name === pkg.name);
            if (originalPkg)
                originalPkg.monthlyRank = index + 1;
        });
        // Sort by weekly downloads and assign ranks
        const sortedByWeekly = [...successfulStats].sort((a, b) => b.weeklyDownloads - a.weeklyDownloads);
        sortedByWeekly.forEach((pkg, index) => {
            const originalPkg = successfulStats.find(p => p.name === pkg.name);
            if (originalPkg)
                originalPkg.weeklyRank = index + 1;
        });
        // Calculate totals
        const totalMonthlyDownloads = successfulStats.reduce((sum, pkg) => sum + pkg.monthlyDownloads, 0);
        const totalWeeklyDownloads = successfulStats.reduce((sum, pkg) => sum + pkg.weeklyDownloads, 0);
        const totalStars = successfulStats.reduce((sum, pkg) => sum + (pkg.githubStats?.stars || 0), 0);
        const totalForks = successfulStats.reduce((sum, pkg) => sum + (pkg.githubStats?.forks || 0), 0);
        return {
            username,
            packages: successfulStats,
            totalMonthlyDownloads,
            totalWeeklyDownloads,
            totalStars,
            totalForks,
            packageCount: successfulStats.length,
            topByMonthly: sortedByMonthly.slice(0, 10), // Top 10 by monthly downloads
            topByWeekly: sortedByWeekly.slice(0, 10), // Top 10 by weekly downloads
            packagesWithoutStats // Add packages without stats
        };
    }
    /**
     * Get combined download statistics for multiple periods
     */
    async getPackageDownloadHistory(packageName) {
        const [daily, weekly, monthly] = await Promise.all([
            this.getPackageDownloads(packageName, 'last-day'),
            this.getPackageDownloads(packageName, 'last-week'),
            this.getPackageDownloads(packageName, 'last-month')
        ]);
        return { daily, weekly, monthly };
    }
}
//# sourceMappingURL=npm-api.js.map