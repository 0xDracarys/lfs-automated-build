# 04. Test Operation Examples

This section presents representative test cases and operational data validating system reliability and correctness. Tests are implemented using Vitest and Firebase Emulator Suite (Vitest Team, 2024; Firebase, 2024).

## Unit Tests

- **Auth tests**: Validate login, registration, and error handling. Example:
```tsx
// ...existing code...
expect(screen.getByText('Login successful')).toBeInTheDocument();
// ...existing code...
```

- **Build submission tests**: Ensure input validation and error reporting. Example:
```js
// ...existing code...
expect(response.status).toBe(400);
// ...existing code...
```

## Integration Tests

- **Build flow**: Simulate end-to-end build submission and artifact retrieval. Example:
```js
// ...existing code...
await submitBuild(config);
await expectArtifactAvailable(buildId);
// ...existing code...
```

## Performance Tests

- **Load testing**: Artillery config simulates 10-100 concurrent users, measuring p95 latency and error rates.

## Rationale

Testing ensures system robustness and supports Objective 2 (reduce build time, increase reliability). Real test results are summarized in Table 30 and Table 31.

## Figure Reference

Figure 23: Performance graph showing build time vs CPU cores, derived from Artillery and Cloud Monitoring data; see diagrams/figure-23.png.

*Citation: Vitest Team. (2024). Vitest Documentation. https://vitest.dev/*