/**
 * VERIDEGREE X — HIGH PERFORMANCE FUZZY MATCHING ENGINE
 * 
 * Implements Levenshtein Ratio, Jaro-Winkler Similarity, and Token Sort Ratio
 * for robust, fast identity resolution across large academic datasets.
 */

export class FuzzyMatcher {
  /**
   * Calculates Levenshtein Distance between two strings.
   */
  public static levenshteinDistance(s1: string, s2: string): number {
    const a = s1.toLowerCase();
    const b = s2.toLowerCase();
    const m = a.length;
    const n = b.length;

    if (m === 0) return n;
    if (n === 0) return m;

    let v0 = new Int32Array(n + 1);
    let v1 = new Int32Array(n + 1);

    for (let i = 0; i <= n; i++) {
      v0[i] = i;
    }

    for (let i = 0; i < m; i++) {
      v1[0] = i + 1;
      for (let j = 0; j < n; j++) {
        const cost = a[i] === b[j] ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }
      for (let j = 0; j <= n; j++) {
        v0[j] = v1[j];
      }
    }

    return v1[n];
  }

  /**
   * Computes normalized Levenshtein Similarity Ratio in range [0.0, 1.0].
   */
  public static levenshteinRatio(s1: string, s2: string): number {
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;
    const distance = this.levenshteinDistance(s1, s2);
    return 1.0 - distance / maxLen;
  }

  /**
   * Computes Jaro Similarity between two strings in range [0.0, 1.0].
   */
  public static jaroSimilarity(s1: string, s2: string): number {
    const a = s1.toLowerCase();
    const b = s2.toLowerCase();
    const len1 = a.length;
    const len2 = b.length;

    if (len1 === 0 && len2 === 0) return 1.0;
    if (len1 === 0 || len2 === 0) return 0.0;
    if (a === b) return 1.0;

    const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
    const s1Matches = new Uint8Array(len1);
    const s2Matches = new Uint8Array(len2);

    let matches = 0;
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, len2);

      for (let j = start; j < end; j++) {
        if (!s2Matches[j] && a[i] === b[j]) {
          s1Matches[i] = 1;
          s2Matches[j] = 1;
          matches++;
          break;
        }
      }
    }

    if (matches === 0) return 0.0;

    let transpositions = 0;
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (s1Matches[i]) {
        while (!s2Matches[k]) k++;
        if (a[i] !== b[k]) transpositions++;
        k++;
      }
    }

    return (
      (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0
    );
  }

  /**
   * Computes Jaro-Winkler Similarity with prefix boost (p = 0.1, max 4 chars).
   */
  public static jaroWinkler(s1: string, s2: string): number {
    const jaro = this.jaroSimilarity(s1, s2);
    if (jaro < 0.7) return jaro;

    let prefixLength = 0;
    const maxPrefix = Math.min(4, Math.min(s1.length, s2.length));
    for (let i = 0; i < maxPrefix; i++) {
      if (s1[i].toLowerCase() === s2[i].toLowerCase()) {
        prefixLength++;
      } else {
        break;
      }
    }

    return jaro + prefixLength * 0.1 * (1.0 - jaro);
  }

  /**
   * Computes Token Sort Ratio: splits strings into words, sorts them,
   * and calculates Levenshtein ratio. Resolves "Deshmukh Aditi" vs "Aditi Deshmukh".
   */
  public static tokenSortRatio(s1: string, s2: string): number {
    const t1 = s1
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join(' ');
    const t2 = s2
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join(' ');
    return this.levenshteinRatio(t1, t2);
  }

  /**
   * Comprehensive Composite Similarity for Person Names:
   * Combines Jaro-Winkler (prefix bias), Token Sort (order invariance), and Levenshtein (edit distance).
   */
  public static nameSimilarity(name1: string, name2: string): number {
    if (!name1 || !name2) return 0.0;
    const n1 = name1.trim();
    const n2 = name2.trim();
    if (n1.toLowerCase() === n2.toLowerCase()) return 1.0;

    const jw = this.jaroWinkler(n1, n2);
    const ts = this.tokenSortRatio(n1, n2);
    const lev = this.levenshteinRatio(n1, n2);

    // Composite weighting: 40% Jaro-Winkler, 40% Token-Sort, 20% Levenshtein
    const score = 0.4 * jw + 0.4 * ts + 0.2 * lev;
    return Math.round(score * 1000) / 1000;
  }
}

