"""Rating calculation engine for updating rider ratings based on race results."""

import math
from datetime import datetime
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.models import Rider, RiderRating, RatingHistory, Race, RaceResult, RaceCharacteristics
from config.settings import settings


class RatingEngine:
    """
    Engine for calculating and updating rider ratings.

    Uses an ELO-like rating system adapted for multi-dimensional cycling performance.
    """

    def __init__(self, db: Session):
        self.db = db
        self.k_factor = settings.k_factor
        self.initial_rating = settings.initial_rating

    def calculate_expected_score(self, rating_a: int, rating_b: int) -> float:
        """
        Calculate expected score for rider A against rider B using ELO formula.

        Args:
            rating_a: Rating of rider A
            rating_b: Rating of rider B

        Returns:
            Expected score (0.0 to 1.0)
        """
        return 1 / (1 + math.pow(10, (rating_b - rating_a) / 400))

    def calculate_performance_score(self, position: int, total_riders: int) -> float:
        """
        Calculate performance score based on finishing position.

        Args:
            position: Finishing position (1 = winner)
            total_riders: Total number of riders

        Returns:
            Performance score (0.0 to 1.0)
        """
        if position == 1:
            return 1.0
        elif position <= 3:
            return 0.9 - (position - 1) * 0.15  # 2nd: 0.75, 3rd: 0.6
        elif position <= 10:
            return 0.6 - (position - 3) * 0.05  # Linear decrease
        elif position <= 20:
            return 0.3 - (position - 10) * 0.02
        else:
            return max(0.1, 0.1 - (position - 20) * 0.005)

    def get_race_importance_multiplier(self, race: Race) -> float:
        """
        Get importance multiplier based on race category.

        Args:
            race: Race object

        Returns:
            Importance multiplier
        """
        category_name = race.category.value if race.category else "Others"
        return settings.race_importance_multiplier.get(category_name, 1.0)

    def calculate_rating_change(
        self,
        current_rating: int,
        expected_score: float,
        actual_score: float,
        importance_multiplier: float
    ) -> int:
        """
        Calculate rating change using modified ELO formula.

        Args:
            current_rating: Current rider rating
            expected_score: Expected performance score
            actual_score: Actual performance score
            importance_multiplier: Race importance multiplier

        Returns:
            Rating change (can be negative)
        """
        change = self.k_factor * importance_multiplier * (actual_score - expected_score)
        return int(round(change))

    def update_ratings_for_race(self, race_id: int) -> Dict[str, any]:
        """
        Update all rider ratings based on a race result.

        Args:
            race_id: ID of the race

        Returns:
            Dictionary with update statistics
        """
        race = self.db.query(Race).filter(Race.id == race_id).first()
        if not race:
            raise ValueError(f"Race {race_id} not found")

        characteristics = race.characteristics
        if not characteristics:
            raise ValueError(f"Race {race_id} has no characteristics defined")

        results = self.db.query(RaceResult).filter(
            RaceResult.race_id == race_id,
            RaceResult.did_not_finish == 0,
            RaceResult.did_not_start == 0
        ).order_by(RaceResult.position).all()

        if not results:
            return {"updated": 0, "message": "No results to process"}

        total_riders = len(results)
        importance = self.get_race_importance_multiplier(race)
        char_dict = characteristics.to_dict()

        updates = []

        for result in results:
            rider = result.rider
            rating = self._get_or_create_rating(rider.id)

            # Calculate average competitor rating for each dimension
            avg_ratings = self._calculate_average_competitor_ratings(
                results, result.rider_id, char_dict
            )

            # Update each dimension based on race characteristics
            old_ratings = rating.to_dict()
            new_ratings = {}

            for dimension, weight in char_dict.items():
                if weight > 0:
                    dimension_name = dimension.replace('_weight', '')
                    current_rating_value = getattr(rating, dimension_name)
                    avg_competitor_rating = avg_ratings[dimension_name]

                    # Calculate expected and actual scores
                    expected = self.calculate_expected_score(
                        current_rating_value,
                        avg_competitor_rating
                    )
                    actual = self.calculate_performance_score(result.position, total_riders)

                    # Calculate rating change (weighted by dimension importance)
                    change = self.calculate_rating_change(
                        current_rating_value,
                        expected,
                        actual,
                        importance * weight
                    )

                    new_rating_value = max(1000, min(2500, current_rating_value + change))
                    setattr(rating, dimension_name, new_rating_value)
                    new_ratings[dimension_name] = new_rating_value
                else:
                    dimension_name = dimension.replace('_weight', '')
                    new_ratings[dimension_name] = getattr(rating, dimension_name)

            # Update overall rating (weighted average)
            rating.overall = self._calculate_overall_rating(rating)

            # Update statistics
            rating.races_count += 1
            if result.position == 1:
                rating.wins_count += 1
            if result.position <= 3:
                rating.podiums_count += 1

            rating.updated_at = datetime.utcnow()

            # Save rating history
            history = RatingHistory(
                rider_id=rider.id,
                race_id=race_id,
                date=race.date,
                ratings=new_ratings,
                change_reason=f"Race result: {race.name} (P{result.position})"
            )
            self.db.add(history)

            updates.append({
                "rider": rider.name,
                "position": result.position,
                "rating_change": rating.overall - old_ratings["overall"]
            })

        self.db.commit()

        return {
            "updated": len(updates),
            "race": race.name,
            "date": race.date,
            "updates": updates
        }

    def _get_or_create_rating(self, rider_id: int) -> RiderRating:
        """Get or create rating entry for a rider."""
        rating = self.db.query(RiderRating).filter(
            RiderRating.rider_id == rider_id
        ).first()

        if not rating:
            rating = RiderRating(
                rider_id=rider_id,
                flat=self.initial_rating,
                cobbles=self.initial_rating,
                mountain=self.initial_rating,
                time_trial=self.initial_rating,
                sprint=self.initial_rating,
                gc=self.initial_rating,
                one_day=self.initial_rating,
                endurance=self.initial_rating,
                overall=self.initial_rating
            )
            self.db.add(rating)

        return rating

    def _calculate_average_competitor_ratings(
        self,
        results: List[RaceResult],
        exclude_rider_id: int,
        characteristics: Dict[str, float]
    ) -> Dict[str, float]:
        """Calculate average competitor ratings for each dimension."""
        avg_ratings = {}
        dimensions = [d.replace('_weight', '') for d in characteristics.keys()]

        for dimension in dimensions:
            ratings_sum = 0
            count = 0

            for result in results:
                if result.rider_id != exclude_rider_id:
                    rider_rating = self._get_or_create_rating(result.rider_id)
                    ratings_sum += getattr(rider_rating, dimension)
                    count += 1

            avg_ratings[dimension] = ratings_sum / count if count > 0 else self.initial_rating

        return avg_ratings

    def _calculate_overall_rating(self, rating: RiderRating) -> int:
        """Calculate overall rating as weighted average of all dimensions."""
        weights = {
            'flat': 0.15,
            'cobbles': 0.10,
            'mountain': 0.20,
            'time_trial': 0.15,
            'sprint': 0.10,
            'gc': 0.15,
            'one_day': 0.10,
            'endurance': 0.05
        }

        weighted_sum = sum(
            getattr(rating, dim) * weight
            for dim, weight in weights.items()
        )

        return int(round(weighted_sum))

    def initialize_rider_ratings(self, rider_id: int) -> RiderRating:
        """
        Initialize ratings for a new rider.

        Args:
            rider_id: ID of the rider

        Returns:
            Created RiderRating object
        """
        rating = self._get_or_create_rating(rider_id)
        self.db.commit()
        return rating
