# UI Components Library

A centralized collection of reusable UI components for the project.

## Components

### Input
Text input component with support for various input types.

```jsx
import { Input } from '@/ui';

<Input
  name="email"
  label="Email Address"
  type="email"
  value={formData.email}
  onChange={handleChange}
  placeholder="Enter your email"
  required
  error={errors.email}
  helperText="We'll never share your email"
/>
```

**Props:**
- `name` (required): Field name
- `label`: Label text
- `type`: Input type (text, email, password, number, date, etc.)
- `value`: Input value
- `onChange`: Change handler
- `placeholder`: Placeholder text
- `required`: Show required indicator
- `disabled`: Disable input
- `error`: Error message to display
- `helperText`: Helper text below input
- `className`: Additional CSS classes

---

### Select
Dropdown select component with options support.

```jsx
import { Select } from '@/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  // Or simple strings: ['Option 1', 'Option 2']
];

<Select
  name="category"
  label="Category"
  value={formData.category}
  onChange={handleChange}
  options={options}
  placeholder="Select a category"
  required
/>
```

**Props:**
- `name` (required): Field name
- `label`: Label text
- `value`: Selected value
- `onChange`: Change handler
- `options`: Array of options (strings or {value, label} objects)
- `placeholder`: Placeholder text
- `required`: Show required indicator
- `disabled`: Disable select
- `error`: Error message to display
- `helperText`: Helper text below select
- `className`: Additional CSS classes

---

### Button
Button component with multiple variants and sizes.

```jsx
import { Button } from '@/ui';

<Button
  variant="primary"
  size="md"
  onClick={handleClick}
  loading={isLoading}
  disabled={isDisabled}
  fullWidth
>
  Click Me
</Button>
```

**Props:**
- `children` (required): Button content
- `type`: Button type (button, submit, reset)
- `variant`: Style variant (primary, secondary, success, danger, warning, outline, ghost)
- `size`: Size (sm, md, lg, xl)
- `disabled`: Disable button
- `loading`: Show loading spinner
- `fullWidth`: Make button full width
- `onClick`: Click handler
- `className`: Additional CSS classes

---

### Textarea
Multi-line text input component.

```jsx
import { Textarea } from '@/ui';

<Textarea
  name="description"
  label="Description"
  value={formData.description}
  onChange={handleChange}
  rows={4}
  placeholder="Enter description"
  required
/>
```

**Props:**
- `name` (required): Field name
- `label`: Label text
- `value`: Textarea value
- `onChange`: Change handler
- `rows`: Number of rows
- `placeholder`: Placeholder text
- `required`: Show required indicator
- `disabled`: Disable textarea
- `error`: Error message to display
- `helperText`: Helper text below textarea
- `className`: Additional CSS classes

---

### Checkbox
Checkbox input component.

```jsx
import { Checkbox } from '@/ui';

<Checkbox
  name="agree"
  label="I agree to the terms and conditions"
  checked={formData.agree}
  onChange={handleChange}
  required
/>
```

**Props:**
- `name` (required): Field name
- `label`: Label text
- `checked`: Checked state
- `onChange`: Change handler
- `required`: Show required indicator
- `disabled`: Disable checkbox
- `error`: Error message to display
- `helperText`: Helper text
- `className`: Additional CSS classes

---

### RadioGroup
Radio button group component.

```jsx
import { RadioGroup } from '@/ui';

const options = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

<RadioGroup
  name="gender"
  label="Gender"
  value={formData.gender}
  onChange={handleChange}
  options={options}
  required
/>
```

**Props:**
- `name` (required): Field name
- `label`: Group label
- `value`: Selected value
- `onChange`: Change handler
- `options`: Array of options (strings or {value, label} objects)
- `required`: Show required indicator
- `disabled`: Disable all radios
- `error`: Error message to display
- `helperText`: Helper text
- `className`: Additional CSS classes

---

### Label
Standalone label component.

```jsx
import { Label } from '@/ui';

<Label htmlFor="input-id" required>
  Field Label
</Label>
```

**Props:**
- `htmlFor`: ID of associated input
- `children` (required): Label text
- `required`: Show required indicator
- `className`: Additional CSS classes

---

### DatePicker
Date picker component with native HTML5 date input.

```jsx
import { DatePicker } from '@/ui';

<DatePicker
  name="birth_date"
  label="Birth Date"
  value={formData.birth_date}
  onChange={handleChange}
  min="1900-01-01"
  max="2024-12-31"
  required
/>
```

**Props:**
- `name` (required): Field name
- `label`: Label text
- `value`: Date value (YYYY-MM-DD format)
- `onChange`: Change handler
- `placeholder`: Placeholder text
- `required`: Show required indicator
- `disabled`: Disable date picker
- `min`: Minimum date (YYYY-MM-DD)
- `max`: Maximum date (YYYY-MM-DD)
- `error`: Error message to display
- `helperText`: Helper text below input
- `className`: Additional CSS classes

---

### Card
Card container component.

```jsx
import { Card } from '@/ui';

<Card
  title="Card Title"
  footer={<Button>Action</Button>}
  padding="p-4"
>
  Card content goes here
</Card>
```

**Props:**
- `children` (required): Card content
- `title`: Card title (string or node)
- `footer`: Footer content (node)
- `padding`: Padding class (default: 'p-6')
- `className`: Additional CSS classes

---

## Usage Examples

### Complete Form Example

```jsx
import { Input, Select, Button, Textarea, DatePicker } from '@/ui';

const MyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form>
      <Input
        name="name"
        label="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      
      <Input
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      
      <Select
        name="category"
        label="Category"
        value={formData.category}
        onChange={handleChange}
        options={['Option 1', 'Option 2', 'Option 3']}
        required
      />
      
      <Textarea
        name="message"
        label="Message"
        value={formData.message}
        onChange={handleChange}
        rows={5}
      />
      
      <DatePicker
        name="date"
        label="Select Date"
        value={formData.date}
        onChange={handleChange}
        required
      />
      
      <Button type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
};
```

## Features

- ✅ Consistent styling with Tailwind CSS
- ✅ Memoized for performance
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Error handling and validation support
- ✅ Responsive design
- ✅ TypeScript-ready (PropTypes included)

## Importing

```jsx
// Import individual components
import { Input, Select, Button, DatePicker } from '@/ui';

// Or import from specific file
import Input from '@/ui/Input';
import DatePicker from '@/ui/DatePicker';
```
