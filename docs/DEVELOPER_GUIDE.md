# Cycling Rating System - Developer Guide

**Version 2.0.0** | **Last Updated: 2024-11-17**

This guide is for developers who want to contribute to, extend, or deploy the Cycling Rating System.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Development Workflow](#development-workflow)
5. [Adding New Features](#adding-new-features)
6. [Testing](#testing)
7. [Database Management](#database-management)
8. [Code Style](#code-style)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [Troubleshooting Development Issues](#troubleshooting-development-issues)

---

## Development Setup

### Prerequisites

- **Python 3.9+** (tested on 3.9, 3.10, 3.11)
- **pip** for package management
- **Git** for version control
- **virtualenv** or **venv** (recommended)
- **SQLite** (included with Python)
- **PostgreSQL** (optional, for production deployment)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CyclingModelization
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database:**
   ```bash
   python -c "from src.models.base import init_db; init_db()"
   ```

6. **Load sample data (optional):**
   ```bash
   python scripts/init_sample_data.py
   ```

7. **Run the application:**
   ```bash
   streamlit run app.py
   ```

### Development Dependencies

Install additional development tools:

```bash
pip install pytest pytest-cov pytest-mock black flake8 mypy
```

**Tool purposes:**
- **pytest** - Testing framework
- **pytest-cov** - Test coverage reporting
- **pytest-mock** - Mocking for tests
- **black** - Code formatting
- **flake8** - Linting
- **mypy** - Type checking (optional)

---

## Project Structure

```
CyclingModelization/
├── app.py                          # Main Streamlit application entry point
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
│
├── config/
│   └── settings.py                 # Application configuration (Pydantic)
│
├── src/                            # Source code
│   ├── models/                     # Database models (SQLAlchemy ORM)
│   │   ├── base.py                 # Database engine, session, initialization
│   │   ├── rider.py                # Rider, RiderRating, RatingHistory models
│   │   └── race.py                 # Race, RaceCharacteristics, RaceResult models
│   │
│   ├── services/                   # Business logic layer
│   │   ├── rating_engine.py        # ELO rating calculation engine
│   │   ├── procyclingstats_scraper.py  # Pro Cycling Stats web scraper
│   │   ├── daily_updater.py        # Daily automation pipeline
│   │   └── data_fetcher.py         # Data fetching utilities (legacy)
│   │
│   └── utils/                      # Utility functions
│       ├── db_helpers.py           # Database CRUD operations
│       ├── race_templates.py       # Predefined race characteristic templates
│       └── csv_importer.py         # CSV bulk import utilities
│
├── pages/                          # Streamlit pages (multi-page app)
│   ├── 1_📊_Rankings.py           # Rankings display page
│   ├── 2_👤_Rider_Profile.py      # Individual rider analysis
│   ├── 3_📝_Manage_Data.py        # Data management interface
│   ├── 4_📈_Analytics.py          # System analytics
│   ├── 5_📥_Import_Data.py        # CSV import interface
│   └── 6_⚙️_System_Monitor.py    # System health and manual updates
│
├── scripts/                        # Utility scripts
│   ├── init_sample_data.py         # Initialize sample data
│   ├── run_daily_update.py         # Manual daily update CLI
│   ├── schedule_daily_updates.sh   # Cron job installer (Linux/Mac)
│   └── test_system.py              # System validation tests
│
├── tests/                          # Test suite
│   ├── conftest.py                 # Pytest fixtures and configuration
│   ├── test_rating_engine.py       # Rating engine tests (8 tests)
│   ├── test_scraper.py             # Web scraper tests (15 tests)
│   └── test_daily_updater.py       # Daily updater tests (9 tests)
│
├── data/                           # Data directory (not in Git)
│   └── cycling_ratings.db          # SQLite database file
│
├── logs/                           # Log files (not in Git)
│   ├── daily_update.log            # Daily update logs
│   └── cron.log                    # Cron execution logs
│
└── docs/                           # Documentation
    ├── ARCHITECTURE.md             # System architecture
    ├── API_REFERENCE.md            # API documentation
    ├── TEST_REPORT.md              # Test coverage report
    ├── USER_GUIDE.md               # User documentation
    └── DEVELOPER_GUIDE.md          # This file
```

### Key Files Explained

**app.py**
- Entry point for Streamlit application
- Initializes database on first run
- Sets up navigation and layout

**config/settings.py**
- Centralized configuration using Pydantic
- Environment-specific settings (local vs. cloud)
- Rating system parameters
- Database connection strings

**src/models/**
- SQLAlchemy ORM models
- Database schema definitions
- Relationships between entities

**src/services/**
- Core business logic
- Rating calculations
- Web scraping
- Automation pipelines

**src/utils/**
- Helper functions
- CRUD operations
- Templates and imports

**pages/**
- Streamlit UI pages
- Each file is a separate page in the app
- Naming convention: `N_Icon_PageName.py`

**tests/**
- Pytest test suite
- Fixtures in conftest.py
- Unit and integration tests

---

## Architecture Overview

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Streamlit Web UI                        │
│  (Pages: Rankings, Profile, Manage, Analytics, Import)     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Services Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ RatingEngine │  │   Scraper    │  │ DailyUpdater    │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ SQLAlchemy   │  │  DB Helpers  │  │   Templates     │  │
│  │    ORM       │  │              │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                Database (SQLite/PostgreSQL)                 │
│  Tables: riders, rider_ratings, rating_history,            │
│          races, race_characteristics, race_results         │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

**1. Repository Pattern**
- `db_helpers.py` acts as a repository
- Abstracts database operations
- Provides clean interface for CRUD operations

**2. Service Layer Pattern**
- Business logic separated from UI and data layers
- Services: RatingEngine, Scraper, DailyUpdater
- Reusable across different interfaces (CLI, web, API)

**3. Factory Pattern**
- `RaceTemplates.get_template()` creates race configurations
- Predefined templates for common race types

**4. Strategy Pattern**
- Rating calculation strategies
- Different scraping strategies for different race types

**5. Dependency Injection**
- Services receive database session as parameter
- Makes testing easier (can inject mocks)

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Streamlit** | Web UI framework | 1.31.0 |
| **SQLAlchemy** | ORM and database abstraction | 2.0.25 |
| **Pandas** | Data manipulation | 2.2.0 |
| **BeautifulSoup4** | Web scraping | 4.12.3 |
| **Pytest** | Testing framework | 8.0.0 |
| **Plotly** | Interactive visualizations | 5.18.0 |
| **Pydantic** | Settings validation | 2.6.0 |

---

## Development Workflow

### Branching Strategy

**Main branches:**
- `main` - Production-ready code
- `develop` - Integration branch for features

**Feature branches:**
- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `hotfix/issue-name` - Critical production fixes

### Git Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-new-feature

# Make changes, commit regularly
git add .
git commit -m "Add feature X"

# Push to remote
git push origin feature/my-new-feature

# Create pull request to develop branch
# After review and approval, merge to develop

# Release process
git checkout main
git merge develop
git tag -a v2.1.0 -m "Release version 2.1.0"
git push origin main --tags
```

### Commit Message Convention

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(rating): Add new dimension for gravel racing

Implement gravel_weight dimension in rating calculation.
Update database schema and UI to support gravel races.

Closes #42
```

```
fix(scraper): Handle missing elevation data

Scraper was failing when elevation data not available.
Now defaults to 0 and infers from profile type.

Fixes #38
```

### Development Cycle

1. **Pick an issue** from GitHub issues or create one
2. **Create feature branch** from `develop`
3. **Write tests first** (TDD approach recommended)
4. **Implement feature** with clean, documented code
5. **Run tests** and ensure all pass
6. **Check code style** with black and flake8
7. **Update documentation** if needed
8. **Commit changes** with meaningful messages
9. **Push and create PR** for review
10. **Address review comments** if any
11. **Merge after approval**

---

## Adding New Features

### Example: Adding a New Dimension

Let's add a "gravel" dimension for gravel racing.

#### Step 1: Update Configuration

**config/settings.py:**
```python
class Settings(BaseSettings):
    dimensions: list[str] = [
        "flat", "cobbles", "mountain", "time_trial",
        "sprint", "gc", "one_day", "endurance",
        "gravel"  # NEW
    ]
```

#### Step 2: Update Database Models

**src/models/rider.py:**
```python
class RiderRating(Base):
    # ... existing columns ...
    gravel = Column(Integer, default=1500)  # NEW
```

**src/models/race.py:**
```python
class RaceCharacteristics(Base):
    # ... existing columns ...
    gravel_weight = Column(Float, default=0.0)  # NEW
```

#### Step 3: Create Migration Script

**scripts/add_gravel_dimension.py:**
```python
"""Add gravel dimension to existing database."""
from src.models import SessionLocal, RiderRating, RaceCharacteristics

def upgrade():
    db = SessionLocal()

    # Add column to RiderRating (SQLite requires recreation)
    # For PostgreSQL, use ALTER TABLE

    # Update all existing riders with default gravel rating
    ratings = db.query(RiderRating).all()
    for rating in ratings:
        rating.gravel = 1500

    # Update all existing races with default gravel weight
    characteristics = db.query(RaceCharacteristics).all()
    for char in characteristics:
        char.gravel_weight = 0.0

    db.commit()
    db.close()
    print("Migration complete!")

if __name__ == "__main__":
    upgrade()
```

#### Step 4: Update Rating Engine

**src/services/rating_engine.py:**
```python
def calculate_overall_rating(self, rider_id: int) -> int:
    # ... existing code ...

    overall = (
        rating.flat * 0.15 +
        rating.mountain * 0.20 +
        rating.sprint * 0.10 +
        rating.time_trial * 0.15 +
        rating.gc * 0.20 +
        rating.one_day * 0.10 +
        rating.endurance * 0.10 +
        rating.gravel * 0.10  # NEW (adjust weights as needed)
    )
```

**update_ratings_for_dimension:**
```python
def update_ratings_for_dimension(
    self,
    race_id: int,
    dimension: str  # Can now be "gravel"
) -> Dict:
    # Existing code handles this automatically
    # as long as dimension exists in model
```

#### Step 5: Update Templates

**src/utils/race_templates.py:**
```python
@staticmethod
def unbound_gravel() -> Dict[str, float]:
    """Unbound Gravel 200."""
    return {
        'gravel_weight': 1.0,
        'endurance_weight': 0.9,
        'one_day_weight': 1.0,
        'mountain_weight': 0.3,  # Some climbing
        'flat_weight': 0.0,
        'cobbles_weight': 0.0,
        'time_trial_weight': 0.0,
        'sprint_weight': 0.0,
        'gc_weight': 0.0
    }
```

#### Step 6: Update UI Pages

**pages/1_📊_Rankings.py:**
```python
dimension = st.selectbox(
    "Select Dimension",
    options=[
        "overall", "flat", "cobbles", "mountain",
        "time_trial", "sprint", "gc", "one_day",
        "endurance", "gravel"  # NEW
    ]
)
```

**pages/3_📝_Manage_Data.py:**
```python
# Add slider for gravel_weight
gravel = st.slider(
    "Gravel Weight",
    min_value=0.0,
    max_value=1.0,
    value=default_chars.get('gravel_weight', 0.0),
    step=0.1
)
```

#### Step 7: Write Tests

**tests/test_rating_engine.py:**
```python
def test_gravel_rating_update(db_session, sample_riders, sample_race):
    """Test that gravel ratings update correctly."""
    engine = RatingEngine(db_session)

    # Initialize riders
    for rider in sample_riders:
        engine.initialize_rider_ratings(rider.id)

    # Set race as gravel race
    race = db_session.query(Race).filter(Race.id == 1).first()
    race.characteristics.gravel_weight = 1.0
    db_session.commit()

    # Add results
    add_race_result(db_session, race_id=1, rider_id=1, position=1)
    add_race_result(db_session, race_id=1, rider_id=2, position=2)

    # Update ratings
    engine.update_ratings_for_race(1)

    # Verify gravel ratings changed
    winner_rating = db_session.query(RiderRating).filter(
        RiderRating.rider_id == 1
    ).first()

    assert winner_rating.gravel > 1500  # Winner's rating increased
```

#### Step 8: Update Documentation

- Update USER_GUIDE.md with gravel dimension explanation
- Update API_REFERENCE.md with new fields
- Add example gravel races to sample data

#### Step 9: Run Migration and Tests

```bash
# Run migration
python scripts/add_gravel_dimension.py

# Run tests
pytest tests/ -v

# Check coverage
pytest tests/ --cov=src --cov-report=term

# Verify in UI
streamlit run app.py
```

### Example: Adding a New Page

Let's add a "Team Rankings" page.

#### Step 1: Create Page File

**pages/7_🏆_Team_Rankings.py:**
```python
"""Team Rankings page."""

import streamlit as st
import pandas as pd
from sqlalchemy import func
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import SessionLocal, Rider, RiderRating

st.set_page_config(page_title="Team Rankings", page_icon="🏆", layout="wide")

st.title("🏆 Team Rankings")

db = SessionLocal()

# Get average ratings by team
team_ratings = (
    db.query(
        Rider.team,
        func.avg(RiderRating.overall).label('avg_rating'),
        func.count(Rider.id).label('rider_count')
    )
    .join(RiderRating, Rider.id == RiderRating.rider_id)
    .filter(Rider.team.isnot(None))
    .filter(RiderRating.races_count > 0)
    .group_by(Rider.team)
    .order_by(func.avg(RiderRating.overall).desc())
    .all()
)

# Display results
if team_ratings:
    data = []
    for team, avg_rating, rider_count in team_ratings:
        data.append({
            'Team': team,
            'Average Rating': round(avg_rating),
            'Riders': rider_count
        })

    df = pd.DataFrame(data)
    st.dataframe(df, use_container_width=True, hide_index=True)
else:
    st.info("No team data available")

db.close()
```

#### Step 2: Test the Page

```bash
streamlit run app.py
# Navigate to Team Rankings page
```

---

## Testing

### Test Structure

```
tests/
├── conftest.py              # Fixtures and configuration
├── test_rating_engine.py    # Rating calculation tests
├── test_scraper.py          # Web scraper tests
└── test_daily_updater.py    # Automation tests
```

### Writing Tests

**Use pytest fixtures from conftest.py:**

```python
def test_my_feature(db_session, sample_riders):
    """Test description."""
    # db_session: Fresh database session
    # sample_riders: List of 3 sample riders

    # Arrange
    rider = sample_riders[0]

    # Act
    result = my_function(db_session, rider.id)

    # Assert
    assert result is not None
    assert result.some_property == expected_value
```

**Available fixtures:**
- `db_session` - Clean database session for each test
- `sample_riders` - 3 test riders
- `sample_race` - 1 test race with characteristics
- `mock_scraper` - Mocked ProCyclingStatsScraper

**Test categories:**

1. **Unit Tests** - Test individual functions
   ```python
   def test_calculate_expected_score():
       engine = RatingEngine(db_session)
       score = engine.calculate_expected_score(1500, 1500)
       assert score == 0.5  # Equal ratings = 50% expected
   ```

2. **Integration Tests** - Test component interactions
   ```python
   def test_complete_rating_workflow(db_session, sample_riders, sample_race):
       # Test full workflow: add results → update ratings → verify
       engine = RatingEngine(db_session)
       # ... add results ...
       result = engine.update_ratings_for_race(1)
       assert result['updated'] > 0
   ```

3. **Mock Tests** - Test with external dependencies mocked
   ```python
   def test_daily_update_with_mock(db_session, mock_scraper):
       # Mock scraper returns fake data
       updater = DailyUpdater(db_session, mock_scraper)
       stats = updater.run_daily_update(date.today())
       assert stats['success']
   ```

### Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_rating_engine.py -v

# Run specific test
pytest tests/test_rating_engine.py::test_calculate_expected_score -v

# Run with coverage
pytest tests/ --cov=src --cov-report=term-missing

# Run with coverage report (HTML)
pytest tests/ --cov=src --cov-report=html
open htmlcov/index.html  # View in browser

# Run only fast tests (exclude slow integration tests)
pytest tests/ -v -m "not slow"
```

### Test Coverage Goals

- **Overall:** 80%+ coverage
- **Critical components:** 90%+ coverage
  - RatingEngine
  - Database models
  - DB helpers

- **Less critical:** 60%+ coverage
  - UI pages
  - Utilities

### Mocking External Dependencies

**Mock Pro Cycling Stats requests:**

```python
@pytest.fixture
def mock_pcs_response():
    return """
    <html>
        <div class="result">
            <a href="/rider/tadej-pogacar">Tadej Pogačar</a>
            <span class="position">1</span>
        </div>
    </html>
    """

def test_scraper_with_mock(mock_pcs_response, monkeypatch):
    def mock_get(*args, **kwargs):
        class MockResponse:
            text = mock_pcs_response
            status_code = 200
        return MockResponse()

    monkeypatch.setattr(requests, 'get', mock_get)

    scraper = ProCyclingStatsScraper()
    result = scraper.fetch_race_details("https://example.com/race")
    assert result is not None
```

---

## Database Management

### Database Schema

See [ARCHITECTURE.md](ARCHITECTURE.md) for complete schema documentation.

**Core tables:**
- `riders` - Rider information
- `rider_ratings` - Current ratings (one per rider)
- `rating_history` - Historical snapshots
- `races` - Race information
- `race_characteristics` - Race terrain weights
- `race_results` - Individual results

### Migrations

Currently using manual migration scripts. Future: Alembic integration.

**Creating a migration:**

```python
# scripts/migrations/001_add_new_column.py

from src.models import SessionLocal, Rider

def upgrade():
    """Apply migration."""
    db = SessionLocal()
    # Perform schema changes
    db.commit()
    db.close()

def downgrade():
    """Rollback migration."""
    db = SessionLocal()
    # Revert schema changes
    db.commit()
    db.close()

if __name__ == "__main__":
    upgrade()
```

**Running migrations:**

```bash
python scripts/migrations/001_add_new_column.py
```

### Database Backup

**SQLite:**
```bash
# Backup
cp data/cycling_ratings.db data/cycling_ratings_backup_$(date +%Y%m%d).db

# Restore
cp data/cycling_ratings_backup_20240714.db data/cycling_ratings.db
```

**PostgreSQL:**
```bash
# Backup
pg_dump cycling_ratings > backup_$(date +%Y%m%d).sql

# Restore
psql cycling_ratings < backup_20240714.sql
```

### Database Inspection

**Using Python:**
```python
from src.models import SessionLocal, Rider, Race

db = SessionLocal()

# Count records
print(f"Riders: {db.query(Rider).count()}")
print(f"Races: {db.query(Race).count()}")

# Query data
riders = db.query(Rider).limit(5).all()
for rider in riders:
    print(f"{rider.name} - {rider.team}")

db.close()
```

**Using SQLite CLI:**
```bash
sqlite3 data/cycling_ratings.db

# List tables
.tables

# Describe table
.schema riders

# Query data
SELECT name, team FROM riders LIMIT 5;

# Exit
.quit
```

### Performance Optimization

**Indexes:**

Currently, SQLAlchemy creates indexes on foreign keys automatically. Add custom indexes as needed:

```python
# In model definition
class Rider(Base):
    __tablename__ = 'riders'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, index=True)  # Add index
```

**Query optimization:**

```python
# Bad: N+1 query problem
riders = db.query(Rider).all()
for rider in riders:
    rating = rider.current_rating  # Separate query for each rider

# Good: Eager loading
from sqlalchemy.orm import joinedload

riders = db.query(Rider).options(
    joinedload(Rider.current_rating)
).all()
for rider in riders:
    rating = rider.current_rating  # Already loaded
```

---

## Code Style

### Python Style Guide

Follow **PEP 8** with these specifics:

**Formatting:**
- **Line length:** 88 characters (Black default)
- **Indentation:** 4 spaces
- **Quotes:** Double quotes for strings
- **Import order:** Standard lib, third-party, local

**Naming conventions:**
- **Classes:** `PascalCase` (e.g., `RatingEngine`)
- **Functions:** `snake_case` (e.g., `calculate_rating`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RATING`)
- **Private:** `_leading_underscore` (e.g., `_internal_method`)

**Docstrings:**

```python
def calculate_rating_change(
    self,
    current_rating: int,
    expected_score: float,
    actual_score: float
) -> int:
    """Calculate rating change based on ELO algorithm.

    Args:
        current_rating: Current rider rating (1000-2500)
        expected_score: Expected performance (0.0-1.0)
        actual_score: Actual performance (0.0-1.0)

    Returns:
        Rating change amount (can be negative)

    Example:
        >>> engine = RatingEngine(db)
        >>> change = engine.calculate_rating_change(1500, 0.5, 1.0)
        >>> print(change)
        16
    """
    change = self.k_factor * (actual_score - expected_score)
    return int(round(change))
```

### Type Hints

Use type hints for function signatures:

```python
from typing import List, Dict, Optional

def get_top_riders(
    db: Session,
    dimension: str = "overall",
    limit: int = 20
) -> List[Tuple[Rider, int]]:
    """Get top riders by dimension."""
    # Implementation
```

### Code Formatting

**Use Black for automatic formatting:**

```bash
# Format entire project
black .

# Format specific file
black src/services/rating_engine.py

# Check without modifying
black --check .
```

**Configuration (.black.toml):**
```toml
[tool.black]
line-length = 88
target-version = ['py39']
include = '\.pyi?$'
exclude = '''
/(
    \.git
  | \.venv
  | build
  | dist
)/
'''
```

### Linting

**Use Flake8:**

```bash
# Check all files
flake8 .

# Check specific file
flake8 src/services/rating_engine.py
```

**Configuration (.flake8):**
```ini
[flake8]
max-line-length = 88
extend-ignore = E203, W503
exclude = .git,__pycache__,venv,build,dist
```

### Import Organization

```python
# Standard library
import os
import sys
from datetime import datetime, date
from typing import List, Dict, Optional

# Third-party
import pandas as pd
import streamlit as st
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

# Local
from src.models import Rider, Race
from src.services.rating_engine import RatingEngine
from config.settings import settings
```

---

## Deployment

### Local Deployment

Already covered in [Development Setup](#development-setup).

### Single Server Deployment (Linux)

**1. Provision server:**
- Ubuntu 20.04+ or Debian 11+
- Minimum 2GB RAM, 20GB storage
- Python 3.9+ installed

**2. Setup application:**

```bash
# Clone repository
git clone <repository-url> /var/www/cycling-ratings
cd /var/www/cycling-ratings

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
nano .env  # Edit configuration

# Initialize database
python -c "from src.models.base import init_db; init_db()"

# Load sample data (optional)
python scripts/init_sample_data.py
```

**3. Setup systemd service:**

**/etc/systemd/system/cycling-ratings.service:**
```ini
[Unit]
Description=Cycling Rating System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/cycling-ratings
Environment="PATH=/var/www/cycling-ratings/venv/bin"
ExecStart=/var/www/cycling-ratings/venv/bin/streamlit run app.py --server.port 8501 --server.address 0.0.0.0

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**4. Start service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable cycling-ratings
sudo systemctl start cycling-ratings
sudo systemctl status cycling-ratings
```

**5. Setup Nginx reverse proxy:**

**/etc/nginx/sites-available/cycling-ratings:**
```nginx
server {
    listen 80;
    server_name cycling-ratings.example.com;

    location / {
        proxy_pass http://localhost:8501;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable and restart:**
```bash
sudo ln -s /etc/nginx/sites-available/cycling-ratings /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**6. Setup SSL with Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d cycling-ratings.example.com
```

**7. Setup daily updates cron:**

```bash
# Edit crontab for www-data user
sudo crontab -u www-data -e

# Add line:
0 2 * * * cd /var/www/cycling-ratings && /var/www/cycling-ratings/venv/bin/python scripts/run_daily_update.py >> logs/cron.log 2>&1
```

### Cloud Deployment

#### Heroku

**1. Install Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

**2. Create app:**
```bash
heroku create cycling-ratings-app
```

**3. Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

**4. Configure environment:**
```bash
heroku config:set ENVIRONMENT=production
heroku config:set K_FACTOR=32
```

**5. Create Procfile:**
```
web: streamlit run app.py --server.port=$PORT --server.address=0.0.0.0
```

**6. Deploy:**
```bash
git push heroku main
```

**7. Run migrations:**
```bash
heroku run python -c "from src.models.base import init_db; init_db()"
```

**8. Setup scheduled updates (Heroku Scheduler):**
```bash
heroku addons:create scheduler:standard
heroku addons:open scheduler
# Add daily job: python scripts/run_daily_update.py
```

#### AWS EC2

Similar to single server deployment, but:
- Use EC2 instance (t2.small minimum)
- RDS PostgreSQL for database
- S3 for backups
- CloudWatch for monitoring
- ELB for load balancing (if needed)

#### Docker

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8501:8501"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/cycling_ratings
    depends_on:
      - db
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cycling_ratings
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy:**
```bash
docker-compose up -d
```

---

## Contributing

### Contribution Workflow

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/cycling-rating-system.git
   ```
3. **Create feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```
4. **Make changes** with tests and documentation
5. **Run tests:**
   ```bash
   pytest tests/ -v
   black .
   flake8 .
   ```
6. **Commit changes:**
   ```bash
   git commit -m "feat: Add my feature"
   ```
7. **Push to fork:**
   ```bash
   git push origin feature/my-feature
   ```
8. **Create Pull Request** to main repository

### Pull Request Guidelines

**PR should include:**
- Clear description of changes
- Reference to related issue (if any)
- Tests for new functionality
- Updated documentation
- No breaking changes (or clearly documented)

**PR checklist:**
- [ ] Tests pass (`pytest tests/ -v`)
- [ ] Code formatted (`black .`)
- [ ] Linting passes (`flake8 .`)
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
- [ ] Backwards compatible (or migration provided)

### Code Review Process

1. **Automated checks** run on PR (tests, linting)
2. **Maintainer reviews** code
3. **Feedback addressed** by contributor
4. **Approval** from maintainer
5. **Merge** to develop branch
6. **Release** in next version

---

## Troubleshooting Development Issues

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'src'`

**Solution:**
```bash
# Ensure you're running from project root
cd /path/to/CyclingModelization

# Or add to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/CyclingModelization"
```

### Database Errors

**Error:** `sqlite3.OperationalError: database is locked`

**Solution:**
- Close all other connections to the database
- Restart Streamlit application
- If persistent, copy database file and work with copy

**Error:** `sqlalchemy.exc.OperationalError: no such table: riders`

**Solution:**
```python
# Reinitialize database
from src.models.base import init_db
init_db()
```

### Test Failures

**Error:** Tests fail with database errors

**Solution:**
```bash
# Clear test database
rm -rf test_data/
pytest tests/ -v
```

**Error:** Mocking not working

**Solution:**
```python
# Ensure pytest-mock is installed
pip install pytest-mock

# Use monkeypatch fixture correctly
def test_with_mock(monkeypatch):
    monkeypatch.setattr(module, 'function', mock_function)
```

### Streamlit Issues

**Error:** Page not updating after code changes

**Solution:**
- Use "Always rerun" option in Streamlit
- Or manually click "Rerun" after changes
- Hard refresh browser (Ctrl+Shift+R)

**Error:** Session state errors

**Solution:**
```python
# Initialize session state properly
if 'key' not in st.session_state:
    st.session_state.key = initial_value
```

---

## Additional Resources

### Documentation
- [Streamlit Documentation](https://docs.streamlit.io/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pytest Documentation](https://docs.pytest.org/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)

### Tools
- [Black Code Formatter](https://black.readthedocs.io/)
- [Flake8 Linter](https://flake8.pycqa.org/)
- [mypy Type Checker](https://mypy.readthedocs.io/)

### Community
- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions and share ideas
- Pull Requests: Contribute code improvements

---

**Happy coding!** 🚴‍♂️💻

For questions or support, please open an issue on GitHub.

**Last Updated:** 2024-11-17
**Version:** 2.0.0
