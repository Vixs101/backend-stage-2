import db from './database';


export function initializeSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id                   TEXT PRIMARY KEY,
      name                 TEXT NOT NULL UNIQUE,
      gender               TEXT NOT NULL,
      gender_probability   REAL NOT NULL,
      age                  INTEGER NOT NULL,
      age_group            TEXT NOT NULL,
      country_id           TEXT NOT NULL,
      country_name         TEXT NOT NULL,
      country_probability  REAL NOT NULL,
      created_at           TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_gender ON profiles(gender);
    CREATE INDEX IF NOT EXISTS idx_age ON profiles(age);
    CREATE INDEX IF NOT EXISTS idx_age_group ON profiles(age_group);
    CREATE INDEX IF NOT EXISTS idx_country_id ON profiles(country_id);
  `);

  console.log('Database schema ready');
}