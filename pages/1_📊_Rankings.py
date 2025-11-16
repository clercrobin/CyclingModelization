"""Rankings page - View top riders by different dimensions."""

import streamlit as st
import pandas as pd
import plotly.express as px
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import SessionLocal
from src.utils.db_helpers import get_top_riders
from config.settings import settings

st.set_page_config(page_title="Rankings", page_icon="📊", layout="wide")

st.title("📊 Rider Rankings")

# Sidebar controls
st.sidebar.header("Filters")

dimension = st.sidebar.selectbox(
    "Select Dimension",
    options=["overall"] + settings.dimensions,
    format_func=lambda x: x.replace("_", " ").title()
)

limit = st.sidebar.slider("Number of Riders", min_value=10, max_value=100, value=50, step=10)

# Get rankings
db = SessionLocal()
try:
    riders = get_top_riders(db, dimension=dimension, limit=limit)

    if not riders:
        st.warning("No riders found in the database. Add some riders first!")
    else:
        # Create DataFrame
        df = pd.DataFrame(riders)

        # Display metrics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Riders", len(riders))
        with col2:
            avg_rating = df['rating'].mean()
            st.metric("Average Rating", f"{avg_rating:.0f}")
        with col3:
            total_races = df['races'].sum()
            st.metric("Total Races", total_races)

        st.markdown("---")

        # Rankings table
        st.subheader(f"Top {len(riders)} Riders - {dimension.replace('_', ' ').title()}")

        # Format the dataframe for display
        display_df = df.copy()
        display_df.insert(0, 'Rank', range(1, len(display_df) + 1))
        display_df = display_df.rename(columns={
            'name': 'Name',
            'team': 'Team',
            'country': 'Country',
            'rating': f'{dimension.replace("_", " ").title()} Rating',
            'overall': 'Overall Rating',
            'races': 'Races',
            'wins': 'Wins',
            'podiums': 'Podiums'
        })

        st.dataframe(
            display_df,
            use_container_width=True,
            hide_index=True
        )

        # Visualization
        st.markdown("---")
        st.subheader("Rating Distribution")

        col1, col2 = st.columns(2)

        with col1:
            # Bar chart of top 20
            fig_bar = px.bar(
                df.head(20),
                x='name',
                y='rating',
                title=f'Top 20 Riders - {dimension.replace("_", " ").title()} Rating',
                labels={'name': 'Rider', 'rating': 'Rating'},
                color='rating',
                color_continuous_scale='Blues'
            )
            fig_bar.update_layout(xaxis_tickangle=-45)
            st.plotly_chart(fig_bar, use_container_width=True)

        with col2:
            # Histogram of rating distribution
            fig_hist = px.histogram(
                df,
                x='rating',
                nbins=20,
                title='Rating Distribution',
                labels={'rating': 'Rating', 'count': 'Number of Riders'}
            )
            st.plotly_chart(fig_hist, use_container_width=True)

        # Additional stats
        st.markdown("---")
        st.subheader("Statistics")

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            total_wins = df['wins'].sum()
            st.metric("Total Wins", total_wins)

        with col2:
            total_podiums = df['podiums'].sum()
            st.metric("Total Podiums", total_podiums)

        with col3:
            avg_wins = df['wins'].mean()
            st.metric("Avg Wins per Rider", f"{avg_wins:.1f}")

        with col4:
            avg_podiums = df['podiums'].mean()
            st.metric("Avg Podiums per Rider", f"{avg_podiums:.1f}")

finally:
    db.close()
