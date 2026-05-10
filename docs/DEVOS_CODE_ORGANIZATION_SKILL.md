# DevOS Code Organization SKILL

This is a specialized skill for maintaining DevOS code organization standards.

## Standards to Enforce

### File Size Limit
- **Maximum 30 lines per file**
- Split into multiple files if logic exceeds this
- Includes comments and imports

### Comments
- **Exactly one comment per function/code block**
- Comment explains PURPOSE, not WHAT code does
- Format: `// Purpose of this function/block`

### Type Safety
- Python: Use `type hints` on all functions
- TypeScript: Explicit return types required
- Use `Pydantic` for data validation in Python
- Use interfaces for TypeScript

### Import Structure
- Group: standard library, third-party, local
- Use `index.ts/index.py` files for clean exports
- Avoid circular imports

### No Anti-Patterns
- ❌ Monolithic classes/functions
- ❌ Commented-out code
- ❌ `console.log()` in production code
- ❌ Hardcoded values (use constants)
- ❌ Mixed concerns (UI + logic, DB + API)

## File Organization Template

```
[domain]/
├── types.ts                # Interfaces & types
├── constants.ts            # Enums, defaults
├── [feature1].ts           # Feature logic
├── [feature2].ts           # Feature logic
└── index.ts                # Exports
```

## Refactoring Checklist

When adding code:
1. [ ] File ≤ 30 lines?
2. [ ] One comment per block?
3. [ ] Type hints complete?
4. [ ] No hardcoded values?
5. [ ] Could it be simpler?
6. [ ] Exported via index file?

## Common Refactoring Patterns

**Too many responsibilities:**
```typescript
// ❌ BAD: 1 file, 100+ lines
export class UserService { ... }

// ✅ GOOD: Separate files
export async function fetchUser() { }
export async function updateUser() { }
export async function deleteUser() { }
```

**Long functions:**
```python
# ❌ BAD: 50 lines in one function
def process_data(raw):
    # ... lots of code

# ✅ GOOD: Smaller functions
def validate_data(raw): ...
def transform_data(raw): ...
def save_data(data): ...
```

---

**Invoke this skill for:** Code reviews, refactoring guidance, architecture decisions for DevOS.
