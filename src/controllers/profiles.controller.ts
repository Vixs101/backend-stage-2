import { Request, Response } from 'express';
import { getProfiles } from '../services/profiles.service';
import { ProfileFilters } from '../types/profile.types';

export function handleGetAllProfiles(req: Request, res: Response): void {
  const {
    gender, age_group, country_id,
    min_age, max_age, min_gender_probability, min_country_probability,
    sort_by, order, page, limit,
  } = req.query;

  const filters: ProfileFilters = {
    gender: gender as string | undefined,
    age_group: age_group as string | undefined,
    country_id: country_id as string | undefined,
    min_age: min_age ? Number(min_age) : undefined,
    max_age: max_age ? Number(max_age) : undefined,
    min_gender_probability: min_gender_probability ? Number(min_gender_probability) : undefined,
    min_country_probability: min_country_probability ? Number(min_country_probability) : undefined,
    sort_by: sort_by as any,
    order: order as any,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  };

  const result = getProfiles(filters);

  res.status(200).json({
    status: 'success',
    page: result.page,
    limit: result.limit,
    total: result.total,
    data: result.data,
  });
}