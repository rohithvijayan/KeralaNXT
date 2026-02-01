# Contributing to KeralaNXT

Thanks for your interest in contributing to KeralaNXT — we appreciate your help! This document explains how to file issues, propose changes, and submit pull requests so we can review and merge your work quickly.

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [How can I contribute?](#how-can-i-contribute)
  - [Reporting bugs](#reporting-bugs)
  - [Suggesting enhancements](#suggesting-enhancements)
  - [Submitting code changes (pull requests)](#submitting-code-changes-pull-requests)
- [Development workflow](#development-workflow)
- [Commit message guidelines](#commit-message-guidelines)
- [Testing and quality](#testing-and-quality)
- [Style and linting](#style-and-linting)
- [Getting help](#getting-help)
- [License](#license)

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) — if the file does not exist yet, please be respectful and collaborative in all interactions. If you would like, open a PR adding the repository's standard Contributor Covenant.

## How can I contribute?

There are several ways to contribute:

- Report bugs or regressions.
- Propose new features or enhancements.
- Improve documentation or examples.
- Submit bug fixes, new features, or refactors via pull requests.

### Reporting bugs

When opening a bug report, include:

- A clear and descriptive title.
- Steps to reproduce the behavior.
- What you expected to happen.
- What actually happened, including error messages and stack traces.
- Environment information (OS, Node/Python/Java version, browser/version if relevant).
- Minimal reproduction or example repository / code snippet if possible.

A short bug report template:

```text
Title: [short, descriptive]

Steps to reproduce:
1. ...
2. ...

Expected behavior:
...

Actual behavior:
...

Environment:
- OS:
- Version:
- Any relevant logs or stack traces:
```

### Suggesting enhancements

When suggesting a new feature:

- Explain the problem it's solving and who benefits.
- Describe the proposed solution and alternatives.
- If possible, include a short mockup or example usage.

### Submitting code changes (pull requests)

1. Fork the repository and create a branch from main (or the default branch):
   ```bash
   git checkout -b add-feature-or-fix
   ```
2. Make your changes in a single branch with clear, focused commits.
3. Run tests and linters locally.
4. Update documentation where appropriate.
5. Open a pull request describing:
   - What changed and why.
   - Any notable implementation details.
   - How to test the change.
   - Link any related issues with `Closes #<issue>` if applicable.

Pull request checklist:
- [ ] My changes follow the repository style and lint rules.
- [ ] I ran the test suite and all tests pass.
- [ ] I updated documentation if required.
- [ ] I added tests for new behavior where appropriate.

## Development workflow

We prefer small, focused pull requests. Suggested branch naming:

- feature/<short-description>
- fix/<short-description>
- docs/<short-description>

Example workflow:

```bash
git clone https://github.com/<your-username>/KeralaNXT.git
cd KeralaNXT
git checkout -b add-contributing
# make changes
git add CONTRIBUTING.md
git commit -m "docs: add contributing guide"
git push origin add-contributing
```

Then open a PR on GitHub comparing your branch against `main` (or the project default branch).

## Commit message guidelines

Use short, descriptive commit messages in present tense. Optionally follow Conventional Commits:

```
<type>(<scope>): <short summary>

More detailed description if necessary.

BREAKING CHANGE: description of the change
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Testing and quality

Run the project's test suite before opening a PR. The command depends on the project stack — examples:

- JavaScript/TypeScript: `npm test` or `yarn test`
- Python: `pytest`
- Other: `make test` or the project's documented test command

If there are no tests, consider adding tests for any bugfixes or new features.

## Style and linting

Follow existing code style. If the repository has linters or formatters configured (ESLint, Prettier, Black, etc.), run them before committing:

```bash
# examples
npm run lint
npm run format
black .
```

If no tooling exists, aim to keep changes consistent with surrounding code.

## Getting help

If you need help, open an issue describing the problem and include relevant context. You can also mention maintainers in existing issues/PRs if appropriate.

## License

By contributing to KeralaNXT you agree that your contributions will be licensed under the same license as the project (see the `LICENSE` file in the repository).

Thank you for contributing!