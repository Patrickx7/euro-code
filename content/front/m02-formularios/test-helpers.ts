/**
 * Trechos de código reaproveitados nos testes dos exercícios web deste módulo.
 *
 * `enviar()` clica no botão de envio e devolve se o `submit` disparou e se o código do jogador
 * chamou `preventDefault()`. O listener na `window` roda depois dos do jogador (o evento sobe até ela)
 * e sempre cancela o envio, para a página do teste não navegar para outro lugar.
 */
export const ENVIAR = `function enviar() {
  const envio = { disparou: false, prevenido: false };
  const pegar = function (e) { envio.disparou = true; envio.prevenido = e.defaultPrevented; e.preventDefault(); };
  window.addEventListener('submit', pegar);
  click('button[type=submit]');
  window.removeEventListener('submit', pegar);
  return envio;
}
`;

/** `digitar(seletor, texto)`: troca o valor do campo e dispara o evento `input`, como se a pessoa digitasse. */
export const DIGITAR = `function digitar(seletor, texto) {
  const campo = document.querySelector(seletor);
  campo.value = texto;
  campo.dispatchEvent(new Event('input', { bubbles: true }));
  return campo;
}
`;
