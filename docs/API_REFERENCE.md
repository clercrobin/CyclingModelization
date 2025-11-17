# API Reference - Cycling Rating System

**Version**: 2.0.0
**Last Updated**: 2024-11-16

---

## Table of Contents

1. [Overview](#overview)
2. [Models](#models)
3. [Services](#services)
4. [Utilities](#utilities)
5. [Configuration](#configuration)
6. [Examples](#examples)

---

## Overview

This document provides complete API reference for the Cycling Rating System's Python modules.

### Import Convention

```python
# Models
from src.models import Rider, RiderRating, Race, RaceResult, RaceCharacteristics
from src.models import SessionLocal, init_db

# Services
from src.services.rating_engine import RatingEngine
from src.services.daily_updater import DailyUpdater
from src.services.procyclingstats_scraper import ProCyclingStatsScraper

# Utilities
from src.utils.db_helpers import add_rider, add_race, add_race_result, get_top_riders
from src.utils.race_templates import RaceTemplates
from src.utils.csv_importer import CSVImporter

# Configuration
from config.settings import settings
```

---

## Models

### Rider

Represents a professional cyclist.

#### Class Definition

```python
class Rider(Base):
    """Professional cyclist model."""

    __tablename__ = "riders"

    id: int  # Primary key
    pcs_id: Optional[str]  # ProCyclingStats ID
    name: str  # Full name (required)
    country: Optional[str]  # Country code (e.g., "FRA")
    team: Optional[str]  # Current team name
    birth_date: Optional[datetime]  # Date of birth
    created_at: datetime  # Record creation timestamp
    updated_at: datetime  # Last update timestamp

    # Relationships
    ratings: RiderRating  # One-to-one
    rating_history: List[RatingHistory]  # One-to-many
    race_results: List[RaceResult]  # One-to-many
```

#### Example Usage

```python
# Create a new rider
rider = Rider(
    name="Tadej Pogačar",
    team="UAE Team Emirates",
    country="SVN",
    pcs_id="tadej-pogacar"
)
db.add(rider)
db.commit()

# Query riders
pogacar = db.query(Rider).filter(Rider.name == "Tadej Pogačar").first()
all_riders = db.query(Rider).all()
slovenian_riders = db.query(Rider).filter(Rider.country == "SVN").all()
```

---

### RiderRating

Stores current ratings for a rider across all dimensions.

#### Class Definition

```python
class RiderRating(Base):
    """Current ratings for each rider."""

    __tablename__ = "rider_ratings"

    id: int  # Primary key
    rider_id: int  # Foreign key to Rider (unique)

    # Rating dimensions (1000-2500 scale)
    flat: int = 1500
    cobbles: int = 1500
    mountain: int = 1500
    time_trial: int = 1500
    sprint: int = 1500
    gc: int = 1500  # General Classification
    one_day: int = 1500
    endurance: int = 1500
    overall: int = 1500  # Weighted average

    # Statistics
    races_count: int = 0
    wins_count: int = 0
    podiums_count: int = 0

    updated_at: datetime

    # Relationships
    rider: Rider  # Many-to-one
```

#### Methods

```python
def to_dict(self) -> Dict[str, int]:
    """Convert ratings to dictionary.

    Returns:
        Dictionary mapping dimension names to ratings
    """
```

#### Example Usage

```python
# Get rider's ratings
rating = db.query(RiderRating).filter(RiderRating.rider_id == 1).first()

# Access dimensions
print(f"Mountain: {rating.mountain}")
print(f"Sprint: {rating.sprint}")
print(f"Overall: {rating.overall}")

# Get as dictionary
ratings_dict = rating.to_dict()
# {'flat': 1520, 'mountain': 1650, 'sprint': 1480, ...}

# Update a rating
rating.mountain = 1700
rating.overall = calculate_overall(rating)
db.commit()
```

---

### Race

Represents a cycling race or stage.

#### Class Definition

```python
class Race(Base):
    """Cycling race or stage model."""

    __tablename__ = "races"

    id: int  # Primary key
    pcs_id: Optional[str]  # ProCyclingStats ID
    name: str  # Race name (required)
    category: RaceCategory  # Race classification
    date: datetime  # Race date (required)
    season: int  # Year
    country: Optional[str]  # Country code
    is_stage_race: bool = False  # Multi-day race
    stage_number: Optional[int]  # Stage number if applicable
    parent_race_id: Optional[int]  # FK to parent race
    created_at: datetime
    updated_at: datetime

    # Relationships
    characteristics: RaceCharacteristics  # One-to-one
    results: List[RaceResult]  # One-to-many
    stages: List[Race]  # One-to-many (self-referential)
```

#### RaceCategory Enum

```python
class RaceCategory(enum.Enum):
    GT = "GT"  # Grand Tour
    MONUMENT = "Monument"  # Five Monuments
    WC = "WC"  # World Championship
    WT = "WT"  # World Tour
    PROSERIES = "ProSeries"  # UCI ProSeries
    OTHERS = "Others"  # Regional/national
```

#### Example Usage

```python
# Create a race
race = Race(
    name="Tour de France - Stage 15",
    date=datetime(2024, 7, 14),
    category=RaceCategory.GT,
    season=2024,
    country="FRA"
)
db.add(race)
db.commit()

# Query races
recent_races = db.query(Race).order_by(Race.date.desc()).limit(10).all()
gt_races = db.query(Race).filter(Race.category == RaceCategory.GT).all()
```

---

### RaceCharacteristics

Defines which rider dimensions are tested in a race.

#### Class Definition

```python
class RaceCharacteristics(Base):
    """Race characteristics (terrain, profile, etc.)."""

    __tablename__ = "race_characteristics"

    id: int  # Primary key
    race_id: int  # Foreign key to Race (unique)

    # Dimension weights (0.0 to 1.0)
    flat_weight: float = 0.0
    cobbles_weight: float = 0.0
    mountain_weight: float = 0.0
    time_trial_weight: float = 0.0
    sprint_weight: float = 0.0
    gc_weight: float = 0.0
    one_day_weight: float = 0.0
    endurance_weight: float = 0.0

    # Physical characteristics
    distance_km: Optional[float]
    elevation_gain_m: Optional[float]
    avg_gradient: Optional[float]

    # Relationship
    race: Race  # Many-to-one
```

#### Methods

```python
def to_dict(self) -> Dict[str, float]:
    """Convert characteristics to dictionary."""
```

#### Example Usage

```python
# Mountain stage characteristics
characteristics = RaceCharacteristics(
    race_id=race.id,
    flat_weight=0.1,
    cobbles_weight=0.0,
    mountain_weight=1.0,
    time_trial_weight=0.0,
    sprint_weight=0.0,
    gc_weight=0.9,
    one_day_weight=0.0,
    endurance_weight=0.8,
    distance_km=180.5,
    elevation_gain_m=4500
)
db.add(characteristics)
db.commit()
```

---

### RaceResult

Records a rider's result in a race.

#### Class Definition

```python
class RaceResult(Base):
    """Rider's result in a race."""

    __tablename__ = "race_results"

    id: int  # Primary key
    race_id: int  # Foreign key to Race
    rider_id: int  # Foreign key to Rider
    position: int  # Finishing position (required)
    time_seconds: Optional[int]  # Finish time
    time_behind_seconds: Optional[int]  # Time behind winner
    points: int = 0  # Points earned
    did_not_finish: bool = False  # DNF status
    did_not_start: bool = False  # DNS status
    created_at: datetime

    # Relationships
    race: Race
    rider: Rider
```

#### Example Usage

```python
# Add a result
result = RaceResult(
    race_id=race.id,
    rider_id=rider.id,
    position=1,
    time_seconds=14400,  # 4 hours
    time_behind_seconds=0
)
db.add(result)
db.commit()

# Query results for a race
results = db.query(RaceResult).filter(
    RaceResult.race_id == race_id
).order_by(RaceResult.position).all()

# Get rider's recent results
rider_results = db.query(RaceResult).filter(
    RaceResult.rider_id == rider_id
).order_by(RaceResult.created_at.desc()).limit(10).all()
```

---

### RatingHistory

Tracks rating changes over time.

#### Class Definition

```python
class RatingHistory(Base):
    """Historical rating snapshots."""

    __tablename__ = "rating_history"

    id: int  # Primary key
    rider_id: int  # Foreign key to Rider
    race_id: Optional[int]  # Foreign key to Race
    date: datetime  # Snapshot date
    ratings: Dict  # JSON field with all ratings
    change_reason: Optional[str]  # Why ratings changed

    # Relationships
    rider: Rider
    race: Race
```

#### Example Usage

```python
# Get rider's rating history
history = db.query(RatingHistory).filter(
    RatingHistory.rider_id == rider_id
).order_by(RatingHistory.date.desc()).all()

# Create history entry
history_entry = RatingHistory(
    rider_id=rider.id,
    race_id=race.id,
    date=datetime.now(),
    ratings={'flat': 1520, 'mountain': 1650, ...},
    change_reason=f"Race result: {race.name} (P{position})"
)
db.add(history_entry)
db.commit()
```

---

## Services

### RatingEngine

Calculates and updates rider ratings using ELO-based algorithm.

#### Class Definition

```python
class RatingEngine:
    """Rating calculation engine."""

    def __init__(self, db: Session):
        """Initialize with database session.

        Args:
            db: SQLAlchemy session
        """

    def calculate_expected_score(
        self,
        rating_a: int,
        rating_b: int
    ) -> float:
        """Calculate ELO expected score.

        Args:
            rating_a: Rating of rider A
            rating_b: Rating of rider B (or avg of opponents)

        Returns:
            Expected score (0.0 to 1.0)
        """

    def calculate_performance_score(
        self,
        position: int,
        total_riders: int
    ) -> float:
        """Calculate performance score based on position.

        Args:
            position: Finishing position (1 = winner)
            total_riders: Total riders in race

        Returns:
            Performance score (0.0 to 1.0)
        """

    def get_race_importance_multiplier(self, race: Race) -> float:
        """Get importance multiplier for race category.

        Args:
            race: Race object

        Returns:
            Multiplier (GT: 2.0, Monument: 1.8, ...)
        """

    def calculate_rating_change(
        self,
        current_rating: int,
        expected_score: float,
        actual_score: float,
        importance_multiplier: float
    ) -> int:
        """Calculate rating change using ELO formula.

        Args:
            current_rating: Current rating
            expected_score: Expected performance
            actual_score: Actual performance
            importance_multiplier: Race importance

        Returns:
            Rating change (can be negative)
        """

    def update_ratings_for_race(self, race_id: int) -> Dict:
        """Update all rider ratings for a race.

        Args:
            race_id: ID of the race

        Returns:
            Dictionary with update statistics

        Raises:
            ValueError: If race not found or has no characteristics
        """

    def initialize_rider_ratings(self, rider_id: int) -> RiderRating:
        """Initialize ratings for a new rider.

        Args:
            rider_id: ID of the rider

        Returns:
            Created RiderRating object
        """
```

#### Example Usage

```python
from src.services.rating_engine import RatingEngine

# Initialize
db = SessionLocal()
engine = RatingEngine(db)

# Initialize new rider
rating = engine.initialize_rider_ratings(rider.id)

# Update ratings after a race
stats = engine.update_ratings_for_race(race.id)
print(f"Updated {stats['updated']} riders")
print(f"Rating changes: {stats['updates']}")

# Calculate expected score
expected = engine.calculate_expected_score(1600, 1500)
# Returns: 0.64 (64% chance of winning)

# Calculate performance score
performance = engine.calculate_performance_score(position=2, total_riders=150)
# Returns: 0.75 (2nd place performance)
```

---

### ProCyclingStatsScraper

Fetches and parses data from Pro Cycling Stats website.

#### Class Definition

```python
class ProCyclingStatsScraper:
    """Web scraper for Pro Cycling Stats."""

    def __init__(self, rate_limit_delay: float = 2.0):
        """Initialize scraper.

        Args:
            rate_limit_delay: Seconds between requests
        """

    def get_today_races(
        self,
        target_date: Optional[date] = None
    ) -> List[Dict]:
        """Get all races for a specific date.

        Args:
            target_date: Date to fetch (defaults to today)

        Returns:
            List of race info dictionaries
        """

    def fetch_race_details(self, race_url: str) -> Optional[Dict]:
        """Fetch complete race details.

        Args:
            race_url: URL of the race page

        Returns:
            Dictionary with race data or None on error

        Race data dictionary:
        {
            'name': str,
            'date': datetime,
            'category': str,
            'country': str,
            'distance_km': float,
            'elevation_m': float,
            'profile_type': str,
            'results': List[Dict],
            'characteristics': Dict[str, float],
            'url': str
        }
        """

    def search_rider(self, rider_name: str) -> Optional[Dict]:
        """Search for a rider.

        Args:
            rider_name: Name of rider

        Returns:
            Rider information or None
        """
```

#### Private Methods

```python
def _extract_race_name(self, soup: BeautifulSoup) -> str:
    """Extract race name from page."""

def _extract_race_date(self, soup: BeautifulSoup) -> Optional[datetime]:
    """Extract race date from page."""

def _extract_race_category(self, soup: BeautifulSoup) -> str:
    """Extract race category."""

def _extract_distance(self, soup: BeautifulSoup) -> Optional[float]:
    """Extract distance in km."""

def _extract_elevation(self, soup: BeautifulSoup) -> Optional[float]:
    """Extract elevation gain in meters."""

def _extract_profile_type(self, soup: BeautifulSoup) -> str:
    """Determine profile type (flat, mountain, etc.)."""

def _extract_results(self, soup: BeautifulSoup) -> List[Dict]:
    """Extract race results from table."""

def _infer_characteristics(self, race_data: Dict) -> Dict[str, float]:
    """Infer race characteristics from data."""
```

#### Example Usage

```python
from src.services.procyclingstats_scraper import ProCyclingStatsScraper

# Initialize
scraper = ProCyclingStatsScraper(rate_limit_delay=2.0)

# Get today's races
races = scraper.get_today_races()
# Returns: [{'name': '...', 'url': '...', 'date': ...}, ...]

# Fetch race details
race_data = scraper.fetch_race_details(race_url)
# Returns: Complete race data with results and characteristics

# Search for rider
rider_info = scraper.search_rider("Tadej Pogačar")
# Returns: {'name': '...', 'pcs_id': '...', 'url': '...'}
```

---

### DailyUpdater

Orchestrates daily update pipeline.

#### Class Definition

```python
class DailyUpdater:
    """Automated daily update system."""

    def __init__(
        self,
        db: Session,
        scraper: Optional[ProCyclingStatsScraper] = None
    ):
        """Initialize updater.

        Args:
            db: Database session
            scraper: Scraper instance (creates one if None)
        """

    def run_daily_update(
        self,
        target_date: Optional[date] = None
    ) -> Dict:
        """Run complete daily update.

        Args:
            target_date: Date to process (defaults to today)

        Returns:
            Dictionary with statistics:
            {
                'success': bool,
                'date': str,
                'races_processed': int,
                'races_failed': int,
                'riders_added': int,
                'results_added': int,
                'ratings_updated': int,
                'errors': List[Dict]
            }
        """

    def run_historical_update(
        self,
        start_date: date,
        end_date: Optional[date] = None,
        max_days: int = 30
    ) -> List[Dict]:
        """Run updates for historical date range.

        Args:
            start_date: Start date
            end_date: End date (defaults to start + max_days)
            max_days: Maximum days to process

        Returns:
            List of daily statistics dictionaries
        """
```

#### Private Methods

```python
def _process_race(self, race_info: Dict):
    """Process a single race."""

def _process_results(
    self,
    race_id: int,
    results: List[Dict]
) -> int:
    """Process race results."""

def _validate_race_data(self, race_data: Dict) -> bool:
    """Validate race data before processing."""
```

#### Example Usage

```python
from src.services.daily_updater import DailyUpdater

# Initialize
db = SessionLocal()
updater = DailyUpdater(db)

# Run daily update
stats = updater.run_daily_update(date.today())

if stats['success']:
    print(f"✅ Processed {stats['races_processed']} races")
    print(f"✅ Added {stats['riders_added']} new riders")
    print(f"✅ Added {stats['results_added']} results")
else:
    print(f"❌ Update failed: {stats['errors']}")

# Historical update
stats_list = updater.run_historical_update(
    start_date=date(2024, 7, 1),
    end_date=date(2024, 7, 7)
)

total_races = sum(s['races_processed'] for s in stats_list)
print(f"Historical update: {total_races} races processed")
```

---

## Utilities

### Database Helpers

Convenience functions for common database operations.

#### Functions

```python
def add_rider(
    db: Session,
    name: str,
    country: Optional[str] = None,
    team: Optional[str] = None,
    pcs_id: Optional[str] = None
) -> Rider:
    """Add a new rider.

    Args:
        db: Database session
        name: Rider name (required)
        country: Country code
        team: Team name
        pcs_id: ProCyclingStats ID

    Returns:
        Created Rider object (or existing if already exists)
    """

def add_race(
    db: Session,
    name: str,
    date: datetime,
    category: str = "Others",
    country: Optional[str] = None,
    characteristics: Optional[Dict[str, float]] = None,
    pcs_id: Optional[str] = None
) -> Race:
    """Add a new race.

    Args:
        db: Database session
        name: Race name (required)
        date: Race date (required)
        category: Race category
        country: Country code
        characteristics: Race characteristics dictionary
        pcs_id: ProCyclingStats ID

    Returns:
        Created Race object
    """

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
    """Add a race result.

    Args:
        db: Database session
        race_id: Race ID
        rider_id: Rider ID
        position: Finishing position
        time_seconds: Finish time
        time_behind_seconds: Time behind winner
        did_not_finish: DNF status
        did_not_start: DNS status

    Returns:
        Created RaceResult object
    """

def get_top_riders(
    db: Session,
    dimension: str = "overall",
    limit: int = 50
) -> List[Dict]:
    """Get top riders by rating dimension.

    Args:
        db: Database session
        dimension: Rating dimension name
        limit: Number of riders to return

    Returns:
        List of rider dictionaries with ratings and stats
    """

def get_rider_by_name(db: Session, name: str) -> Optional[Rider]:
    """Get rider by name (case-insensitive partial match)."""

def get_race_by_name(db: Session, name: str) -> Optional[Race]:
    """Get race by name (case-insensitive partial match)."""
```

#### Example Usage

```python
from src.utils.db_helpers import (
    add_rider, add_race, add_race_result, get_top_riders
)

# Add rider
rider = add_rider(
    db,
    name="Jonas Vingegaard",
    team="Visma-Lease a Bike",
    country="DEN"
)

# Add race
race = add_race(
    db,
    name="Tour de France Stage 15",
    date=datetime(2024, 7, 14),
    category="GT",
    characteristics={
        'mountain_weight': 1.0,
        'gc_weight': 0.9,
        'endurance_weight': 0.8,
        # ... other weights
    }
)

# Add result
result = add_race_result(
    db,
    race_id=race.id,
    rider_id=rider.id,
    position=2,
    time_seconds=14420,
    time_behind_seconds=20
)

# Get top climbers
top_climbers = get_top_riders(db, dimension="mountain", limit=10)
for rider_data in top_climbers:
    print(f"{rider_data['name']}: {rider_data['rating']}")
```

---

### Race Templates

Predefined race characteristics for common race types.

#### Class

```python
class RaceTemplates:
    """Predefined race characteristic templates."""

    @staticmethod
    def flat_sprint_stage() -> Dict[str, float]:
        """Flat sprint stage characteristics."""

    @staticmethod
    def mountain_stage() -> Dict[str, float]:
        """Mountain stage characteristics."""

    @staticmethod
    def high_mountain_stage() -> Dict[str, float]:
        """High mountain stage (HC climbs)."""

    @staticmethod
    def individual_time_trial() -> Dict[str, float]:
        """Individual time trial characteristics."""

    @staticmethod
    def paris_roubaix() -> Dict[str, float]:
        """Paris-Roubaix (cobbled monument)."""

    @staticmethod
    def milano_sanremo() -> Dict[str, float]:
        """Milano-Sanremo (sprinter's monument)."""

    @classmethod
    def get_all_templates(cls) -> Dict[str, Dict[str, float]]:
        """Get all templates as dictionary."""

    @classmethod
    def get_template(cls, template_name: str) -> Dict[str, float]:
        """Get specific template by name."""
```

#### Available Templates

- Flat Sprint Stage
- Mountain Stage
- High Mountain Stage
- Medium Mountain Stage
- Individual Time Trial
- Mountain Time Trial
- Paris-Roubaix
- Tour of Flanders
- Liège-Bastogne-Liège
- Milano-Sanremo
- Il Lombardia
- World Championship RR
- World Championship ITT
- Hilly Classic
- Sprint Classic
- Prologue
- Team Time Trial

#### Example Usage

```python
from src.utils.race_templates import RaceTemplates

# Get all templates
templates = RaceTemplates.get_all_templates()
print(templates.keys())  # List all template names

# Get specific template
pr_chars = RaceTemplates.paris_roubaix()
# {'cobbles_weight': 1.0, 'flat_weight': 0.6, ...}

# Use in race creation
race = add_race(
    db,
    name="Paris-Roubaix 2024",
    date=datetime(2024, 4, 7),
    category="Monument",
    characteristics=RaceTemplates.paris_roubaix()
)
```

---

### CSV Importer

Bulk data import from CSV files.

#### Class

```python
class CSVImporter:
    """Import data from CSV files."""

    def __init__(self, db: Session):
        """Initialize with database session."""

    def import_riders_from_csv(self, filepath: str) -> Dict:
        """Import riders from CSV.

        CSV Format:
        name,team,country,pcs_id
        Tadej Pogačar,UAE Team Emirates,Slovenia,tadej-pogacar

        Returns:
            {'success': int, 'errors': int, 'error_details': List}
        """

    def import_races_from_csv(self, filepath: str) -> Dict:
        """Import races from CSV.

        CSV Format (with template):
        name,date,category,country,template
        Paris-Roubaix,2024-04-07,Monument,France,Paris-Roubaix

        OR (with custom characteristics):
        name,date,category,country,flat,cobbles,mountain,...
        """

    def import_results_from_csv(
        self,
        filepath: str,
        race_id: int
    ) -> Dict:
        """Import results from CSV.

        CSV Format:
        position,rider_name,time_seconds,time_behind_seconds
        1,Tadej Pogačar,14400,0
        """
```

#### Example Usage

```python
from src.utils.csv_importer import CSVImporter

db = SessionLocal()
importer = CSVImporter(db)

# Import riders
stats = importer.import_riders_from_csv('riders.csv')
print(f"Imported {stats['success']} riders, {stats['errors']} errors")

# Import races
stats = importer.import_races_from_csv('races.csv')

# Import results
stats = importer.import_results_from_csv('results.csv', race_id=123)
```

---

## Configuration

### Settings

Application configuration using Pydantic.

#### Class

```python
class Settings(BaseSettings):
    """Application settings."""

    # Application
    app_name: str = "Cycling Rating System"
    debug: bool = True

    # Environment
    environment: Literal["local", "cloud"] = "local"

    # Database
    database_url: str = "sqlite:///data/cycling_ratings.db"

    # Pro Cycling Stats
    procyclingstats_base_url: str = "https://www.procyclingstats.com"
    fetch_interval_hours: int = 24

    # Rating System
    initial_rating: int = 1500
    k_factor: int = 32
    race_importance_multiplier: dict = {
        "GT": 2.0,
        "Monument": 1.8,
        "WC": 1.7,
        "WT": 1.3,
        "ProSeries": 1.0,
        "Others": 0.7
    }

    # Dimensions
    dimensions: list[str] = [
        "flat", "cobbles", "mountain", "time_trial",
        "sprint", "gc", "one_day", "endurance"
    ]

    class Config:
        env_file = ".env"
```

#### Usage

```python
from config.settings import settings

# Access settings
print(settings.database_url)
print(settings.initial_rating)
print(settings.k_factor)

# Modify at runtime
settings.debug = False
settings.k_factor = 40  # More volatile ratings
```

---

## Examples

### Complete Workflow Example

```python
from src.models import SessionLocal, init_db
from src.services.rating_engine import RatingEngine
from src.services.daily_updater import DailyUpdater
from src.utils.db_helpers import add_rider, add_race, add_race_result
from src.utils.race_templates import RaceTemplates
from datetime import datetime

# 1. Initialize database
init_db()
db = SessionLocal()

# 2. Create riders
pogacar = add_rider(db, "Tadej Pogačar", "UAE Team Emirates", "SVN")
vingegaard = add_rider(db, "Jonas Vingegaard", "Visma-Lease a Bike", "DEN")

# 3. Initialize ratings
engine = RatingEngine(db)
engine.initialize_rider_ratings(pogacar.id)
engine.initialize_rider_ratings(vingegaard.id)

# 4. Create a race
race = add_race(
    db,
    name="Tour de France Stage 15",
    date=datetime(2024, 7, 14),
    category="GT",
    country="FRA",
    characteristics=RaceTemplates.mountain_stage()
)

# 5. Add results
add_race_result(db, race.id, pogacar.id, position=1, time_seconds=14400)
add_race_result(db, race.id, vingegaard.id, position=2, time_seconds=14420)

# 6. Update ratings
stats = engine.update_ratings_for_race(race.id)
print(f"Updated {stats['updated']} riders")

# 7. View updated ratings
pogacar_rating = db.query(RiderRating).filter(
    RiderRating.rider_id == pogacar.id
).first()
print(f"Pogačar mountain rating: {pogacar_rating.mountain}")

# 8. Run daily update
updater = DailyUpdater(db)
update_stats = updater.run_daily_update()
print(f"Daily update: {update_stats['races_processed']} races processed")

# 9. Close session
db.close()
```

---

**Document Version**: 1.0
**Last Updated**: 2024-11-16
