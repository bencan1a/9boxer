# Contributing to Python Template

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🚀 Getting Started

### Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/yourusername/python-template.git
   cd python-template
   ```

2. **Set up development environment**:
   ```bash
   make dev
   # Or manually:
   pip install -e '.[dev]'
   pre-commit install
   ```

3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Using DevContainer

For the best development experience, use the provided devcontainer:

1. Open the project in VS Code
2. Click "Reopen in Container" when prompted
3. Wait for the container to build and start
4. All dependencies will be automatically installed

## 📝 Contribution Guidelines

### Code Style

- Follow PEP 8 style guide
- Use type hints for all function signatures
- Maximum line length: 100 characters
- Use meaningful variable and function names
- Write docstrings for all public modules, functions, classes, and methods

### Commit Messages

Write clear, descriptive commit messages:

```
feat: Add new calculator function
fix: Resolve division by zero error
docs: Update README with new examples
test: Add tests for greeter module
refactor: Simplify calculator logic
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or changes
- `refactor`: Code refactoring
- `style`: Code style changes (formatting, etc.)
- `chore`: Maintenance tasks

### Pull Request Process

1. **Before submitting**:
   - Run all tests: `make test`
   - Run all quality checks: `make check-all`
   - Update documentation if needed
   - Add tests for new functionality

2. **Pull request checklist**:
   - [ ] Code follows project style guidelines
   - [ ] All tests pass
   - [ ] Test coverage maintained or improved
   - [ ] Documentation updated
   - [ ] Commit messages are clear
   - [ ] PR description explains changes
   - [ ] Breaking changes are documented

3. **Review process**:
   - All CI checks must pass
   - At least one approval required
   - Address review feedback
   - Keep PR focused and small

## 🧪 Testing

### Running Tests

```bash
# Run all tests
make test

# Run with coverage
make coverage

# Run specific test
pytest tests/test_calculator.py

# Run tests matching pattern
pytest -k "test_add"
```

### Writing Tests

- Place tests in the `tests/` directory
- Name test files `test_*.py`
- Use descriptive test function names: `test_<function>_<scenario>`
- Follow AAA pattern: Arrange, Act, Assert
- Use fixtures for common setup
- Add parametrized tests for multiple scenarios

Example:
```python
def test_calculator_add_positive_numbers():
    """Test that calculator correctly adds positive numbers."""
    # Arrange
    calc = Calculator()
    
    # Act
    result = calc.add(2, 3)
    
    # Assert
    assert result == 5
```

## 🔍 Code Quality

### Pre-commit Hooks

Pre-commit hooks run automatically before each commit:

```bash
# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Manual Checks

```bash
# Format code
make format

# Lint code
make lint

# Type check
make type-check

# Security scan
make security

# All checks
make check-all
```

## 📚 Documentation

### Docstring Format

Use Google-style docstrings:

```python
def function_name(param1: str, param2: int) -> bool:
    """
    Brief description of function.

    Longer description if needed.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Description of return value

    Raises:
        ValueError: When invalid input is provided

    Examples:
        >>> function_name("test", 42)
        True
    """
    pass
```

### Updating Documentation

- Update README.md for user-facing changes
- Update docstrings for API changes
- Add examples for new features
- Update CHANGELOG.md

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Reproduction steps**: Minimal steps to reproduce
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: Python version, OS, etc.
6. **Code sample**: Minimal code to reproduce the issue

## 💡 Suggesting Features

When suggesting features:

1. **Use case**: Explain why this feature is needed
2. **Proposal**: Describe the proposed solution
3. **Alternatives**: What alternatives have you considered?
4. **Examples**: Provide usage examples

## ❓ Questions

For questions:
- Check existing issues and discussions
- Review documentation
- Ask in GitHub Discussions
- Open an issue with the "question" label

## 📋 Development Commands

```bash
# Development setup
make dev                 # Set up development environment
make install-dev        # Install with dev dependencies

# Testing
make test               # Run tests
make coverage           # Run tests with coverage
make test-verbose       # Run tests with verbose output

# Code quality
make format             # Format code
make lint               # Lint code
make type-check         # Type check code
make security           # Security scan
make check-all          # Run all checks

# Cleanup
make clean              # Remove generated files

# Build and publish
make build              # Build distribution
make publish-test       # Publish to TestPyPI
make publish            # Publish to PyPI
```

## 🙏 Thank You

Thank you for contributing to this project! Your efforts help make this template better for everyone.
