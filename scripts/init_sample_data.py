"""Initialize the database with sample data for testing."""

import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import init_db, SessionLocal
from src.utils.db_helpers import add_rider, add_race, add_race_result
from src.services.rating_engine import RatingEngine


def create_sample_data():
    """Create sample riders, races, and results."""

    print("Initializing database...")
    init_db()

    db = SessionLocal()
    engine = RatingEngine(db)

    try:
        print("\nAdding sample riders...")

        # Add some famous cyclists
        riders = [
            ("Tadej Pogačar", "UAE Team Emirates", "Slovenia"),
            ("Jonas Vingegaard", "Visma-Lease a Bike", "Denmark"),
            ("Primož Roglič", "Red Bull-BORA-hansgrohe", "Slovenia"),
            ("Remco Evenepoel", "Soudal Quick-Step", "Belgium"),
            ("Mathieu van der Poel", "Alpecin-Deceuninck", "Netherlands"),
            ("Wout van Aert", "Visma-Lease a Bike", "Belgium"),
            ("Jasper Philipsen", "Alpecin-Deceuninck", "Belgium"),
            ("Filippo Ganna", "INEOS Grenadiers", "Italy"),
            ("Julian Alaphilippe", "Soudal Quick-Step", "France"),
            ("Tom Pidcock", "INEOS Grenadiers", "Great Britain"),
            ("Egan Bernal", "INEOS Grenadiers", "Colombia"),
            ("Richard Carapaz", "EF Education-EasyPost", "Ecuador"),
            ("Aleksandr Vlasov", "Red Bull-BORA-hansgrohe", "Russia"),
            ("Sepp Kuss", "Visma-Lease a Bike", "USA"),
            ("David Gaudu", "Groupama-FDJ", "France"),
        ]

        rider_objects = []
        for name, team, country in riders:
            rider = add_rider(db, name=name, team=team, country=country)
            engine.initialize_rider_ratings(rider.id)
            rider_objects.append(rider)
            print(f"  Added: {name}")

        print(f"\n✅ Added {len(riders)} riders")

        print("\nAdding sample races...")

        # Add sample races with different characteristics
        races_data = [
            {
                'name': 'Tour de France - Stage 15 (Mountain)',
                'date': datetime.now() - timedelta(days=30),
                'category': 'GT',
                'country': 'France',
                'characteristics': {
                    'flat_weight': 0.1,
                    'cobbles_weight': 0.0,
                    'mountain_weight': 0.9,
                    'time_trial_weight': 0.0,
                    'sprint_weight': 0.0,
                    'gc_weight': 0.8,
                    'one_day_weight': 0.0,
                    'endurance_weight': 0.7
                }
            },
            {
                'name': 'Paris-Roubaix',
                'date': datetime.now() - timedelta(days=60),
                'category': 'Monument',
                'country': 'France',
                'characteristics': {
                    'flat_weight': 0.4,
                    'cobbles_weight': 1.0,
                    'mountain_weight': 0.0,
                    'time_trial_weight': 0.2,
                    'sprint_weight': 0.1,
                    'gc_weight': 0.0,
                    'one_day_weight': 1.0,
                    'endurance_weight': 0.8
                }
            },
            {
                'name': 'World Championship ITT',
                'date': datetime.now() - timedelta(days=45),
                'category': 'WC',
                'country': 'Switzerland',
                'characteristics': {
                    'flat_weight': 0.5,
                    'cobbles_weight': 0.0,
                    'mountain_weight': 0.2,
                    'time_trial_weight': 1.0,
                    'sprint_weight': 0.0,
                    'gc_weight': 0.3,
                    'one_day_weight': 0.5,
                    'endurance_weight': 0.4
                }
            },
            {
                'name': 'Milano-Sanremo',
                'date': datetime.now() - timedelta(days=90),
                'category': 'Monument',
                'country': 'Italy',
                'characteristics': {
                    'flat_weight': 0.6,
                    'cobbles_weight': 0.0,
                    'mountain_weight': 0.2,
                    'time_trial_weight': 0.0,
                    'sprint_weight': 0.8,
                    'gc_weight': 0.0,
                    'one_day_weight': 1.0,
                    'endurance_weight': 0.7
                }
            },
        ]

        race_objects = []
        for race_data in races_data:
            race = add_race(
                db,
                name=race_data['name'],
                date=race_data['date'],
                category=race_data['category'],
                country=race_data['country'],
                characteristics=race_data['characteristics']
            )
            race_objects.append(race)
            print(f"  Added: {race_data['name']}")

        print(f"\n✅ Added {len(races_data)} races")

        print("\nAdding race results...")

        # Race 1: Mountain stage - climbers win
        results_1 = [
            (rider_objects[0], 1),  # Pogačar
            (rider_objects[1], 2),  # Vingegaard
            (rider_objects[2], 3),  # Roglič
            (rider_objects[3], 4),  # Evenepoel
            (rider_objects[10], 5), # Bernal
            (rider_objects[11], 6), # Carapaz
            (rider_objects[12], 7), # Vlasov
            (rider_objects[13], 8), # Kuss
            (rider_objects[14], 9), # Gaudu
            (rider_objects[9], 10),  # Pidcock
        ]

        for rider, position in results_1:
            add_race_result(db, race_id=race_objects[0].id, rider_id=rider.id, position=position)

        print(f"  Added results for {race_objects[0].name}")

        # Race 2: Paris-Roubaix - classics specialists
        results_2 = [
            (rider_objects[4], 1),  # Van der Poel
            (rider_objects[5], 2),  # Van Aert
            (rider_objects[9], 3),  # Pidcock
            (rider_objects[8], 4),  # Alaphilippe
            (rider_objects[6], 5),  # Philipsen
            (rider_objects[0], 12), # Pogačar
        ]

        for rider, position in results_2:
            add_race_result(db, race_id=race_objects[1].id, rider_id=rider.id, position=position)

        print(f"  Added results for {race_objects[1].name}")

        # Race 3: Time Trial - TT specialists
        results_3 = [
            (rider_objects[7], 1),  # Ganna
            (rider_objects[3], 2),  # Evenepoel
            (rider_objects[0], 3),  # Pogačar
            (rider_objects[1], 4),  # Vingegaard
            (rider_objects[2], 5),  # Roglič
            (rider_objects[5], 6),  # Van Aert
        ]

        for rider, position in results_3:
            add_race_result(db, race_id=race_objects[2].id, rider_id=rider.id, position=position)

        print(f"  Added results for {race_objects[2].name}")

        # Race 4: Sprint finish
        results_4 = [
            (rider_objects[6], 1),  # Philipsen
            (rider_objects[5], 2),  # Van Aert
            (rider_objects[4], 3),  # Van der Poel
            (rider_objects[8], 4),  # Alaphilippe
            (rider_objects[0], 8),  # Pogačar
        ]

        for rider, position in results_4:
            add_race_result(db, race_id=race_objects[3].id, rider_id=rider.id, position=position)

        print(f"  Added results for {race_objects[3].name}")

        print("\n✅ Added race results")

        print("\nUpdating ratings based on results...")

        for race in race_objects:
            result = engine.update_ratings_for_race(race.id)
            print(f"  Updated ratings for {race.name}: {result['updated']} riders")

        print("\n✅ Sample data initialization complete!")
        print("\nYou can now run the application with: streamlit run app.py")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_sample_data()
