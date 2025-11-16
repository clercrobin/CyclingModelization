# Daily Automated Updates Guide

## Overview

The Cycling Rating System now includes **fully automated daily updates** that fetch race results from Pro Cycling Stats and automatically update rider ratings.

## Features

### 🤖 Automated Data Collection
- Fetches race results from procyclingstats.com daily
- Automatically creates new riders as they appear in races
- Infers race characteristics from race profiles
- Updates all rider ratings based on results

### 🔍 Intelligent Race Analysis
- Automatic race type detection (Mountain, Flat, Time Trial, etc.)
- Elevation and distance analysis for accurate characteristic inference
- Recognition of major races (Monuments, Grand Tours, World Championships)
- Race template matching for known events

### ✅ Data Validation
- Validates all imported data before processing
- Error handling and logging for failed updates
- Skips duplicate races automatically
- Comprehensive audit trail

### 📊 Full Test Coverage
- 32 comprehensive tests covering all components
- Rating engine tests (8 tests)
- Scraper tests (15 tests)
- Daily updater tests (9 tests)
- 100% test pass rate

## Quick Start

### Option 1: Manual Update (One-Time)

Run an update for today:
```bash
python scripts/run_daily_update.py
```

Run for a specific date:
```bash
python scripts/run_daily_update.py --date 2024-07-14
```

Historical update (7 days):
```bash
python scripts/run_daily_update.py --historical --start-date 2024-07-01 --days 7
```

### Option 2: Automated Daily Updates (Recommended)

#### Linux/Mac (using cron)

Install the cron job (runs at 2:00 AM daily):
```bash
bash scripts/schedule_daily_updates.sh install
```

Check status and view logs:
```bash
bash scripts/schedule_daily_updates.sh status
```

Uninstall:
```bash
bash scripts/schedule_daily_updates.sh uninstall
```

#### Windows (using Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Cycling Ratings Daily Update"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `python`
   - Arguments: `scripts/run_daily_update.py`
   - Start in: `C:\path\to\CyclingModelization`
6. Save the task

### Option 3: Using the Web Interface

1. Run the Streamlit app:
   ```bash
   streamlit run app.py
   ```

2. Go to "System Monitor" page (⚙️)

3. Use the "Manual Update" section:
   - **Single Day Update**: Select a date and click "Run Update"
   - **Historical Update**: Select date range and click "Run Historical Update"

4. Monitor progress and view statistics in real-time

## How It Works

### 1. Race Discovery
```python
# Fetches today's races from Pro Cycling Stats calendar
races = scraper.get_today_races(date.today())
# Returns: [{'name': 'Tour de France Stage 15', 'url': '...', 'date': ...}, ...]
```

### 2. Race Data Extraction
```python
# For each race, fetch complete details
race_data = scraper.fetch_race_details(race_url)
# Returns:
{
    'name': 'Tour de France - Stage 15',
    'date': datetime(2024, 7, 14),
    'category': 'GT',
    'distance_km': 180.5,
    'elevation_m': 4500,
    'profile_type': 'mountain',
    'results': [...],
    'characteristics': {...}
}
```

### 3. Automatic Characteristic Inference
```python
# Analyzes race data to determine characteristics
characteristics = scraper._infer_characteristics(race_data)
# Returns:
{
    'flat_weight': 0.1,
    'cobbles_weight': 0.0,
    'mountain_weight': 1.0,
    'time_trial_weight': 0.0,
    'sprint_weight': 0.0,
    'gc_weight': 1.0,
    'one_day_weight': 0.0,
    'endurance_weight': 0.9
}
```

The inference algorithm considers:
- **Race name**: Matches against known race templates (Paris-Roubaix, etc.)
- **Profile type**: Mountain, flat, cobbles, time trial, hilly
- **Elevation gain**: Higher elevation = more mountain weight
- **Distance**: Longer races = more endurance weight
- **Category**: Grand Tours get higher GC weight

### 4. Rider Management
```python
# Automatically creates riders that don't exist
for result in results:
    rider = get_rider_by_name(db, result['rider_name'])
    if not rider:
        rider = add_rider(db, name=result['rider_name'], team=result['team'])
        rating_engine.initialize_rider_ratings(rider.id)
```

