export const isCommand = (cmd?: string) => {
	return cmd?.startsWith('/');
};
