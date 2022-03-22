import type * as ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode-languageserver-protocol';
import * as previewer from '../utils/previewer';
import * as shared from '@volar/shared';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import logger from '@volar/logger';

export function register(
	languageService: ts.LanguageService,
	getTextDocument: (uri: string) => TextDocument | undefined,
	getTextDocument2: (uri: string) => TextDocument | undefined,
	ts: typeof import('typescript/lib/tsserverlibrary'),
) {
	return (uri: string, position: vscode.Position, documentOnly = false): vscode.Hover | undefined => {
		logger.info('[typescript-language-service hover.ts] doHover');
		const document = getTextDocument(uri);
		logger.info(`[typescript-language-service hover.ts] doHover document]: ${document?.getText()}`)
		if (!document) return;

		const fileName = shared.uriToFsPath(document.uri);
		const offset = document.offsetAt(position);

		let info: ReturnType<typeof languageService.getQuickInfoAtPosition> | undefined;
		try { info = languageService.getQuickInfoAtPosition(fileName, offset); } catch { }
		if (!info) return;

		const parts: string[] = [];
		const displayString = ts.displayPartsToString(info.displayParts);
		const documentation = previewer.markdownDocumentation(info.documentation ?? [], info.tags, { toResource: shared.fsPathToUri }, getTextDocument2);

		if (displayString && !documentOnly) {
			parts.push(['```typescript', displayString, '```'].join('\n'));
		}
		if (documentation) {
			parts.push(documentation);
		}

		const markdown: vscode.MarkupContent = {
			kind: vscode.MarkupKind.Markdown,
			value: parts.join('\n\n'),
		};

		return {
			contents: markdown,
			range: vscode.Range.create(
				document.positionAt(info.textSpan.start),
				document.positionAt(info.textSpan.start + info.textSpan.length),
			),
		};
	};
}
