# Keyword Counting Prompt Evolution

## Problem Statement
The AI content generation system was significantly overshooting keyword mention targets, resulting in keyword stuffing that could harm SEO. Target was 41-45 mentions, but actual output was 97 mentions (237% of lower bound).

## Evolution of Solutions

### Version 1: Initial Implementation (Generic)
**File**: `content-creator.js` (lines 397-416, original)

**Approach:**
- Generic "hit the target" instruction
- Example distribution pattern
- "YOU MUST HIT THIS TARGET" closing statement

**Results:**
- Target: 41-45 mentions
- Actual: 97 mentions
- Variance: +52 to +56 (237% of lower bound)
- **Status**: ❌ Failed - Excessive keyword stuffing

**Key Weakness:**
- No concrete definition of what counts vs. doesn't count
- No penalty framing for overshooting
- Vague verification instructions

---

### Version 2: Strict Counting Protocol
**File**: `content-creator.js` (lines 397-449, v2)

**Key Improvements:**
1. **Explicit Counting Rules** (Added)
   ```
   What Counts: ONLY exact phrase (case-insensitive)
   ✅ "technical analysis", "Technical Analysis"
   ❌ "technical analyst", "analyzing technically"
   ```

2. **Section Inclusion/Exclusion** (Added)
   - Include: Summary, Intro, Main, Conclusion, FAQs
   - Exclude: Title, Research Verification, SEO Metadata

3. **Target Interpretation** (Added)
   - Range targets: Aim for lower bound
   - Never exceed upper bound by 2-3

4. **Dynamic Distribution Formula** (Added)
   - Calculates per-section budget based on target
   - Provides specific distribution (e.g., "Summary: 3 mentions")

5. **Pre-Submission Verification** (Added)
   - Mental tally section-by-section
   - Revision if off by more than 3

**Results:**
- Target: 41-45 mentions
- Actual: 81 mentions
- Variance: +36 to +40 (197% of lower bound)
- **Status**: ⚠️ Improved but still excessive

**Key Weakness:**
- Still had "quality over quantity" escape clause
- "Aim for lower bound" was too passive
- No strong framing that exceeding is BAD

---

### Version 3: Ultra-Strict with Penalty Framing
**File**: `content-creator.js` (lines 397-463, v3)

**Critical Changes from v2:**

1. **Reframed Target Interpretation** (Lines 415-420)
   ```
   BEFORE (v2): "Aim for lower bound, never exceed upper by 2-3"

   AFTER (v3):
   - Treat LOWER BOUND as your MAXIMUM
   - Being UNDER by 3-5 is ACCEPTABLE
   - Being OVER by even 5 is UNACCEPTABLE FAILURE
   - Think of it as a budget: Once spent, STOP
   ```

2. **Removed Quality Escape Clause** (Lines 438-443)
   ```
   BEFORE (v2): "Quality and readability > hitting exact number"

   AFTER (v3):
   - NEVER use quality/readability as excuse to exceed
   - If in doubt, err on side of FEWER exact mentions
   - Added max 1-2 per paragraph rule
   ```

3. **Enhanced Verification with Failure Framing** (Lines 445-450)
   ```
   NEW in v3:
   - UNDER by 3-5: ACCEPTABLE and preferred
   - OVER by 3-5: MUST reduce
   - OVER by 10+: CRITICAL FAILURE
   ```

4. **Added Concrete Revision Strategy** (Lines 452-460)
   ```
   NEW in v3:
   - Once target hit, switch IMMEDIATELY to variations
   - Specific synonym examples provided
   - Before/after transformation example
   ```

5. **SEO Harm Framing** (Lines 462)
   ```
   NEW in v3:
   - "Exceeding by 10+ is keyword stuffing"
   - "Will harm SEO"
   - "Better to be 5 under than 5 over"
   ```

**Expected Results** (Testing in progress):
- Target: 41-45 mentions
- Expected: 38-48 mentions
- Variance: -3 to +3 (within acceptable range)
- **Status**: ⏳ Testing...

**Key Improvements:**
- Penalty framing ("FAILURE", "UNACCEPTABLE")
- Budget metaphor (spend = stop)
- Being under is now PREFERRED over being over
- Concrete examples of how to pivot when approaching limit

---

## Comparison Table

