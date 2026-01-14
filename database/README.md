# IGY6 Rooted Database

PostgreSQL database schema for production deployment.

## Files

| File | Description |
|------|-------------|
| `schema.sql` | Complete database schema with all tables, indexes, and constraints |
| `functions.sql` | Database functions and triggers |
| `seed.sql` | Initial seed data for production |

## Setup Instructions

### 1. Create Database

```bash
createdb igy6_rooted
```

### 2. Run Schema

```bash
psql -d igy6_rooted -f schema.sql
```

### 3. Run Functions

```bash
psql -d igy6_rooted -f functions.sql
```

### 4. Seed Data (Optional)

```bash
psql -d igy6_rooted -f seed.sql
```

## Environment Variables

For the backend to connect, set:

```env
DATABASE_URL=postgresql://user:password@host:5432/igy6_rooted
```

## Notes

- Schema is compatible with PostgreSQL 14+
- UUIDs are used for all primary keys
- JSONB is used for flexible data storage
- All timestamps use TIMESTAMPTZ (timezone-aware)
- Indexes are included for common query patterns
