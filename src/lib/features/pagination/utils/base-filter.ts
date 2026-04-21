export function withUserAndSearch<T>(
  userId: string,
  sw: T | undefined
): { userId: { eq: string } } | { AND: [{ userId: { eq: string } }, T] } {
  const base = { userId: { eq: userId } };
  return sw ? { AND: [base, sw] } : base;
}