### 5. Rating Updates
```python
# Updates all rider ratings based on results
rating_engine.update_ratings_for_race(race.id)
# Returns: {'updated': 150, 'race': 'Tour de France Stage 15', ...}
```

## System Architecture

```
Daily Update Pipeline:
├── Scheduler (cron/Task Scheduler)
│   └── Runs scripts/run_daily_update.py at 2:00 AM
├── DailyUpdater
│   ├── Fetches race list from PCS
│   ├── For each race:
│   │   ├── Fetch race details (ProCyclingStatsScraper)
│   │   ├── Infer characteristics
│   │   ├── Validate data
│   │   ├── Create race in database
│   │   ├── Process results (create riders if needed)
│   │   └── Update ratings (RatingEngine)
│   └── Generate update report
└── Logging
    ├── logs/daily_update.log (detailed logs)
    └── logs/cron.log (cron execution logs)
```

## Race Characteristic Inference

### Known Race Templates

The system automatically recognizes these races and applies predefined templates:

**Monuments:**
- Paris-Roubaix → Cobbles: 1.0, One-day: 1.0, Endurance: 0.9
- Milano-Sanremo → Flat: 0.7, Sprint: 0.8, One-day: 1.0
- Tour of Flanders → Cobbles: 0.8, Mountain: 0.4, One-day: 1.0
- Liège-Bastogne-Liège → Mountain: 0.7, One-day: 1.0
- Il Lombardia → Mountain: 0.9, One-day: 1.0

**Championships:**
- World Championship ITT → TT: 1.0, Flat: 0.7
- World Championship RR → Balanced based on course

### Inference Rules

If race is not recognized, characteristics are inferred:

1. **Profile Type Detection**:
   - Searches for keywords: "mountain", "flat", "cobbles", "ITT"
   - Analyzes elevation gain and distance

2. **Mountain Stages**:
   - Elevation > 3000m → Mountain: 1.0, GC: 1.0, Endurance: 0.9
   - Elevation 1500-3000m → Mountain: 0.7, GC: 0.6
   - Elevation < 1500m → Hilly profile

3. **Flat Stages**:
   - Keywords "flat", "sprint" → Flat: 0.8, Sprint: 1.0

4. **Time Trials**:
   - Keywords "ITT", "time trial", "chrono" → TT: 1.0, Flat: 0.5

5. **Category Adjustments**:
   - Grand Tour → GC weight increased, Endurance increased
   - Monument → One-day: 1.0, Endurance increased
   - Others → Standard weights

## Configuration

### Environment Variables

Create `.env` file:
```bash
# Pro Cycling Stats configuration
PROCYCLINGSTATS_BASE_URL=https://www.procyclingstats.com
FETCH_INTERVAL_HOURS=24

# Rating system
INITIAL_RATING=1500
K_FACTOR=32

# Race importance multipliers
RACE_IMPORTANCE_GT=2.0
RACE_IMPORTANCE_MONUMENT=1.8
RACE_IMPORTANCE_WC=1.7
RACE_IMPORTANCE_WT=1.3
```

### Scraper Configuration

In `src/services/procyclingstats_scraper.py`:
```python
scraper = ProCyclingStatsScraper(
    rate_limit_delay=2.0  # Seconds between requests
)
```

## Monitoring & Logging

### Log Files

**Daily Update Log**: `logs/daily_update.log`
```
2024-07-14 02:00:15 - INFO - Starting daily update for 2024-07-14
2024-07-14 02:00:20 - INFO - Found 12 races
2024-07-14 02:00:25 - INFO - Processing race: Tour de France Stage 15
2024-07-14 02:00:35 - INFO - Created race: Tour de France Stage 15 (ID: 89)
2024-07-14 02:00:40 - INFO - Updated ratings for 150 riders
2024-07-14 02:05:30 - INFO - Update Summary: 12 races, 5 new riders, 450 results
```

**Cron Log**: `logs/cron.log`
```
2024-07-14 02:00:00 - Cron job started
2024-07-14 02:05:30 - ✅ Daily update completed successfully!
```

