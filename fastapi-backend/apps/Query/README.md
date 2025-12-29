# Query / Support Ticket System

## Overview
This module implements a query/support ticket system where Manager, HR, and Users can send queries to Admin, and Admin can resolve them by updating remarks and status.

## Features

### User Roles
- **Manager (spa_manager)**: Can create queries
- **HR**: Can create queries
- **User**: Can create queries
- **Admin (admin/super_admin)**: Can view all queries, update status, add remarks, and delete queries

### Query Status Flow
1. **pending** - Initial status when query is created
2. **processing** - Admin is working on it
3. **resolved** - Query has been resolved
4. **closed** - Query is closed

## API Endpoints

### Query Type Endpoints
- `GET /api/queries/types` - Get all query types (active only by default)

### Query Endpoints
- `POST /api/queries/` - Create a new query (Manager, HR, User, Admin)
- `GET /api/queries/` - Get list of queries with filters (Users see only their own, Admin sees all)
- `GET /api/queries/{query_id}` - Get a specific query by ID
- `PUT /api/queries/{query_id}` - Update query status and remarks (Admin only)
- `DELETE /api/queries/{query_id}` - Soft delete a query (Admin only)

## Request/Response Examples

### Create Query
```json
POST /api/queries/
{
  "spa_id": 1,
  "query_type_id": 1,
  "query": "Need help with certificate generation",
  "contact_number": "+1234567890"
}
```

### Update Query (Admin only)
```json
PUT /api/queries/{query_id}
{
  "status": "resolved",
  "admin_remark": "Issue resolved. Certificate generation is now working."
}
```

### Get Queries with Filters
```
GET /api/queries/?status=pending&spa_id=1&page=1&page_size=10
```

## Database Models

### QueryType
- Master table for query types (managed by Admin)
- Fields: id, name, description, is_active, created_at, updated_at

### Query
- Main query/ticket table
- Fields:
  - Relations: spa_id, query_type_id, created_by, updated_by, deleted_by
  - Content: query, contact_number
  - Status: status (pending/processing/resolved/closed)
  - Admin: admin_remark
  - Audit: created_at, updated_at, deleted_at
  - Flags: is_active, is_deleted

## Access Control

- **Users (Manager, HR, User)**: Can only view and create their own queries
- **Admin**: Can view all queries, update status/remarks, and delete queries

## Files Structure

```
apps/Query/
├── __init__.py
├── models.py          # SQLAlchemy models
├── schemas.py         # Pydantic schemas
├── routers.py         # FastAPI endpoints
├── services/
│   ├── __init__.py
│   └── query_service.py  # Business logic
└── README.md          # This file
```

## Integration

The router is registered in `main.py`:
```python
app.include_router(query_router, prefix="/api/queries", tags=["Queries"])
```

Models are imported in `config/database.py` for automatic table creation.
