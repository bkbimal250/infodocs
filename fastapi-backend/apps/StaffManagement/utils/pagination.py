"""
Pagination Schema Helper
Provides clean, generic models for paginated database responses.
"""
from typing import TypeVar, Generic, List
from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Standard generic wrapper for paginated endpoints"""
    items: List[T]
    total: int
    limit: int
    offset: int
