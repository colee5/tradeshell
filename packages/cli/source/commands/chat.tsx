import { AgentResponseType, type AgentResponse } from '@tradeshell/core';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useAtomValue, useSetAtom } from 'jotai';
import { marked } from 'marked';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ToolApprovalDialog } from '../components/tool-approval-dialog.js';
import { PRIMARY_COLOR } from '../lib/constants/colors.js';
import { useDecideToolCalls, useProcessMessage } from '../lib/hooks/agent-hooks.js';
import { setupMarkdownRenderer } from '../lib/markdown.js';
import { chatIdAtom } from '../lib/store/chat.atom.js';
import { replaceCommandLogEntryAtom } from '../lib/store/command-log.atom.js';

type Props = {
	message: string;
	entryId: string;
};

type PendingApproval = AgentResponse & { type: typeof AgentResponseType.APPROVAL_REQUEST };

setupMarkdownRenderer();

export function Chat({ message, entryId }: Props) {
	const chatId = useAtomValue(chatIdAtom);
	const processMessage = useProcessMessage();
	const decideToolCalls = useDecideToolCalls();
	const replaceEntry = useSetAtom(replaceCommandLogEntryAtom);
	const hasSent = useRef(false);

	const [pending, setPending] = useState<PendingApproval | null>(null);
	const [loading, setLoading] = useState(true);
	const [decisionStates, setDecisionStates] = useState<
		Array<{ approvalId: string; approved: boolean }>
	>([]);

	const finish = useCallback(
		(output: React.ReactElement) => {
			setLoading(false);
			setPending(null);
			setDecisionStates([]);
			replaceEntry({ id: entryId, output });
		},
		[entryId, replaceEntry],
	);

	const handleResponse = useCallback(
		(data: AgentResponse) => {
			if (data.type === AgentResponseType.APPROVAL_REQUEST) {
				setPending(data);
				setDecisionStates([]);
				setLoading(false);
				return;
			}

			finish(
				<Box flexDirection="column" gap={1}>
					{data.toolsCalled.length > 0 && (
						<Text dimColor>Tools called: {data.toolsCalled.join(', ')}</Text>
					)}
					<Text>{marked.parse(data.text) as string}</Text>
				</Box>,
			);
		},
		[finish],
	);

	const handleError = useCallback(
		(error: Error) => {
			finish(<Text color="red">{error.message}</Text>);
		},
		[finish],
	);

	const handleDecision = useCallback(
		(approvalId: string, approved: boolean) => {
			const nextDecisions = [...decisionStates, { approvalId, approved }];

			if (pending && nextDecisions.length < pending.approvals.length) {
				setDecisionStates(nextDecisions);
				return;
			}

			setPending(null);
			setDecisionStates([]);
			setLoading(true);
			decideToolCalls
				.mutateAsync({ chatId, decisions: nextDecisions })
				.then(handleResponse, handleError);
		},
		[chatId, decideToolCalls, handleResponse, handleError, decisionStates, pending],
	);

	useEffect(() => {
		if (hasSent.current) return;
		hasSent.current = true;

		processMessage.mutateAsync({ input: message, chatId }).then(handleResponse, handleError);
	}, []);

	if (!loading && !pending) {
		return null;
	}

	if (pending) {
		const approval = pending.approvals[decisionStates.length]!;

		return (
			<ToolApprovalDialog
				toolName={approval.toolName}
				description={approval.description}
				args={approval.args}
				counter={{ current: decisionStates.length + 1, total: pending.approvals.length }}
				onDecision={(approved) => handleDecision(approval.approvalId, approved)}
			/>
		);
	}

	const isExecuting = decideToolCalls.isPending;

	return (
		<Box flexDirection="row" gap={1}>
			<Spinner />
			<Text color={isExecuting ? undefined : PRIMARY_COLOR}>
				{isExecuting ? 'Executing tool...' : 'Thinking...'}
			</Text>
		</Box>
	);
}
