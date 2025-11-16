"""
Daily automated update system for fetching and processing race results.

This module handles:
- Daily fetching of race results from Pro Cycling Stats
- Automatic rider discovery and creation
- Race result processing
- Rating updates
- Error handling and logging
"""

import logging
from datetime import datetime, date, timedelta
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.services.procyclingstats_scraper import ProCyclingStatsScraper
from src.services.rating_engine import RatingEngine
from src.utils.db_helpers import add_rider, add_race, add_race_result, get_rider_by_name, get_race_by_name
from src.models import SessionLocal, Rider, Race, RaceResult

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DailyUpdater:
    """
    Automated daily update system for cycling ratings.

    This class handles the complete pipeline:
    1. Fetch today's races from PCS
    2. Extract race details and results
    3. Create/update riders as needed
    4. Store race and results data
    5. Update ratings
    6. Generate update report
    """

    def __init__(self, db: Session, scraper: Optional[ProCyclingStatsScraper] = None):
        """
        Initialize the daily updater.

        Args:
            db: Database session
            scraper: ProCyclingStats scraper instance (creates one if None)
        """
        self.db = db
        self.scraper = scraper or ProCyclingStatsScraper()
        self.rating_engine = RatingEngine(db)
        self.stats = {
            'races_processed': 0,
            'races_failed': 0,
            'riders_added': 0,
            'results_added': 0,
            'ratings_updated': 0,
            'errors': []
        }

    def run_daily_update(self, target_date: Optional[date] = None) -> Dict:
        """
        Run the complete daily update process.

        Args:
            target_date: Date to process (defaults to today)

        Returns:
            Dictionary with update statistics and status
        """
        if target_date is None:
            target_date = date.today()

        logger.info(f"=" * 60)
        logger.info(f"Starting daily update for {target_date}")
        logger.info(f"=" * 60)

        # Reset stats
        self.stats = {
            'races_processed': 0,
            'races_failed': 0,
            'riders_added': 0,
            'results_added': 0,
            'ratings_updated': 0,
            'errors': [],
            'date': target_date.isoformat()
        }

        try:
            # Step 1: Fetch today's races
            logger.info("Step 1: Fetching race list...")
            races = self.scraper.get_today_races(target_date)
            logger.info(f"Found {len(races)} races")

            if not races:
                logger.warning(f"No races found for {target_date}")
                self.stats['message'] = "No races found"
                return self.stats

            # Step 2: Process each race
            logger.info("Step 2: Processing races...")
            for race_info in races:
                try:
                    self._process_race(race_info)
                    self.stats['races_processed'] += 1
                except Exception as e:
                    logger.error(f"Failed to process race {race_info.get('name')}: {e}")
                    self.stats['races_failed'] += 1
                    self.stats['errors'].append({
                        'race': race_info.get('name'),
                        'error': str(e)
                    })

            # Step 3: Generate summary
            logger.info("=" * 60)
            logger.info("Update Summary:")
            logger.info(f"  Races processed: {self.stats['races_processed']}")
            logger.info(f"  Races failed: {self.stats['races_failed']}")
            logger.info(f"  New riders added: {self.stats['riders_added']}")
            logger.info(f"  Results added: {self.stats['results_added']}")
            logger.info(f"  Ratings updated: {self.stats['ratings_updated']}")
            logger.info("=" * 60)

            self.stats['success'] = True
            return self.stats

        except Exception as e:
            logger.error(f"Daily update failed: {e}")
            self.stats['success'] = False
            self.stats['errors'].append({'system': str(e)})
            return self.stats

    def _process_race(self, race_info: Dict):
        """
        Process a single race: fetch details, create race, process results.

        Args:
            race_info: Basic race information from race list
        """
        race_name = race_info.get('name')
        logger.info(f"Processing race: {race_name}")

        # Check if race already exists
        existing_race = get_race_by_name(self.db, race_name)
        if existing_race:
            logger.info(f"Race '{race_name}' already exists, skipping")
            return

        # Fetch full race details
        race_url = race_info.get('url')
        race_data = self.scraper.fetch_race_details(race_url)

        if not race_data:
            raise ValueError(f"Failed to fetch race details from {race_url}")

        # Validate race data
        if not self._validate_race_data(race_data):
            raise ValueError("Invalid race data")

        # Create race in database
        race = add_race(
            self.db,
            name=race_data['name'],
            date=race_data['date'],
            category=race_data['category'],
            country=race_data.get('country'),
            characteristics=race_data['characteristics']
        )

        logger.info(f"Created race: {race.name} (ID: {race.id})")

        # Process results
        results = race_data.get('results', [])
        if not results:
            logger.warning(f"No results found for {race_name}")
            return

        results_added = self._process_results(race.id, results)
        self.stats['results_added'] += results_added

        # Update ratings
        logger.info(f"Updating ratings for {race_name}...")
        try:
            rating_result = self.rating_engine.update_ratings_for_race(race.id)
            self.stats['ratings_updated'] += rating_result.get('updated', 0)
            logger.info(f"Updated ratings for {rating_result.get('updated', 0)} riders")
        except Exception as e:
            logger.error(f"Failed to update ratings: {e}")
            raise

    def _process_results(self, race_id: int, results: List[Dict]) -> int:
        """
        Process race results: create/find riders, add results.

        Args:
            race_id: ID of the race
            results: List of result dictionaries

        Returns:
            Number of results successfully added
        """
        added_count = 0

        for result in results:
            try:
                rider_name = result.get('rider_name')
                if not rider_name:
                    continue

                # Find or create rider
                rider = get_rider_by_name(self.db, rider_name)
                if not rider:
                    logger.info(f"Creating new rider: {rider_name}")
                    rider = add_rider(
                        self.db,
                        name=rider_name,
                        team=result.get('team')
                    )
                    self.rating_engine.initialize_rider_ratings(rider.id)
                    self.stats['riders_added'] += 1

                # Add race result
                position = result.get('position')
                if position:
                    add_race_result(
                        self.db,
                        race_id=race_id,
                        rider_id=rider.id,
                        position=position
                    )
                    added_count += 1

            except Exception as e:
                logger.error(f"Failed to process result for {result.get('rider_name')}: {e}")
                continue

        return added_count

    def _validate_race_data(self, race_data: Dict) -> bool:
        """
        Validate race data before processing.

        Args:
            race_data: Race data dictionary

        Returns:
            True if valid, False otherwise
        """
        required_fields = ['name', 'date', 'category', 'characteristics']

        for field in required_fields:
            if field not in race_data or race_data[field] is None:
                logger.error(f"Missing required field: {field}")
                return False

        # Validate characteristics
        characteristics = race_data.get('characteristics', {})
        required_char_fields = [
            'flat_weight', 'cobbles_weight', 'mountain_weight',
            'time_trial_weight', 'sprint_weight', 'gc_weight',
            'one_day_weight', 'endurance_weight'
        ]

        for field in required_char_fields:
            if field not in characteristics:
                logger.error(f"Missing characteristic: {field}")
                return False

        return True

    def run_historical_update(self, start_date: date, end_date: Optional[date] = None, max_days: int = 30):
        """
        Run updates for a historical date range.

        Args:
            start_date: Start date for historical update
            end_date: End date (defaults to start_date + max_days)
            max_days: Maximum number of days to process
        """
        if end_date is None:
            end_date = min(start_date + timedelta(days=max_days), date.today())

        logger.info(f"Running historical update from {start_date} to {end_date}")

        current_date = start_date
        all_stats = []

        while current_date <= end_date:
            logger.info(f"\nProcessing date: {current_date}")
            stats = self.run_daily_update(current_date)
            all_stats.append(stats)

            current_date += timedelta(days=1)

            # Sleep between days to be respectful
            import time
            time.sleep(5)

        # Summary
        total_races = sum(s.get('races_processed', 0) for s in all_stats)
        total_riders = sum(s.get('riders_added', 0) for s in all_stats)
        total_results = sum(s.get('results_added', 0) for s in all_stats)

        logger.info("\n" + "=" * 60)
        logger.info("Historical Update Summary:")
        logger.info(f"  Date range: {start_date} to {end_date}")
        logger.info(f"  Total races processed: {total_races}")
        logger.info(f"  Total new riders: {total_riders}")
        logger.info(f"  Total results added: {total_results}")
        logger.info("=" * 60)

        return all_stats


