import db from './database';
import { initializeSchema } from './schema';
import { Profile } from '../types/profile.types';
import { v7 as uuidv7 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

initializeSchema();

const dataPath = path.join(__dirname, 'data/profiles.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const profiles = JSON.parse(rawData).profiles;

const insert = db.prepare(`
    INSERT INTO profiles (
        id,
        name,
        gender,
        gender_probability,
        age,
        age_group,
        country_id,
        country_name,
        country_probability,
        created_at
    ) VALUES (
        @id,
        @name,
        @gender,
        @gender_probability,
        @age,
        @age_group,
        @country_id,
        @country_name,
        @country_probability,
        @created_at
    )
`);

const seedAll = db.transaction((records: Profile[]) => {
    let inserted = 0;
    let skipped = 0;

    for (const record of records) {
       try {
         const result = insert.run({
            id: record.id ?? uuidv7(),
            name: record.name,
            gender: record.gender,
            gender_probability: record.gender_probability,
            age: record.age,
            age_group: record.age_group,
            country_id: record.country_id,
            country_name: record.country_name,
            country_probability: record.country_probability,
            created_at: record.created_at ?? new Date().toISOString(),
        });

        if (result.changes > 0) inserted++;
        else skipped++;
       } catch (e: any) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            skipped++;
        } else {
            throw e;
        }
       }
    }
    console.log(`Seeding complete: ${inserted} inserted, ${skipped} skipped`);
});

seedAll(profiles);