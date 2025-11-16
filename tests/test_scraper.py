"""Tests for the Pro Cycling Stats scraper."""

import pytest
from datetime import date, datetime
from unittest.mock import Mock, patch, MagicMock
from bs4 import BeautifulSoup

from src.services.procyclingstats_scraper import ProCyclingStatsScraper


class TestProCyclingStatsScraper:
    """Test suite for ProCyclingStatsScraper."""

    @pytest.fixture
    def scraper(self):
        """Create a scraper instance."""
        return ProCyclingStatsScraper(rate_limit_delay=0.1)

    def test_init(self, scraper):
        """Test scraper initialization."""
        assert scraper.base_url == "https://www.procyclingstats.com"
        assert scraper.rate_limit_delay == 0.1
        assert scraper.session is not None

    def test_rate_limit(self, scraper):
        """Test rate limiting functionality."""
        import time

        start = time.time()
        scraper._rate_limit()
        scraper._rate_limit()
        elapsed = time.time() - start

        # Should enforce delay between calls
        assert elapsed >= scraper.rate_limit_delay

    def test_extract_race_name(self, scraper):
        """Test race name extraction."""
        html = """
        <html>
            <head><title>Tour de France 2024 » PCS</title></head>
            <body><h1>Tour de France 2024</h1></body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')

        name = scraper._extract_race_name(soup)
        assert 'Tour de France' in name

    def test_extract_race_category(self, scraper):
        """Test race category extraction."""
        # Test Grand Tour
        html_gt = "<html><body>Tour de France 2024</body></html>"
        soup = BeautifulSoup(html_gt, 'html.parser')
        assert scraper._extract_race_category(soup) == 'GT'

        # Test Monument
        html_monument = "<html><body>Paris-Roubaix 2024</body></html>"
        soup = BeautifulSoup(html_monument, 'html.parser')
        assert scraper._extract_race_category(soup) == 'Monument'

        # Test World Championship
        html_wc = "<html><body>World Championship ITT</body></html>"
        soup = BeautifulSoup(html_wc, 'html.parser')
        assert scraper._extract_race_category(soup) == 'WC'

    def test_extract_distance(self, scraper):
        """Test distance extraction."""
        html = "<html><body>Distance: 250.5 km</body></html>"
        soup = BeautifulSoup(html, 'html.parser')

        distance = scraper._extract_distance(soup)
        assert distance == 250.5

    def test_extract_elevation(self, scraper):
        """Test elevation extraction."""
        html = "<html><body>Elevation gain: 3,500 m</body></html>"
        soup = BeautifulSoup(html, 'html.parser')

        elevation = scraper._extract_elevation(soup)
        assert elevation == 3500.0

    def test_extract_profile_type(self, scraper):
        """Test profile type extraction."""
        test_cases = [
            ("<html><body>Mountain stage with multiple climbs</body></html>", "mountain"),
            ("<html><body>Flat sprint stage</body></html>", "flat"),
            ("<html><body>Cobbled classic with pavé sections</body></html>", "cobbles"),
            ("<html><body>Individual time trial (ITT)</body></html>", "time_trial"),
            ("<html><body>Hilly route with rolling terrain</body></html>", "hilly"),
        ]

        for html, expected in test_cases:
            soup = BeautifulSoup(html, 'html.parser')
            profile = scraper._extract_profile_type(soup)
            assert profile == expected

    def test_infer_characteristics_known_race(self, scraper):
        """Test characteristic inference for known races."""
        # Test Paris-Roubaix
        race_data = {
            'name': 'Paris-Roubaix 2024',
            'profile_type': 'cobbles',
            'distance_km': 257,
            'elevation_m': 500,
            'category': 'Monument'
        }

        characteristics = scraper._infer_characteristics(race_data)

        assert characteristics['cobbles_weight'] == 1.0
        assert characteristics['one_day_weight'] == 1.0
        assert characteristics['endurance_weight'] >= 0.8

    def test_infer_characteristics_mountain_stage(self, scraper):
        """Test characteristic inference for mountain stage."""
        race_data = {
            'name': 'Test Mountain Stage',
            'profile_type': 'mountain',
            'distance_km': 180,
            'elevation_m': 4000,
            'category': 'GT'
        }

        characteristics = scraper._infer_characteristics(race_data)

        assert characteristics['mountain_weight'] == 1.0
        assert characteristics['gc_weight'] == 1.0
        assert characteristics['endurance_weight'] >= 0.8

    def test_infer_characteristics_time_trial(self, scraper):
        """Test characteristic inference for time trial."""
        race_data = {
            'name': 'Test ITT',
            'profile_type': 'time_trial',
            'distance_km': 40,
            'elevation_m': 200,
            'category': 'WT'
        }

        characteristics = scraper._infer_characteristics(race_data)

        assert characteristics['time_trial_weight'] == 1.0
        assert characteristics['flat_weight'] >= 0.5

    def test_infer_characteristics_flat_sprint(self, scraper):
        """Test characteristic inference for flat sprint stage."""
        race_data = {
            'name': 'Sprint Stage',
            'profile_type': 'flat',
            'distance_km': 200,
            'elevation_m': 100,
            'category': 'GT'
        }

        characteristics = scraper._infer_characteristics(race_data)

        assert characteristics['sprint_weight'] == 1.0
        assert characteristics['flat_weight'] >= 0.7

    def test_extract_results_from_table(self, scraper):
        """Test result extraction from HTML table."""
        html = """
        <html><body>
            <table class="results">
                <tr><th>Pos</th><th>Rider</th><th>Team</th><th>Time</th></tr>
                <tr><td>1</td><td><a href="/rider/tadej-pogacar">Tadej Pogačar</a></td><td>UAE</td><td>4h 20m</td></tr>
                <tr><td>2</td><td><a href="/rider/jonas-vingegaard">Jonas Vingegaard</a></td><td>Visma</td><td>+15s</td></tr>
                <tr><td>3</td><td><a href="/rider/primoz-roglic">Primož Roglič</a></td><td>Bora</td><td>+45s</td></tr>
            </table>
        </body></html>
        """
        soup = BeautifulSoup(html, 'html.parser')

        results = scraper._extract_results(soup)

        assert len(results) == 3
        assert results[0]['position'] == 1
        assert results[0]['rider_name'] == 'Tadej Pogačar'
        assert results[1]['position'] == 2
        assert results[2]['position'] == 3

    @patch('src.services.procyclingstats_scraper.requests.Session.get')
    def test_fetch_page_caching(self, mock_get, scraper):
        """Test that fetch_page uses caching."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.content = b"<html><body>Test</body></html>"
        mock_get.return_value = mock_response

        url = "https://test.com/page"

        # First fetch
        soup1 = scraper._fetch_page(url)
        assert mock_get.call_count == 1

        # Second fetch should use cache
        soup2 = scraper._fetch_page(url, use_cache=True)
        assert mock_get.call_count == 1  # Not called again

        # Third fetch without cache
        soup3 = scraper._fetch_page(url, use_cache=False)
        assert mock_get.call_count == 2  # Called again

    def test_infer_characteristics_distance_adjustment(self, scraper):
        """Test that distance affects endurance weight."""
        # Long race
        long_race = {
            'name': 'Long Race',
            'profile_type': 'flat',
            'distance_km': 250,
            'elevation_m': 100,
            'category': 'Monument'
        }

        char_long = scraper._infer_characteristics(long_race)

        # Short race
        short_race = {
            'name': 'Short Race',
            'profile_type': 'flat',
            'distance_km': 40,
            'elevation_m': 100,
            'category': 'Others'
        }

        char_short = scraper._infer_characteristics(short_race)

        # Long race should have higher endurance
        assert char_long['endurance_weight'] > char_short['endurance_weight']

    def test_infer_characteristics_gt_adjustment(self, scraper):
        """Test that Grand Tour category increases GC weight."""
        gt_race = {
            'name': 'GT Stage',
            'profile_type': 'flat',
            'distance_km': 180,
            'elevation_m': 100,
            'category': 'GT'
        }

        char_gt = scraper._infer_characteristics(gt_race)

        other_race = {
            'name': 'Other Stage',
            'profile_type': 'flat',
            'distance_km': 180,
            'elevation_m': 100,
            'category': 'Others'
        }

        char_other = scraper._infer_characteristics(other_race)

        # GT should have higher GC weight
        assert char_gt['gc_weight'] > char_other['gc_weight']


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
