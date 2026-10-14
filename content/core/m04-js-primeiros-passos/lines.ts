/** Junta linhas de código com "\n" (deixa os trechos de código mais legíveis no arquivo). */
export function lines(...parts: string[]): string {
  return parts.join('\n');
}
