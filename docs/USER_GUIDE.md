# Cycling Rating System - User Guide

**Version 2.0.0** | **Last Updated: 2024-11-17**

Welcome to the Cycling Rating System! This guide will help you understand and use all features of the application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Rating System](#understanding-the-rating-system)
3. [Using the Web Interface](#using-the-web-interface)
4. [Managing Data](#managing-data)
5. [Daily Updates](#daily-updates)
6. [Analytics and Insights](#analytics-and-insights)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Getting Started

### First Launch

1. **Start the application:**
   ```bash
   streamlit run app.py
   ```

2. **Access the web interface:**
   - Open your browser to `http://localhost:8501`
   - The database will be automatically initialized on first run

3. **Load sample data (optional):**
   ```bash
   python scripts/init_sample_data.py
   ```
   This creates 15 professional riders and 4 sample races to explore the system.

### Navigation

The application has 6 main pages accessible from the sidebar:

- 🏠 **Home** - Overview and introduction
- 📊 **Rankings** - View rider rankings by dimension
- 👤 **Rider Profile** - Detailed rider analysis
- 📝 **Manage Data** - Add and edit riders, races, and results
- 📈 **Analytics** - System-wide performance insights
- 📥 **Import Data** - Bulk CSV import
- ⚙️ **System Monitor** - Health monitoring and manual updates

---

## Understanding the Rating System

### How Ratings Work

The system uses an **ELO-based rating algorithm** adapted for professional cycling. Each rider has ratings across 8 different dimensions.

### The 8 Dimensions

| Dimension | Description | Example Specialists |
|-----------|-------------|-------------------|
| **Flat** | Performance on flat terrain | Mark Cavendish, Jasper Philipsen |
| **Cobbles** | Performance on cobbled classics | Mathieu van der Poel, Wout van Aert |
| **Mountain** | Climbing ability | Tadej Pogačar, Jonas Vingegaard |
| **Time Trial** | Individual time trial ability | Filippo Ganna, Remco Evenepoel |
| **Sprint** | Sprint finish ability | Mark Cavendish, Dylan Groenewegen |
| **GC** | General classification (stage racing) | Tadej Pogačar, Primož Roglič |
| **One Day** | One-day race ability | Mathieu van der Poel, Julian Alaphilippe |
| **Endurance** | Multi-day race stamina | Jonas Vingegaard, Tadej Pogačar |

### Rating Scale

- **Range:** 1000 - 2500 points
- **Initial rating:** 1500 (new riders)
- **World-class:** 2200+
- **Professional level:** 1800-2200
- **Development level:** 1500-1800
- **Amateur level:** Below 1500

### Overall Rating

The **Overall** rating is a weighted average of all dimensions, giving you a single number to compare riders:

```
Overall = (Flat × 0.15 + Mountain × 0.20 + Sprint × 0.10 +
           Time Trial × 0.15 + GC × 0.20 + One Day × 0.10 +
           Endurance × 0.10)
```

### How Ratings Change

After each race:

1. **Expected performance** is calculated based on rider ratings
2. **Actual performance** is determined by finish position
3. **Rating changes** are calculated using the ELO formula
4. **Race characteristics** determine which dimensions are affected
5. **Race importance** multiplies the rating change:
   - Grand Tour: ×2.0
   - Monument: ×1.8
   - World Championship: ×1.7
   - World Tour: ×1.3
   - Pro Series: ×1.0

**Example:**
- A rider with 1800 mountain rating finishes 2nd in a mountain stage
- If they were expected to finish 5th, their mountain rating increases
- If they were expected to win, their rating might decrease slightly
- The rating change is larger in a Grand Tour vs. a smaller race

---

## Using the Web Interface

### Home Page

The home page provides:
- Quick statistics (total riders, races, results)
- Recent race activity
- Top riders across dimensions
- Getting started instructions

### Rankings Page 📊

**View and compare rider rankings:**

1. **Select dimension:**
   - Use dropdown to choose: Overall, Mountain, Sprint, etc.
   - Click "Show All Dimensions" to see all ratings at once

2. **Filter riders:**
   - Use the slider to select top N riders (default: 20)
   - Riders are sorted by the selected dimension

3. **View details:**
   - **Rating column:** Current rating in selected dimension
   - **Races:** Number of races completed
   - **Wins:** Number of race wins
   - **Podiums:** Number of podium finishes (1st-3rd)

4. **Visual charts:**
   - Bar chart shows rating comparison
   - Color-coded by rating level

**Use cases:**
- "Who are the best climbers?" → Select Mountain dimension
- "Who's the most complete rider?" → Select Overall dimension
- "Show me the top sprinters" → Select Sprint dimension

### Rider Profile Page 👤

**Analyze individual rider performance:**

1. **Select a rider:**
   - Use dropdown to choose from all riders in database
   - Riders are sorted alphabetically

2. **Rating Overview:**
   - **Radar chart:** Visual representation of all 8 dimensions
   - **Statistics cards:** Overall rating, races, wins, podiums
   - **Team and country information**

3. **Rating History:**
   - **Line graph:** Shows rating changes over time
   - **Dimension selector:** Choose which rating to track
   - **Interactive:** Hover to see exact values and dates

4. **Recent Results:**
   - **Table:** Last 10 race results
   - **Columns:** Date, Race, Position, Category
   - **Sorted:** Most recent first

**Use cases:**
- "How has Pogačar's mountain rating changed this season?"
- "What races has Van Aert won recently?"
- "Compare a rider's strengths and weaknesses"

### Manage Data Page 📝

**Add and edit data manually:**

#### Add a New Rider

1. Navigate to "Add Rider" section
2. Fill in the form:
   - **Name** (required): Full rider name
   - **Country** (optional): ISO country code (e.g., "SVN")
   - **Team** (optional): Current team name
   - **PCS ID** (optional): Pro Cycling Stats ID for future updates
3. Click "Add Rider"
4. Rider is created with initial ratings of 1500 in all dimensions

#### Add a New Race

1. Navigate to "Add Race" section
2. Fill in basic information:
   - **Name** (required): Race name (e.g., "Paris-Roubaix 2024")
   - **Date** (required): Race date
   - **Category** (required): GT, Monument, WC, WT, ProSeries, or Others
   - **Distance** (optional): Race distance in km
   - **Elevation** (optional): Total elevation gain in meters

3. **Choose race characteristics:**

   **Option A: Use a template**
   - Select from 17 predefined race templates:
     - Paris-Roubaix (Cobbles: 1.0)
     - Milano-Sanremo (Flat: 0.7, Sprint: 0.8)
     - Tour of Flanders (Cobbles: 0.8, Mountain: 0.4)
     - Liège-Bastogne-Liège (Mountain: 0.7)
     - Mountain Stage (Mountain: 1.0, GC: 1.0)
     - Flat Stage (Flat: 0.8, Sprint: 1.0)
     - Time Trial (TT: 1.0)
     - And more...

   **Option B: Custom weights**
   - Select "Custom (Manual)"
   - Set each dimension weight from 0.0 to 1.0:
     - **0.0** = Not relevant to this race
     - **0.5** = Moderately important
     - **1.0** = Critically important

   **Examples:**
   - Pure mountain stage: Mountain=1.0, GC=1.0, Endurance=0.9, others=0.0
   - Sprint stage: Flat=0.8, Sprint=1.0, Endurance=0.3, others=0.0
   - Hilly classic: Mountain=0.6, One Day=1.0, Endurance=0.8

4. Click "Add Race"
5. Race is created and ready for results

#### Add Race Results

1. Navigate to "Add Race Results" section
2. Select the race from dropdown
3. For each result, enter:
   - **Rider** (required): Select from dropdown
   - **Position** (required): Finishing position (1, 2, 3, ...)
   - **Time** (optional): Finish time or time gap
   - **DNF/DNS** (optional): Check if rider did not finish/start

4. Click "Add Result"
5. Repeat for all finishers
6. Click "Update Ratings for This Race" to recalculate all ratings

**Batch entry tips:**
- Add all results before updating ratings (more efficient)
- Top finishers are most important (top 20 minimum recommended)
- DNF riders can be added with position = 999

### Import Data Page 📥

**Bulk import via CSV files:**

#### Import Riders

1. Navigate to "Import Riders" tab
2. **Download the template:**
   - Click "Download Riders CSV Template"
   - Opens template with columns: name, country, team, pcs_id

3. **Fill in your data:**
   ```csv
   name,country,team,pcs_id
   Tadej Pogačar,SVN,UAE Team Emirates,tadej-pogacar
   Jonas Vingegaard,DEN,Visma-Lease a Bike,jonas-vingegaard
   Primož Roglič,SVN,Red Bull-BORA-hansgrohe,primoz-roglic
   ```

4. **Upload the file:**
   - Click "Choose a file" and select your CSV
   - System validates the data
   - Preview shows what will be imported

5. **Review and import:**
   - Check for errors or warnings
   - Click "Import" to add riders
   - Confirmation shows number of riders added

#### Import Races

1. Navigate to "Import Races" tab
2. **Download the template:**
   - Click "Download Races CSV Template"
   - Columns: name, date, category, distance_km, elevation_m, template, or custom characteristics

3. **Fill in your data:**
   ```csv
   name,date,category,distance_km,elevation_m,template
   Tour de France Stage 1,2024-06-29,GT,206,3600,mountain_stage
   Gent-Wevelgem 2024,2024-03-24,WT,256,350,flat_classic
   ```

4. **Using templates:**
   - **template column:** Use template name (e.g., "paris_roubaix")
   - **OR custom weights:** Add columns for each dimension

   ```csv
   name,date,category,flat_weight,mountain_weight,sprint_weight,...
   Custom Race,2024-07-15,WT,0.6,0.4,0.8,...
   ```

5. **Upload and import:**
   - Select file and click upload
   - Preview and verify
   - Import races

#### Import Results

1. Navigate to "Import Results" tab
2. **Download the template:**
   - Columns: race_name, rider_name, position, time_gap, dnf

3. **Fill in your data:**
   ```csv
   race_name,rider_name,position,time_gap,dnf
   Tour de France Stage 1,Tadej Pogačar,1,0:00:00,False
   Tour de France Stage 1,Jonas Vingegaard,2,0:00:04,False
   Tour de France Stage 1,Primož Roglič,3,0:00:12,False
   ```

4. **Upload and import:**
   - Results are linked to existing races and riders
   - Riders not found will be created automatically
   - Races must exist before importing results

5. **Update ratings:**
   - After import, go to Manage Data page
   - Click "Update Ratings for This Race" for each race

**Import tips:**
- Import riders first, then races, then results
- Use templates for common race types
- Keep CSV files clean (no extra columns, consistent formatting)
- Check for typos in rider/race names (exact match required)

### Analytics Page 📈

**Explore system-wide insights:**

#### Rating Distribution

- **Histogram:** Shows distribution of ratings across all riders
- **Dimension selector:** Choose which rating to analyze
- **Use case:** "Are most riders clustered around 1500, or is there a wide spread?"

#### Correlation Analysis

- **Heatmap:** Shows correlations between different dimensions
- **Interpretation:**
  - **Positive correlation (green):** Riders good at one tend to be good at the other
  - **Negative correlation (red):** Inverse relationship
  - **Example:** Mountain and GC often have high positive correlation

#### Top Specialists

- **Radar charts:** Compare top riders in each dimension
- **Dimension tabs:** Select Mountain, Sprint, TT, etc.
- **Use case:** "Who are the pure specialists vs. all-rounders?"

#### Performance Insights

- **Statistics:** Average ratings, standard deviations
- **Trends:** Rating changes over time
- **Comparisons:** Team performance, country performance

### System Monitor Page ⚙️

**Monitor system health and run updates:**

#### System Health Dashboard

Real-time metrics:
- **Total Riders:** Count of all riders in database
- **Total Races:** Count of all races
- **Total Results:** Count of all race results
- **Active Riders:** Riders who have competed in at least one race

#### Recent Activity

- **Recent Races table:** Last 10 races with dates and result counts
- **Most Active Riders:** Riders with most races in last 30 days

#### Manual Updates

**Single Day Update:**

1. Select a date using the date picker
2. Click "Run Update"
3. System will:
   - Fetch races from Pro Cycling Stats for that date
   - Download race details and results
   - Automatically infer race characteristics
   - Create any new riders found
   - Add all results to database
   - Update all rider ratings
4. View summary: races processed, riders added, results added

**Historical Update:**

1. Select start date
2. Choose number of days (1-30 recommended)
3. Click "Run Historical Update"
4. **Warning:** This can take a long time (1-2 minutes per day)
5. Progress bar shows current status
6. View daily breakdown after completion

**When to use manual updates:**
- You want to add a specific historical date
- Automated updates failed for a date
- You're catching up after installing the system
- Testing the scraper functionality

---

## Daily Updates

### Understanding Automatic Updates

The system can automatically fetch race results from Pro Cycling Stats every day and update rider ratings. This is the **core feature** for keeping the system current.

### How It Works

Every day at 2:00 AM (by default):

1. **Discover races:** System checks Pro Cycling Stats calendar for races
2. **Fetch details:** Downloads race information, results, elevation, distance
3. **Infer characteristics:** Automatically determines race type and weights
4. **Process results:** Adds results to database, creates new riders if needed
5. **Update ratings:** Recalculates all affected rider ratings
6. **Log results:** Records what was processed and any errors

### Race Characteristic Inference

The system intelligently determines race characteristics:

**Known race templates:**
- Paris-Roubaix → Automatically set as cobbles=1.0
- Milano-Sanremo → Flat=0.7, Sprint=0.8
- Tour de France mountain stages → Mountain=1.0, GC=1.0

**Automatic inference from data:**
- **High elevation (>3000m):** Mountain=1.0, GC=1.0, Endurance=0.9
- **Flat profile + "sprint" in name:** Flat=0.8, Sprint=1.0
- **"ITT" or "time trial" in name:** Time Trial=1.0
- **Long distance (>250km):** Endurance weight increased
- **Grand Tour category:** GC weight increased

**Example:**
```
Race: "Tour de France 2024 - Stage 15"
Distance: 180km
Elevation: 4500m
Profile: Mountain

→ System infers:
  - Mountain: 1.0 (high elevation)
  - GC: 1.0 (Grand Tour stage)
  - Endurance: 0.9 (significant distance + elevation)
  - Flat: 0.1 (some flat sections)
  - Others: 0.0
```

### Setting Up Automated Updates

See the [Daily Updates Guide](../DAILY_UPDATES.md) for complete setup instructions.

**Quick setup (Linux/Mac):**
```bash
bash scripts/schedule_daily_updates.sh install
```

**Manual run:**
```bash
python scripts/run_daily_update.py
```

### Monitoring Updates

**Check logs:**
- `logs/daily_update.log` - Detailed update logs
- `logs/cron.log` - Cron execution logs (Linux/Mac)

**System Monitor page:**
- View recent races added
- Check system health metrics
- See active riders count

**What to monitor:**
- New races being added daily
- Rating changes seem reasonable
- No repeated errors in logs
- Rider count growing as new races add new riders

---

## Analytics and Insights

### Understanding Your Data

#### Rating Trends

**Question:** "How has the average mountain rating changed over the season?"

**Analysis:**
1. Go to Analytics page
2. View Rating Distribution for Mountain dimension
3. Note the average rating shown
4. Repeat monthly to track trends

#### Specialist Identification

**Question:** "Who are the pure climbers (high mountain, low sprint)?"

**Analysis:**
1. Go to Rankings page
2. Sort by Mountain rating (top 20)
3. For each rider, check their Rider Profile
4. Look at radar chart - specialists will have unbalanced profiles

#### Team Performance

**Question:** "Which team has the strongest time trialists?"

**Analysis:**
1. Export rider data or view in Rankings
2. Filter by Team
3. Sort by Time Trial dimension
4. Compare average TT ratings across teams

#### Race Difficulty

**Question:** "What are the characteristics of Monument races in the database?"

**Analysis:**
1. Go to Manage Data page
2. View races with Category = "Monument"
3. Note the characteristic weights
4. Typical Monuments have high one_day_weight and high specific terrain weight

### Exporting Data

Currently, data can be viewed in the web interface. For analysis in Excel or Python:

**Option 1: Database access**
```python
from src.models import SessionLocal, Rider, RiderRating
db = SessionLocal()
riders = db.query(Rider).all()
# Process as needed
```

**Option 2: Screenshots**
- Use browser screenshot tools for charts and tables
- Copy table data for pasting into spreadsheets

---

## Troubleshooting

### Application Won't Start

**Error:** `ModuleNotFoundError: No module named 'streamlit'`

**Solution:**
```bash
pip install -r requirements.txt
```

---

**Error:** `sqlite3.OperationalError: unable to open database file`

**Solution:**
1. Check that `data/` directory exists
2. Create it: `mkdir -p data`
3. Check file permissions

---

### No Riders or Races Showing

**Problem:** Application loads but shows zero riders/races

**Solution:**
1. Load sample data: `python scripts/init_sample_data.py`
2. Or manually add riders via Manage Data page
3. Or import via CSV on Import Data page

---

### Ratings Not Updating

**Problem:** Added race results but ratings didn't change

**Solution:**
1. Make sure race has characteristics defined (not all zeros)
2. Make sure results include positions (not just DNF)
3. Click "Update Ratings for This Race" button in Manage Data page
4. Check that at least 2 riders finished the race

---

### Daily Update Errors

**Problem:** Manual update shows errors

**Common errors:**

**"No races found for date"**
- Pro Cycling Stats has no races scheduled for that date
- Try a different date during the racing season (March-October)

**"Failed to fetch race details"**
- Network error or Pro Cycling Stats is down
- Try again later
- Check internet connection

**"Could not infer characteristics"**
- Race page format doesn't match expected structure
- Manually add race with custom characteristics
- Report issue with race URL

**"Duplicate race"**
- Race already exists in database
- System skips duplicate automatically
- Check race list in Manage Data page

---

### Performance Issues

**Problem:** Application is slow to load

**Solutions:**
- Close unused browser tabs
- Clear browser cache
- Restart Streamlit: Stop (Ctrl+C) and restart
- Check database size: Large databases (>100k results) may need optimization

---

### CSV Import Errors

**Problem:** CSV import fails with validation errors

**Common issues:**

**"Rider not found"**
- Import riders CSV first before results
- Check exact spelling of rider names
- Names are case-sensitive

**"Race not found"**
- Import races CSV before results
- Check exact spelling of race names
- Names are case-sensitive

**"Invalid date format"**
- Use format: YYYY-MM-DD (e.g., 2024-07-14)
- No slashes or other separators

**"Invalid category"**
- Must be one of: GT, Monument, WC, WT, ProSeries, Others
- Exact capitalization required

---

### Web Scraping Issues

**Problem:** Scraper blocked or rate limited

**Solutions:**
- Increase rate limit delay in settings
- Wait 1 hour before retrying
- Use manual data entry as backup
- Contact Pro Cycling Stats if persistent

---

## FAQ

### General Questions

**Q: How often should I run updates?**

A: Daily automated updates are recommended. Set up cron/Task Scheduler to run at 2:00 AM automatically.

---

**Q: Can I use this for amateur racing?**

A: Yes! The system works for any cycling races. Just add your own riders and races manually or via CSV import.

---

**Q: How accurate are the ratings?**

A: Accuracy improves with more race data. With 50+ races and diverse race types, ratings become quite reliable. Initial ratings (1500) may not be accurate until a rider has competed in 5-10 races.

---

**Q: Can multiple users access the system?**

A: Currently, this is a single-user local application. For multi-user access, deploy to a cloud server (see Developer Guide).

---

**Q: Can I change the rating scale?**

A: Yes, but it requires modifying the source code. See Developer Guide for configuration options.

---

### Data Questions

**Q: What happens if I add a duplicate rider?**

A: The system checks for existing riders by exact name match. If found, it reuses the existing rider instead of creating a duplicate.

---

**Q: Can I delete races or riders?**

A: Currently, deletion is not supported in the UI. You can delete directly from the database file or edit the source code to add deletion features.

---

**Q: How do I fix a wrong race characteristic?**

A: Currently, you need to manually update in the database. Future versions will support editing. For now, you can:
1. Delete the race from the database (using a DB tool)
2. Re-add it with correct characteristics
3. Re-import results
4. Update ratings

---

**Q: Can I import data from other sources besides Pro Cycling Stats?**

A: Yes! Use the CSV import feature. As long as you have race names, dates, and results in CSV format, you can import from any source.

---

### Rating Questions

**Q: Why did a rider's rating go down after winning?**

A: If the rider was heavily favored to win (much higher rating than competitors), winning might only slightly increase or even slightly decrease the rating. ELO rewards unexpected performance.

---

**Q: What's a "good" overall rating?**

A:
- **2200+** - World-class (e.g., Pogačar, Vingegaard)
- **1900-2200** - Top professional
- **1700-1900** - Professional level
- **1500-1700** - Development/neo-pro
- **<1500** - Amateur or new riders

---

**Q: Why are some dimensions correlated?**

A: Real-world cycling abilities overlap. For example:
- Mountain climbers often good at GC (multi-day racing)
- Sprinters often good on flat terrain
- Time trialists often good on flat terrain
- One-day specialists often good at endurance

---

**Q: Can I manually adjust a rider's rating?**

A: Not recommended. Ratings should be data-driven. If you must, you can edit the database directly, but this defeats the purpose of the system.

---

### Technical Questions

**Q: Where is the data stored?**

A: In a SQLite database file at `data/cycling_ratings.db`. This is a single file containing all riders, races, and results.

---

**Q: Can I backup my data?**

A: Yes! Copy the entire `data/` directory. Recommendation:
```bash
cp -r data/ data_backup_$(date +%Y%m%d)/
```

---

**Q: Can I migrate to PostgreSQL?**

A: Yes! Update the `DATABASE_URL` in your `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost/cycling_ratings
```

---

**Q: Can I run this on a server?**

A: Yes! Deploy Streamlit to cloud platforms like Heroku, AWS, or DigitalOcean. See Developer Guide for deployment instructions.

---

**Q: How do I update the application?**

A:
1. Pull latest code from repository
2. Update dependencies: `pip install -r requirements.txt --upgrade`
3. Run database migrations if any (see Developer Guide)
4. Restart application

---

## Getting Help

### Resources

1. **Documentation:**
   - [README.md](../README.md) - Project overview
   - [QUICKSTART.md](../QUICKSTART.md) - Quick start guide
   - [DAILY_UPDATES.md](../DAILY_UPDATES.md) - Daily update setup
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
   - [API_REFERENCE.md](API_REFERENCE.md) - Developer API docs
   - [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Development guide

2. **Logs:**
   - `logs/daily_update.log` - Update process logs
   - `logs/cron.log` - Scheduled task logs

3. **Testing:**
   - Run system tests: `python scripts/test_system.py`
   - Run full test suite: `pytest tests/ -v`

### Support

For issues or questions:
1. Check this User Guide
2. Check troubleshooting section
3. Review logs for error messages
4. Run system tests to verify installation
5. Check GitHub issues for similar problems
6. Open a new issue with details

---

## Best Practices

### For Accurate Ratings

1. **Add diverse race types:** Don't only add mountain stages or only sprints
2. **Add complete results:** Top 20 minimum, full results preferred
3. **Update regularly:** Daily updates keep ratings current
4. **Verify characteristics:** Check that race characteristics match reality
5. **Wait for convergence:** New riders need 5-10 races for accurate ratings

### For System Health

1. **Backup regularly:** Copy `data/` directory weekly
2. **Monitor logs:** Check for repeated errors
3. **Verify updates:** After automated updates, spot-check new races
4. **Keep software updated:** Update dependencies monthly
5. **Test before big imports:** Try small CSV imports first

### For Performance

1. **Limit historical updates:** Max 30 days at a time
2. **Close unused tabs:** Keep only one Streamlit session open
3. **Restart periodically:** Restart Streamlit weekly
4. **Clean old logs:** Archive logs older than 90 days

---

**Thank you for using the Cycling Rating System!**

For feature requests or bug reports, please open an issue on GitHub.

Happy racing! 🚴‍♂️
