# Testing Guidelines & Definition of Done

## Overview
This document outlines the testing requirements, implementation process, and Definition of Done (DoD) criteria for the Gemini CLI project, with emphasis on comprehensive unit test coverage.

## Implementation Process

### 1. Pre-Implementation Phase
- [ ] **Requirements Analysis**: Clearly define functional and non-functional requirements
- [ ] **Test Planning**: Identify test scenarios, edge cases, and coverage targets
- [ ] **Architecture Review**: Ensure changes align with existing patterns and don't break isolation

### 2. Implementation Phase
- [ ] **Test-Driven Development (TDD)**: Write tests before or alongside implementation
- [ ] **Code Implementation**: Implement features following established patterns
- [ ] **Continuous Testing**: Run tests frequently during development

### 3. Testing Phase
- [ ] **Unit Test Coverage**: Achieve minimum 90% code coverage for new code
- [ ] **Integration Testing**: Verify component interactions work correctly
- [ ] **Manual Testing**: Test user-facing functionality end-to-end

## Unit Test Requirements

### Coverage Targets
- **New Code**: Minimum 90% line coverage
- **Modified Code**: Maintain or improve existing coverage
- **Critical Paths**: 100% coverage for error handling and core business logic

### Test Categories Required

#### 1. Core Functionality Tests
```typescript
describe('CoreFeature', () => {
  it('should handle normal input correctly', () => {
    // Test main happy path
  });
  
  it('should handle edge cases', () => {
    // Test boundary conditions
  });
  
  it('should handle error conditions', () => {
    // Test error scenarios
  });
});
```

#### 2. Method-Level Coverage
For each public method, ensure tests for:
- [ ] **Happy Path**: Normal operation with valid inputs
- [ ] **Edge Cases**: Boundary conditions, empty inputs, null/undefined
- [ ] **Error Handling**: Invalid inputs, network failures, API errors
- [ ] **State Changes**: Verify object state changes correctly

#### 3. Integration Points
- [ ] **External Dependencies**: Mock all external calls (APIs, file system, etc.)
- [ ] **Component Interactions**: Test how components work together
- [ ] **Configuration Variations**: Test different config scenarios

### Test Structure Standards

#### File Organization
```
src/
├── feature/
│   ├── feature.ts
│   ├── feature.test.ts          # Unit tests
│   └── feature.integration.test.ts  # Integration tests (if needed)
```

#### Test Naming Convention
```typescript
describe('ClassName/FeatureName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
    
    it('should throw [error type] when [invalid condition]', () => {
      // Error test
    });
  });
});
```

#### Test Structure Template
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let mockDependency: jest.MockedObject<DependencyType>;

  beforeEach(() => {
    // Setup fresh instances for each test
    mockDependency = createMockDependency();
    component = new ComponentName(mockDependency);
  });

  afterEach(() => {
    // Cleanup if needed
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'valid input';
      const expectedOutput = 'expected result';
      
      // Act
      const result = component.methodName(input);
      
      // Assert
      expect(result).toBe(expectedOutput);
    });
  });
});
```

## Definition of Done (DoD)

### ✅ Code Quality
- [ ] **Code Review**: At least one peer review completed
- [ ] **Linting**: No ESLint errors or warnings
- [ ] **Type Safety**: No TypeScript errors
- [ ] **Code Style**: Follows established conventions

### ✅ Testing Requirements
- [ ] **Unit Tests**: All new code has comprehensive unit tests
- [ ] **Test Coverage**: Minimum 90% line coverage for new/modified code
- [ ] **Test Quality**: Tests cover happy path, edge cases, and error conditions
- [ ] **Test Isolation**: Tests are independent and can run in any order
- [ ] **Mock Usage**: External dependencies are properly mocked

### ✅ Functional Requirements
- [ ] **Feature Complete**: All acceptance criteria met
- [ ] **Manual Testing**: Feature tested manually in realistic scenarios
- [ ] **Integration Testing**: Component interactions verified
- [ ] **Performance**: No significant performance regressions

### ✅ Documentation
- [ ] **Code Comments**: Complex logic is well-documented
- [ ] **API Documentation**: Public interfaces documented
- [ ] **Test Documentation**: Test cases explain what they verify
- [ ] **Update Guides**: Relevant documentation updated

### ✅ Quality Assurance
- [ ] **Build Success**: All builds pass in CI/CD
- [ ] **Test Suite**: All tests pass (unit, integration, e2e)
- [ ] **Security**: No security vulnerabilities introduced
- [ ] **Backward Compatibility**: Existing functionality unaffected

## Coverage Verification Process

### 1. Running Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View detailed coverage
npm run test:coverage:html
open coverage/index.html
```

### 2. Coverage Thresholds
Configure in `vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
});
```

### 3. Coverage Review Checklist
- [ ] **Line Coverage**: ≥90% for new code
- [ ] **Branch Coverage**: ≥80% for conditional logic
- [ ] **Function Coverage**: 100% for public methods
- [ ] **Uncovered Lines**: Justified or covered by integration tests

## Code Review Checklist

### Testing Focus Areas
- [ ] **Test Completeness**: All scenarios covered
- [ ] **Test Quality**: Tests are clear, focused, and maintainable
- [ ] **Mock Appropriateness**: Mocks are used correctly and don't over-mock
- [ ] **Error Scenarios**: Error conditions properly tested
- [ ] **Edge Cases**: Boundary conditions covered

### Implementation Review
- [ ] **Code Structure**: Follows established patterns
- [ ] **Error Handling**: Proper error handling and logging
- [ ] **Performance**: No obvious performance issues
- [ ] **Security**: No security vulnerabilities
- [ ] **Maintainability**: Code is readable and well-structured

## Example: Ollama Integration Testing

### Implementation Steps Followed
1. **Analysis**: Identified need for Ollama support with thinking token removal
2. **Test Planning**: Defined test scenarios for content generation, streaming, and optimization
3. **TDD Approach**: Created comprehensive test suite before finalizing implementation
4. **Coverage Verification**: Achieved 100% coverage for new OllamaContentGenerator class

### Test Coverage Achieved
```
✅ OllamaContentGenerator: 14 tests
  ✅ cleanThinkingTokens: 7 tests (100% coverage)
  ✅ generateContentStream: 3 tests (100% coverage)  
  ✅ generateContent: 2 tests (100% coverage)
  ✅ convertToOllamaMessages: 2 tests (100% coverage)

✅ Client optimization: 8 tests
  ✅ shouldSkipNextSpeakerCheckForOllama: 8 tests (100% coverage)

✅ ContentGenerator factory: 2 additional tests
  ✅ Ollama auth type handling: 2 tests (100% coverage)
```

### DoD Verification
- [x] Code Review: Peer reviewed
- [x] Unit Tests: 24 new tests added
- [x] Coverage: 100% for new code
- [x] Integration: All 1,081 tests pass
- [x] Manual Testing: End-to-end functionality verified
- [x] Documentation: Implementation documented

## Continuous Improvement

### Regular Reviews
- **Weekly**: Review test coverage reports
- **Monthly**: Analyze test quality and effectiveness
- **Quarterly**: Update testing guidelines based on lessons learned

### Metrics Tracking
- Test coverage percentage over time
- Test execution time trends
- Defect detection rate by test type
- Code review feedback patterns

### Tool Integration
- **CI/CD**: Automated coverage reporting
- **IDE**: Real-time coverage feedback
- **Code Review**: Coverage diff in pull requests
- **Monitoring**: Track coverage in production deployments

---

This document ensures that all code changes maintain high quality through comprehensive testing and rigorous review processes. 