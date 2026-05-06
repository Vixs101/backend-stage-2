# Insighta Labs — Demographic Intelligence API

A Node.js/Express/TypeScript REST API for querying demographic profile data. Supports advanced filtering, sorting, pagination, and natural language search.

---

## Endpoints

### `GET /api/profiles`

Returns a paginated list of profiles. All parameters are optional and combinable.

**Filter parameters**

| Parameter | Type | Description |
|---|---|---|
| `gender` | string | `male` or `female` |
| `age_group` | string | `child`, `teenager`, `adult`, or `senior` |
| `country_id` | string | ISO 2-letter country code (e.g. `NG`, `KE`) |
| `min_age` | number | Minimum age (inclusive) |
| `max_age` | number | Maximum age (inclusive) |
| `min_gender_probability` | number | Minimum gender confidence score (0–1) |
| `min_country_probability` | number | Minimum country confidence score (0–1) |

**Sorting parameters**

| Parameter | Values | Default |
|---|---|---|
| `sort_by` | `age`, `created_at`, `gender_probability` | `created_at` |
| `order` | `asc`, `desc` | `desc` |

**Pagination parameters**

| Parameter | Default | Max |
|---|---|---|
| `page` | `1` | — |
| `limit` | `10` | `50` |

**Example**

```
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10
```

**Response (200)**

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 142,
  "data": [
    {
      "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
      "name": "Emmanuel Okafor",
      "gender": "male",
      "gender_probability": 0.99,
      "age": 34,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.85,
      "created_at": "2026-04-01T12:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/profiles/search`

Accepts a plain English query string and converts it into filters using rule-based parsing. Supports the same pagination parameters (`page`, `limit`) as the main endpoint.

**Parameters**

| Parameter | Required | Description |
|---|---|---|
| `q` | Yes | Natural language query string |
| `page` | No | Page number (default: 1) |
| `limit` | No | Results per page (default: 10, max: 50) |

**Example**

```
GET /api/profiles/search?q=young males from nigeria&page=1&limit=10
```

**Response (200)** — same shape as `GET /api/profiles`

**Error response when query cannot be interpreted (400)**

```json
{
  "status": "error",
  "message": "Unable to interpret query"
}
```

---

## Natural language parsing approach

The parser is entirely rule-based — no AI or external services involved. It works by lowercasing the query string and scanning it for known keyword patterns using regular expressions. Each matched pattern contributes one or more filters to a `ProfileFilters` object, which is then passed directly into the same query builder used by `GET /api/profiles`.

If no keywords match at all, the parser returns `null` and the endpoint responds with `"Unable to interpret query"`.

### Supported keywords and their filter mappings

**Gender**

| Query contains | Maps to |
|---|---|
| `male`, `males`, `men`, `man` | `gender = male` |
| `female`, `females`, `women`, `woman`, `girl`, `girls` | `gender = female` |

Note: the female check runs before the male check because "female" contains the substring "male". Without this ordering, "females" would incorrectly match as male.

**Age groups**

| Query contains | Maps to |
|---|---|
| `child`, `children` | `age_group = child` |
| `teen`, `teens`, `teenager`, `teenagers` | `age_group = teenager` |
| `adult`, `adults` | `age_group = adult` |
| `senior`, `seniors` | `age_group = senior` |

**Special age keyword**

| Query contains | Maps to |
|---|---|
| `young` | `min_age = 16`, `max_age = 24` |

`young` is a parsing-only concept — it is not a stored `age_group` value. It maps to an age range of 16–24 for query purposes only.

**Age comparisons**

| Query pattern | Maps to |
|---|---|
| `above 30`, `over 30`, `older than 30`, `greater than 30`, `more than 30` | `min_age = 30` |
| `below 30`, `under 30`, `younger than 30`, `less than 30` | `max_age = 30` |
| `between 20 and 40` | `min_age = 20`, `max_age = 40` |
| `aged 25`, `age 25` | `min_age = 25`, `max_age = 25` |

**Country**

The parser first looks for "from \<country\>" or "in \<country\>" patterns. If that doesn't match, it falls back to scanning the entire query for any known country name.

Country names are matched against a lookup table of 60+ countries mapping full names and common aliases to ISO 2-letter codes. Multi-word country names (e.g. "south africa", "burkina faso") are tried before shorter partial names to prevent false matches.

Common aliases supported:

| Alias | Resolves to |
|---|---|
| `uk`, `britain`, `england` | `GB` |
| `usa`, `america` | `US` |
| `drc`, `democratic republic` | `CD` |
| `ivory`, `ivory coast` | `CI` |
| `burkina` | `BF` |

Adjective forms like "nigerian", "kenyan", "ghanaian" are also handled — if the query word starts with a known country name, it matches.

### How filters combine

All matched filters are combined with AND logic, the same as the main endpoint. A query like "young adult males from nigeria" would produce:

```
gender = male
AND min_age = 16
AND max_age = 24
AND age_group = adult
AND country_id = NG
```

---

## Limitations and edge cases

**What the parser does not handle:**

- **Negation** — "not from nigeria" or "non-adults" are not supported. The parser has no concept of exclusion.
- **OR logic** — "males or females" is not supported. All filters are AND-only.
- **Multiple countries** — "from nigeria or kenya" will only match the first country found.
- **Ambiguous gender phrases** — "male and female teenagers above 17" will not set a gender filter since both genders are mentioned. Only `age_group = teenager` and `min_age = 17` will be extracted.
- **Relative terms without numbers** — "older people" or "very young" do not map to any filter. Age comparisons require an explicit number (e.g. "above 30").
- **Typos and misspellings** — "niegria" or "fmale" will not match. There is no fuzzy matching.
- **Country adjectives beyond the lookup table** — "congolese" or "ivorian" are not in the alias table and will not match their respective countries.
- **Compound queries with conflicting filters** — "adults above 60" will set both `age_group = adult` and `min_age = 60`. The database query will honour both, which may return fewer or zero results since adults are defined as 20–59.
- **Non-English input** — the parser only understands English keywords.

---

## Database

SQLite via `better-sqlite3`. The `profiles` table is indexed on `gender`, `age`, `age_group`, and `country_id` to avoid full-table scans on common filter combinations.

## Running locally

```bash
npm install
npm run seed      
npm run dev       
```

Server runs on `http://localhost:3000` by default.
