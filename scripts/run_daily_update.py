#!/usr/bin/env python
"""
Command-line script to run daily updates.

This script can be scheduled with cron or other task schedulers.

Usage:
    python scripts/run_daily_update.py                    # Update today
    python scripts/run_daily_update.py --date 2024-07-14  # Update specific date
    python scripts/run_daily_update.py --historical --start-date 2024-07-01 --days 7
"""

import sys
import os
from datetime import datetime, date, timedelta
import argparse
import logging

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.models import SessionLocal, init_db
from src.services.daily_updater import DailyUpdater

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/daily_update.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Run daily update for cycling ratings'
    )

    parser.add_argument(
        '--date',
        type=str,
        help='Date to process (YYYY-MM-DD format), defaults to today'
    )

    parser.add_argument(
        '--historical',
        action='store_true',
        help='Run historical update for date range'
    )

    parser.add_argument(
        '--start-date',
        type=str,
        help='Start date for historical update (YYYY-MM-DD)'
    )

    parser.add_argument(
        '--days',
        type=int,
        default=7,
        help='Number of days for historical update (default: 7)'
    )

    parser.add_argument(
        '--init-db',
        action='store_true',
        help='Initialize database before update'
    )

    args = parser.parse_args()

    try:
        # Initialize database if requested
        if args.init_db:
            logger.info("Initializing database...")
            init_db()

        # Create database session
        db = SessionLocal()

        try:
            updater = DailyUpdater(db)

            if args.historical:
                # Historical update
                if not args.start_date:
                    logger.error("--start-date required for historical update")
                    return 1

                start_date = datetime.strptime(args.start_date, '%Y-%m-%d').date()
                end_date = start_date + timedelta(days=args.days - 1)

                logger.info(f"Running historical update: {start_date} to {end_date}")
                all_stats = updater.run_historical_update(start_date, end_date)

                # Summary
                total_races = sum(s.get('races_processed', 0) for s in all_stats)
                total_riders = sum(s.get('riders_added', 0) for s in all_stats)

                logger.info(f"\n{'='*60}")
                logger.info("Historical Update Complete")
                logger.info(f"Total races processed: {total_races}")
                logger.info(f"Total new riders: {total_riders}")
                logger.info(f"{'='*60}\n")

                return 0

            else:
                # Single day update
                if args.date:
                    target_date = datetime.strptime(args.date, '%Y-%m-%d').date()
                else:
                    target_date = date.today()

                logger.info(f"Running daily update for {target_date}")
                stats = updater.run_daily_update(target_date)

                if stats.get('success'):
                    logger.info("\n✅ Daily update completed successfully!")
                    logger.info(f"Races processed: {stats.get('races_processed', 0)}")
                    logger.info(f"New riders added: {stats.get('riders_added', 0)}")
                    logger.info(f"Results added: {stats.get('results_added', 0)}")
                    logger.info(f"Ratings updated: {stats.get('ratings_updated', 0)}\n")
                    return 0
                else:
                    logger.error("\n❌ Daily update failed!")
                    if stats.get('errors'):
                        logger.error(f"Errors: {stats['errors']}")
                    return 1

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        return 1


if __name__ == '__main__':
    # Ensure logs directory exists
    os.makedirs('logs', exist_ok=True)

    exit(main())
