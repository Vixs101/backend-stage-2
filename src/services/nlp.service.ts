import { match } from "node:assert";
import { ProfileFilters } from "../types/profile.types";
import { COUNTRY_NAME_TO_ID } from './countries';

export function parseNaturalLanguageQuery(q: string): ProfileFilters | null {
    const query = q.toLowerCase().trim();

    if (!query) return null;

    const filters: ProfileFilters = {};
    let matched = false;

    //gender
    if (/\b(male|males|men|man)\b/.test(query) && !/\b(fe?male|women|woman|girl)\b/.test(query)) {
        filters.gender = 'male';
        matched = true;
    } else if (/\b(female|females|women|woman|girl|girls)\b/.test(query)) {
        filters.gender = 'female';
        matched = true;
    }

    //age group
    if (/\bchild(ren)?\b/.test(query)) {
        filters.age_group = 'child';
        matched = true;
    } else if (/\bteen(ager)?s?\b/.test(query)) {
        filters.age_group = 'teenager';
        matched = true;    
    } else if (/\badults?\b/.test(query)) {
        filters.age_group = 'adult';
        matched = true;
    } else if (/\bsenior\b/.test(query)) {
        filters.age_group = 'senior';
        matched = true;
    }

    // "young" keyword
    if (/\byoung\b/.test(query)) {
        filters.min_age = 16;
        filters.max_age = 24;
        matched = true;
    }

    // "above 30" - "over 30" - "older than 30"
    const aboveMatch = query.match(/\b(?:above|over|older than|greater than|more than)\s+(\d+)\b/);
    if (aboveMatch) {
        filters.min_age = parseInt(aboveMatch[1], 10);
        matched = true;
    }

    //"below 30" / "under 30" / "younger than 30"
    const belowMatch = query.match(/\b(?:below|under|younger than|less than)\s+(\d+)\b/);
    if (belowMatch) {
        filters.max_age = parseInt(belowMatch[1], 10);
        matched = true;
    }

    // "between 20 and 40"
    const betweenMatch = query.match(/\bbetween\s+(\d+)\s+and\s+(\d+)\b/);
    if (betweenMatch) {
        filters.min_age = parseInt(betweenMatch[1], 10);
        filters.max_age = parseInt(betweenMatch[2], 10);
        matched = true;
    }

    // "aged 25" / "age 25"
    const agedMatch = query.match(/\baged?\s+(\d+)\b/);
    if (agedMatch) {
        filters.min_age = parseInt(agedMatch[1], 10);
        filters.max_age = parseInt(agedMatch[1], 10);
        matched = true;
    }

    //country
    // try "from <country>" or "in  <country>" patterns first
    const countryPhraseMatch = query.match(/\b(?:from|in)\s+([a-z\s\-]+?)(?:\s+(?:who|that|with|aged?|above|below|over|under)|$)/);
    if (countryPhraseMatch) {
        const countryName = countryPhraseMatch[1].trim();
        const countryId = lookupCountry(countryName);
        if (countryId) {
            filters.country_id = countryId;
            matched = true;
        } 
    }

    //fallback to scan all known country names, anywhere in the query
    if (!filters.country_id) {
        const sortedCountries = Object.keys(COUNTRY_NAME_TO_ID).sort((a, b) => b.length - a.length);
        for (const name of sortedCountries) {
            if (query.includes(name)) {
                filters.country_id = COUNTRY_NAME_TO_ID[name];
                matched = true;
                break;
            }
        }
    }

    return matched ? filters : null;
}

function lookupCountry(name: string): string | null {
  // Direct match
  if (COUNTRY_NAME_TO_ID[name]) return COUNTRY_NAME_TO_ID[name];

  // Partial match "nigerian" should still find "nigeria"
  for (const [key, value] of Object.entries(COUNTRY_NAME_TO_ID)) {
    if (name.startsWith(key) || key.startsWith(name)) return value;
  }

  return null;
}