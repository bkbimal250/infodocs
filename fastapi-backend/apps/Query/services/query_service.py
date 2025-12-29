"""
Query Service
Business logic for query/support ticket operations
"""
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, delete
from sqlalchemy.orm import selectinload

from apps.Query.models import Query, QueryType
from apps.Query.schemas import QueryCreate, QueryUpdate, QueryTypeCreate, QueryTypeUpdate
from apps.forms_app.models import SPA
from apps.users.models import User
from core.exceptions import NotFoundError, ValidationError


async def create_query(
    db: AsyncSession,
    query_data: QueryCreate,
    created_by: int
) -> Query:
    """Create a new query"""
    
    # Verify SPA exists
    spa_stmt = select(SPA).where(SPA.id == query_data.spa_id)
    spa_result = await db.execute(spa_stmt)
    spa = spa_result.scalar_one_or_none()
    if not spa:
        raise NotFoundError(f"SPA with id {query_data.spa_id} not found")
    
    # Verify query type exists if provided
    query_type = None
    if query_data.query_type_id:
        type_stmt = select(QueryType).where(
            and_(
                QueryType.id == query_data.query_type_id,
                QueryType.is_active == True
            )
        )
        type_result = await db.execute(type_stmt)
        query_type = type_result.scalar_one_or_none()
        if not query_type:
            raise NotFoundError(f"Query type with id {query_data.query_type_id} not found or inactive")
    
    # Create query
    query_dict = query_data.model_dump()
    query_dict['created_by'] = created_by
    query_dict['status'] = 'pending'  # Always start as pending
    
    query = Query(**query_dict)
    db.add(query)
    await db.commit()
    await db.refresh(query)
    
    # Create notifications for all admins
    try:
        from apps.notifications.services.notification_service import create_query_notification
        
        # Get SPA name for notification
        spa_name = spa.name if spa else None
        
        # Get query type name if provided
        query_type_name = query_type.name if query_type else None
        
        # Create notifications for all admins
        await create_query_notification(
            db=db,
            query_id=query.id,
            query_text=query_data.query,
            created_by=created_by,
            spa_name=spa_name,
            query_type_name=query_type_name,
            contact_number=query_data.contact_number,
            send_admin_email=True
        )
    except Exception as e:
        # Log error but don't fail query creation if notification fails
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create query notifications: {e}", exc_info=True)
    
    return query


async def get_query_by_id(
    db: AsyncSession,
    query_id: int,
    user_id: Optional[int] = None,
    user_role: Optional[str] = None
) -> Optional[Query]:
    """Get a query by ID with access control"""
    stmt = select(Query).where(
        and_(
            Query.id == query_id,
            Query.is_deleted == False
        )
    )
    result = await db.execute(stmt)
    query = result.scalar_one_or_none()
    
    if not query:
        return None
    
    # Access control: Users can only see their own queries, Admin can see all
    if user_role not in ['admin', 'super_admin']:
        if query.created_by != user_id:
            return None
    
    return query


