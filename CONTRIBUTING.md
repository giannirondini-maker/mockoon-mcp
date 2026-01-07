# Contributing to Mockoon MCP Server

Thank you for your interest in contributing to the Mockoon MCP Server! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm (comes with Node.js)
- Git
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mockoon-mcp.git
   cd mockoon-mcp
   ```

3. **Add the upstream repository** as a remote:
   ```bash
   git remote add upstream https://github.com/giannirondini-maker/mockoon-mcp.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

6. **Verify everything works**:
   ```bash
   npm start
   ```

## Development Workflow

### Working on a Feature or Bug Fix

1. **Create a new branch** from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```
   
   Use prefixes:
   - `feature/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation changes
   - `refactor/` for code refactoring

2. **Make your changes** following the coding standards below

3. **Test your changes** thoroughly

4. **Commit your changes** with clear, descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add support for nested data buckets"
   ```
   
   Follow conventional commit format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Development Commands

- `npm run dev` - Run in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm start` - Run the compiled server

## Coding Standards

### TypeScript Best Practices

- Use TypeScript for all new code
- Avoid using `any` type; prefer proper type definitions
- Define interfaces in `src/types/` for reusable types
- Use Zod schemas for runtime validation

### Code Organization

- **Single Responsibility**: Each file should have one clear purpose
- **Tool Handlers**: Place new MCP tools in appropriate handler files under `src/tools/handlers/`
- **Utilities**: Shared utility functions go in `src/utils/`
- **Type Definitions**: All Mockoon-related types in `src/types/mockoon.ts`

### ESLint

All code must pass ESLint checks:

```bash
npm run lint
```

Common rules enforced:
- No unused variables or imports
- Consistent code formatting
- Proper TypeScript usage

### Documentation

- Add JSDoc comments for public functions
- Update `README.md` if adding new features
- Update `doc/ARCHITECTURE.md` for structural changes
- Update `.github/copilot-instructions.md` for major changes

Example JSDoc:
```typescript
/**
 * Reads and parses a Mockoon configuration file
 * @param filePath - Absolute path to the Mockoon JSON file
 * @returns Parsed MockoonConfig object
 * @throws Error if file doesn't exist or is invalid JSON
 */
export async function readMockoonConfig(filePath: string): Promise<MockoonConfig> {
  // Implementation
}
```

## Submitting Changes

### Pull Request Process

1. **Ensure your code passes all checks**:
   ```bash
   npm run build
   npm run lint
   ```

2. **Update documentation** as needed:
   - README.md for user-facing changes
   - ARCHITECTURE.md for architectural changes
   - Add comments for complex logic

3. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues (e.g., "Fixes #123")
   - Describe what changed and why
   - Include examples if applicable

4. **Pull Request Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   Describe how you tested your changes
   
   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] ESLint passes without errors
   - [ ] Documentation updated
   - [ ] Self-review completed
   ```

5. **Respond to feedback** from maintainers promptly

### What to Include in a PR

- **Clear commits**: Each commit should be atomic and well-described
- **Tests**: Add tests for new functionality (when applicable)
- **Documentation**: Update relevant docs
- **No unrelated changes**: Keep PRs focused on one feature/fix

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** in README.md and doc/
3. **Update to the latest version** to see if it's already fixed

### Creating a Good Issue

Use the following template:

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 14.0]
- Node.js version: [e.g., 22.0.0]
- MCP Server version: [e.g., 1.0.0]

## Additional Context
Any other relevant information, logs, or screenshots
```

## Feature Requests

We welcome feature requests! Please provide:

1. **Clear use case**: Why is this feature needed?
2. **Proposed solution**: How should it work?
3. **Alternatives considered**: What other approaches did you think about?
4. **Additional context**: Any examples, mockups, or references

## Questions?

If you have questions about contributing, feel free to:

- Open a GitHub Discussion
- Create an issue with the "question" label
- Check existing documentation in the `doc/` folder

## Recognition

Contributors will be recognized in:
- GitHub's contributor list
- Release notes for significant contributions

Thank you for contributing to make this project better! 🎉
