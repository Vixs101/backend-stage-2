import { Request, Response, NextFunction } from "express";
import { SortOrder, SortableField } from "../types/profile.types";

const VALID_SORT_FIELDS = ['age', 'created_at', 'gender_probability'];
const VALID_ORDERS = ['asc', 'desc'];
const VALID_AGE_GROUPS = ['child', 'teenager', 'adult', 'senior'];
const VALID_GENDERS = ['male', 'female'];

export function validateProfilesQuery(req: Request, res: Response, next: NextFunction): void {
    const {
        sort_by,
        order,
        page,
        limit,
        age_group,
        gender,
        min_age,
        max_age,
        min_gender_probability,
        min_country_probability
    } = req.query;

    if (sort_by && !VALID_SORT_FIELDS.includes(sort_by as string)) {
        res.status(400).json({ status: 'error', message: 'Invalid query parameters' });
        return
    }
    if (order && !VALID_ORDERS.includes((order as string).toLowerCase())) {
        res.status(400).json({ status: 'error', message: 'Invalid query parameters' });
        return
    }
    if (age_group && !VALID_AGE_GROUPS.includes((age_group as string).toLowerCase())) {
        res.status(400).json({ status: 'error', message: 'Invalid query parameters' });
        return
    }
    if (gender && !VALID_GENDERS.includes((gender as string).toLowerCase())) {
        res.status(400).json({ status: 'error', message: 'Invalid query parameters' });
        return
    }
 
    //making sure numeric field are just numbers
    for (const [key, val] of Object.entries({ 
        page, limit, min_age, max_age, min_gender_probability, min_country_probability
    })) {
        if (val !== undefined && isNaN(Number(val))) {
            res.status(422).json({ status: 'error', message: 'Invalid query parameters' });
            return;
        }
    }

    next();
}