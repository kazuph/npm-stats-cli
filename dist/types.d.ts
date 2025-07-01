export interface PackageDownloads {
    package: string;
    downloads: number;
    start: string;
    end: string;
}
export interface PackageInfo {
    name: string;
    description?: string;
    version: string;
    homepage?: string;
    repository?: {
        type: string;
        url: string;
    };
    author?: string | {
        name: string;
        email?: string;
    };
    keywords?: string[];
    license?: string;
    time: {
        created: string;
        modified: string;
        [version: string]: string;
    };
}
export interface GitHubStats {
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    owner: string;
    repo: string;
}
export interface PackageStatsWithRanking {
    name: string;
    weeklyDownloads: number;
    monthlyDownloads: number;
    githubStats?: GitHubStats;
    monthlyRank: number;
    weeklyRank: number;
}
export interface UserPackageStats {
    username: string;
    packages: PackageStatsWithRanking[];
    totalMonthlyDownloads: number;
    totalWeeklyDownloads: number;
    totalStars: number;
    totalForks: number;
    packageCount: number;
    topByMonthly: PackageStatsWithRanking[];
    topByWeekly: PackageStatsWithRanking[];
    packagesWithoutStats?: string[];
}
export interface NPMSearchResult {
    objects: Array<{
        package: {
            name: string;
            scope: string;
            version: string;
            description: string;
            keywords: string[];
            date: string;
            links: {
                npm: string;
                homepage?: string;
                repository?: string;
                bugs?: string;
            };
            author?: {
                name: string;
                email?: string;
                username?: string;
            };
            publisher: {
                username: string;
                email: string;
            };
            maintainers: Array<{
                username: string;
                email: string;
            }>;
        };
        flags?: {
            unstable?: boolean;
        };
        score: {
            final: number;
            detail: {
                quality: number;
                popularity: number;
                maintenance: number;
            };
        };
        searchScore: number;
    }>;
    total: number;
    time: string;
}
//# sourceMappingURL=types.d.ts.map