"""
Query / Support Ticket Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# =====================================================
# Query Type Schemas
# =====================================================

class QueryTypeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Query type name")
    description: Optional[str] = Field(None, description="Query type description")
    is_active: bool = Field(True, description="Whether the query type is active")


class QueryTypeCreate(QueryTypeBase):
    pass


class QueryTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class QueryTypeResponse(QueryTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# Query Schemas
# =====================================================

class QueryBase(BaseModel):
    spa_id: int = Field(..., description="SPA ID for the query")
    query_type_id: Optional[int] = Field(None, description="Query type ID")
    query: str = Field(..., min_length=1, description="Query message")
    contact_number: str = Field(..., min_length=1, description="Contact number")


class QueryCreate(QueryBase):
    pass


class QueryUpdate(BaseModel):
    """Admin can update status and remarks"""
    status: Optional[str] = Field(None, pattern="^(pending|processing|resolved|closed)$")
    admin_remark: Optional[str] = Field(None, description="Admin remarks/resolution")


class QueryResponse(BaseModel):
    id: int
    spa_id: int
    query_type_id: Optional[int] = None
    query: str
    contact_number: str
    status: str
    admin_remark: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    is_active: bool
    is_deleted: bool
    
    # Related data
    spa_name: Optional[str] = None
    spa_address: Optional[str] = None
    spa_city: Optional[str] = None
    spa_area: Optional[str] = None
    spa_state: Optional[str] = None
    query_type_name: Optional[str] = None
    created_by_name: Optional[str] = None
    updated_by_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class QueryListResponse(BaseModel):
    """Response for list of queries"""
    queries: List[QueryResponse]
    total: int
    page: int
    page_size: int


# =====================================================
# Response Schemas
# =====================================================

class MessageResponse(BaseModel):
    message: str
    success: bool = True
