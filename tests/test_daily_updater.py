"""Tests for the daily update system."""

import pytest
from datetime import date, datetime
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.models.base import Base
from src.models import Rider, Race, RaceResult, RiderRating
from src.services.daily_updater import DailyUpdater


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
def mock_scraper():
    """Create a mock scraper."""
    scraper = Mock()
    return scraper


class TestDailyUpdater:
    """Test suite for DailyUpdater."""

    def test_init(self, db_session, mock_scraper):
        """Test updater initialization."""
        updater = DailyUpdater(db_session, mock_scraper)

        assert updater.db == db_session
        assert updater.scraper == mock_scraper
        assert updater.rating_engine is not None
        assert 'races_processed' in updater.stats

    def test_validate_race_data_valid(self, db_session, mock_scraper):
        """Test race data validation with valid data."""
        updater = DailyUpdater(db_session, mock_scraper)

        valid_data = {
            'name': 'Test Race',
            'date': datetime.now(),
            'category': 'WT',
            'characteristics': {
                'flat_weight': 0.5,
                'cobbles_weight': 0.0,
                'mountain_weight': 0.8,
                'time_trial_weight': 0.0,
                'sprint_weight': 0.2,
                'gc_weight': 0.6,
                'one_day_weight': 0.0,
                'endurance_weight': 0.7
            }
        }

        assert updater._validate_race_data(valid_data) is True

    def test_validate_race_data_missing_field(self, db_session, mock_scraper):
        """Test race data validation with missing fields."""
        updater = DailyUpdater(db_session, mock_scraper)

        invalid_data = {
            'name': 'Test Race',
            # Missing 'date', 'category', 'characteristics'
        }

        assert updater._validate_race_data(invalid_data) is False

    def test_validate_race_data_missing_characteristics(self, db_session, mock_scraper):
        """Test race data validation with incomplete characteristics."""
        updater = DailyUpdater(db_session, mock_scraper)

        invalid_data = {
            'name': 'Test Race',
            'date': datetime.now(),
            'category': 'WT',
            'characteristics': {
                'flat_weight': 0.5,
                # Missing other weights
            }
        }

        assert updater._validate_race_data(invalid_data) is False

    def test_process_results_creates_riders(self, db_session, mock_scraper):
        """Test that _process_results creates new riders."""
        updater = DailyUpdater(db_session, mock_scraper)

        # Create a race first
        from src.utils.db_helpers import add_race
        race = add_race(
            db_session,
            name='Test Race',
            date=datetime.now(),
            characteristics={
                'flat_weight': 0.5,
                'cobbles_weight': 0.0,
                'mountain_weight': 0.8,
                'time_trial_weight': 0.0,
                'sprint_weight': 0.2,
                'gc_weight': 0.6,
                'one_day_weight': 0.0,
                'endurance_weight': 0.7
            }
        )

        results = [
            {'rider_name': 'New Rider 1', 'team': 'Team A', 'position': 1},
            {'rider_name': 'New Rider 2', 'team': 'Team B', 'position': 2},
        ]

        added = updater._process_results(race.id, results)

        assert added == 2
        assert updater.stats['riders_added'] == 2

        # Verify riders were created
        assert db_session.query(Rider).filter(Rider.name == 'New Rider 1').first() is not None
        assert db_session.query(Rider).filter(Rider.name == 'New Rider 2').first() is not None

    def test_process_results_uses_existing_riders(self, db_session, mock_scraper):
        """Test that _process_results uses existing riders."""
        updater = DailyUpdater(db_session, mock_scraper)

        # Create existing rider
        from src.utils.db_helpers import add_rider, add_race
        existing_rider = add_rider(db_session, name='Existing Rider', team='Team X')

        race = add_race(
            db_session,
            name='Test Race',
            date=datetime.now(),
            characteristics={'flat_weight': 0.5, 'cobbles_weight': 0.0,
                           'mountain_weight': 0.8, 'time_trial_weight': 0.0,
                           'sprint_weight': 0.2, 'gc_weight': 0.6,
                           'one_day_weight': 0.0, 'endurance_weight': 0.7}
        )

        results = [
            {'rider_name': 'Existing Rider', 'team': 'Team X', 'position': 1},
        ]

        added = updater._process_results(race.id, results)

        assert added == 1
        assert updater.stats['riders_added'] == 0  # Should not create new rider

    @patch.object(DailyUpdater, '_process_race')
    def test_run_daily_update_no_races(self, mock_process_race, db_session, mock_scraper):
        """Test daily update when no races are found."""
        mock_scraper.get_today_races.return_value = []

        updater = DailyUpdater(db_session, mock_scraper)
        stats = updater.run_daily_update(date.today())

        assert stats['races_processed'] == 0
        assert 'No races found' in stats.get('message', '')
        mock_process_race.assert_not_called()

    @patch.object(DailyUpdater, '_process_race')
    def test_run_daily_update_with_races(self, mock_process_race, db_session, mock_scraper):
        """Test daily update with races found."""
        mock_scraper.get_today_races.return_value = [
            {'name': 'Race 1', 'url': 'http://test.com/race1', 'date': date.today()},
            {'name': 'Race 2', 'url': 'http://test.com/race2', 'date': date.today()},
        ]

        updater = DailyUpdater(db_session, mock_scraper)
        stats = updater.run_daily_update(date.today())

        assert stats['races_processed'] == 2
        assert mock_process_race.call_count == 2

    @patch.object(DailyUpdater, '_process_race')
    def test_run_daily_update_handles_failures(self, mock_process_race, db_session, mock_scraper):
        """Test that daily update handles race processing failures."""
        mock_scraper.get_today_races.return_value = [
            {'name': 'Good Race', 'url': 'http://test.com/race1', 'date': date.today()},
            {'name': 'Bad Race', 'url': 'http://test.com/race2', 'date': date.today()},
        ]

        # Make second race fail
        def side_effect(race_info):
            if race_info['name'] == 'Bad Race':
                raise ValueError("Test error")

        mock_process_race.side_effect = side_effect

        updater = DailyUpdater(db_session, mock_scraper)
        stats = updater.run_daily_update(date.today())

        assert stats['races_processed'] == 1
        assert stats['races_failed'] == 1
        assert len(stats['errors']) == 1


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
