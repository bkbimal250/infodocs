# Backend Performance Optimizations

## Issues Identified

### 1. **N+1 Query Problem**
- **Location**: `get_public_certificates()`, `get_user_certificates()`, `get_all_certificates_with_users()`
- **Issue**: Multiple separate queries executed in loops for each certificate model type
- **Impact**: High database load, slow response times
- **Fix**: Use UNION ALL queries or execute queries in parallel

### 2. **Memory Inefficiency**
- **Location**: Certificate listing functions
- **Issue**: Loading all certificates from all tables into memory, then sorting and slicing in Python
- **Impact**: High memory usage, slow for large datasets
- **Fix**: Implement database-level pagination and sorting

### 3. **Synchronous File I/O**
- **Location**: `save_base64_image()`, `save_certificate_file()`
- **Issue**: Blocking file operations in async context
- **Impact**: Blocks event loop, reduces concurrency
- **Fix**: Use `aiofiles` for async file operations

### 4. **Redundant Path Calculations**
- **Location**: `prepare_certificate_data()`
- **Issue**: Path calculations repeated on every call
- **Impact**: Unnecessary CPU cycles
- **Fix**: Cache path calculations at module level

### 5. **Multiple SPA Queries**
- **Location**: `routers.py` - multiple endpoints
- **Issue**: Separate SPA queries instead of joins or caching
- **Impact**: Extra database round trips
- **Fix**: Use joins or implement SPA caching

### 6. **No Template Caching**
- **Location**: `get_template_by_id()`, `get_public_templates()`
- **Issue**: Templates fetched from database on every request
- **Impact**: Unnecessary database queries for frequently accessed data
- **Fix**: Implement Redis or in-memory caching for templates

## Optimizations Implemented

### 1. Optimized Certificate Queries
- Combined multiple queries using UNION ALL approach
- Added database-level pagination
- Parallel query execution where possible

### 2. Async File Operations
- Converted file I/O to async using `aiofiles`
- Non-blocking file operations

### 3. Path Calculation Caching
- Cached static paths at module level
- Reduced redundant calculations

### 4. Query Optimization
- Added proper indexes recommendations
- Optimized WHERE clauses
- Reduced data transfer

## Performance Metrics Expected

- **Query Time**: 60-80% reduction for certificate listings
- **Memory Usage**: 50-70% reduction for large datasets
- **Concurrency**: 2-3x improvement with async file I/O
- **Response Time**: 40-60% improvement for certificate endpoints

## Database Index Recommendations

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_certificates_public ON certificate_templates(is_public, is_active);
CREATE INDEX idx_certificates_created_by ON spa_therapist_certificates(created_by);
CREATE INDEX idx_certificates_generated_at ON spa_therapist_certificates(generated_at);
-- Similar indexes for other certificate tables
```

## Monitoring

Monitor these metrics:
- Database query execution time
- Memory usage per request
- File I/O operation time
- API response times
- Database connection pool usage
