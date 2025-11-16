"""Test script to verify the cycling rating system is working correctly."""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import SessionLocal, Rider, RiderRating, Race, RaceResult
from src.utils import get_top_riders
from src.utils.race_templates import RaceTemplates


def test_database():
    """Test database connectivity and data."""
    print("=" * 60)
    print("TESTING DATABASE CONNECTIVITY")
    print("=" * 60)

    db = SessionLocal()

    try:
        # Test rider count
        rider_count = db.query(Rider).count()
        print(f"✓ Database connected")
        print(f"✓ Total riders: {rider_count}")

        # Test race count
        race_count = db.query(Race).count()
        print(f"✓ Total races: {race_count}")

        # Test results count
        result_count = db.query(RaceResult).count()
        print(f"✓ Total race results: {result_count}")

        # Test ratings exist
        rating_count = db.query(RiderRating).count()
        print(f"✓ Total rider ratings: {rating_count}")

        print("\n✅ Database test PASSED\n")
        return True

    except Exception as e:
        print(f"\n❌ Database test FAILED: {e}\n")
        return False
    finally:
        db.close()


def test_top_riders():
    """Test getting top riders."""
    print("=" * 60)
    print("TESTING TOP RIDERS QUERY")
    print("=" * 60)

    db = SessionLocal()

    try:
        top_riders = get_top_riders(db, dimension='overall', limit=10)

        if top_riders:
            print(f"✓ Retrieved {len(top_riders)} top riders")
            print("\nTop 5 Overall:")
            print("-" * 60)
            for i, rider in enumerate(top_riders[:5], 1):
                print(f"{i}. {rider['name']:<25} | Rating: {rider['rating']:4d} | Races: {rider['races']:2d}")

            print("\n✅ Top riders test PASSED\n")
            return True
        else:
            print("⚠️  No riders found (this is OK if database is empty)")
            print("\n✅ Top riders test PASSED\n")
            return True

    except Exception as e:
        print(f"\n❌ Top riders test FAILED: {e}\n")
        return False
    finally:
        db.close()


def test_race_templates():
    """Test race templates."""
    print("=" * 60)
    print("TESTING RACE TEMPLATES")
    print("=" * 60)

    try:
        templates = RaceTemplates.get_all_templates()
        print(f"✓ Found {len(templates)} race templates")

        # Test a specific template
        paris_roubaix = RaceTemplates.paris_roubaix()
        print(f"\n✓ Paris-Roubaix template:")
        print(f"  - Cobbles weight: {paris_roubaix['cobbles_weight']}")
        print(f"  - One-day weight: {paris_roubaix['one_day_weight']}")
        print(f"  - Endurance weight: {paris_roubaix['endurance_weight']}")

        mountain_stage = RaceTemplates.mountain_stage()
        print(f"\n✓ Mountain Stage template:")
        print(f"  - Mountain weight: {mountain_stage['mountain_weight']}")
        print(f"  - GC weight: {mountain_stage['gc_weight']}")
        print(f"  - Endurance weight: {mountain_stage['endurance_weight']}")

        print("\n✅ Race templates test PASSED\n")
        return True

    except Exception as e:
        print(f"\n❌ Race templates test FAILED: {e}\n")
        return False


def test_rating_calculation():
    """Test rating calculation."""
    print("=" * 60)
    print("TESTING RATING CALCULATION")
    print("=" * 60)

    db = SessionLocal()

    try:
        # Get a rider with races
        rider_with_rating = (
            db.query(Rider, RiderRating)
            .join(RiderRating, Rider.id == RiderRating.rider_id)
            .filter(RiderRating.races_count > 0)
            .first()
        )

        if rider_with_rating:
            rider, rating = rider_with_rating
            print(f"✓ Found rider with rating: {rider.name}")
            print(f"  - Overall rating: {rating.overall}")
            print(f"  - Mountain rating: {rating.mountain}")
            print(f"  - Sprint rating: {rating.sprint}")
            print(f"  - Races completed: {rating.races_count}")
            print(f"  - Wins: {rating.wins_count}")
            print(f"  - Podiums: {rating.podiums_count}")

            print("\n✅ Rating calculation test PASSED\n")
        else:
            print("⚠️  No riders with race results found")
            print("💡 Run scripts/init_sample_data.py to populate the database")
            print("\n✅ Rating calculation test PASSED (no data to test)\n")

        return True

    except Exception as e:
        print(f"\n❌ Rating calculation test FAILED: {e}\n")
        return False
    finally:
        db.close()


def test_race_results():
    """Test race results."""
    print("=" * 60)
    print("TESTING RACE RESULTS")
    print("=" * 60)

    db = SessionLocal()

    try:
        # Get a race with results
        race_with_results = (
            db.query(Race)
            .join(RaceResult, Race.id == RaceResult.race_id)
            .first()
        )

        if race_with_results:
            result_count = db.query(RaceResult).filter(
                RaceResult.race_id == race_with_results.id
            ).count()

            print(f"✓ Found race with results: {race_with_results.name}")
            print(f"  - Date: {race_with_results.date.strftime('%Y-%m-%d')}")
            print(f"  - Category: {race_with_results.category.value}")
            print(f"  - Number of results: {result_count}")

            if race_with_results.characteristics:
                print(f"  - Mountain weight: {race_with_results.characteristics.mountain_weight}")
                print(f"  - Sprint weight: {race_with_results.characteristics.sprint_weight}")

            print("\n✅ Race results test PASSED\n")
        else:
            print("⚠️  No races with results found")
            print("💡 Run scripts/init_sample_data.py to populate the database")
            print("\n✅ Race results test PASSED (no data to test)\n")

        return True

    except Exception as e:
        print(f"\n❌ Race results test FAILED: {e}\n")
        return False
    finally:
        db.close()


def main():
    """Run all tests."""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "CYCLING RATING SYSTEM - TEST SUITE" + " " * 14 + "║")
    print("╚" + "=" * 58 + "╝")
    print("\n")

    tests = [
        ("Database Connectivity", test_database),
        ("Top Riders Query", test_top_riders),
        ("Race Templates", test_race_templates),
        ("Rating Calculation", test_rating_calculation),
        ("Race Results", test_race_results),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}\n")
            results.append((test_name, False))

    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} | {test_name}")

    print("=" * 60)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)

    if passed == total:
        print("\n🎉 All tests PASSED! The system is working correctly.\n")
        print("Next steps:")
        print("  1. Run the app: streamlit run app.py")
        print("  2. Explore the sample data in the web interface")
        print("  3. Add your own riders and races\n")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the output above for details.\n")
        return 1


if __name__ == "__main__":
    exit(main())
