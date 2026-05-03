# Database schema (Option B)

Five tables, **20 columns each** (including `id`, `created_at`, `updated_at`):

| Table | Purpose |
|--------|--------|
| **teams** | Realistic constructor rows (e.g. Oracle Red Bull Racing, Mercedes-AMG PETRONAS, Scuderia Ferrari) with chassis codes **RB20**, **W15**, **SF-24** |
| **seasons** | Year, regs, calendar counts, budget cap, champions, media, prize pool |
| **drivers** | Profile, career stats, contract, physicals, helmet, emergency contact → `team_id` |
| **races** | Grand prix event per season (circuit, timing, format flags, capacity) → `season_id` |
| **race_results** | Finishing data per driver per race → `race_id`, `driver_id` |

Load in MySQL:

```bash
mysql -u root -p < schema.sql
```

Set `DB_*` variables (see `.env.example`) before starting the API.

**Note:** Column names differ slightly from a minimal sketch (`color_hex`, `full_name`, `performance_index`, `f1_debut_year`) so the API layer can map to UI labels (`color`, `name`, `performance_score`, `start_year`) if needed.