async def get_queries(
    db: AsyncSession,
    user_id: Optional[int] = None,
    user_role: Optional[str] = None,
    status: Optional[str] = None,
    spa_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[Query], int]:
    """Get list of queries with filters and pagination"""
    
    # Base query
    conditions = [Query.is_deleted == False]
    
    # Access control: Users can only see their own queries, Admin can see all
    if user_role not in ['admin', 'super_admin']:
        if user_id:
            conditions.append(Query.created_by == user_id)
    
    # Apply filters
    if status:
        conditions.append(Query.status == status)
    
    if spa_id:
        conditions.append(Query.spa_id == spa_id)
    
    # Count total
    count_stmt = select(func.count()).select_from(Query).where(and_(*conditions))
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0
    
    # Get queries
    stmt = (
        select(Query)
        .where(and_(*conditions))
        .order_by(desc(Query.created_at))
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(stmt)
    queries = result.scalars().all()
    
    return list(queries), total


async def update_query(
    db: AsyncSession,
    query_id: int,
    query_data: QueryUpdate,
    updated_by: int,
    user_role: Optional[str] = None
) -> Query:
    """Update a query (Admin only for status and remarks)"""
    
    # Get query
    stmt = select(Query).where(
        and_(
            Query.id == query_id,
            Query.is_deleted == False
        )
    )
    result = await db.execute(stmt)
    query = result.scalar_one_or_none()
    
    if not query:
        raise NotFoundError(f"Query with id {query_id} not found")
    
    # Only admin can update status and remarks
    if user_role not in ['admin', 'super_admin']:
        raise ValidationError("Only admin can update query status and remarks")
    
    # Update fields
    update_dict = query_data.model_dump(exclude_unset=True)
    
    if 'status' in update_dict:
        valid_statuses = ['pending', 'processing', 'resolved', 'closed']
        if update_dict['status'] not in valid_statuses:
            raise ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        query.status = update_dict['status']
    
    if 'admin_remark' in update_dict:
        query.admin_remark = update_dict['admin_remark']
    
    query.updated_by = updated_by
    await db.commit()
    await db.refresh(query)
    
    return query


async def delete_query(
    db: AsyncSession,
    query_id: int,
    deleted_by: int,
    user_role: Optional[str] = None,
    permanent: bool = False
) -> bool:
    """Delete a query (Admin only). Soft delete by default, permanent if specified."""
    
    if user_role not in ['admin', 'super_admin']:
        raise ValidationError("Only admin can delete queries")
    
    stmt = select(Query).where(Query.id == query_id)
    if not permanent:
        # For soft delete, only get non-deleted queries
        stmt = stmt.where(Query.is_deleted == False)
    
    result = await db.execute(stmt)
    query = result.scalar_one_or_none()
    
    if not query:
        raise NotFoundError(f"Query with id {query_id} not found")
    
    if permanent:
        # Permanent delete - remove from database
        from sqlalchemy import delete
        stmt = delete(Query).where(Query.id == query_id)
        await db.execute(stmt)
    else:
        # Soft delete - mark as deleted
        query.is_deleted = True
        query.deleted_by = deleted_by
        from datetime import datetime, timezone
        query.deleted_at = datetime.now(timezone.utc)
    
    await db.commit()
    return True


# =====================================================
# Query Type Service
# =====================================================

async def get_query_types(
    db: AsyncSession,
    active_only: bool = True
) -> List[QueryType]:
    """Get all query types"""
    conditions = []
    if active_only:
        conditions.append(QueryType.is_active == True)
    
    stmt = select(QueryType)
    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.order_by(QueryType.name)
    
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_query_type_by_id(
    db: AsyncSession,
    query_type_id: int
) -> Optional[QueryType]:
    """Get query type by ID"""
    stmt = select(QueryType).where(QueryType.id == query_type_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_query_type(
    db: AsyncSession,
    query_type_data: QueryTypeCreate
) -> QueryType:
    """Create a new query type"""
    # Check if name already exists
    existing_stmt = select(QueryType).where(QueryType.name == query_type_data.name)
    existing_result = await db.execute(existing_stmt)
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        raise ValidationError(f"Query type with name '{query_type_data.name}' already exists")
    
    query_type_dict = query_type_data.model_dump()
    query_type = QueryType(**query_type_dict)
    db.add(query_type)
    await db.commit()
    await db.refresh(query_type)
    
    return query_type


async def update_query_type(
    db: AsyncSession,
    query_type_id: int,
    query_type_data: QueryTypeUpdate
) -> QueryType:
    """Update a query type"""
    stmt = select(QueryType).where(QueryType.id == query_type_id)
    result = await db.execute(stmt)
    query_type = result.scalar_one_or_none()
    
    if not query_type:
        raise NotFoundError(f"Query type with id {query_type_id} not found")
    
    update_dict = query_type_data.model_dump(exclude_unset=True)
    
    # Check if name already exists (if name is being changed)
    if 'name' in update_dict and update_dict['name'] != query_type.name:
        existing_stmt = select(QueryType).where(
            and_(
                QueryType.name == update_dict['name'],
                QueryType.id != query_type_id
            )
        )
        existing_result = await db.execute(existing_stmt)
        existing = existing_result.scalar_one_or_none()
        
        if existing:
            raise ValidationError(f"Query type with name '{update_dict['name']}' already exists")
    
    # Update fields
    for key, value in update_dict.items():
        if value is not None:
            setattr(query_type, key, value)
    
    await db.commit()
    await db.refresh(query_type)
    
    return query_type


async def delete_query_type(
    db: AsyncSession,
    query_type_id: int,
    permanent: bool = False
) -> bool:
    """Delete a query type"""
    stmt = select(QueryType).where(QueryType.id == query_type_id)
    result = await db.execute(stmt)
    query_type = result.scalar_one_or_none()
    
    if not query_type:
        raise NotFoundError(f"Query type with id {query_type_id} not found")
    
    if permanent:
        # Permanent delete
        stmt = delete(QueryType).where(QueryType.id == query_type_id)
        await db.execute(stmt)
    else:
        # Soft delete - deactivate
        query_type.is_active = False
        await db.commit()
    
    await db.commit()
    return True


async def enrich_query_with_relations(
    db: AsyncSession,
    query: Query
) -> dict:
    """Enrich query with related data for response"""
    result = {
        'id': query.id,
        'spa_id': query.spa_id,
        'query_type_id': query.query_type_id,
        'query': query.query,
        'contact_number': query.contact_number,
        'status': query.status,
        'admin_remark': query.admin_remark,
        'created_at': query.created_at,
        'updated_at': query.updated_at,
        'created_by': query.created_by,
        'updated_by': query.updated_by,
        'is_active': query.is_active,
        'is_deleted': query.is_deleted,
        'spa_name': None,
        'spa_address': None,
        'spa_city': None,
        'spa_area': None,
        'spa_state': None,
        'query_type_name': None,
        'created_by_name': None,
        'updated_by_name': None,
    }
    
    # Get SPA details
    if query.spa_id:
        spa_stmt = select(SPA).where(SPA.id == query.spa_id)
        spa_result = await db.execute(spa_stmt)
        spa = spa_result.scalar_one_or_none()
        if spa:
            result['spa_name'] = spa.name
            result['spa_address'] = spa.address
            result['spa_city'] = spa.city
            result['spa_area'] = spa.area
            result['spa_state'] = spa.state
    
    # Get query type name
    if query.query_type_id:
        type_stmt = select(QueryType).where(QueryType.id == query.query_type_id)
        type_result = await db.execute(type_stmt)
        query_type = type_result.scalar_one_or_none()
        if query_type:
            result['query_type_name'] = query_type.name
    
    # Get created by name
    if query.created_by:
        user_stmt = select(User).where(User.id == query.created_by)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()
        if user:
            result['created_by_name'] = user.full_name
    
    # Get updated by name
    if query.updated_by:
        user_stmt = select(User).where(User.id == query.updated_by)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()
        if user:
            result['updated_by_name'] = user.full_name
    
    return result
