1. The CLI genrtaes a chat id, and then holds it into a jotai state until we close the process / clear the current chat by /reset
2. Uses only the processMessage as a central RPC method, the backend handles the rest
