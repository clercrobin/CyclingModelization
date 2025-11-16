"""Tests for the rating calculation engine."""

import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.models.base import Base
from src.models import Rider, RiderRating, Race, RaceResult, RaceCharacteristics
from src.models.race import RaceCategory
from src.services.rating_engine import RatingEngine


@pytest.fixture
def db_session():
    """Create a test database session."""
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def sample_riders(db_session):
    """Create sample riders for testing."""
    riders = []
    for i, name in enumerate(['Rider A', 'Rider B', 'Rider C'], 1):
        rider = Rider(id=i, name=name, team=f'Team {i}')
        db_session.add(rider)
        riders.append(rider)

    db_session.commit()
    return riders


@pytest.fixture
def sample_race(db_session):
    """Create a sample race for testing."""
    race = Race(
        id=1,
        name='Test Race',
        date=datetime.now(),
        category=RaceCategory.WT,
        season=2024
    )
    db_session.add(race)

    characteristics = RaceCharacteristics(
        race_id=1,
        flat_weight=0.5,
        cobbles_weight=0.0,
        mountain_weight=0.8,
        time_trial_weight=0.0,
        sprint_weight=0.2,
        gc_weight=0.6,
        one_day_weight=0.0,
        endurance_weight=0.7
    )
    db_session.add(characteristics)
    db_session.commit()

    return race


class TestRatingEngine:
    """Test suite for RatingEngine."""

    def test_initialize_rider_ratings(self, db_session, sample_riders):
        """Test initializing ratings for a new rider."""
        engine = RatingEngine(db_session)
        rider = sample_riders[0]

        rating = engine.initialize_rider_ratings(rider.id)

        assert rating is not None
        assert rating.rider_id == rider.id
        assert rating.overall == 1500
        assert rating.mountain == 1500
        assert rating.sprint == 1500
        assert rating.races_count == 0
        assert rating.wins_count == 0

    def test_calculate_expected_score(self, db_session):
        """Test ELO expected score calculation."""
        engine = RatingEngine(db_session)

        # Equal ratings should give 0.5
        score = engine.calculate_expected_score(1500, 1500)
        assert 0.49 < score < 0.51

        # Higher rating should give > 0.5
        score = engine.calculate_expected_score(1600, 1500)
        assert score > 0.5

        # Lower rating should give < 0.5
        score = engine.calculate_expected_score(1400, 1500)
        assert score < 0.5

    def test_calculate_performance_score(self, db_session):
        """Test performance score calculation."""
        engine = RatingEngine(db_session)

        # Winner should get 1.0
        assert engine.calculate_performance_score(1, 10) == 1.0

        # 2nd place should get less
        assert 0.7 < engine.calculate_performance_score(2, 10) < 0.8

        # Last place should get low score
        assert engine.calculate_performance_score(10, 10) < 0.5

    def test_update_ratings_for_race(self, db_session, sample_riders, sample_race):
        """Test rating updates after a race."""
        engine = RatingEngine(db_session)

        # Initialize ratings
        for rider in sample_riders:
            engine.initialize_rider_ratings(rider.id)

        # Add race results
        results = [
            RaceResult(race_id=1, rider_id=1, position=1),  # Winner
            RaceResult(race_id=1, rider_id=2, position=2),  # 2nd
            RaceResult(race_id=1, rider_id=3, position=3),  # 3rd
        ]

        for result in results:
            db_session.add(result)
        db_session.commit()

        # Update ratings
        update_result = engine.update_ratings_for_race(1)

        assert update_result['updated'] == 3

        # Check winner's rating increased
        winner_rating = db_session.query(RiderRating).filter(
            RiderRating.rider_id == 1
        ).first()

        assert winner_rating.mountain > 1500  # Mountain weight is high
        assert winner_rating.races_count == 1
        assert winner_rating.wins_count == 1
        assert winner_rating.podiums_count == 1

        # Check 2nd place
        second_rating = db_session.query(RiderRating).filter(
            RiderRating.rider_id == 2
        ).first()

        assert second_rating.races_count == 1
        assert second_rating.wins_count == 0
        assert second_rating.podiums_count == 1

    def test_rating_history_created(self, db_session, sample_riders, sample_race):
        """Test that rating history is created."""
        engine = RatingEngine(db_session)

        # Initialize and create results
        engine.initialize_rider_ratings(sample_riders[0].id)

        result = RaceResult(race_id=1, rider_id=1, position=1)
        db_session.add(result)
        db_session.commit()

        # Update ratings
        engine.update_ratings_for_race(1)

        # Check history was created
        from src.models import RatingHistory
        history = db_session.query(RatingHistory).filter(
            RatingHistory.rider_id == 1
        ).first()

        assert history is not None
        assert history.race_id == 1
        assert 'mountain' in history.ratings

    def test_get_race_importance_multiplier(self, db_session):
        """Test race importance multipliers."""
        engine = RatingEngine(db_session)

        # Create races of different categories
        gt_race = Race(name='GT', category=RaceCategory.GT, date=datetime.now(), season=2024)
        monument_race = Race(name='Monument', category=RaceCategory.MONUMENT, date=datetime.now(), season=2024)
        wt_race = Race(name='WT', category=RaceCategory.WT, date=datetime.now(), season=2024)

        assert engine.get_race_importance_multiplier(gt_race) == 2.0
        assert engine.get_race_importance_multiplier(monument_race) == 1.8
        assert engine.get_race_importance_multiplier(wt_race) == 1.3

    def test_calculate_overall_rating(self, db_session, sample_riders):
        """Test overall rating calculation."""
        engine = RatingEngine(db_session)

        rider = sample_riders[0]
        rating = engine.initialize_rider_ratings(rider.id)

        # Set specific ratings
        rating.mountain = 1700
        rating.sprint = 1300
        rating.flat = 1500
        rating.time_trial = 1600

        overall = engine._calculate_overall_rating(rating)

        # Should be weighted average
        assert 1450 < overall < 1650

    def test_rating_bounds(self, db_session, sample_riders, sample_race):
        """Test that ratings stay within bounds (1000-2500)."""
        engine = RatingEngine(db_session)

        rider = sample_riders[0]
        rating = engine.initialize_rider_ratings(rider.id)

        # Set very high rating
        rating.mountain = 2400

        # Add many wins
        for i in range(10):
            result = RaceResult(race_id=1, rider_id=rider.id, position=1)
            db_session.add(result)
            db_session.commit()
            db_session.delete(result)  # Clean up for next iteration

        result = RaceResult(race_id=1, rider_id=rider.id, position=1)
        db_session.add(result)
        db_session.commit()

        engine.update_ratings_for_race(1)

        updated_rating = db_session.query(RiderRating).filter(
            RiderRating.rider_id == rider.id
        ).first()

        # Should not exceed 2500
        assert updated_rating.mountain <= 2500


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
