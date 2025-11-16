"""Manage Data page - Add riders, races, and results."""

import streamlit as st
from datetime import datetime, date
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import SessionLocal
from src.utils.db_helpers import add_rider, add_race, add_race_result, get_rider_by_name, get_race_by_name
from src.services.rating_engine import RatingEngine
from config.settings import settings

st.set_page_config(page_title="Manage Data", page_icon="📝", layout="wide")

st.title("📝 Manage Data")

# Tabs for different data types
tab1, tab2, tab3, tab4 = st.tabs(["Add Rider", "Add Race", "Add Results", "Update Ratings"])

db = SessionLocal()

# Tab 1: Add Rider
with tab1:
    st.subheader("Add New Rider")

    with st.form("add_rider_form"):
        rider_name = st.text_input("Rider Name*", placeholder="e.g., Tadej Pogačar")
        col1, col2 = st.columns(2)

        with col1:
            rider_team = st.text_input("Team", placeholder="e.g., UAE Team Emirates")
            rider_country = st.text_input("Country", placeholder="e.g., Slovenia")

        with col2:
            rider_pcs_id = st.text_input("ProCyclingStats ID (optional)", placeholder="e.g., tadej-pogacar")

        submitted = st.form_submit_button("Add Rider")

        if submitted:
            if rider_name:
                try:
                    rider = add_rider(
                        db,
                        name=rider_name,
                        team=rider_team if rider_team else None,
                        country=rider_country if rider_country else None,
                        pcs_id=rider_pcs_id if rider_pcs_id else None
                    )

                    # Initialize ratings
                    engine = RatingEngine(db)
                    engine.initialize_rider_ratings(rider.id)

                    st.success(f"✅ Rider '{rider_name}' added successfully!")
                except Exception as e:
                    st.error(f"Error adding rider: {e}")
            else:
                st.error("Rider name is required!")

# Tab 2: Add Race
with tab2:
    st.subheader("Add New Race")

    with st.form("add_race_form"):
        race_name = st.text_input("Race Name*", placeholder="e.g., Tour de France - Stage 1")
        col1, col2 = st.columns(2)

        with col1:
            race_date = st.date_input("Race Date*", value=date.today())
            race_category = st.selectbox(
                "Category",
                options=["GT", "Monument", "WC", "WT", "ProSeries", "Others"]
            )
            race_country = st.text_input("Country", placeholder="e.g., France")

        with col2:
            st.write("**Race Characteristics** (0.0 to 1.0)")
            flat_weight = st.slider("Flat", 0.0, 1.0, 0.0, 0.1)
            cobbles_weight = st.slider("Cobbles", 0.0, 1.0, 0.0, 0.1)
            mountain_weight = st.slider("Mountain", 0.0, 1.0, 0.0, 0.1)
            time_trial_weight = st.slider("Time Trial", 0.0, 1.0, 0.0, 0.1)

        col3, col4 = st.columns(2)

        with col3:
            sprint_weight = st.slider("Sprint", 0.0, 1.0, 0.0, 0.1)
            gc_weight = st.slider("GC", 0.0, 1.0, 0.0, 0.1)

        with col4:
            one_day_weight = st.slider("One Day", 0.0, 1.0, 0.0, 0.1)
            endurance_weight = st.slider("Endurance", 0.0, 1.0, 0.0, 0.1)

        submitted_race = st.form_submit_button("Add Race")

        if submitted_race:
            if race_name:
                try:
                    characteristics = {
                        'flat_weight': flat_weight,
                        'cobbles_weight': cobbles_weight,
                        'mountain_weight': mountain_weight,
                        'time_trial_weight': time_trial_weight,
                        'sprint_weight': sprint_weight,
                        'gc_weight': gc_weight,
                        'one_day_weight': one_day_weight,
                        'endurance_weight': endurance_weight
                    }

                    race = add_race(
                        db,
                        name=race_name,
                        date=datetime.combine(race_date, datetime.min.time()),
                        category=race_category,
                        country=race_country if race_country else None,
                        characteristics=characteristics
                    )

                    st.success(f"✅ Race '{race_name}' added successfully!")
                except Exception as e:
                    st.error(f"Error adding race: {e}")
            else:
                st.error("Race name is required!")

