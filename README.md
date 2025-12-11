# 🚴 Cycling Rating System

A comprehensive professional cycling rating and analysis system. This application tracks and rates professional cyclists across multiple performance dimensions using an advanced ELO-like algorithm, similar to Pro Cycling Manager.

## 🆕 Version 2.0 - Now with GitHub Pages Support!

The system has been completely rebuilt with a modern architecture:
- **Frontend**: React + Vite + Tailwind CSS (deployed on GitHub Pages)
- **Backend**: Supabase (PostgreSQL + REST API + Edge Functions)
- **Legacy**: Python/Streamlit version still available for local development

![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Streamlit](https://img.shields.io/badge/streamlit-1.31+-red.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### Multi-Dimensional Rating System
- **8 Performance Dimensions**: Flat, Cobbles, Mountain, Time Trial, Sprint, GC, One-Day, Endurance
- **ELO-like Algorithm**: Ratings update based on race results and race characteristics
- **Historical Tracking**: Complete history of rating evolution over time

### Comprehensive Data Management
- **Rider Database**: Store and manage professional cyclist information
- **Race Management**: Define races with custom characteristics
- **Result Tracking**: Record race results and automatically update ratings
- **Batch Import**: Import multiple results at once

### Rich Analytics
- **Interactive Rankings**: View top riders by any dimension
- **Rider Profiles**: Detailed individual rider analysis with radar charts
- **Performance Insights**: Win rates, activity statistics, and more
- **Correlation Analysis**: Understand relationships between different skills

### Cloud-Ready Architecture
- **Local Development**: SQLite database for easy local setup
- **Cloud Migration**: Easy migration to PostgreSQL or other cloud databases
- **Modular Design**: Clean separation of concerns for scalability

## 📋 Table of Contents

- [Quick Start (Web Version)](#-quick-start-web-version)
- [Supabase Setup](#-supabase-setup)
- [Local Development](#-local-development)
- [Legacy Streamlit Version](#-legacy-streamlit-version)
- [Rating System](#-rating-system)
- [Project Structure](#-project-structure)

## 🚀 Quick Start (Web Version)

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works great)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd CyclingModelization/frontend
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migrations in `supabase/migrations/` (in order)
3. Go to **Settings → API** and copy your URL and anon key

### Step 3: Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Run the App

```bash
npm run dev
```

Open `http://localhost:5173` in your browser!

## 🗄️ Supabase Setup

### Running Migrations

In the Supabase SQL Editor, run these files in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_sample_data.sql` - Adds sample riders and races

### Deploy Edge Function (Optional)

For automatic rating calculations, deploy the edge function:

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link your project
supabase login
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy update-ratings
```

### GitHub Pages Deployment

1. Enable GitHub Pages in your repo settings (Settings → Pages → Source: GitHub Actions)
2. Add secrets to your repository:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to `main` branch - deployment is automatic!

## 💻 Local Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

## 🐍 Legacy Streamlit Version

The original Python/Streamlit version is still available for local-only use:

### Prerequisites

- Python 3.9 or higher
- pip package manager

### Installation

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running

```bash
streamlit run app.py
```

The application will open in your default browser at `http://localhost:8501`

### Basic Workflow

1. **Add Riders**
   - Navigate to "Manage Data" → "Add Rider"
   - Enter rider information (name, team, country)
   - Riders are automatically initialized with base ratings (1500)

2. **Add Races**
   - Go to "Manage Data" → "Add Race"
   - Define race characteristics using sliders (0.0-1.0 weights)
   - Higher weights indicate more importance of that dimension

3. **Add Results**
   - Select a race and add results one by one, or
   - Use batch import with CSV format:
     ```
     1,Tadej Pogačar,14400,0
     2,Jonas Vingegaard,14420,20
     3,Primož Roglič,14450,50
     ```

4. **Update Ratings**
   - After adding results, go to "Update Ratings"
   - Select the race and click "Update Ratings"
   - Ratings are recalculated based on performance

5. **View Results**
   - Check "Rankings" for top riders
   - View "Rider Profile" for detailed individual analysis
   - Explore "Analytics" for system-wide insights

## 📖 Usage Guide

### Understanding Race Characteristics

When adding a race, you define weights for each dimension (0.0 to 1.0):

- **Flat Weight**: How much flat terrain matters (e.g., 0.8 for flat stages)
- **Cobbles Weight**: Importance of cobblestone sections (1.0 for Paris-Roubaix)
- **Mountain Weight**: Climbing difficulty (0.9 for mountain stages)
- **Time Trial Weight**: Individual TT component (1.0 for pure TT)
- **Sprint Weight**: Sprint finish importance (0.8 for sprint stages)
- **GC Weight**: Stage race/overall classification relevance
- **One Day Weight**: One-day race characteristics
- **Endurance Weight**: Overall distance/endurance factor

### Race Categories

- **GT** (Grand Tour): Tour de France, Giro d'Italia, Vuelta a España
- **Monument**: Five major one-day races
- **WC** (World Championship): World Championship events
- **WT** (World Tour): UCI World Tour races
- **ProSeries**: UCI ProSeries races
- **Others**: Regional and national races

Categories affect the importance multiplier in rating calculations.

### Rating Interpretation

- **1000-1300**: Amateur/Development level
- **1300-1500**: Professional level
- **1500-1700**: Strong professional
- **1700-1900**: Top tier professional
- **1900-2100**: World class
- **2100+**: Exceptional/GOAT level

## 🧮 Rating System

### Algorithm Overview

The rating system uses a modified ELO algorithm adapted for cycling:

1. **Expected Score Calculation**
   ```
   E = 1 / (1 + 10^((R_opponent - R_rider) / 400))
   ```

2. **Performance Score**
   - Position-based: 1st = 1.0, 2nd = 0.75, 3rd = 0.6, etc.
   - Considers total field size

3. **Rating Change**
   ```
   ΔR = K × I × W × (S_actual - S_expected)
   ```
   Where:
   - K = K-factor (32 by default)
   - I = Race importance multiplier (based on category)
   - W = Dimension weight (from race characteristics)
   - S = Score (actual vs expected)

4. **Multi-Dimensional Update**
   - Each dimension is updated separately based on race characteristics
   - Overall rating is a weighted average of all dimensions

### Key Parameters

You can adjust these in `config/settings.py` or `.env`:

- `INITIAL_RATING`: Starting rating for new riders (default: 1500)
- `K_FACTOR`: Rating volatility (default: 32)
- Race importance multipliers (GT: 2.0, Monument: 1.8, etc.)

## 📁 Project Structure

```
CyclingModelization/
├── app.py                      # Main Streamlit application
├── requirements.txt            # Python dependencies
├── .env.example               # Environment configuration template
│
├── config/
│   └── settings.py            # Application settings
│
├── src/
│   ├── models/                # Database models
│   │   ├── __init__.py
│   │   ├── base.py           # Database configuration
│   │   ├── rider.py          # Rider and rating models
│   │   └── race.py           # Race and result models
│   │
│   ├── services/             # Business logic
│   │   ├── __init__.py
│   │   ├── rating_engine.py  # Rating calculation engine
│   │   └── data_fetcher.py   # Pro Cycling Stats integration
│   │
│   ├── utils/                # Utility functions
│   │   ├── __init__.py
│   │   └── db_helpers.py     # Database helper functions
│   │
│   └── ui/                   # UI components (if needed)
│
├── pages/                    # Streamlit pages
│   ├── 1_📊_Rankings.py
│   ├── 2_👤_Rider_Profile.py
│   ├── 3_📝_Manage_Data.py
│   └── 4_📈_Analytics.py
│
├── scripts/                  # Utility scripts
│   └── init_sample_data.py  # Initialize sample data
│
├── data/                     # Data directory
│   ├── raw/                 # Raw data files
│   └── processed/           # Processed data
│
└── tests/                    # Unit tests
    └── (test files)
```

## ☁️ Cloud Deployment

### Migrating to Cloud Database

1. **Set up a cloud database** (e.g., PostgreSQL on AWS RDS, Google Cloud SQL)

2. **Update environment configuration**:
   ```bash
   # .env
   ENVIRONMENT=cloud
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```

3. **Install PostgreSQL adapter**:
   ```bash
   pip install psycopg2-binary
   ```

4. **Initialize cloud database**:
   ```bash
   python -c "from src.models import init_db; init_db()"
   ```

### Deploying to Streamlit Cloud

1. Push your code to GitHub

2. Go to [share.streamlit.io](https://share.streamlit.io)

3. Connect your repository

4. Set environment variables in Streamlit Cloud settings

5. Deploy!

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py"]
```

Build and run:
```bash
docker build -t cycling-rating-system .
docker run -p 8501:8501 cycling-rating-system
```

## 🔧 Development

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black src/ tests/
```

### Linting

```bash
flake8 src/ tests/
```

### Adding New Features

1. **New Rating Dimension**:
   - Add to `config/settings.py` dimensions list
   - Update `RiderRating` model in `src/models/rider.py`
   - Update `RaceCharacteristics` model in `src/models/race.py`
   - Update rating calculation in `src/services/rating_engine.py`

2. **New Data Source**:
   - Extend `DataFetcher` in `src/services/data_fetcher.py`
   - Add parsing logic for the new source

3. **New Analytics**:
   - Create new page in `pages/` directory
   - Follow naming convention: `N_emoji_Page_Name.py`

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Happy Rating! 🚴‍♂️**