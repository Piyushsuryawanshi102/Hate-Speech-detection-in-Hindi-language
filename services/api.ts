// API Service for Hate Speech Detection
// Connects to the local Python ML backend (Hindi dataset model)

import { Platform } from 'react-native';

// ── Backend URL Configuration ─────────────────────────────────────────
// Android emulator uses 10.0.2.2 to reach host machine's localhost
// iOS simulator & web use localhost directly
// For physical device, replace with your computer's local IP (e.g. 192.168.x.x)
const getBackendUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();

// Perspective API fallback (kept as secondary option)
// API key is loaded from .env file (EXPO_PUBLIC_PERSPECTIVE_API_KEY)
const PERSPECTIVE_API_KEY = process.env.EXPO_PUBLIC_PERSPECTIVE_API_KEY || '';
const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`;

export interface AnalysisResult {
  overallScore: number;
  categories: {
    toxicity: number;
    severeToxicity: number;
    identityAttack: number;
    insult: number;
    profanity: number;
    threat: number;
  };
  label: 'Safe' | 'Low Risk' | 'Moderate' | 'High' | 'Severe' | 'Critical';
  timestamp: string;
  text: string;
  // New fields from our custom model
  translatedText?: string | null;
  isHindi?: boolean;
  confidence?: number;
  prediction?: number; // 0 = Not Hate, 1 = Hate
  source?: 'local_model' | 'perspective_api';
}

export interface AnalysisHistory {
  id: string;
  result: AnalysisResult;
}

function getLabel(score: number): AnalysisResult['label'] {
  if (score < 0.15) return 'Safe';
  if (score < 0.30) return 'Low Risk';
  if (score < 0.50) return 'Moderate';
  if (score < 0.70) return 'High';
  if (score < 0.85) return 'Severe';
  return 'Critical';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ── Primary: Local ML Model Backend ───────────────────────────────────
async function analyzeWithLocalModel(text: string): Promise<AnalysisResult> {
  const response = await fetch(`${BACKEND_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Local Model API Error:', errorData);
    throw new Error(`Local model API failed with status ${response.status}`);
  }

  const data = await response.json();

  return {
    overallScore: data.overallScore,
    categories: {
      toxicity: data.categories.toxicity,
      severeToxicity: data.categories.severeToxicity,
      identityAttack: data.categories.identityAttack,
      insult: data.categories.insult,
      profanity: data.categories.profanity,
      threat: data.categories.threat,
    },
    label: data.label as AnalysisResult['label'],
    timestamp: data.timestamp || new Date().toISOString(),
    text: data.text,
    translatedText: data.translatedText,
    isHindi: data.isHindi,
    confidence: data.confidence,
    prediction: data.prediction,
    source: 'local_model',
  };
}

// ── Fallback: Perspective API ─────────────────────────────────────────
async function analyzeWithPerspective(text: string): Promise<AnalysisResult> {
  const requestBody = {
    comment: { text },
    languages: ['en', 'hi'],
    requestedAttributes: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
      IDENTITY_ATTACK: {},
      INSULT: {},
      PROFANITY: {},
      THREAT: {},
    },
  };

  const response = await fetch(PERSPECTIVE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Perspective API Error:', errorData);
    throw new Error(`Perspective API failed with status ${response.status}`);
  }

  const data = await response.json();
  const attrs = data.attributeScores;

  const categories = {
    toxicity: attrs.TOXICITY?.summaryScore?.value ?? 0,
    severeToxicity: attrs.SEVERE_TOXICITY?.summaryScore?.value ?? 0,
    identityAttack: attrs.IDENTITY_ATTACK?.summaryScore?.value ?? 0,
    insult: attrs.INSULT?.summaryScore?.value ?? 0,
    profanity: attrs.PROFANITY?.summaryScore?.value ?? 0,
    threat: attrs.THREAT?.summaryScore?.value ?? 0,
  };

  const overallScore = Math.max(
    categories.toxicity,
    categories.severeToxicity,
    categories.identityAttack,
    categories.insult,
    categories.profanity,
    categories.threat
  );

  return {
    overallScore,
    categories,
    label: getLabel(overallScore),
    timestamp: new Date().toISOString(),
    text,
    source: 'perspective_api',
  };
}

// ── Health Check ──────────────────────────────────────────────────────
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ── Main Analysis Function (with fallback) ────────────────────────────
export async function analyzeText(text: string): Promise<AnalysisResult> {
  try {
    // Try local model first
    const result = await analyzeWithLocalModel(text);
    return result;
  } catch (localError) {
    console.warn('Local model unavailable, falling back to Perspective API:', localError);
    try {
      // Fallback to Perspective API
      const result = await analyzeWithPerspective(text);
      return result;
    } catch (perspectiveError) {
      console.error('Both APIs failed:', perspectiveError);
      throw new Error(
        'Analysis failed. Please ensure the backend server is running (python server.py) or check your internet connection.'
      );
    }
  }
}

// In-memory history store
let history: AnalysisHistory[] = [];

export function addToHistory(result: AnalysisResult): AnalysisHistory {
  const entry: AnalysisHistory = {
    id: generateId(),
    result,
  };
  history.unshift(entry);
  // Keep only last 50 items
  if (history.length > 50) {
    history = history.slice(0, 50);
  }
  return entry;
}

export function getHistory(): AnalysisHistory[] {
  return [...history];
}

export function clearHistory(): void {
  history = [];
}

export function getStats() {
  const total = history.length;
  if (total === 0) {
    return {
      totalScans: 0,
      safePercentage: 0,
      averageScore: 0,
      highestCategory: 'N/A',
      recentTrend: 'neutral' as const,
    };
  }

  const safeCount = history.filter(
    (h) => h.result.label === 'Safe' || h.result.label === 'Low Risk'
  ).length;

  const avgScore =
    history.reduce((sum, h) => sum + h.result.overallScore, 0) / total;

  // Find highest average category
  const categoryTotals = {
    toxicity: 0,
    severeToxicity: 0,
    identityAttack: 0,
    insult: 0,
    profanity: 0,
    threat: 0,
  };

  history.forEach((h) => {
    Object.keys(categoryTotals).forEach((key) => {
      categoryTotals[key as keyof typeof categoryTotals] +=
        h.result.categories[key as keyof typeof categoryTotals];
    });
  });

  const highestCategory = Object.entries(categoryTotals).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  const categoryLabels: Record<string, string> = {
    toxicity: 'Toxicity',
    severeToxicity: 'Severe Toxicity',
    identityAttack: 'Identity Attack',
    insult: 'Insult',
    profanity: 'Profanity',
    threat: 'Threat',
  };

  // Recent trend (last 5 vs previous 5)
  let recentTrend: 'up' | 'down' | 'neutral' = 'neutral';
  if (total >= 10) {
    const recent5 =
      history.slice(0, 5).reduce((s, h) => s + h.result.overallScore, 0) / 5;
    const prev5 =
      history.slice(5, 10).reduce((s, h) => s + h.result.overallScore, 0) / 5;
    recentTrend = recent5 > prev5 + 0.05 ? 'up' : recent5 < prev5 - 0.05 ? 'down' : 'neutral';
  }

  return {
    totalScans: total,
    safePercentage: Math.round((safeCount / total) * 100),
    averageScore: avgScore,
    highestCategory: categoryLabels[highestCategory] || highestCategory,
    recentTrend,
  };
}
