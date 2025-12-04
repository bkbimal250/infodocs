# SQL Command to Add `staff_required` Column

## Add Column to `hiring_forms` Table

```sql
ALTER TABLE hiring_forms 
ADD COLUMN staff_required INT NOT NULL DEFAULT 1 
AFTER created_by;
```

**Note:** If the table already has data and you want to set a default value for existing rows, you can use:

```sql
-- First, add the column as nullable
ALTER TABLE hiring_forms 
ADD COLUMN staff_required INT NULL 
AFTER created_by;

-- Update existing rows with a default value (e.g., 1)
UPDATE hiring_forms 
SET staff_required = 1 
WHERE staff_required IS NULL;

-- Then make it NOT NULL
ALTER TABLE hiring_forms 
MODIFY COLUMN staff_required INT NOT NULL;
```

## Verify the Column

```sql
DESC hiring_forms;
```

Or:

```sql
SHOW COLUMNS FROM hiring_forms LIKE 'staff_required';
```

