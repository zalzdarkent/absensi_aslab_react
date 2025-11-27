// Wayfinder types and utilities for route generation

export interface RouteQueryOptions {
    query?: Record<string, any>;
    mergeQuery?: Record<string, any>;
}

export interface RouteDefinition<T extends string = string> {
    url: string;
    method: T;
}

export interface RouteFormDefinition<T extends string = string> {
    action: string;
    method: T;
}

/**
 * Convert query parameters to URL query string
 */
export function queryParams(options?: RouteQueryOptions): string {
    if (!options) return '';

    const params = options.query || options.mergeQuery;
    if (!params || Object.keys(params).length === 0) return '';

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
        }
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}
