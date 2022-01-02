export const orderDirection = ['ASC', 'DESC', 'asc', 'desc'] as const;
export type orderDirectionTypes = typeof orderDirection[number];
