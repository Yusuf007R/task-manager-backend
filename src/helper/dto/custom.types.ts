export const orderDirection = ['ASC', 'DESC', 'asc', 'desc'] as const;
export type orderDirectionTypes = typeof orderDirection[number];

export const booleanArray = ['true', 'false', '1', '0'] as const;
export type booleanArrayTypes = typeof booleanArray[number];
