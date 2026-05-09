// ============================================================
//  src/utils/helpers.js
//  Shared utility functions and constants used across the app
// ============================================================

// ── Grade calculation ────────────────────────────────────────
// Takes a numeric score (0-100) and returns a letter grade
export function calcLetterGrade(score) {
  if (score == null || isNaN(score)) return 'N/A'
  if (score >= 90) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 70) return 'C+'
  if (score >= 65) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// ── Average calculation ──────────────────────────────────────
// Takes an array of grade objects { grade: number } and returns rounded average
export function calcAverage(grades = []) {
  if (!grades.length) return null
  const total = grades.reduce((sum, g) => sum + (g.grade ?? 0), 0)
  return Math.round(total / grades.length)
}

// ── Time format ──────────────────────────────────────────────
// Normalizes time string from backend ("08:30:00") to input-safe ("08:30")
// Prevents the double ":00" bug when editing courses
export function normalizeTimeForInput(timeString) {
  if (!timeString) return ''
  return timeString.slice(0, 5) // "08:30:00" → "08:30"
}

// Converts input value ("08:30") to backend format ("08:30:00")
export function formatTimeForApi(inputValue) {
  if (!inputValue) return null
  return inputValue.length === 5 ? `${inputValue}:00` : inputValue
}

// ── Name helpers ─────────────────────────────────────────────
export function getFullName(person) {
  if (!person) return ''
  return `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim()
}

// ── Error message extractor ──────────────────────────────────

export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message
    || (typeof err?.response?.data === 'string' ? err.response.data : null)
    || fallback
}

// ── Role constants ───────────────────────────────────────────
export const ROLES = {
  ADMIN:   'ADMIN',
  TEACHER: 'INSTRACTOR' || 'INSTRUCTOR',
  STUDENT: 'STUDENT',
  PARENT:  'PARENT',
}

// ── Attendance status constants ──────────────────────────────
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT:  'ABSENT',
  LATE:    'LATE',
}

// Bootstrap color variant for each attendance status
export const ATTENDANCE_STATUS_COLOR = {
  PRESENT: 'success',
  ABSENT:  'danger',
  LATE:    'warning',
}

// ── Fee status constants ─────────────────────────────────────
export const FEE_STATUS = {
  PAID:    'PAID',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
}