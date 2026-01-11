import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import SyntaxHighlight from 'ink-syntax-highlight';
import React from 'react';
import { useGetConfig } from '../lib/hooks/api-hooks.js';

type Props = {
	args: string[];
};

export function Config({ args }: Props) {
	const subcommand = args[0];

	// If no subcommand, default to 'get' (show config)
	if (!subcommand) {
		return <ConfigGet />;
	}

	if (subcommand === 'set') {
		const key = args[1];
		const value = args[2];
		return <ConfigSet configKey={key} value={value} />;
	}

	if (subcommand === 'delete') {
		const key = args[1];
		return <ConfigDelete configKey={key} />;
	}

	return (
		<Text color="yellow">
			Unknown subcommand: {subcommand}
			{'\n'}
			Available subcommands: get, set, delete
		</Text>
	);
}

// Subcommand: config get
function ConfigGet() {
	const { data: config, error, isLoading } = useGetConfig();
	const stringifiedConfig = JSON.stringify(config, null, 2);

	if (isLoading) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Loading config...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Text color="red">
				Failed to fetch config from server:{' '}
				{error instanceof Error ? error.message : 'Unknown error'}
			</Text>
		);
	}

	if (!config) {
		return <Text>No config data available</Text>;
	}

	return (
		<Text>
			<SyntaxHighlight code={stringifiedConfig} />
		</Text>
	);
}

// Subcommand: config set <key> <value>
function ConfigSet({ configKey, value }: { configKey?: string; value?: string }) {
	if (!configKey || !value) {
		return <Text color="yellow">Usage: config set &lt;key&gt; &lt;value&gt;</Text>;
	}

	// TODO: Create useUpdateConfig hook with useMutation
	// const { mutate, isLoading } = useUpdateConfig();
	// React.useEffect(() => {
	//   mutate({ [configKey]: value });
	// }, []);

	return (
		<Text color="green">
			Setting {configKey} = {value}
			{'\n'}
			<Text color="gray">(Not yet implemented - need to create useUpdateConfig hook)</Text>
		</Text>
	);
}

// Subcommand: config delete <key>
function ConfigDelete({ configKey }: { configKey?: string }) {
	if (!configKey) {
		return <Text color="yellow">Usage: config delete &lt;key&gt;</Text>;
	}

	// TODO: Create useDeleteConfig hook with useMutation
	// const { mutate, isLoading } = useDeleteConfig();
	// React.useEffect(() => {
	//   mutate(configKey);
	// }, []);

	return (
		<Text color="green">
			Deleting {configKey}
			{'\n'}
			<Text color="gray">(Not yet implemented - need to create useDeleteConfig hook)</Text>
		</Text>
	);
}
