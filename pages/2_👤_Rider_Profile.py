"""Rider profile page - View detailed rider information and rating history."""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import SessionLocal, Rider, RiderRating, RatingHistory, RaceResult, Race
from config.settings import settings

st.set_page_config(page_title="Rider Profile", page_icon="👤", layout="wide")

st.title("👤 Rider Profile")

# Get all riders
db = SessionLocal()
try:
    riders = db.query(Rider).order_by(Rider.name).all()

    if not riders:
        st.warning("No riders in the database. Add some riders first!")
    else:
        # Rider selection
        rider_names = [r.name for r in riders]
        selected_name = st.selectbox("Select Rider", rider_names)

        rider = db.query(Rider).filter(Rider.name == selected_name).first()

        if rider:
            # Rider information
            col1, col2, col3 = st.columns(3)

            with col1:
                st.subheader(rider.name)
                if rider.team:
                    st.write(f"**Team:** {rider.team}")
                if rider.country:
                    st.write(f"**Country:** {rider.country}")

            rating = db.query(RiderRating).filter(RiderRating.rider_id == rider.id).first()

            if rating:
                with col2:
                    st.metric("Overall Rating", rating.overall)
                    st.write(f"**Races:** {rating.races_count}")

                with col3:
                    st.metric("Wins", rating.wins_count)
                    st.metric("Podiums", rating.podiums_count)

                st.markdown("---")

                # Rating dimensions
                st.subheader("Rating Dimensions")

                dimensions_data = {
                    'Dimension': [],
                    'Rating': []
                }

                for dim in settings.dimensions:
                    dimensions_data['Dimension'].append(dim.replace('_', ' ').title())
                    dimensions_data['Rating'].append(getattr(rating, dim))

                col1, col2 = st.columns([1, 2])

                with col1:
                    # Display ratings as metrics
                    for dim in settings.dimensions:
                        rating_value = getattr(rating, dim)
                        st.metric(
                            dim.replace('_', ' ').title(),
                            rating_value,
                            delta=None
                        )

                with col2:
                    # Radar chart
                    fig = go.Figure()

                    fig.add_trace(go.Scatterpolar(
                        r=[getattr(rating, dim) for dim in settings.dimensions],
                        theta=[dim.replace('_', ' ').title() for dim in settings.dimensions],
                        fill='toself',
                        name=rider.name
                    ))

                    fig.update_layout(
                        polar=dict(
                            radialaxis=dict(
                                visible=True,
                                range=[1000, 2500]
                            )
                        ),
                        showlegend=False,
                        title="Rating Profile"
                    )

                    st.plotly_chart(fig, use_container_width=True)

                st.markdown("---")

                # Rating history
                st.subheader("Rating History")

                history = db.query(RatingHistory).filter(
                    RatingHistory.rider_id == rider.id
                ).order_by(RatingHistory.date).all()

                if history:
                    # Prepare data for line chart
                    history_data = {
                        'Date': [],
                        'Overall Rating': []
                    }

                    for h in history:
                        history_data['Date'].append(h.date)
                        history_data['Overall Rating'].append(h.ratings.get('overall', 1500))

                    df_history = pd.DataFrame(history_data)

                    fig_history = px.line(
                        df_history,
                        x='Date',
                        y='Overall Rating',
                        title='Rating Evolution',
                        markers=True
                    )

                    fig_history.update_layout(
                        xaxis_title='Date',
                        yaxis_title='Rating',
                        yaxis_range=[1000, 2500]
                    )

                    st.plotly_chart(fig_history, use_container_width=True)
                else:
                    st.info("No rating history available yet.")

                st.markdown("---")

                # Race results
                st.subheader("Recent Race Results")

                results = db.query(RaceResult, Race).join(
                    Race, RaceResult.race_id == Race.id
                ).filter(
                    RaceResult.rider_id == rider.id
                ).order_by(Race.date.desc()).limit(20).all()

                if results:
                    results_data = []
                    for result, race in results:
                        results_data.append({
                            'Date': race.date.strftime('%Y-%m-%d'),
                            'Race': race.name,
                            'Category': race.category.value,
                            'Position': result.position,
                            'Points': result.points
                        })

                    df_results = pd.DataFrame(results_data)
                    st.dataframe(df_results, use_container_width=True, hide_index=True)
                else:
                    st.info("No race results available yet.")

            else:
                st.info("No rating information available for this rider yet.")

finally:
    db.close()
