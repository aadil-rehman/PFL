"""
Runtime configuration — all values from environment variables or .env file.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Priority order:
      1. Real environment variables
      2. Values in .env file
      3. Defaults below (safe for local dev)
    """

    # --- CLIP model (primary tree detector) ---
    # Auto-downloaded from HuggingFace on first run — no API key needed.
    CLIP_MODEL: str = "openai/clip-vit-base-patch32"

    # Prompts that mean "yes, tree is present". More prompts = better recall.
    # Added all possible edge cases: small plants, people holding saplings, groups planting.
    TREE_POSITIVE_PROMPTS: str = (
        "a photo of a tree,"
        "a photo of trees,"
        "a photo of a forest,"
        "a photo of a plant or tree,"
        "a person standing next to a tree,"
        "a person planting a tree,"
        "a group of people planting trees together,"
        "people holding a tree or sapling,"
        "a person holding a small plant in their hands,"
        "a small tree sapling,"
        "a tiny green plant,"
        "an outdoor scene with a tree,"
        "a tree growing in a field,"
        "a photo showing green leaves,"
        "a close-up of branches and leaves,"
        "a hint of greenery or plants,"
        "a small patch of grass or a bush,"
        "someone carrying a potted plant,"
        "a nature scene with foliage"
    )

    # Prompts that mean "no tree". Used to calibrate the softmax.
    # Stricter negatives so it only returns False on completely barren images.
    TREE_NEGATIVE_PROMPTS: str = (
        "a photo with absolutely no trees,"
        "a completely barren landscape,"
        "a photo of a building with no plants,"
        "a purely indoor scene with no plants,"
        "a paved road with no greenery,"
        "a clear sky,"
        "a blank wall,"
        "a desert with no plants"
    )

    # If the best pairwise score exceeds this, tree_detected = True.
    # Pairwise comparison: 0.50 = tie, >0.50 = tree more likely than no-tree.
    # Set to 0.51 to trigger on the slightest doubt or minimal greenery.
    CONFIDENCE_THRESHOLD: float = 0.51

    # --- Upload limits ---
    MAX_UPLOAD_BYTES: int = 10_485_760   # 10 MB
    ALLOWED_CONTENT_TYPES: str = "image/jpeg,image/png,image/webp"

    # --- Server ---
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    
    DOCS_API_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Derived helpers ---

    @property
    def positive_prompts(self) -> list[str]:
        return [p.strip() for p in self.TREE_POSITIVE_PROMPTS.split(",") if p.strip()]

    @property
    def negative_prompts(self) -> list[str]:
        return [p.strip() for p in self.TREE_NEGATIVE_PROMPTS.split(",") if p.strip()]

    @property
    def allowed_content_type_list(self) -> list[str]:
        return [c.strip() for c in self.ALLOWED_CONTENT_TYPES.split(",") if c.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached singleton — safe to call from any module or FastAPI Depends()."""
    return Settings()