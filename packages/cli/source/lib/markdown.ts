import { marked, type Token, type Tokens, type MarkedExtension } from 'marked';
import { markedTerminal } from 'marked-terminal';

export function setupMarkdownRenderer() {
	const terminalRenderer = markedTerminal() as MarkedExtension;

	if (terminalRenderer.renderer) {
		terminalRenderer.renderer.text = function (
			this: { parser?: { parseInline(tokens: Token[]): string } },
			token: string | Tokens.Escape | Tokens.Tag | Tokens.Text,
		) {
			if (typeof token === 'object' && 'tokens' in token && token.tokens) {
				return String(this.parser?.parseInline(token.tokens) ?? token.text);
			}

			if (typeof token === 'object') {
				return String(token.text);
			}

			return String(token);
		};
	}

	marked.use(terminalRenderer);
}