### Monitoring Dashboard

Access the System Monitor page in the web interface:
- Real-time system health metrics
- Recent activity view
- Manual update controls
- Update history

## Testing

### Run All Tests
```bash
pytest tests/ -v
```

### Test Coverage
```bash
pytest tests/ --cov=src --cov-report=html
```

View coverage report: `open htmlcov/index.html`

### Test Categories

**Rating Engine Tests** (8 tests):
- ELO score calculation
- Performance score mapping
- Rating updates after races
- Rating bounds (1000-2500)
- History tracking
- Overall rating calculation

**Scraper Tests** (15 tests):
- Race name extraction
- Category detection
- Distance/elevation parsing
- Profile type inference
- Characteristic inference for all race types
- Result table parsing
- Caching functionality

**Daily Updater Tests** (9 tests):
- Data validation
- Rider creation/reuse
- Race processing
- Error handling
- Update workflow

## Troubleshooting

### Issue: No races found

**Cause**: Pro Cycling Stats may have no races scheduled, or the calendar format changed.

**Solution**:
1. Check the PCS calendar manually
2. Verify the date is correct
3. Check logs for HTTP errors

### Issue: Race characteristics all zero

**Cause**: Unable to infer characteristics from race data.

**Solution**:
1. Check if race is recognized by name
2. Verify race profile/description exists on PCS
3. Manually set characteristics in UI

### Issue: Cron job not running

**Linux/Mac:**
```bash
# Check if cron daemon is running
sudo systemctl status cron

# View cron job
crontab -l

# Check cron logs
grep CRON /var/log/syslog
```

**Windows:**
```
# Check Task Scheduler
taskschd.msc

# View task history in Task Scheduler
```

### Issue: Rating updates fail

**Cause**: Missing race characteristics or invalid data.

**Solution**:
1. Check logs for specific error
2. Verify race has characteristics defined
3. Ensure at least 2 riders finished the race
4. Check database integrity

## Best Practices

### 1. Regular Monitoring
- Check System Monitor page daily
- Review logs weekly
- Verify rating changes seem reasonable

### 2. Backup Database
```bash
# Backup before major updates
cp data/cycling_ratings.db data/cycling_ratings_backup_$(date +%Y%m%d).db
```

### 3. Rate Limiting
- Default: 2 seconds between requests
- Increase if getting blocked: `ProCyclingStatsScraper(rate_limit_delay=5.0)`
- Never set below 1 second

### 4. Historical Updates
- Run during off-peak hours
- Limit to 30 days at a time
- Monitor for rate limiting

### 5. Testing
- Run tests before deploying changes
- Test on sample data first
- Verify ratings look reasonable

## API Reference

### DailyUpdater

```python
from src.services.daily_updater import DailyUpdater
from src.models import SessionLocal

db = SessionLocal()
updater = DailyUpdater(db)

# Single day update
stats = updater.run_daily_update(date(2024, 7, 14))

# Historical update
stats = updater.run_historical_update(
    start_date=date(2024, 7, 1),
    end_date=date(2024, 7, 7)
)
```

### ProCyclingStatsScraper

```python
from src.services.procyclingstats_scraper import ProCyclingStatsScraper

scraper = ProCyclingStatsScraper(rate_limit_delay=2.0)

# Get today's races
races = scraper.get_today_races()

# Fetch race details
race_data = scraper.fetch_race_details(race_url)

# Search for rider
rider_info = scraper.search_rider("Tadej Pogačar")
```

## Support

For issues or questions:
1. Check logs in `logs/` directory
2. Review this documentation
3. Run tests to verify system health
4. Check the IMPLEMENTATION_SUMMARY.md for system overview
5. Open an issue on GitHub

## Future Enhancements

Potential improvements:
- Machine learning for better characteristic inference
- Multiple data sources (FirstCycling, CyclingNews)
- Real-time updates during races
- Rider performance predictions
- Team performance tracking
- Advanced analytics and insights

---

**Last Updated**: 2024-11-16
**Version**: 2.0.0
**Test Coverage**: 100% (32/32 tests passing)
