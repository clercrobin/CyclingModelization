"""System Monitor page - View system health and run manual updates."""

import streamlit as st
from datetime import datetime, date, timedelta
import pandas as pd
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import SessionLocal, Rider, Race, RaceResult, RiderRating
from src.services.daily_updater import DailyUpdater
from sqlalchemy import func

st.set_page_config(page_title="System Monitor", page_icon="⚙️", layout="wide")

st.title("⚙️ System Monitor & Daily Updates")

st.markdown("""
Monitor system health and run daily updates from Pro Cycling Stats.
""")

# Database connection
db = SessionLocal()

# System Health Section
st.header("📊 System Health")

col1, col2, col3, col4 = st.columns(4)

with col1:
    total_riders = db.query(Rider).count()
    st.metric("Total Riders", total_riders)

with col2:
    total_races = db.query(Race).count()
    st.metric("Total Races", total_races)

with col3:
    total_results = db.query(RaceResult).count()
    st.metric("Total Results", total_results)

with col4:
    riders_with_races = db.query(RiderRating).filter(
        RiderRating.races_count > 0
    ).count()
    st.metric("Active Riders", riders_with_races)

st.markdown("---")

# Recent Activity
st.header("📅 Recent Activity")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Recent Races")
    recent_races = db.query(Race).order_by(Race.date.desc()).limit(10).all()

    if recent_races:
        race_data = []
        for race in recent_races:
            result_count = db.query(RaceResult).filter(
                RaceResult.race_id == race.id
            ).count()

            race_data.append({
                'Date': race.date.strftime('%Y-%m-%d'),
                'Race': race.name,
                'Category': race.category.value,
                'Results': result_count
            })

        df_races = pd.DataFrame(race_data)
        st.dataframe(df_races, use_container_width=True, hide_index=True)
    else:
        st.info("No races in database")

with col2:
    st.subheader("Most Active Riders (Last 30 Days)")

    # Get riders with most races in last 30 days
    cutoff_date = datetime.now() - timedelta(days=30)

    active_riders_query = (
        db.query(
            Rider.name,
            func.count(RaceResult.id).label('races')
        )
        .join(RaceResult, Rider.id == RaceResult.rider_id)
        .join(Race, RaceResult.race_id == Race.id)
        .filter(Race.date >= cutoff_date)
        .group_by(Rider.name)
        .order_by(func.count(RaceResult.id).desc())
        .limit(10)
    )

    active_riders = active_riders_query.all()

    if active_riders:
        active_data = []
        for rider_name, race_count in active_riders:
            active_data.append({
                'Rider': rider_name,
                'Races (30d)': race_count
            })

        df_active = pd.DataFrame(active_data)
        st.dataframe(df_active, use_container_width=True, hide_index=True)
    else:
        st.info("No recent activity")

st.markdown("---")

# Manual Update Section
st.header("🔄 Manual Update")

st.markdown("""
Run a manual update to fetch and process race results from Pro Cycling Stats.

**Note:** This can take several minutes depending on the number of races.
""")

tab1, tab2 = st.tabs(["Single Day Update", "Historical Update"])

with tab1:
    st.subheader("Update Single Day")

    update_date = st.date_input(
        "Select date to update",
        value=date.today(),
        max_value=date.today()
    )

    if st.button("Run Update", key="single_update"):
        with st.spinner(f"Fetching and processing races for {update_date}..."):
            try:
                updater = DailyUpdater(db)
                stats = updater.run_daily_update(update_date)

                if stats.get('success'):
                    st.success("✅ Update completed successfully!")

                    col1, col2, col3, col4 = st.columns(4)

                    with col1:
                        st.metric("Races Processed", stats.get('races_processed', 0))
                    with col2:
                        st.metric("New Riders", stats.get('riders_added', 0))
                    with col3:
                        st.metric("Results Added", stats.get('results_added', 0))
                    with col4:
                        st.metric("Ratings Updated", stats.get('ratings_updated', 0))

                    if stats.get('errors'):
                        st.warning(f"⚠️ {len(stats['errors'])} errors occurred")
                        with st.expander("Show errors"):
                            for error in stats['errors'][:10]:
                                st.write(f"- {error}")
                else:
                    st.error("❌ Update failed!")
                    if stats.get('errors'):
                        st.write("Errors:")
                        for error in stats['errors']:
                            st.write(f"- {error}")

            except Exception as e:
                st.error(f"Error running update: {e}")
                st.exception(e)

