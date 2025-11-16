"""Data fetcher for Pro Cycling Stats website."""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from datetime import datetime
import time
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from config.settings import settings


class DataFetcher:
    """
    Fetches cycling data from Pro Cycling Stats.

    Note: This is a basic implementation. For production use, consider:
    - Respecting robots.txt
    - Implementing rate limiting
    - Caching responses
    - Handling errors gracefully
    - Using official APIs if available
    """

    def __init__(self):
        self.base_url = settings.procyclingstats_base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def fetch_race_results(
        self,
        race_url: str,
        delay: float = 1.0
    ) -> Optional[Dict]:
        """
        Fetch race results from Pro Cycling Stats.

        Args:
            race_url: URL or path of the race (e.g., '/race/tour-de-france/2024')
            delay: Delay between requests in seconds (for rate limiting)

        Returns:
            Dictionary with race information and results, or None if error
        """
        time.sleep(delay)  # Rate limiting

        if not race_url.startswith('http'):
            url = f"{self.base_url}{race_url}"
        else:
            url = race_url

        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'lxml')

            # Extract race information
            race_data = {
                'name': self._extract_race_name(soup),
                'date': self._extract_race_date(soup),
                'category': self._extract_race_category(soup),
                'results': self._extract_results(soup),
                'characteristics': self._extract_characteristics(soup)
            }

            return race_data

        except Exception as e:
            print(f"Error fetching race results from {url}: {e}")
            return None

    def _extract_race_name(self, soup: BeautifulSoup) -> str:
        """Extract race name from page."""
        # This is a placeholder - actual implementation depends on PCS HTML structure
        h1 = soup.find('h1')
        if h1:
            return h1.text.strip()
        return "Unknown Race"

    def _extract_race_date(self, soup: BeautifulSoup) -> Optional[datetime]:
        """Extract race date from page."""
        # Placeholder implementation
        # You would need to find the actual date element in PCS HTML
        return datetime.now()

    def _extract_race_category(self, soup: BeautifulSoup) -> str:
        """Extract race category (GT, Monument, WT, etc.)."""
        # Placeholder implementation
        return "Others"

    def _extract_results(self, soup: BeautifulSoup) -> List[Dict]:
        """
        Extract race results from page.

        Returns:
            List of dictionaries with rider results
        """
        results = []

        # Placeholder implementation
        # Actual implementation would parse the results table from PCS
        # Example structure:
        # results = [
        #     {
        #         'position': 1,
        #         'rider_name': 'John Doe',
        #         'team': 'Team XYZ',
        #         'time': '4h 23m 15s',
        #         'time_behind': '0s'
        #     },
        #     ...
        # ]

        return results

    def _extract_characteristics(self, soup: BeautifulSoup) -> Dict[str, float]:
        """
        Extract or infer race characteristics.

        This would analyze race profile, distance, etc. to determine
        which dimensions are most relevant.

        Returns:
            Dictionary of dimension weights
        """
        # Placeholder implementation
        # Would analyze race profile, keywords, etc.
        characteristics = {
            'flat_weight': 0.3,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.5,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.2,
            'gc_weight': 0.4,
            'one_day_weight': 0.0,
            'endurance_weight': 0.6
        }

        return characteristics

    def search_rider(self, rider_name: str) -> Optional[Dict]:
        """
        Search for a rider on Pro Cycling Stats.

        Args:
            rider_name: Name of the rider to search

        Returns:
            Rider information dictionary or None
        """
        # Placeholder implementation
        # Would search PCS and return rider info
        return {
            'name': rider_name,
            'pcs_id': None,
            'team': 'Unknown',
            'country': 'Unknown'
        }

    def fetch_recent_races(self, limit: int = 10) -> List[Dict]:
        """
        Fetch recent race results.

        Args:
            limit: Maximum number of races to fetch

        Returns:
            List of race data dictionaries
        """
        # Placeholder implementation
        # Would fetch recent races from PCS
        return []


# Utility function to manually add race data
def create_manual_race_data(
    name: str,
    date: datetime,
    category: str,
    results: List[Dict],
    characteristics: Dict[str, float]
) -> Dict:
    """
    Create race data manually (for when you have the data from other sources).

    Args:
        name: Race name
        date: Race date
        category: Race category
        results: List of results with position, rider_name, etc.
        characteristics: Race characteristics weights

    Returns:
        Formatted race data dictionary
    """
    return {
        'name': name,
        'date': date,
        'category': category,
        'results': results,
        'characteristics': characteristics
    }
