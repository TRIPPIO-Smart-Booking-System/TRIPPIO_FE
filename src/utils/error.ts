// utils/error.ts
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err && 'message' in err) {
    return String(err.message);
  }
  return 'Unexpected error';
}
