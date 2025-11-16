"""Database helper functions for common operations."""

from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.models import Rider, RiderRating, Race, RaceResult, RaceCharacteristics
from src.models.race import RaceCategory


def add_rider(
    db: Session,
    name: str,
    country: Optional[str] = None,
    team: Optional[str] = None,
    pcs_id: Optional[str] = None
) -> Rider:
    """
    Add a new rider to the database.

    Args:
        db: Database session
        name: Rider name
        country: Rider country
        team: Rider team
        pcs_id: Pro Cycling Stats ID

    Returns:
        Created Rider object
    """
    # Check if rider already exists
    existing = db.query(Rider).filter(Rider.name == name).first()
    if existing:
        return existing

    rider = Rider(
        name=name,
        country=country,
        team=team,
        pcs_id=pcs_id
    )

    db.add(rider)
    db.commit()
    db.refresh(rider)

    return rider


def add_race(
    db: Session,
    name: str,
    date: datetime,
    category: str = "Others",
    country: Optional[str] = None,
    characteristics: Optional[Dict[str, float]] = None,
    pcs_id: Optional[str] = None
) -> Race:
    """
    Add a new race to the database.

    Args:
        db: Database session
        name: Race name
        date: Race date
        category: Race category
        country: Country where race takes place
        characteristics: Dictionary of race characteristics
        pcs_id: Pro Cycling Stats ID

    Returns:
        Created Race object
    """
    # Get or create race category enum
    try:
        race_category = RaceCategory[category.upper().replace("PROSERIES", "PROSERIES")]
    except KeyError:
        race_category = RaceCategory.OTHERS

    race = Race(
        name=name,
        date=date,
        category=race_category,
        country=country,
        season=date.year,
        pcs_id=pcs_id
    )

    db.add(race)
    db.flush()  # Get race ID

    # Add characteristics if provided
    if characteristics:
        race_char = RaceCharacteristics(
            race_id=race.id,
            **characteristics
        )
        db.add(race_char)

    db.commit()
    db.refresh(race)

    return race


def add_race_result(
    db: Session,
    race_id: int,
    rider_id: int,
    position: int,
    time_seconds: Optional[int] = None,
    time_behind_seconds: Optional[int] = None,
    did_not_finish: bool = False,
    did_not_start: bool = False
) -> RaceResult:
    """
    Add a race result.

    Args:
        db: Database session
        race_id: Race ID
        rider_id: Rider ID
        position: Finishing position
        time_seconds: Finish time in seconds
        time_behind_seconds: Time behind winner in seconds
        did_not_finish: Whether rider DNF
        did_not_start: Whether rider DNS

    Returns:
        Created RaceResult object
    """
    result = RaceResult(
        race_id=race_id,
        rider_id=rider_id,
        position=position,
        time_seconds=time_seconds,
        time_behind_seconds=time_behind_seconds,
        did_not_finish=1 if did_not_finish else 0,
        did_not_start=1 if did_not_start else 0
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return result


def get_top_riders(
    db: Session,
    dimension: str = "overall",
    limit: int = 50
) -> List[Dict]:
    """
    Get top riders by rating dimension.

    Args:
        db: Database session
        dimension: Rating dimension (overall, flat, mountain, etc.)
        limit: Number of riders to return

    Returns:
        List of dictionaries with rider info and ratings
    """
    if not hasattr(RiderRating, dimension):
        dimension = "overall"

    riders_query = (
        db.query(Rider, RiderRating)
        .join(RiderRating, Rider.id == RiderRating.rider_id)
        .order_by(getattr(RiderRating, dimension).desc())
        .limit(limit)
    )

    results = []
    for rider, rating in riders_query:
        results.append({
            'name': rider.name,
            'team': rider.team,
            'country': rider.country,
            'rating': getattr(rating, dimension),
            'overall': rating.overall,
            'races': rating.races_count,
            'wins': rating.wins_count,
            'podiums': rating.podiums_count
        })

    return results


def get_rider_by_name(db: Session, name: str) -> Optional[Rider]:
    """Get rider by name."""
    return db.query(Rider).filter(Rider.name.ilike(f"%{name}%")).first()


def get_race_by_name(db: Session, name: str) -> Optional[Race]:
    """Get race by name."""
    return db.query(Race).filter(Race.name.ilike(f"%{name}%")).first()
