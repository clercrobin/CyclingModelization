# Quick Start Guide

Get up and running with the Cycling Rating System in 5 minutes!

## Installation

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Initialize with sample data (optional but recommended)
python scripts/init_sample_data.py

# 3. Run the application
streamlit run app.py
```

## First Steps

### Option A: Use Sample Data (Recommended for Testing)

If you ran `init_sample_data.py`, you already have:
- 15 professional riders
- 4 sample races with different characteristics
- Race results with calculated ratings

Navigate through the app:
1. **Rankings** - See top riders by dimension
2. **Rider Profile** - View detailed rider stats
3. **Analytics** - Explore system insights

### Option B: Start from Scratch

1. **Add Your First Rider**
   - Go to "Manage Data" → "Add Rider" tab
   - Fill in:
     - Name: "John Doe"
     - Team: "Pro Team"
     - Country: "USA"
   - Click "Add Rider"

2. **Add a Race**
   - Go to "Manage Data" → "Add Race" tab
   - Fill in race details:
     - Name: "Spring Classic"
     - Date: Select today's date
     - Category: "WT"
   - Set race characteristics (example for a flat sprint race):
     - Flat: 0.8
     - Sprint: 0.9
     - Endurance: 0.5
     - Others: 0.0
   - Click "Add Race"

3. **Add Race Results**
   - Go to "Manage Data" → "Add Results" tab
   - Select your race
   - Add results individually or use batch import:
     ```
     1,John Doe,14400,0
     ```
   - Click "Add Result"

4. **Update Ratings**
   - Go to "Manage Data" → "Update Ratings" tab
   - Select your race
   - Click "Update Ratings"
   - Ratings are now calculated!

5. **View Rankings**
   - Go to "Rankings" page
   - Select dimension to view (Overall, Flat, Mountain, etc.)
   - See your riders ranked!

## Understanding the System

### Race Characteristics

Think of weights as "How important is this skill for this race?":

- **Flat Race** (e.g., Tour de France Stage 1):
  - Flat: 0.8, Sprint: 0.9, Endurance: 0.6

- **Mountain Stage** (e.g., Alpine Stage):
  - Mountain: 1.0, GC: 0.8, Endurance: 0.7

- **Time Trial**:
  - Time Trial: 1.0, Flat: 0.5, GC: 0.3

- **Cobbled Classic** (e.g., Paris-Roubaix):
  - Cobbles: 1.0, Flat: 0.4, One Day: 1.0, Endurance: 0.8

### How Ratings Work

- New riders start at **1500**
- Winning important races → Rating increases
- Losing to lower-rated riders → Rating decreases
- Race category affects rating change magnitude:
  - Grand Tour win: Big change
  - Local race: Small change

### Tips

1. **Be consistent** with race characteristics - similar races should have similar weights
2. **Add multiple results** before drawing conclusions - ratings stabilize over time
3. **Use batch import** for faster data entry
4. **Explore Analytics** to see correlations and patterns

## Next Steps

- Read the full [README.md](README.md) for detailed information
- Customize rating parameters in `config/settings.py`
- Add real race data from Pro Cycling Stats
- Explore the code to understand the rating algorithm

## Common Issues

**Problem**: "No riders found"
- **Solution**: Add riders first in "Manage Data" → "Add Rider"

**Problem**: "Race has no characteristics defined"
- **Solution**: Ensure you set at least one characteristic weight > 0 when creating a race

**Problem**: Ratings don't update
- **Solution**: Make sure to click "Update Ratings" after adding results

**Problem**: Can't find the database
- **Solution**: It's created automatically in `data/cycling_ratings.db`

## Have Fun!

This system is designed to be flexible and fun to use. Experiment with different race characteristics and see how ratings evolve!

For more help, check out the full README or open an issue on GitHub.
