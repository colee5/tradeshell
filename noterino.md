STAGE 0: Agent and skills setup
[x] Standard for error handling
[x] Standard for DTO and typing
[x] Redundant return types on methods
[x] Standard for not spamming freaking useEffects everywhere
[x] Comments pattern

STAGE 1: Monorepo and architecture
[✓] Chat Interface
[✓] Autocomplete of commands when hit
[✓] Config service on the client & the server
[✓] Setup API endpoint queries with Tanstack Query
[✓] Setup import path alias for @shared
[✓] Generate backend schemas for the FE - hey-api
[✓] Setup husky for linting
[✓] Setup commit message standard
[✓] Refactor by overlay-component-architecture.md
[✓] Use bun workers with RPC instead of HTTP nestjs api

STAGE 2: Configure config - FE Onboarding & CLI subcommands /config
[✓] Onboarding LLM setup
[✓] Config commands
-- [✓] Find a way to have subcommands
-- [✓] Config list command - `/config get` to show current config (with secrets masked)
-- [✓] Config reset command - `/config reset` to return to defaults
-- [✓] Handle initialPrompt error case
-- [✓] Handle onboarding error case, it just stops and runs infinitely
-- [✓] Refactor command autocomplete component
-- [] separate setup commands for the LLM and Blockchain - apart from /onboard

STAGE 3: Private key storing and safety
[x] Private key storage - Use encrypted master wallet and support for multiple wallets
[x] Wallet Service Client implementation
[x] Switch logic should emmit the unlocked event on the blockchainService and load that wallet into memory
[x] First time user handles all onboarding cases, wallet too
[x] Handle wallet AND blockchain/llm config being missing
[x] Audit logging - Log all wallet operations (deploys, transactions) to ~/.tradeshell/audit.log
[x] wallet /add command on the client should be guarded if wallet is locked.

# [x] wallet /add command on the client should be guarded if wallet is locked.

STAGE 4: Agent service, extensible folder structure /tools in the agent module
[] Find a toolcall structure which the LLM can prompt user to confirm/select etc - ZOD validated
[] llm.service which will store the model initialization and revalidate on update config event
[] Tool response schemas - Zod validation for tool outputs (not just inputs)
[] Agent streaming - Real-time agent thinking/progress display in CLI
[] Tool execution confirmation - For dangerous operations (deploy, transfer), require explicit user confirmation

STAGE 5: Wallet Operations
[x] Wallet list command - List all deployed/imported wallets
[x] Wallet import - Import existing wallet via private key
[] Balance checking - Multi-chain balance display
[] Gas estimation - Before any transaction, show estimated gas costs
[] Transaction history - Query and display transaction history for a wallet

STAGE 6: Testing & Quality
[x] Dev mode which spins up 3 terminals, from each /packages + the bun run logs
[] Unit tests - For critical services (wallet, config, agent tools)
[] Integration tests - Test CLI ↔ Server communication
[] E2E tests - Test full agent flows (deploy wallet from start to finish)
[] Security audit - Review all crypto operations, key storage, RPC interactions

STAGE 7: DevOps & Deployment
[x] Logging strategy - Structured logging (JSON) for both CLI and server
[] Two-file binary distribution, the workers with worker.bundle.js AND the CLi with bun run --compile
[] Graceful shutdown - Handle SIGTERM/SIGINT properly (save sessions, close connections)

STAGE 8: Web feature with embedded web assets in worker bundle
[] Create packages/web structure
[] React + Vite + TanStack Query
[] Add Bun.serve() to worker with API routes
[] RPC Methods to start/stop dashboard, controller through the CLI via
[] /dashboard command that opens browser
[] Build Process - Update script to embed web assets

MAINTAINCE AND REFACTOR
[x] Return formatted history entry after all modals w/ pushCommandLog
[x] Tidy up custom pino logger
<<<<<<< HEAD
<<<<<<< HEAD
[x] Find a good validation layer for inputs between client/workers
[x] Render static components instead of hydrated react components in command history log
=======
[] Find a good validation layer for inputs between client/workers
>>>>>>> 4e10781 (feat: worker validation layer)
=======
[x] Find a good validation layer for inputs between client/workers
[x] Render static components instead of hydrated react components in command history log
>>>>>>> 52c41a8 (docs: noterino)
[] Find a better structure for CLI components, too bloated
[] Better help component, make it dynamic
[] Client error handling standard
[] Refactor type checks and order of operations in root package.json
[] Linter update

---

<!-- BELOW CAN BE SKIPPED WITH, cmd + shift + p -> run task -> Dev: All -->

<!-- WORKFLOW -->
<!-- Terminal 1:  cd packages/core && bun run dev     # watches & rebuilds dist/ continuously
Terminal 2:  cd packages/cli && bun run dev      # runs the CLI restart loop -->

<!-- LOGS -->
<!-- bun run logs -->

CONFIG BRAINSTORM
What will we need in the config?
RPC URL, can add more and then can switch between them via the dropdown component, BUT this is tricky - how do we make the server easily prompt the client to pick options - MAYBE like this - user writes subcommand for picking between RPCs - then the client fetches all current RPCs available on the server and then maps through them via the option

- then only with the PUT method updates the needed, We must also see which one is currently picked via an isActive field or something.

IGNORE THIS ABOVE - Just go with one current RPC url and thats it!! - Make a command to fetch only the RPC url, and make a command to only update the RPC url via PUT - thats it.

About the chains in the config - we'll have a mapping on the server of most EVM chains and then the user can make activate/disable them via the isActive field on the config - something like:

```json
Chains[
    {
        "name" : "arbitrum",
        "isActive" : true,
        "id" : 42161,
    },
    {
        "name" : "base",
        "isActive" : false,
        "id" : 8453,
    }
]
```

From written notes:

- Make progress up until broadcasting a transaction and deploying a wallet through the agent toolset, then simply opensource. Don't forget that all actions should be done through the agent's toolset except the config which it's better to take into our own hands and have a good onboarding experience. We're not building a CLI for trading - we're building an agent to help you trade and interact with DEFI with pure words not with remembering commands. MUST keep our command set to the minimum. Anything which can't be written with a single command like /balance should be made through a tool.

- What's a firewalled subnet? How can my app be ran in this contanirized mode in which only the server can send requests to the configured AI Api & the RPCs provided.

- Possibly make it easy for the user to add his own tool implementations of protocols. Like interacting with Uniswap/Aave Protocol. He would need to input the contract ABI into the CLI and it would save it on his local machine from which the agent can then call tools? This might be a good idea and its greatly modular.
