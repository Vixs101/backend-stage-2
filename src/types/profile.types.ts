export interface Profile {
    id: string;
    name: string;
    gender: string;
    gender_probability: number;
    age: number;
    age_group: string;
    country_id: string;
    country_name: string;
    country_probability: number;
    created_at: string;
}

export type AgeGroup = 'child' | 'teenager' | 'adult' | 'senior';

export type SortableField = 'age' | 'created_at' | 'gender_probability';

export type SortOrder = 'asc' | 'desc';

export interface ProfileFilters {
    gender?: string;
    age_group?: string;
    country_id?: string;
    min_age?: number;
    max_age?: number;
    min_gender_probability?: number;
    min_country_probability?: number;
    sort_by?: SortableField;
    order?: SortOrder;
    page?: number;
    limit?: number;
}

export interface PaginatedResult {
    data: Profile[];
    total: number;
    page: number;
    limit: number;
}