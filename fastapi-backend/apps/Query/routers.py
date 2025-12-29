"""
Query / Support Ticket Routers
API endpoints for query management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query as FastAPIQuery
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from config.database import get_db
from apps.Query.schemas import (
    QueryCreate,
    QueryUpdate,
    QueryResponse,
    QueryListResponse,
    QueryTypeCreate,
    QueryTypeUpdate,
    QueryTypeResponse,
    MessageResponse,
)
from apps.Query.services.query_service import (
    create_query,
    get_query_by_id,
    get_queries,
    update_query,
    delete_query,
    get_query_types,
    get_query_type_by_id,
    create_query_type,
    update_query_type,
    delete_query_type,
    enrich_query_with_relations,
)
from core.dependencies import get_current_active_user, require_role
from apps.users.models import User
from core.exceptions import NotFoundError, ValidationError

query_router = APIRouter()


# =====================================================
# Query Type Endpoints
# =====================================================

@query_router.get(
    "/types",
    response_model=list[QueryTypeResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all query types",
    description="Get list of all active query types"
)
async def get_query_types_endpoint(
    active_only: bool = FastAPIQuery(True, description="Return only active types"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all query types"""
    try:
        types = await get_query_types(db, active_only=active_only)
        return types
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching query types: {str(e)}"
        )


@query_router.post(
    "/types",
    response_model=QueryTypeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new query type",
    description="Admin can create new query types"
)
async def create_query_type_endpoint(
    query_type_data: QueryTypeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Create a new query type (Admin only)"""
    try:
        query_type = await create_query_type(db, query_type_data)
        return QueryTypeResponse(
            id=query_type.id,
            name=query_type.name,
            description=query_type.description,
            is_active=query_type.is_active,
            created_at=query_type.created_at,
            updated_at=query_type.updated_at
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating query type: {str(e)}"
        )


@query_router.put(
    "/types/{query_type_id}",
    response_model=QueryTypeResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a query type",
    description="Admin can update query types"
)
async def update_query_type_endpoint(
    query_type_id: int,
    query_type_data: QueryTypeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Update a query type (Admin only)"""
    try:
        query_type = await update_query_type(db, query_type_id, query_type_data)
        return QueryTypeResponse(
            id=query_type.id,
            name=query_type.name,
            description=query_type.description,
            is_active=query_type.is_active,
            created_at=query_type.created_at,
            updated_at=query_type.updated_at
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating query type: {str(e)}"
        )


@query_router.delete(
    "/types/{query_type_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a query type",
    description="Admin can delete query types. Soft delete by default (deactivates), permanent if permanent=true"
)
async def delete_query_type_endpoint(
    query_type_id: int,
    permanent: bool = FastAPIQuery(False, description="Permanent delete (default: false = deactivate)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Delete a query type (Admin only). Soft delete (deactivate) by default, permanent if specified."""
    try:
        await delete_query_type(db, query_type_id, permanent=permanent)
        
        delete_type = "permanently deleted" if permanent else "deactivated"
        return MessageResponse(message=f"Query type {delete_type} successfully")
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting query type: {str(e)}"
        )


# =====================================================
# Query CRUD Endpoints
# =====================================================

@query_router.post(
    "/",
    response_model=QueryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new query",
    description="Manager, HR, and Users can create queries"
)
async def create_query_endpoint(
    query_data: QueryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("spa_manager", "hr", "user", "admin", "super_admin"))
):
    """Create a new query"""
    try:
        query = await create_query(db, query_data, current_user.id)
        enriched = await enrich_query_with_relations(db, query)
        return QueryResponse(**enriched)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating query: {str(e)}"
        )


@query_router.get(
    "/",
    response_model=QueryListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all queries",
    description="Get list of queries with filters. Users see only their own, Admin sees all."
)
async def get_queries_endpoint(
    status_filter: Optional[str] = FastAPIQuery(None, alias="status", description="Filter by status"),
    spa_id: Optional[int] = FastAPIQuery(None, description="Filter by SPA ID"),
    page: int = FastAPIQuery(1, ge=1, description="Page number"),
    page_size: int = FastAPIQuery(10, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of queries"""
    try:
        skip = (page - 1) * page_size
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        
        queries, total = await get_queries(
            db,
            user_id=current_user.id,
            user_role=user_role,
            status=status_filter,
            spa_id=spa_id,
            skip=skip,
            limit=page_size
        )
        
        # Enrich queries with relations
        enriched_queries = []
        for query in queries:
            enriched = await enrich_query_with_relations(db, query)
            enriched_queries.append(QueryResponse(**enriched))
        
        return QueryListResponse(
            queries=enriched_queries,
            total=total,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching queries: {str(e)}"
        )


@query_router.get(
    "/{query_id}",
    response_model=QueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get query by ID",
    description="Get a specific query by ID"
)
async def get_query_endpoint(
    query_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a query by ID"""
    try:
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        query = await get_query_by_id(db, query_id, current_user.id, user_role)
        
        if not query:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Query with id {query_id} not found or access denied"
            )
        
        enriched = await enrich_query_with_relations(db, query)
        return QueryResponse(**enriched)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching query: {str(e)}"
        )


@query_router.put(
    "/{query_id}",
    response_model=QueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Update query (Admin only)",
    description="Admin can update query status and remarks"
)
async def update_query_endpoint(
    query_id: int,
    query_data: QueryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Update a query (Admin only)"""
    try:
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        query = await update_query(db, query_id, query_data, current_user.id, user_role)
        enriched = await enrich_query_with_relations(db, query)
        return QueryResponse(**enriched)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating query: {str(e)}"
        )


@query_router.delete(
    "/{query_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete query (Admin only)",
    description="Delete a query. Soft delete by default, permanent if permanent=true"
)
async def delete_query_endpoint(
    query_id: int,
    permanent: bool = FastAPIQuery(False, description="Permanent delete (default: false = soft delete)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Delete a query (Admin only). Soft delete by default, permanent if specified."""
    try:
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        await delete_query(db, query_id, current_user.id, user_role, permanent=permanent)
        
        delete_type = "permanently" if permanent else "soft"
        return MessageResponse(message=f"Query {delete_type} deleted successfully")
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting query: {str(e)}"
        )
