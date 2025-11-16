"""
Enhanced data fetcher for Pro Cycling Stats with real scraping capabilities.

This module provides automated data collection from procyclingstats.com including:
- Daily race results
- Rider information
- Race profiles and characteristics
- Automatic race type inference
"""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta, date
import time
import re
import logging
from urllib.parse import urljoin
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from config.settings import settings
from src.utils.race_templates import RaceTemplates

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ProCyclingStatsScraper:
    """
    Production-ready scraper for Pro Cycling Stats.

    Features:
    - Rate limiting and respectful scraping
    - Automatic race characteristic inference
    - Error handling and retry logic
    - Caching to minimize requests
    """

    def __init__(self, rate_limit_delay: float = 2.0):
        """
        Initialize the scraper.

        Args:
            rate_limit_delay: Seconds to wait between requests
        """
        self.base_url = "https://www.procyclingstats.com"
        self.rate_limit_delay = rate_limit_delay
        self.last_request_time = 0
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self._cache = {}

    def _rate_limit(self):
        """Enforce rate limiting between requests."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - elapsed)
        self.last_request_time = time.time()

    def _fetch_page(self, url: str, use_cache: bool = True) -> Optional[BeautifulSoup]:
        """
        Fetch and parse a webpage.

        Args:
            url: URL to fetch
            use_cache: Whether to use cached version if available

        Returns:
            BeautifulSoup object or None on error
        """
        if use_cache and url in self._cache:
            logger.debug(f"Using cached version of {url}")
            return self._cache[url]

        self._rate_limit()

        try:
            logger.info(f"Fetching: {url}")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')
            self._cache[url] = soup
            return soup

        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def get_today_races(self, target_date: Optional[date] = None) -> List[Dict]:
        """
        Get all races for a specific date.

        Args:
            target_date: Date to fetch races for (defaults to today)

        Returns:
            List of race information dictionaries
        """
        if target_date is None:
            target_date = date.today()

        # PCS calendar URL format
        date_str = target_date.strftime("%Y-%m-%d")
        url = f"{self.base_url}/races.php?date={date_str}&circuit=1&class=&filter=Filter"

        soup = self._fetch_page(url)
        if not soup:
            return []

        races = []
        # Find race links in the calendar
        for race_link in soup.find_all('a', href=re.compile(r'/race/')):
            race_url = urljoin(self.base_url, race_link.get('href'))
            races.append({
                'name': race_link.text.strip(),
                'url': race_url,
                'date': target_date
            })

        logger.info(f"Found {len(races)} races for {date_str}")
        return races

    def fetch_race_details(self, race_url: str) -> Optional[Dict]:
        """
        Fetch complete race details including results and profile.

        Args:
            race_url: URL of the race page

        Returns:
            Dictionary with race data or None on error
        """
        soup = self._fetch_page(race_url)
        if not soup:
            return None

        try:
            race_data = {
                'name': self._extract_race_name(soup),
                'date': self._extract_race_date(soup),
                'category': self._extract_race_category(soup),
                'country': self._extract_country(soup),
                'distance_km': self._extract_distance(soup),
                'elevation_m': self._extract_elevation(soup),
                'profile_type': self._extract_profile_type(soup),
                'results': self._extract_results(soup),
                'url': race_url
            }

            # Infer characteristics from race data
            race_data['characteristics'] = self._infer_characteristics(race_data)

            return race_data

        except Exception as e:
            logger.error(f"Error parsing race details from {race_url}: {e}")
            return None

    def _extract_race_name(self, soup: BeautifulSoup) -> str:
        """Extract race name from the page."""
        # Try h1 tag first
        h1 = soup.find('h1')
        if h1:
            return h1.text.strip()

        # Fallback to title
        title = soup.find('title')
        if title:
            # Remove " » " and site name
            name = title.text.split('»')[0].strip()
            return name

        return "Unknown Race"

    def _extract_race_date(self, soup: BeautifulSoup) -> Optional[datetime]:
        """Extract race date from the page."""
        # Look for date in various formats
        date_patterns = [
            r'(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})',
            r'(\d{4})-(\d{2})-(\d{2})'
        ]

        text = soup.get_text()
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    if len(match.groups()) == 3:
                        day, month, year = match.groups()
                        date_str = f"{day} {month} {year}"
                        return datetime.strptime(date_str, "%d %B %Y")
                except:
                    continue

        # Default to today if not found
        return datetime.now()

    def _extract_race_category(self, soup: BeautifulSoup) -> str:
        """Extract race category/classification."""
        text = soup.get_text().lower()

        # Check for specific race types
        if 'tour de france' in text or 'giro d\'italia' in text or 'vuelta a españa' in text:
            return 'GT'
        elif any(monument in text for monument in ['paris-roubaix', 'milano-sanremo', 'tour of flanders', 'liège-bastogne-liège', 'il lombardia']):
            return 'Monument'
        elif 'world championship' in text or 'wc ' in text:
            return 'WC'
        elif 'uci world tour' in text or '1.uwt' in text:
            return 'WT'
        elif 'uci proseries' in text or '1.pro' in text:
            return 'ProSeries'
        else:
            return 'Others'

    def _extract_country(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract race country."""
        # Look for country flag or text
        flag = soup.find('span', class_='flag')
        if flag:
            return flag.get('class', [''])[1] if len(flag.get('class', [])) > 1 else None
        return None

    def _extract_distance(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract race distance in km."""
        # Look for distance information
        distance_match = re.search(r'(\d+(?:\.\d+)?)\s*km', soup.get_text(), re.IGNORECASE)
        if distance_match:
            try:
                return float(distance_match.group(1))
            except:
                pass
        return None

    def _extract_elevation(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract elevation gain in meters."""
        # Look for elevation/altitude gain
        elev_patterns = [
            r'(\d+(?:,\d+)?)\s*m\s+(?:elevation|altitude|climbing)',
            r'(?:elevation|altitude|climbing).*?(\d+(?:,\d+)?)\s*m'
        ]

        text = soup.get_text()
        for pattern in elev_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    elev_str = match.group(1).replace(',', '')
                    return float(elev_str)
                except:
                    continue
        return None

    def _extract_profile_type(self, soup: BeautifulSoup) -> str:
        """Extract profile type (flat, hilly, mountain, etc.)."""
        text = soup.get_text().lower()

        if 'mountain' in text or 'mountains' in text or 'uphill' in text:
            return 'mountain'
        elif 'hilly' in text or 'hills' in text:
            return 'hilly'
        elif 'cobbles' in text or 'cobbled' in text or 'pavé' in text:
            return 'cobbles'
        elif 'flat' in text or 'sprint' in text:
            return 'flat'
        elif 'itt' in text or 'time trial' in text or 'chrono' in text:
            return 'time_trial'
        else:
            return 'mixed'

    def _extract_results(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract race results from the results table."""
        results = []

        # Find results table
        results_table = soup.find('table', class_=re.compile(r'result|classification'))
        if not results_table:
            # Try finding any table with rider results
            results_table = soup.find('table')

        if not results_table:
            logger.warning("No results table found")
            return []

        rows = results_table.find_all('tr')
        for row in rows[1:]:  # Skip header
            cells = row.find_all('td')
            if len(cells) < 2:
                continue

            try:
                position_text = cells[0].text.strip()
                # Extract position number
                position_match = re.search(r'(\d+)', position_text)
                if not position_match:
                    continue

                position = int(position_match.group(1))

                # Extract rider name
                rider_link = cells[1].find('a') if len(cells) > 1 else None
                rider_name = rider_link.text.strip() if rider_link else cells[1].text.strip()

                # Extract team if available
                team = cells[2].text.strip() if len(cells) > 2 else None

                # Extract time if available
                time_cell = cells[3] if len(cells) > 3 else None
                time_str = time_cell.text.strip() if time_cell else None

                result = {
                    'position': position,
                    'rider_name': rider_name,
                    'team': team,
                    'time': time_str
                }

                results.append(result)

            except Exception as e:
                logger.debug(f"Error parsing result row: {e}")
                continue

        logger.info(f"Extracted {len(results)} results")
        return results

    def _infer_characteristics(self, race_data: Dict) -> Dict[str, float]:
        """
        Automatically infer race characteristics from race data.

        Uses race name, profile, distance, elevation to determine
        which rider dimensions are most relevant.

        Args:
            race_data: Dictionary with race information

        Returns:
            Dictionary of characteristic weights
        """
        name = race_data.get('name', '').lower()
        profile = race_data.get('profile_type', 'mixed').lower()
        distance = race_data.get('distance_km', 0)
        elevation = race_data.get('elevation_m', 0)
        category = race_data.get('category', 'Others')

        # Start with neutral characteristics
        characteristics = {
            'flat_weight': 0.0,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.0,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.0,
            'gc_weight': 0.0,
            'one_day_weight': 0.0,
            'endurance_weight': 0.0
        }

        # Check for known race templates by name
        if 'roubaix' in name:
            return RaceTemplates.paris_roubaix()
        elif 'flanders' in name or 'vlaanderen' in name:
            return RaceTemplates.tour_of_flanders()
        elif 'liège' in name or 'liege' in name or 'bastogne' in name:
            return RaceTemplates.liege_bastogne_liege()
        elif 'sanremo' in name or 'milan' in name:
            return RaceTemplates.milano_sanremo()
        elif 'lombardia' in name or 'lombardy' in name:
            return RaceTemplates.il_lombardia()
        elif 'world championship' in name and ('itt' in name or 'time trial' in name):
            return RaceTemplates.world_championship_itt()
        elif 'world championship' in name:
            return RaceTemplates.world_championship_rr()

        # Infer from profile type
        if profile == 'time_trial' or 'itt' in name or 'prologue' in name:
            characteristics['time_trial_weight'] = 1.0
            characteristics['flat_weight'] = 0.5
            characteristics['gc_weight'] = 0.7 if category == 'GT' else 0.3
            characteristics['endurance_weight'] = 0.4

        elif profile == 'cobbles':
            characteristics['cobbles_weight'] = 1.0
            characteristics['flat_weight'] = 0.5
            characteristics['one_day_weight'] = 1.0
            characteristics['endurance_weight'] = 0.8

        elif profile == 'mountain':
            # Use elevation to determine mountain intensity
            if elevation and elevation > 3000:
                characteristics['mountain_weight'] = 1.0
                characteristics['gc_weight'] = 1.0 if category == 'GT' else 0.5
                characteristics['endurance_weight'] = 0.9
            else:
                characteristics['mountain_weight'] = 0.7
                characteristics['gc_weight'] = 0.6 if category == 'GT' else 0.3
                characteristics['endurance_weight'] = 0.7

        elif profile == 'hilly':
            characteristics['mountain_weight'] = 0.5
            characteristics['flat_weight'] = 0.3
            characteristics['sprint_weight'] = 0.4
            characteristics['one_day_weight'] = 0.7
            characteristics['endurance_weight'] = 0.6

        elif profile == 'flat':
            characteristics['flat_weight'] = 0.8
            characteristics['sprint_weight'] = 1.0
            characteristics['endurance_weight'] = 0.5

        else:  # mixed
            characteristics['flat_weight'] = 0.5
            characteristics['mountain_weight'] = 0.3
            characteristics['sprint_weight'] = 0.5
            characteristics['endurance_weight'] = 0.6

        # Adjust based on race category
        if category == 'GT':
            characteristics['gc_weight'] = max(characteristics.get('gc_weight', 0), 0.7)
            characteristics['endurance_weight'] = max(characteristics.get('endurance_weight', 0), 0.7)
        elif category in ['Monument', 'WC']:
            characteristics['one_day_weight'] = 1.0
            characteristics['endurance_weight'] = max(characteristics.get('endurance_weight', 0), 0.8)

        # Adjust based on distance
        if distance:
            if distance > 200:
                characteristics['endurance_weight'] = min(1.0, characteristics.get('endurance_weight', 0) + 0.2)
            elif distance < 50:
                characteristics['endurance_weight'] = max(0.1, characteristics.get('endurance_weight', 0) - 0.2)

        return characteristics

    def search_rider(self, rider_name: str) -> Optional[Dict]:
        """
        Search for a rider on Pro Cycling Stats.

        Args:
            rider_name: Name of the rider

        Returns:
            Rider information or None
        """
        # Clean up rider name for URL
        search_name = rider_name.lower().replace(' ', '+')
        url = f"{self.base_url}/search.php?term={search_name}&searchf=Search"

        soup = self._fetch_page(url)
        if not soup:
            return None

        # Find first rider link
        rider_link = soup.find('a', href=re.compile(r'/rider/'))
        if not rider_link:
            return None

        rider_url = urljoin(self.base_url, rider_link.get('href'))
        pcs_id = rider_url.split('/')[-1] if rider_url else None

        return {
            'name': rider_name,
            'pcs_id': pcs_id,
            'url': rider_url
        }


# Backward compatibility
class DataFetcher(ProCyclingStatsScraper):
    """Alias for backward compatibility."""
    pass