| Aspect | V1 (Original) | V2 (Strict) | V3 (Ultra-Strict) |
|--------|---------------|-------------|-------------------|
| **Target Framing** | "Hit target" | "Aim for lower bound" | "Lower bound = MAXIMUM" |
| **Overshoot Tolerance** | Unspecified | ≤2-3 above upper bound | ≤3-5, else FAILURE |
| **Undershoot Tolerance** | Unspecified | Not mentioned | 3-5 under is ACCEPTABLE |
| **Quality Escape Clause** | Not present | "Quality > quantity" | REMOVED (no excuses) |
| **Failure Language** | None | "Must reduce" | "CRITICAL FAILURE" |
| **SEO Harm Mention** | No | No | Yes ("keyword stuffing") |
| **Revision Strategy** | Generic | "Revise if off by 3" | 7-step concrete strategy |
| **Budget Metaphor** | No | No | Yes ("once spent, STOP") |
| **Results** | 97 mentions | 81 mentions | ⏳ Testing... |

---

## Psychological Prompt Engineering Insights

### What Didn't Work in V1-V2
1. **Positive Framing Only**: "Hit target" is too neutral
2. **Range Ambiguity**: AI interpreted "41-45" as "anywhere in range is fine"
3. **Quality Loophole**: "Quality > quantity" gave AI permission to overshoot
4. **Lack of Consequences**: No framing that exceeding is BAD

### What Should Work in V3
1. **Penalty Framing**: "FAILURE", "UNACCEPTABLE", "CRITICAL" trigger caution
2. **Lower-Bound-as-Maximum**: Eliminates range ambiguity
3. **Preference Flipping**: "Better to be under than over" changes AI priorities
4. **Budget Metaphor**: Concrete mental model for AI to follow
5. **SEO Harm Framing**: Real-world consequence (not just "user said so")

### AI Model Behavior Hypothesis
- LLMs tend to be "helpful" by being thorough
- Thoroughness = more keyword usage (in AI's interpretation)
- V1-V2 didn't override this instinct strongly enough
- V3 explicitly reframes thoroughness as "use variations, not exact phrase"

---

## Testing Methodology

### Verification Tool: `count-keywords.js`

**Features:**
- Section-by-section breakdown
- Excludes non-countable sections (title, research, metadata)
- Target validation with clear pass/fail status
- Exit code: 0 if within target, 1 if out of range

**Usage:**
```bash
node scripts/count-keywords.js \
  "docs/articles/technical analysis/what-is-technical-analysis.md" \
  "technical analysis" \
  "41-45"
```

**Sample Output:**
```
📊 SECTION BREAKDOWN:
   Summary:                   5 mentions
   Introduction:              4 mentions
   Main Content (H2/H3):     28 mentions
   Conclusion:                2 mentions
   FAQs:                      4 mentions

📈 TOTAL COUNTS:
   Countable Content:        43 mentions
   Excluded Sections:        15 mentions

🎯 TARGET VALIDATION:
   Target Range:             41-45 mentions
   Actual Count:             43 mentions
   Status:                   ✅ WITHIN TARGET
```

---

## Future Enhancements

### If V3 Still Overshoots
1. **Post-Generation Reduction Pass**
   - Run regex find-replace to reduce excess mentions
   - Replace last N mentions with variations automatically

2. **Model-Specific Prompts**
   - Different models interpret instructions differently
   - Test and tune per model (Groq, Gemini, OpenAI)

3. **Feedback Loop**
   - Pass actual count back to AI for self-correction
   - "You used 81 mentions. Target was 41. Reduce by 40."

4. **Pre-Flight Budget Tracking**
   - Instruct AI to output running count during generation
   - "Current count: 25/41 mentions used"

### Integration with Workflow
Add automatic verification to batch generator:
```javascript
// After content generation
const count = await verifyKeywordCount(outputPath, keyword, target);
if (count.status !== 'WITHIN_TARGET') {
  console.warn(`⚠️  Keyword count off: ${count.actual} vs ${target}`);
  // Optional: Retry generation or flag for manual review
}
```

---

## Lessons Learned

1. **Explicit > Implicit**: AI needs concrete rules, not general guidelines
2. **Penalty Framing Works**: Framing exceeding as "failure" is more effective than "aim for"
3. **Remove Escape Clauses**: Any loophole will be exploited
4. **Provide Concrete Examples**: Show before/after transformations
5. **Flip Defaults**: Make being under preferred, not being over
6. **Use Strong Language**: "CRITICAL FAILURE" > "please try to avoid"
7. **Budget Metaphors Help**: Concrete mental models guide AI behavior

---

## Version History

- **V1**: 2025-11-28 Initial (97 mentions, 237% of target)
- **V2**: 2025-11-28 Strict Protocol (81 mentions, 197% of target)
- **V3**: 2025-11-28 Ultra-Strict + Penalty Framing (⏳ Testing...)

---

**Last Updated**: 2025-11-28
**Testing Status**: V3 in progress
**Next Review**: After V3 test results
