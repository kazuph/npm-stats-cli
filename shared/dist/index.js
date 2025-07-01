export * from './types.js';
export * from './npm-api.js';
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
//# sourceMappingURL=index.js.map