with tab2:
    st.subheader("Historical Update")

    st.warning("⚠️ Historical updates can take a long time. Use with caution.")

    col1, col2 = st.columns(2)

    with col1:
        hist_start_date = st.date_input(
            "Start date",
            value=date.today() - timedelta(days=7),
            max_value=date.today()
        )

    with col2:
        hist_days = st.number_input(
            "Number of days",
            min_value=1,
            max_value=30,
            value=7
        )

    hist_end_date = hist_start_date + timedelta(days=hist_days - 1)
    st.info(f"Will update from {hist_start_date} to {hist_end_date} ({hist_days} days)")

    if st.button("Run Historical Update", key="historical_update"):
        with st.spinner(f"Running historical update for {hist_days} days..."):
            try:
                updater = DailyUpdater(db)

                # Show progress
                progress_bar = st.progress(0)
                status_text = st.empty()

                current_date = hist_start_date
                all_stats = []
                day_count = 0

                while current_date <= hist_end_date:
                    day_count += 1
                    progress = day_count / hist_days

                    status_text.text(f"Processing {current_date} ({day_count}/{hist_days})...")
                    progress_bar.progress(progress)

                    stats = updater.run_daily_update(current_date)
                    all_stats.append(stats)

                    current_date += timedelta(days=1)

                # Summary
                total_races = sum(s.get('races_processed', 0) for s in all_stats)
                total_riders = sum(s.get('riders_added', 0) for s in all_stats)
                total_results = sum(s.get('results_added', 0) for s in all_stats)
                total_ratings = sum(s.get('ratings_updated', 0) for s in all_stats)

                st.success("✅ Historical update completed!")

                col1, col2, col3, col4 = st.columns(4)

                with col1:
                    st.metric("Total Races", total_races)
                with col2:
                    st.metric("New Riders", total_riders)
                with col3:
                    st.metric("Total Results", total_results)
                with col4:
                    st.metric("Ratings Updated", total_ratings)

                # Daily breakdown
                with st.expander("Daily Breakdown"):
                    breakdown_data = []
                    for i, stats in enumerate(all_stats):
                        breakdown_data.append({
                            'Date': (hist_start_date + timedelta(days=i)).strftime('%Y-%m-%d'),
                            'Races': stats.get('races_processed', 0),
                            'Riders': stats.get('riders_added', 0),
                            'Results': stats.get('results_added', 0)
                        })

                    df_breakdown = pd.DataFrame(breakdown_data)
                    st.dataframe(df_breakdown, use_container_width=True, hide_index=True)

            except Exception as e:
                st.error(f"Error running historical update: {e}")
                st.exception(e)

st.markdown("---")

# Automated Updates Info
st.header("⏰ Automated Updates")

st.markdown("""
### Setting Up Automated Daily Updates

You can schedule automatic daily updates using cron (Linux/Mac) or Task Scheduler (Windows).

**Linux/Mac (using cron):**
```bash
# Install the cron job (runs at 2:00 AM daily)
bash scripts/schedule_daily_updates.sh install

# Check status
bash scripts/schedule_daily_updates.sh status

# Uninstall
bash scripts/schedule_daily_updates.sh uninstall
```

**Manual Run:**
```bash
# Update today
python scripts/run_daily_update.py

# Update specific date
python scripts/run_daily_update.py --date 2024-07-14

# Historical update
python scripts/run_daily_update.py --historical --start-date 2024-07-01 --days 7
```

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `python`
6. Arguments: `scripts/run_daily_update.py`
7. Start in: `/path/to/CyclingModelization`
""")

# Clean up
db.close()
