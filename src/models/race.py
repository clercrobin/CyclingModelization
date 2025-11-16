"""Race models for storing race information and results."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import Base


class RaceCategory(enum.Enum):
    """Race category types."""
    GT = "GT"  # Grand Tour
    MONUMENT = "Monument"
    WC = "WC"  # World Championship
    WT = "WT"  # World Tour
    PROSERIES = "ProSeries"
    OTHERS = "Others"


class Race(Base):
    """Model representing a professional cycling race."""

    __tablename__ = "races"

    id = Column(Integer, primary_key=True, index=True)
    pcs_id = Column(String, unique=True, index=True, nullable=True)  # ProCyclingStats ID
    name = Column(String, nullable=False, index=True)

    # Race information
    category = Column(Enum(RaceCategory), default=RaceCategory.OTHERS)
    date = Column(DateTime, nullable=False, index=True)
    season = Column(Integer, nullable=False, index=True)

    # Location
    country = Column(String, nullable=True)

    # Stage race info
    is_stage_race = Column(Integer, default=0)  # Boolean: 0 or 1
    stage_number = Column(Integer, nullable=True)
    parent_race_id = Column(Integer, ForeignKey("races.id"), nullable=True)  # For stages

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    characteristics = relationship("RaceCharacteristics", back_populates="race", uselist=False)
    results = relationship("RaceResult", back_populates="race")
    stages = relationship("Race", backref="parent_race", remote_side=[id])

    def __repr__(self):
        return f"<Race(name='{self.name}', date={self.date})>"


class RaceCharacteristics(Base):
    """Characteristics of a race that determine which skills are tested."""

    __tablename__ = "race_characteristics"

    id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("races.id"), unique=True, nullable=False)

    # Terrain characteristics (0.0 to 1.0 weights)
    flat_weight = Column(Float, default=0.0)
    cobbles_weight = Column(Float, default=0.0)
    mountain_weight = Column(Float, default=0.0)
    time_trial_weight = Column(Float, default=0.0)
    sprint_weight = Column(Float, default=0.0)
    gc_weight = Column(Float, default=0.0)
    one_day_weight = Column(Float, default=0.0)
    endurance_weight = Column(Float, default=0.0)

    # Physical characteristics
    distance_km = Column(Float, nullable=True)
    elevation_gain_m = Column(Float, nullable=True)
    avg_gradient = Column(Float, nullable=True)

    # Relationships
    race = relationship("Race", back_populates="characteristics")

    def __repr__(self):
        return f"<RaceCharacteristics(race_id={self.race_id})>"

    def to_dict(self):
        """Convert characteristics to dictionary."""
        return {
            "flat_weight": self.flat_weight,
            "cobbles_weight": self.cobbles_weight,
            "mountain_weight": self.mountain_weight,
            "time_trial_weight": self.time_trial_weight,
            "sprint_weight": self.sprint_weight,
            "gc_weight": self.gc_weight,
            "one_day_weight": self.one_day_weight,
            "endurance_weight": self.endurance_weight
        }


class RaceResult(Base):
    """Results of riders in races."""

    __tablename__ = "race_results"

    id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("races.id"), nullable=False)
    rider_id = Column(Integer, ForeignKey("riders.id"), nullable=False)

    # Result
    position = Column(Integer, nullable=False)
    time_seconds = Column(Integer, nullable=True)
    time_behind_seconds = Column(Integer, nullable=True)

    # Points/bonifications
    points = Column(Integer, default=0)

    # DNF/DNS status
    did_not_finish = Column(Integer, default=0)  # Boolean
    did_not_start = Column(Integer, default=0)  # Boolean

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    race = relationship("Race", back_populates="results")
    rider = relationship("Rider", back_populates="race_results")

    def __repr__(self):
        return f"<RaceResult(race_id={self.race_id}, rider_id={self.rider_id}, position={self.position})>"