def run_daily_update_cli():
    """Command-line interface for running daily updates."""
    import argparse

    parser = argparse.ArgumentParser(description='Run daily update for cycling ratings')
    parser.add_argument('--date', type=str, help='Date to process (YYYY-MM-DD format), defaults to today')
    parser.add_argument('--historical', action='store_true', help='Run historical update')
    parser.add_argument('--start-date', type=str, help='Start date for historical update (YYYY-MM-DD)')
    parser.add_argument('--days', type=int, default=7, help='Number of days for historical update')

    args = parser.parse_args()

    db = SessionLocal()

    try:
        updater = DailyUpdater(db)

        if args.historical:
            if not args.start_date:
                print("Error: --start-date required for historical update")
                return 1

            start_date = datetime.strptime(args.start_date, '%Y-%m-%d').date()
            end_date = start_date + timedelta(days=args.days)

            updater.run_historical_update(start_date, end_date)

        else:
            if args.date:
                target_date = datetime.strptime(args.date, '%Y-%m-%d').date()
            else:
                target_date = date.today()

            stats = updater.run_daily_update(target_date)

            if stats.get('success'):
                print("\n✅ Daily update completed successfully!")
                return 0
            else:
                print("\n❌ Daily update failed!")
                return 1

    except Exception as e:
        logger.error(f"Update failed: {e}")
        return 1

    finally:
        db.close()


if __name__ == '__main__':
    exit(run_daily_update_cli())
