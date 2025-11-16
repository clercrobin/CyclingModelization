"""
Main Streamlit application for the Cycling Rating System.

Run with: streamlit run app.py
"""

import streamlit as st
import sys
import os

# Add src to path
sys.path.append(os.path.dirname(__file__))

from src.models import init_db

# Page configuration
st.set_page_config(
    page_title="Cycling Rating System",
    page_icon="🚴",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize database on first run
if 'db_initialized' not in st.session_state:
    init_db()
    st.session_state.db_initialized = True

# Main page content
st.title("🚴 Professional Cycling Rating System")

st.markdown("""
### Welcome to the Cycling Rating System!

This system tracks and rates professional cyclists across multiple performance dimensions:
- **Flat**: Performance on flat terrain
- **Cobbles**: Performance on cobblestone sections
- **Mountain**: Climbing ability
- **Time Trial**: Individual time trial performance
- **Sprint**: Sprint finishing ability
- **GC**: General Classification (stage race) ability
- **One Day**: One-day race performance
- **Endurance**: Long-distance endurance

The rating system uses an ELO-like algorithm that updates ratings based on race results and characteristics.

### Quick Start

1. **Add Riders**: Go to "Manage Data" → "Add Riders"
2. **Add Races**: Define races and their characteristics
3. **Add Results**: Input race results
4. **View Rankings**: See rider rankings across all dimensions
5. **Analytics**: Analyze rider performance and rating evolution

### Navigation

Use the sidebar to navigate between different sections of the application.
""")

# Sidebar navigation
st.sidebar.title("Navigation")
st.sidebar.markdown("---")

# Show some quick stats if database has data
from src.models import SessionLocal, Rider, RiderRating, Race

db = SessionLocal()
try:
    rider_count = db.query(Rider).count()
    race_count = db.query(Race).count()

    st.sidebar.metric("Total Riders", rider_count)
    st.sidebar.metric("Total Races", race_count)

    if rider_count > 0:
        top_rider = (
            db.query(Rider, RiderRating)
            .join(RiderRating, Rider.id == RiderRating.rider_id)
            .order_by(RiderRating.overall.desc())
            .first()
        )
        if top_rider:
            st.sidebar.markdown("### 🏆 Top Rated Rider")
            st.sidebar.write(f"**{top_rider[0].name}**")
            st.sidebar.write(f"Rating: {top_rider[1].overall}")
finally:
    db.close()

st.sidebar.markdown("---")
st.sidebar.markdown("""
### About

This rating system is inspired by Pro Cycling Manager and uses
advanced algorithms to rate cyclists based on their race results
and the characteristics of each race.

**Version:** 1.0.0
""")
