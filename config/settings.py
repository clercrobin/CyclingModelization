"""Configuration settings for the Cycling Rating System."""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Literal


class Settings(BaseSettings):
    """Application settings with support for local and cloud deployments."""

    # Application
    app_name: str = "Cycling Rating System"
    debug: bool = True

    # Environment
    environment: Literal["local", "cloud"] = "local"

    # Database
    database_url: str = Field(
        default="sqlite:///data/cycling_ratings.db",
        description="Database connection string"
    )

    # Data fetching
    procyclingstats_base_url: str = "https://www.procyclingstats.com"
    fetch_interval_hours: int = 24

    # Rating system parameters
    initial_rating: int = 1500
    k_factor: int = 32  # ELO-like K-factor
    race_importance_multiplier: dict = {
        "GT": 2.0,  # Grand Tours
        "Monument": 1.8,  # Monuments
        "WC": 1.7,  # World Championships
        "WT": 1.3,  # World Tour
        "ProSeries": 1.0,  # Pro Series
        "Others": 0.7
    }

    # Rider dimensions
    dimensions: list[str] = [
        "flat",
        "cobbles",
        "mountain",
        "time_trial",
        "sprint",
        "gc",  # General Classification
        "one_day",
        "endurance"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
