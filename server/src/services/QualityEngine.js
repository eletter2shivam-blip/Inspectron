class QualityEngine {
  /**
   * Run comprehensive quality audit on test cases
   */
  evaluate(testCases = []) {
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return {
        quality_score: 0,
        grade: 'N/A',
        strengths: [],
        weaknesses: ['No test cases provided for quality audit.'],
        suggestions: ['Generate or import test cases to run quality inspection.'],
        metrics: {
          total: 0,
          duplicates: 0,
          missingPreconditions: 0,
          missingExpectedResults: 0,
          nonTestableLanguageCount: 0,
          negativeCasesCount: 0,
          boundaryCasesCount: 0
        }
      };
    }

    let score = 100;
    const strengths = [];
    const weaknesses = [];
    const suggestions = [];

    const seenTitles = new Map();
    const seenScenarios = new Map();
    const seenData = new Map();

    let missingPreconditions = 0;
    let missingExpected = 0;
    let duplicateScenarios = 0;
    let nonTestableCount = 0;
    let negativeCount = 0;
    let boundaryCount = 0;
    let unclearStepsCount = 0;

    const vagueWords = ['works fine', 'should work', 'look good', 'fast', 'acceptable', 'properly', 'normal', 'simple'];

    testCases.forEach((tc, idx) => {
      const title = (tc.title || '').trim().toLowerCase();
      const scenario = (tc.scenario || '').trim().toLowerCase();

      // Duplicate title / scenario
      if (title && seenTitles.has(title)) {
        duplicateScenarios++;
        score -= 6;
      } else if (title) {
        seenTitles.set(title, idx);
      }

      if (scenario && seenScenarios.has(scenario)) {
        duplicateScenarios++;
        score -= 4;
      } else if (scenario) {
        seenScenarios.set(scenario, idx);
      }

      // Precondition check
      if (!tc.preconditions || tc.preconditions.trim().length < 5) {
        missingPreconditions++;
        score -= 3;
      }

      // Expected result check
      if (!tc.expected_result || tc.expected_result.trim().length < 8) {
        missingExpected++;
        score -= 5;
      }

      // Steps validation
      const steps = Array.isArray(tc.steps) ? tc.steps : (tc.steps || '').split('\n').filter(s => s.trim().length > 0);
      if (steps.length < 2) {
        unclearStepsCount++;
        score -= 3;
      }

      // Non-testable language check
      const textToScan = `${tc.title} ${tc.expected_result} ${(steps).join(' ')}`.toLowerCase();
      const foundVague = vagueWords.filter(w => textToScan.includes(w));
      if (foundVague.length > 0) {
        nonTestableCount++;
        score -= 2;
      }

      // Type classifications
      const testType = (tc.test_type || '').toLowerCase();
      if (testType === 'negative') negativeCount++;
      if (testType === 'boundary') boundaryCount++;
    });

    // Check coverage diversity
    if (negativeCount === 0 && testCases.length >= 3) {
      score -= 8;
      weaknesses.push('Suite lacks explicit Negative scenarios (error handling, invalid inputs).');
      suggestions.push('Add dedicated negative test cases testing invalid characters, empty values, and failed authentications.');
    } else if (negativeCount > 0) {
      strengths.push(`Includes ${negativeCount} negative failure/validation scenario(s).`);
    }

    if (boundaryCount === 0 && testCases.length >= 3) {
      score -= 6;
      weaknesses.push('Suite lacks Boundary-Value scenarios (min/max limits, zero/empty states).');
      suggestions.push('Incorporate boundary test cases for minimum length, maximum character thresholds, and numeric extremes.');
    } else if (boundaryCount > 0) {
      strengths.push(`Includes ${boundaryCount} boundary-value scenario(s).`);
    }

    if (duplicateScenarios > 0) {
      weaknesses.push(`Found ${duplicateScenarios} duplicate or overlapping scenario(s).`);
      suggestions.push('Consolidate redundant test scenarios to optimize CI/CD test execution cycle time.');
    } else {
      strengths.push('Zero duplicate test titles or redundant scenarios detected.');
    }

    if (missingPreconditions > 0) {
      weaknesses.push(`${missingPreconditions} test cases are missing explicit preconditions.`);
      suggestions.push('Specify explicit system state prerequisites (user authentication, test account setup) for every test case.');
    } else {
      strengths.push('All test cases specify clear preconditions.');
    }

    if (missingExpected > 0) {
      weaknesses.push(`${missingExpected} test cases have missing or ambiguous expected results.`);
      suggestions.push('Ensure each test case has definitive, observable, and measurable expected outcomes.');
    }

    if (nonTestableCount > 0) {
      weaknesses.push(`${nonTestableCount} test cases contain subjective language (e.g. "works properly", "fast").`);
      suggestions.push('Replace subjective wording with deterministic criteria (e.g. "responds in < 500ms with HTTP 200").');
    }

    // Clamp score
    score = Math.max(15, Math.min(100, Math.round(score)));

    let grade = 'A';
    if (score < 60) grade = 'Needs Improvement';
    else if (score < 75) grade = 'C';
    else if (score < 85) grade = 'B';
    else if (score < 93) grade = 'B+';

    if (suggestions.length === 0) {
      suggestions.push('Excellent test suite hygiene. Proceed to export or automated script generation.');
    }

    return {
      quality_score: score,
      grade,
      strengths,
      weaknesses,
      suggestions,
      metrics: {
        total: testCases.length,
        duplicates: duplicateScenarios,
        missingPreconditions,
        missingExpectedResults: missingExpected,
        nonTestableLanguageCount: nonTestableCount,
        negativeCasesCount: negativeCount,
        boundaryCasesCount: boundaryCount,
        unclearStepsCount
      }
    };
  }
}

module.exports = new QualityEngine();
