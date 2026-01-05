import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {codeToANSI} from '@shikijs/cli';

export default function ShikiStream() {
	const [streamedCode, setStreamedCode] = useState('');
	const [highlightedCode, setHighlightedCode] = useState('');
	const [isStreaming, setIsStreaming] = useState(true);

	const fullCode = `// Trading Strategy Example
async function executeTrade(symbol: string, amount: number) {
  const price = await getMarketPrice(symbol);
  const cost = price * amount;

  if (cost > balance) {
    throw new Error('Insufficient balance');
  }

  const trade = {
    symbol,
    amount,
    price,
    timestamp: Date.now()
  };

  return await submitOrder(trade);
}`;

	useEffect(() => {
		let currentIndex = 0;
		const interval = setInterval(() => {
			if (currentIndex < fullCode.length) {
				// Stream 3 characters at a time for faster demo
				const nextChunk = fullCode.slice(currentIndex, currentIndex + 3);
				const newCode = streamedCode + nextChunk;
				setStreamedCode(newCode);

				// Re-highlight the updated code
				codeToANSI(newCode, 'typescript', 'github-dark').then(ansi => {
					setHighlightedCode(ansi);
				});

				currentIndex += 3;
			} else {
				setIsStreaming(false);
				clearInterval(interval);
			}
		}, 50); // Update every 50ms

		return () => clearInterval(interval);
	}, [streamedCode]);

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyan" bold>
				=== Streaming Code with Syntax Highlighting ===
			</Text>
			<Text> </Text>

			{isStreaming ? (
				<Text color="yellow">⏳ Streaming code...</Text>
			) : (
				<Text color="green">✓ Stream complete</Text>
			)}

			<Text> </Text>

			{/* Render ANSI-colored streaming code */}
			{highlightedCode ? (
				<Text>{highlightedCode}</Text>
			) : (
				<Text color="gray">Starting stream...</Text>
			)}

			<Text> </Text>
			<Text color="gray">
				{isStreaming
					? 'Watch the code being streamed with live syntax highlighting'
					: 'This simulates how AI responses would stream in your trading CLI'}
			</Text>
		</Box>
	);
}
