import db from "../db/database";
import { Profile, ProfileFilters, PaginatedResult, SortableField } from '../types/profile.types';

//witelist
const SORTABLE_FIELDS: Record<SortableField, string> = {
    age: 'age',
    created_at: 'created_at',
    gender_probability: 'gender_probability',
}

function buildWhereClause(filters: ProfileFilters): { clause: string; params: (string | number | null)[] } {
    const conditions: string[] = [];
    const params: (string | number | null)[] = [];

    if (filters.gender) {
        conditions.push('LOWER(gender) = LOWER(?)');
        params.push(filters.gender);
    }
    if (filters.age_group) {
        conditions.push('LOWER(age_group) = LOWER(?)');
        params.push(filters.age_group);
    }
    if (filters.country_id) {
        conditions.push('LOWER(country_id) = LOWER(?)');
        params.push(filters.country_id);
    }
    if (filters.min_age !== undefined) {
        conditions.push('age >= ?');
        params.push(filters.min_age);
    }
    if (filters.max_age !== undefined) {
        conditions.push('age <= ?');
        params.push(filters.max_age); 
    }
    if (filters.min_gender_probability !== undefined) {
        conditions.push('gender_probability >= ?');
        params.push(filters.min_gender_probability);
    }
    if (filters.min_country_probability !== undefined) {
        conditions.push('country_probability >= ?');
        params.push(filters.min_country_probability);
    }

    const clause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    return { clause, params };
}

export function getProfiles(filters: ProfileFilters): PaginatedResult {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
    const offset = (page - 1) * limit;

    const sortColumn = filters.sort_by ? SORTABLE_FIELDS[filters.sort_by] : 'created_at';
    const sortOrder = filters.order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const  { clause, params } = buildWhereClause(filters);

    //count query
    const countRow = db.prepare(`SELECT COUNT(*) as total FROM profiles ${clause}`).get(...params) as { total: number };

    //data query
    const rows = db.prepare(`
        SELECT * FROM profiles
        ${clause}
        ORDER BY ${sortColumn} ${sortOrder}
        LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as Profile[];
    
    return {
        data: rows,
        total: countRow.total,
        page,
        limit,
    };
}