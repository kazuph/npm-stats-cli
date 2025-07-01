import { PackageDownloads, PackageInfo, GitHubStats, UserPackageStats } from './types.js';
export declare const formatNumber: (num: number) => string;
export declare const formatDate: (dateString: string) => string;
export declare const calculateGrowthRate: (current: number, previous: number) => number;
export declare class NPMStatsAPI {
    private readonly baseURL;
    private readonly registryURL;
    private readonly githubAPI;
    /**
     * Get package download statistics for a specific period
     */
    getPackageDownloads(packageName: string, period?: string): Promise<PackageDownloads>;
    /**
     * Get package information from NPM registry
     */
    getPackageInfo(packageName: string): Promise<PackageInfo>;
    /**
     * Extract GitHub repository information from package.json
     */
    private extractGitHubRepo;
    /**
     * Get GitHub repository statistics
     */
    getGitHubStats(owner: string, repo: string, token?: string): Promise<GitHubStats>;
    /**
     * Search for packages by author/maintainer
     */
    searchPackagesByAuthor(username: string): Promise<string[]>;
    /**
     * Get comprehensive stats for a user's packages
     */
    getUserPackageStats(username: string, includeGitHub?: boolean, githubToken?: string): Promise<UserPackageStats>;
    /**
     * Get combined download statistics for multiple periods
     */
    getPackageDownloadHistory(packageName: string): Promise<{
        daily: PackageDownloads;
        weekly: PackageDownloads;
        monthly: PackageDownloads;
    }>;
}
//# sourceMappingURL=npm-api.d.ts.map