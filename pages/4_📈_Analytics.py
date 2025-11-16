"""Analytics page - Advanced analytics and insights."""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import SessionLocal, Rider, RiderRating, Race, RaceResult
from sqlalchemy import func

st.set_page_config(page_title="Analytics", page_icon="📈", layout="wide")

st.title("📈 Analytics & Insights")

db = SessionLocal()

try:
    # Overview metrics
    st.header("System Overview")

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
        avg_rating = db.query(func.avg(RiderRating.overall)).scalar()
        st.metric("Avg Rating", f"{avg_rating:.0f}" if avg_rating else "N/A")

    st.markdown("---")

    # Rating distribution analysis
    st.header("Rating Distribution Analysis")

    ratings = db.query(RiderRating).all()

    if ratings:
        # Prepare data for all dimensions
        dimensions_data = {
            'Flat': [r.flat for r in ratings],
            'Cobbles': [r.cobbles for r in ratings],
            'Mountain': [r.mountain for r in ratings],
            'Time Trial': [r.time_trial for r in ratings],
            'Sprint': [r.sprint for r in ratings],
            'GC': [r.gc for r in ratings],
            'One Day': [r.one_day for r in ratings],
            'Endurance': [r.endurance for r in ratings]
        }

        # Box plot of all dimensions
        fig_box = go.Figure()

        for dimension, values in dimensions_data.items():
            fig_box.add_trace(go.Box(
                y=values,
                name=dimension,
                boxmean='sd'
            ))

        fig_box.update_layout(
            title='Rating Distribution by Dimension',
            yaxis_title='Rating',
            yaxis_range=[1000, 2500]
        )

        st.plotly_chart(fig_box, use_container_width=True)

        # Correlation heatmap
        st.subheader("Dimension Correlations")

        df_corr = pd.DataFrame(dimensions_data)
        correlation = df_corr.corr()

        fig_heatmap = px.imshow(
            correlation,
            labels=dict(color="Correlation"),
            x=correlation.columns,
            y=correlation.columns,
            color_continuous_scale='RdBu',
            zmin=-1,
            zmax=1,
            title='Correlation Between Rating Dimensions'
        )

        st.plotly_chart(fig_heatmap, use_container_width=True)

        st.markdown("---")

        # Top performers in each category
        st.header("Specialists")

        st.write("Riders with the highest ratings in specific dimensions:")

        cols = st.columns(4)

        dimensions = ['mountain', 'sprint', 'time_trial', 'cobbles']
        labels = ['Climber', 'Sprinter', 'Time Trialist', 'Cobbles Specialist']

        for idx, (dim, label) in enumerate(zip(dimensions, labels)):
            with cols[idx]:
                top_rider = (
                    db.query(Rider, RiderRating)
                    .join(RiderRating, Rider.id == RiderRating.rider_id)
                    .order_by(getattr(RiderRating, dim).desc())
                    .first()
                )

                if top_rider:
                    st.metric(
                        label,
                        top_rider[0].name,
                        delta=f"{getattr(top_rider[1], dim)} pts"
                    )

    else:
        st.info("No rating data available yet.")

    st.markdown("---")

    # Race statistics
    st.header("Race Statistics")

    races = db.query(Race).all()

    if races:
        # Races by category
        category_counts = {}
        for race in races:
            cat = race.category.value
            category_counts[cat] = category_counts.get(cat, 0) + 1

        fig_pie = px.pie(
            values=list(category_counts.values()),
            names=list(category_counts.keys()),
            title='Races by Category'
        )

        col1, col2 = st.columns(2)

        with col1:
            st.plotly_chart(fig_pie, use_container_width=True)

        with col2:
            # Races over time
            race_dates = [r.date for r in races]
            race_names = [r.name for r in races]

            df_races = pd.DataFrame({
                'Date': race_dates,
                'Race': race_names
            })

            df_races['Month'] = pd.to_datetime(df_races['Date']).dt.to_period('M')
            races_per_month = df_races.groupby('Month').size().reset_index(name='Count')
            races_per_month['Month'] = races_per_month['Month'].astype(str)

            fig_timeline = px.bar(
                races_per_month,
                x='Month',
                y='Count',
                title='Races Over Time'
            )

            st.plotly_chart(fig_timeline, use_container_width=True)

    else:
        st.info("No race data available yet.")

    st.markdown("---")

    # Performance insights
    st.header("Performance Insights")

    # Most active riders
    st.subheader("Most Active Riders")

    active_riders = (
        db.query(Rider, RiderRating)
        .join(RiderRating, Rider.id == RiderRating.rider_id)
        .order_by(RiderRating.races_count.desc())
        .limit(10)
        .all()
    )

    if active_riders:
        active_data = []
        for rider, rating in active_riders:
            active_data.append({
                'Rider': rider.name,
                'Races': rating.races_count,
                'Wins': rating.wins_count,
                'Podiums': rating.podiums_count,
                'Win Rate': f"{(rating.wins_count / rating.races_count * 100):.1f}%" if rating.races_count > 0 else "0%"
            })

        df_active = pd.DataFrame(active_data)
        st.dataframe(df_active, use_container_width=True, hide_index=True)

    # Best win rates (min 5 races)
    st.subheader("Best Win Rates (min 5 races)")

    win_rate_riders = (
        db.query(Rider, RiderRating)
        .join(RiderRating, Rider.id == RiderRating.rider_id)
        .filter(RiderRating.races_count >= 5)
        .all()
    )

    if win_rate_riders:
        win_rate_data = []
        for rider, rating in win_rate_riders:
            win_rate = (rating.wins_count / rating.races_count * 100) if rating.races_count > 0 else 0
            win_rate_data.append({
                'Rider': rider.name,
                'Win Rate': win_rate,
                'Wins': rating.wins_count,
                'Races': rating.races_count
            })

        df_win_rate = pd.DataFrame(win_rate_data)
        df_win_rate = df_win_rate.sort_values('Win Rate', ascending=False).head(10)

        fig_win_rate = px.bar(
            df_win_rate,
            x='Rider',
            y='Win Rate',
            title='Top 10 Win Rates',
            labels={'Win Rate': 'Win Rate (%)'}
        )

        st.plotly_chart(fig_win_rate, use_container_width=True)

finally:
    db.close()
