"""CSV import utilities for bulk data loading."""

import csv
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.utils.db_helpers import add_rider, add_race, add_race_result
from src.utils.race_templates import RaceTemplates
from src.services.rating_engine import RatingEngine


class CSVImporter:
    """Import data from CSV files."""

    def __init__(self, db: Session):
        self.db = db
        self.rating_engine = RatingEngine(db)

    def import_riders_from_csv(self, filepath: str) -> Dict[str, int]:
        """
        Import riders from CSV file.

        CSV Format:
        name,team,country,pcs_id
        Tadej Pogačar,UAE Team Emirates,Slovenia,tadej-pogacar
        ...

        Args:
            filepath: Path to CSV file

        Returns:
            Dictionary with import statistics
        """
        success_count = 0
        error_count = 0
        errors = []

        try:
            df = pd.read_csv(filepath)

            for _, row in df.iterrows():
                try:
                    rider = add_rider(
                        self.db,
                        name=row['name'],
                        team=row.get('team'),
                        country=row.get('country'),
                        pcs_id=row.get('pcs_id')
                    )
                    self.rating_engine.initialize_rider_ratings(rider.id)
                    success_count += 1
                except Exception as e:
                    error_count += 1
                    errors.append(f"Row {_ + 1}: {str(e)}")

        except Exception as e:
            return {
                'success': 0,
                'errors': 1,
                'message': f"Failed to read CSV: {str(e)}"
            }

        return {
            'success': success_count,
            'errors': error_count,
            'error_details': errors
        }

    def import_races_from_csv(self, filepath: str) -> Dict[str, int]:
        """
        Import races from CSV file.

        CSV Format:
        name,date,category,country,template
        Paris-Roubaix,2024-04-07,Monument,France,Paris-Roubaix
        ...

        Or with custom characteristics:
        name,date,category,country,flat,cobbles,mountain,tt,sprint,gc,oneday,endurance
        ...

        Args:
            filepath: Path to CSV file

        Returns:
            Dictionary with import statistics
        """
        success_count = 0
        error_count = 0
        errors = []

        try:
            df = pd.read_csv(filepath)

            for _, row in df.iterrows():
                try:
                    # Check if template is specified
                    if 'template' in df.columns and pd.notna(row.get('template')):
                        characteristics = RaceTemplates.get_template(row['template'])
                    else:
                        # Use custom characteristics from CSV
                        characteristics = {
                            'flat_weight': float(row.get('flat', 0)),
                            'cobbles_weight': float(row.get('cobbles', 0)),
                            'mountain_weight': float(row.get('mountain', 0)),
                            'time_trial_weight': float(row.get('tt', 0)),
                            'sprint_weight': float(row.get('sprint', 0)),
                            'gc_weight': float(row.get('gc', 0)),
                            'one_day_weight': float(row.get('oneday', 0)),
                            'endurance_weight': float(row.get('endurance', 0))
                        }

                    race_date = pd.to_datetime(row['date'])

                    race = add_race(
                        self.db,
                        name=row['name'],
                        date=race_date,
                        category=row.get('category', 'Others'),
                        country=row.get('country'),
                        characteristics=characteristics
                    )
                    success_count += 1
                except Exception as e:
                    error_count += 1
                    errors.append(f"Row {_ + 1}: {str(e)}")

        except Exception as e:
            return {
                'success': 0,
                'errors': 1,
                'message': f"Failed to read CSV: {str(e)}"
            }

        return {
            'success': success_count,
            'errors': error_count,
            'error_details': errors
        }

    def import_results_from_csv(self, filepath: str, race_id: int) -> Dict[str, int]:
        """
        Import race results from CSV file.

        CSV Format:
        position,rider_name,time_seconds,time_behind_seconds
        1,Tadej Pogačar,14400,0
        2,Jonas Vingegaard,14420,20
        ...

        Args:
            filepath: Path to CSV file
            race_id: ID of the race these results belong to

        Returns:
            Dictionary with import statistics
        """
        success_count = 0
        error_count = 0
        errors = []

        try:
            df = pd.read_csv(filepath)

            for _, row in df.iterrows():
                try:
                    from src.utils.db_helpers import get_rider_by_name
                    rider = get_rider_by_name(self.db, row['rider_name'])

                    if not rider:
                        raise ValueError(f"Rider '{row['rider_name']}' not found")

                    add_race_result(
                        self.db,
                        race_id=race_id,
                        rider_id=rider.id,
                        position=int(row['position']),
                        time_seconds=int(row.get('time_seconds', 0)) or None,
                        time_behind_seconds=int(row.get('time_behind_seconds', 0)) or None
                    )
                    success_count += 1
                except Exception as e:
                    error_count += 1
                    errors.append(f"Row {_ + 1}: {str(e)}")

        except Exception as e:
            return {
                'success': 0,
                'errors': 1,
                'message': f"Failed to read CSV: {str(e)}"
            }

        return {
            'success': success_count,
            'errors': error_count,
            'error_details': errors
        }


def create_sample_csv_templates():
    """Create sample CSV templates for import."""

    # Riders template
    riders_template = """name,team,country,pcs_id
Tadej Pogačar,UAE Team Emirates,Slovenia,tadej-pogacar
Jonas Vingegaard,Visma-Lease a Bike,Denmark,jonas-vingegaard
Primož Roglič,Red Bull-BORA-hansgrohe,Slovenia,primoz-roglic"""

    # Races template
    races_template = """name,date,category,country,template
Paris-Roubaix,2024-04-07,Monument,France,Paris-Roubaix
Tour de France Stage 15,2024-07-14,GT,France,Mountain Stage
World Championship ITT,2024-09-22,WC,Switzerland,World Championship ITT"""

    # Results template
    results_template = """position,rider_name,time_seconds,time_behind_seconds
1,Tadej Pogačar,14400,0
2,Jonas Vingegaard,14420,20
3,Primož Roglič,14450,50"""

    return {
        'riders': riders_template,
        'races': races_template,
        'results': results_template
    }
