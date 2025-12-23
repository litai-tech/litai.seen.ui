/**
 * Ensures a string ends with a newline character
 * @param data - The string to process
 * @param useCRLF - Whether to use CRLF (\r\n) instead of LF (\n)
 * @returns The string with a newline appended if needed
 */
export function ensureNewline(data: string, useCRLF = false): string {
  const ending = useCRLF ? "\r\n" : "\n";
  if (data.endsWith("\r\n") || data.endsWith("\n")) {
    return data;
  }
  return data + ending;
}
