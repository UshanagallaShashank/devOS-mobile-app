# DevOS Git Workflow

## Branch Strategy

- `main` — Production-ready code
- `develop` — Integration branch (staging)
- `feat/*` — Feature branches
- `fix/*` — Bug fix branches
- `docs/*` — Documentation updates

## Commit Message Format

```
type: brief description

Optional longer explanation if needed.

Fixes #issue-number
```

Types:
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `refactor` — Code restructuring
- `test` — Tests
- `chore` — Dependencies, config

## Example

```bash
git checkout -b feat/resume-analyzer
# Make changes following 30-line rule

git add .
git commit -m "feat: add resume analysis with Gemini

- Extract skills from resume text
- Identify gaps against job descriptions
- Generate improvement suggestions"

git push origin feat/resume-analyzer
# Create Pull Request for review
```

## Code Review Checklist

Before merging:
- [ ] All files ≤ 30 lines?
- [ ] Single comment per block?
- [ ] Type hints complete?
- [ ] No hardcoded values?
- [ ] Tests passing?
- [ ] No console logs?
- [ ] Follows module structure?

## Pull Request Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation

## Testing
How to test these changes.

## Checklist
- [ ] Code follows style guide
- [ ] Comments explain purpose
- [ ] Files under 30 lines
- [ ] Type hints added
- [ ] Tests pass locally
```
