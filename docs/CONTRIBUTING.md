# Contributing to Phoenix Blaze

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/zombie.git`
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Commit: `git commit -m "feat: add your feature"`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

## Code Style

We use ESLint for code style. Run before committing:
```bash
npm run lint:fix
```

### Naming Conventions
- Classes: `PascalCase` (e.g., `CraftingSystem`)
- Functions/methods: `camelCase` (e.g., `createNPC`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_INVENTORY_SLOTS`)
- Files: `lowercase-with-hyphens.js` or `PascalCase.js` for classes

## Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions
- `chore:` Build/tooling changes

Example: `feat: add cannabis growth mechanics`

## Testing

Add tests for new features:
```bash
npm run test:watch
```

## Documentation

- Update relevant `.md` files
- Add JSDoc comments for new functions
- Update ARCHITECTURE.md if adding new systems

## Development Workflow

1. Create feature branch from `main`
2. Develop locally: `npm run dev`
3. Test: `npm run test`
4. Lint: `npm run lint:fix`
5. Build: `npm run build`
6. Submit PR with description

## Pull Request Process

1. Update documentation if needed
2. Add/update tests
3. Ensure all tests pass: `npm run test`
4. Ensure code lints: `npm run lint`
5. Provide clear PR description with:
   - What changed
   - Why it changed
   - Screenshots if applicable

## Questions?

Reach out to @reeferguyai on GitHub or open a discussion.

Thank you for contributing! 🧟