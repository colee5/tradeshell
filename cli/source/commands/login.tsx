import React from 'react';
import {Text} from 'ink';
import zod from 'zod';

export const options = zod.object({
	username: zod.string().optional().describe('Username'),
});

type Props = {
	options: zod.infer<typeof options>;
};

export default function Login({options}: Props) {
	return (
		<Text color="green">
			LOGGED IN{options.username ? ` as ${options.username}` : ''}
		</Text>
	);
}
