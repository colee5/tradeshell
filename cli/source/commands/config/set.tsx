import { Text } from 'ink';
import React from 'react';

type Props = {
	configKey?: string;
	value?: string;
};

export function ConfigSet({ configKey, value }: Props) {
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
