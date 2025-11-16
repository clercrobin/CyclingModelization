"""Rider models for storing cyclist information and ratings."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base


class Rider(Base):
    """Model representing a professional cyclist."""

    __tablename__ = "riders"

    id = Column(Integer, primary_key=True, index=True)
    pcs_id = Column(String, unique=True, index=True, nullable=True)  # ProCyclingStats ID
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=True)
    team = Column(String, nullable=True)
    birth_date = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ratings = relationship("RiderRating", back_populates="rider", uselist=False)
    rating_history = relationship("RatingHistory", back_populates="rider", order_by="RatingHistory.date.desc()")
    race_results = relationship("RaceResult", back_populates="rider")

    def __repr__(self):
        return f"<Rider(name='{self.name}', team='{self.team}')>"


class RiderRating(Base):
    """Current ratings for each rider across different dimensions."""

    __tablename__ = "rider_ratings"

    id = Column(Integer, primary_key=True, index=True)
    rider_id = Column(Integer, ForeignKey("riders.id"), unique=True, nullable=False)

    # Rating dimensions (1000-2500 scale, similar to ELO)
    flat = Column(Integer, default=1500)
    cobbles = Column(Integer, default=1500)
    mountain = Column(Integer, default=1500)
    time_trial = Column(Integer, default=1500)
    sprint = Column(Integer, default=1500)
    gc = Column(Integer, default=1500)  # General Classification ability
    one_day = Column(Integer, default=1500)  # One-day race ability
    endurance = Column(Integer, default=1500)

    # Overall rating (weighted average)
    overall = Column(Integer, default=1500)

    # Statistics
    races_count = Column(Integer, default=0)
    wins_count = Column(Integer, default=0)
    podiums_count = Column(Integer, default=0)

    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    rider = relationship("Rider", back_populates="ratings")

    def __repr__(self):
        return f"<RiderRating(rider_id={self.rider_id}, overall={self.overall})>"

    def to_dict(self):
        """Convert ratings to dictionary."""
        return {
            "flat": self.flat,
            "cobbles": self.cobbles,
            "mountain": self.mountain,
            "time_trial": self.time_trial,
            "sprint": self.sprint,
            "gc": self.gc,
            "one_day": self.one_day,
            "endurance": self.endurance,
            "overall": self.overall
        }


class RatingHistory(Base):
    """Historical ratings for tracking evolution over time."""

    __tablename__ = "rating_history"

    id = Column(Integer, primary_key=True, index=True)
    rider_id = Column(Integer, ForeignKey("riders.id"), nullable=False)
    race_id = Column(Integer, ForeignKey("races.id"), nullable=True)

    date = Column(DateTime, nullable=False, index=True)

    # Rating snapshots
    ratings = Column(JSON, nullable=False)  # Store all dimension ratings as JSON

    # Change metadata
    change_reason = Column(String, nullable=True)  # e.g., "Race result", "Manual adjustment"

    # Relationships
    rider = relationship("Rider", back_populates="rating_history")
    race = relationship("Race")

    def __repr__(self):
        return f"<RatingHistory(rider_id={self.rider_id}, date={self.date})>"