# Tab 3: Add Results
with tab3:
    st.subheader("Add Race Results")

    # Race selection
    from src.models import Race
    races = db.query(Race).order_by(Race.date.desc()).limit(50).all()

    if races:
        race_options = {f"{r.name} ({r.date.strftime('%Y-%m-%d')})": r.id for r in races}
        selected_race = st.selectbox("Select Race", list(race_options.keys()))

        if selected_race:
            race_id = race_options[selected_race]

            st.write("Add results one by one, or use batch import below.")

            with st.form("add_result_form"):
                col1, col2 = st.columns(2)

                with col1:
                    result_rider_name = st.text_input("Rider Name*")
                    position = st.number_input("Position*", min_value=1, value=1, step=1)

                with col2:
                    time_seconds = st.number_input("Time (seconds)", min_value=0, value=0, step=1)
                    time_behind = st.number_input("Time Behind (seconds)", min_value=0, value=0, step=1)

                submitted_result = st.form_submit_button("Add Result")

                if submitted_result:
                    if result_rider_name:
                        rider = get_rider_by_name(db, result_rider_name)

                        if rider:
                            try:
                                add_race_result(
                                    db,
                                    race_id=race_id,
                                    rider_id=rider.id,
                                    position=position,
                                    time_seconds=time_seconds if time_seconds > 0 else None,
                                    time_behind_seconds=time_behind if time_behind > 0 else None
                                )
                                st.success(f"✅ Result added for {rider.name}!")
                            except Exception as e:
                                st.error(f"Error adding result: {e}")
                        else:
                            st.error(f"Rider '{result_rider_name}' not found. Add the rider first!")
                    else:
                        st.error("Rider name is required!")

            st.markdown("---")
            st.subheader("Batch Import Results")

            st.write("Enter results in CSV format: `Position,Rider Name,Time(seconds),Time Behind(seconds)`")

            batch_text = st.text_area(
                "Paste results here",
                placeholder="1,Tadej Pogačar,14400,0\n2,Jonas Vingegaard,14420,20\n3,Primož Roglič,14450,50",
                height=200
            )

            if st.button("Import Batch Results"):
                if batch_text:
                    lines = batch_text.strip().split('\n')
                    success_count = 0
                    error_count = 0

                    for line in lines:
                        try:
                            parts = [p.strip() for p in line.split(',')]
                            if len(parts) >= 2:
                                pos = int(parts[0])
                                name = parts[1]
                                time_s = int(parts[2]) if len(parts) > 2 and parts[2] else None
                                time_b = int(parts[3]) if len(parts) > 3 and parts[3] else None

                                rider = get_rider_by_name(db, name)
                                if rider:
                                    add_race_result(
                                        db,
                                        race_id=race_id,
                                        rider_id=rider.id,
                                        position=pos,
                                        time_seconds=time_s,
                                        time_behind_seconds=time_b
                                    )
                                    success_count += 1
                                else:
                                    st.warning(f"Rider '{name}' not found - skipped")
                                    error_count += 1
                        except Exception as e:
                            st.warning(f"Error parsing line '{line}': {e}")
                            error_count += 1

                    st.success(f"✅ Imported {success_count} results successfully! ({error_count} errors)")
    else:
        st.info("No races found. Add a race first!")

# Tab 4: Update Ratings
with tab4:
    st.subheader("Update Ratings Based on Race Results")

    st.write("""
    After adding race results, you need to update the ratings. Select a race below to recalculate
    all rider ratings based on the results.
    """)

    from src.models import Race
    races = db.query(Race).order_by(Race.date.desc()).limit(50).all()

    if races:
        race_options = {f"{r.name} ({r.date.strftime('%Y-%m-%d')})": r.id for r in races}
        selected_race_update = st.selectbox("Select Race to Update Ratings", list(race_options.keys()))

        if st.button("Update Ratings"):
            if selected_race_update:
                race_id = race_options[selected_race_update]

                try:
                    engine = RatingEngine(db)
                    result = engine.update_ratings_for_race(race_id)

                    st.success(f"✅ Updated ratings for {result['updated']} riders!")

                    if result.get('updates'):
                        st.write("**Rating Changes:**")
                        for update in result['updates'][:10]:  # Show first 10
                            st.write(
                                f"- {update['rider']} (P{update['position']}): "
                                f"{'+' if update['rating_change'] >= 0 else ''}{update['rating_change']}"
                            )
                except Exception as e:
                    st.error(f"Error updating ratings: {e}")
                    st.exception(e)
    else:
        st.info("No races found. Add a race first!")

db.close()
