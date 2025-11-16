"""
Race characteristic templates for common race types.

These templates provide predefined weights for different types of races,
making it easier to create realistic race profiles.
"""

from typing import Dict


class RaceTemplates:
    """Predefined race characteristic templates."""

    @staticmethod
    def flat_sprint_stage() -> Dict[str, float]:
        """
        Flat sprint stage (e.g., Tour de France Stage 21, sprint stages).

        Characteristics:
        - High flat component
        - Very high sprint importance
        - Moderate endurance
        - No climbing or cobbles
        """
        return {
            'flat_weight': 0.8,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.0,
            'time_trial_weight': 0.0,
            'sprint_weight': 1.0,
            'gc_weight': 0.0,
            'one_day_weight': 0.0,
            'endurance_weight': 0.5
        }

    @staticmethod
    def mountain_stage() -> Dict[str, float]:
        """
        Mountain stage (e.g., Alpine/Pyrenees stage, summit finish).

        Characteristics:
        - Very high mountain component
        - High GC importance
        - High endurance
        - No sprint or flat
        """
        return {
            'flat_weight': 0.1,
            'cobbles_weight': 0.0,
            'mountain_weight': 1.0,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.0,
            'gc_weight': 0.9,
            'one_day_weight': 0.0,
            'endurance_weight': 0.8
        }

    @staticmethod
    def high_mountain_stage() -> Dict[str, float]:
        """
        High mountain stage with multiple HC climbs.

        Characteristics:
        - Maximum mountain component
        - Maximum GC importance
        - Very high endurance
        """
        return {
            'flat_weight': 0.0,
            'cobbles_weight': 0.0,
            'mountain_weight': 1.0,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.0,
            'gc_weight': 1.0,
            'one_day_weight': 0.0,
            'endurance_weight': 0.9
        }

    @staticmethod
    def medium_mountain_stage() -> Dict[str, float]:
        """
        Medium mountain stage with rolling terrain.

        Characteristics:
        - Moderate mountains
        - Some GC relevance
        - Some breakaway potential
        """
        return {
            'flat_weight': 0.3,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.6,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.2,
            'gc_weight': 0.5,
            'one_day_weight': 0.3,
            'endurance_weight': 0.7
        }

    @staticmethod
    def individual_time_trial() -> Dict[str, float]:
        """
        Individual time trial (flat or rolling).

        Characteristics:
        - Maximum TT component
        - High GC importance
        - Some flat component
        """
        return {
            'flat_weight': 0.6,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.0,
            'time_trial_weight': 1.0,
            'sprint_weight': 0.0,
            'gc_weight': 0.7,
            'one_day_weight': 0.0,
            'endurance_weight': 0.4
        }

    @staticmethod
    def mountain_time_trial() -> Dict[str, float]:
        """
        Mountain time trial (uphill finish).

        Characteristics:
        - Maximum TT component
        - High mountain component
        - Maximum GC importance
        """
        return {
            'flat_weight': 0.2,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.7,
            'time_trial_weight': 1.0,
            'sprint_weight': 0.0,
            'gc_weight': 1.0,
            'one_day_weight': 0.0,
            'endurance_weight': 0.5
        }

    @staticmethod
    def paris_roubaix() -> Dict[str, float]:
        """
        Paris-Roubaix (Monument, cobbled classic).

        Characteristics:
        - Maximum cobbles component
        - High flat component
        - Maximum one-day importance
        - Very high endurance
        """
        return {
            'flat_weight': 0.6,
            'cobbles_weight': 1.0,
            'mountain_weight': 0.0,
            'time_trial_weight': 0.2,
            'sprint_weight': 0.1,
            'gc_weight': 0.0,
            'one_day_weight': 1.0,
            'endurance_weight': 0.9
        }

    @staticmethod
    def tour_of_flanders() -> Dict[str, float]:
        """
        Tour of Flanders (Monument, cobbles and hills).

        Characteristics:
        - High cobbles component
        - Some climbing
        - Maximum one-day importance
        - High endurance
        """
        return {
            'flat_weight': 0.4,
            'cobbles_weight': 0.8,
            'mountain_weight': 0.4,
            'time_trial_weight': 0.1,
            'sprint_weight': 0.2,
            'gc_weight': 0.0,
            'one_day_weight': 1.0,
            'endurance_weight': 0.8
        }

    @staticmethod
    def liege_bastogne_liege() -> Dict[str, float]:
        """
        Liège-Bastogne-Liège (Monument, hilly classic).

        Characteristics:
        - High mountain component (many short climbs)
        - Maximum one-day importance
        - High endurance
        - Punchy finish
        """
        return {
            'flat_weight': 0.3,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.7,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.3,
            'gc_weight': 0.0,
            'one_day_weight': 1.0,
            'endurance_weight': 0.8
        }

    @staticmethod
    def milano_sanremo() -> Dict[str, float]:
        """
        Milano-Sanremo (Monument, sprinter's classic).

        Characteristics:
        - High flat component
        - High sprint component
        - Maximum one-day importance
        - Very high endurance (longest classic)
        - Some climbing (Poggio, Cipressa)
        """
        return {
            'flat_weight': 0.7,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.3,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.8,
            'gc_weight': 0.0,
            'one_day_weight': 1.0,
            'endurance_weight': 0.9
        }

    @staticmethod
    def il_lombardia() -> Dict[str, float]:
        """
        Il Lombardia (Monument, climbing classic).

        Characteristics:
        - Very high mountain component
        - Maximum one-day importance
        - High endurance
        """
        return {
            'flat_weight': 0.2,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.9,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.1,
            'gc_weight': 0.0,
            'one_day_weight': 1.0,
            'endurance_weight': 0.8
        }

    @staticmethod
    def world_championship_rr() -> Dict[str, float]:
        """
        World Championship Road Race (varies by location).

        Characteristics:
        - Balanced profile
        - Maximum one-day importance
        - High endurance
        """
        return {
            'flat_weight': 0.5,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.5,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.4,
            'gc_weight': 0.0,
            'one_day_weight': 1.0,
            'endurance_weight': 0.8
        }

    @staticmethod
    def world_championship_itt() -> Dict[str, float]:
        """
        World Championship Individual Time Trial.

        Characteristics:
        - Maximum TT component
        - Some flat component
        """
        return {
            'flat_weight': 0.7,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.2,
            'time_trial_weight': 1.0,
            'sprint_weight': 0.0,
            'gc_weight': 0.0,
            'one_day_weight': 0.8,
            'endurance_weight': 0.4
        }

    @staticmethod
    def hilly_classic() -> Dict[str, float]:
        """
        Generic hilly one-day classic (e.g., Amstel Gold Race, Flèche Wallonne).

        Characteristics:
        - Moderate climbing
        - High one-day importance
        - Punchy finish
        """
        return {
            'flat_weight': 0.3,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.6,
            'time_trial_weight': 0.0,
            'sprint_weight': 0.4,
            'gc_weight': 0.0,
            'one_day_weight': 0.9,
            'endurance_weight': 0.6
        }

    @staticmethod
    def sprint_classic() -> Dict[str, float]:
        """
        Generic sprint classic (e.g., Scheldeprijs).

        Characteristics:
        - High flat component
        - Maximum sprint importance
        - High one-day importance
        """
        return {
            'flat_weight': 0.9,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.0,
            'time_trial_weight': 0.0,
            'sprint_weight': 1.0,
            'gc_weight': 0.0,
            'one_day_weight': 0.7,
            'endurance_weight': 0.5
        }

    @staticmethod
    def prologue() -> Dict[str, float]:
        """
        Prologue / Short TT (5-10km).

        Characteristics:
        - Maximum TT component
        - Some GC importance
        - Low endurance
        """
        return {
            'flat_weight': 0.5,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.0,
            'time_trial_weight': 1.0,
            'sprint_weight': 0.0,
            'gc_weight': 0.3,
            'one_day_weight': 0.0,
            'endurance_weight': 0.1
        }

    @staticmethod
    def team_time_trial() -> Dict[str, float]:
        """
        Team Time Trial.

        Characteristics:
        - Maximum TT component
        - High GC importance
        - Moderate endurance
        """
        return {
            'flat_weight': 0.6,
            'cobbles_weight': 0.0,
            'mountain_weight': 0.0,
            'time_trial_weight': 1.0,
            'sprint_weight': 0.0,
            'gc_weight': 0.6,
            'one_day_weight': 0.0,
            'endurance_weight': 0.5
        }

    @classmethod
    def get_all_templates(cls) -> Dict[str, Dict[str, float]]:
        """
        Get all available templates as a dictionary.

        Returns:
            Dictionary mapping template names to their characteristics
        """
        return {
            'Flat Sprint Stage': cls.flat_sprint_stage(),
            'Mountain Stage': cls.mountain_stage(),
            'High Mountain Stage': cls.high_mountain_stage(),
            'Medium Mountain Stage': cls.medium_mountain_stage(),
            'Individual Time Trial': cls.individual_time_trial(),
            'Mountain Time Trial': cls.mountain_time_trial(),
            'Paris-Roubaix': cls.paris_roubaix(),
            'Tour of Flanders': cls.tour_of_flanders(),
            'Liège-Bastogne-Liège': cls.liege_bastogne_liege(),
            'Milano-Sanremo': cls.milano_sanremo(),
            'Il Lombardia': cls.il_lombardia(),
            'World Championship RR': cls.world_championship_rr(),
            'World Championship ITT': cls.world_championship_itt(),
            'Hilly Classic': cls.hilly_classic(),
            'Sprint Classic': cls.sprint_classic(),
            'Prologue': cls.prologue(),
            'Team Time Trial': cls.team_time_trial(),
        }

    @classmethod
    def get_template(cls, template_name: str) -> Dict[str, float]:
        """
        Get a specific template by name.

        Args:
            template_name: Name of the template

        Returns:
            Template characteristics dictionary

        Raises:
            KeyError: If template name not found
        """
        templates = cls.get_all_templates()
        if template_name not in templates:
            raise KeyError(f"Template '{template_name}' not found. Available: {list(templates.keys())}")
        return templates[template_name]
