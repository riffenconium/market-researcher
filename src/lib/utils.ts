export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
