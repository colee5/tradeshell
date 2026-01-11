Would be best if we could run it somehow w/o a hosted server - it should be a standalone server AND possibly we need to make it so it's easy enough to attach your own running LLM - self hosted. On startup we'll need to have an onboarding sequence where the user is asked if he wants to overwrite the default RPC urls n such - which chains he wants to have supported, and most importantly if he wants to choose a cloud based LLM or a self hosted LLM. ALSO - the user needs to specify his own API keys for data streams like codex etc...

When running his CLI, for example when he writes tradeshell in his terminal - the server needs to run aswell.

What we need to overwrite is the baseURL of the langchain configuration - NO API Key needed for self hosted models.

How can some MEV & Arbitrage tools be integrated within this interface?

What's the best way to have this type of a configurable setup - do we just save the configuration in his own machine somewhere in a file OR it would be a database?

Regarding wallet interface - we'll need to show some kind of a self contained web interface, it could be a view coming from the nestjs standard way

Make a class which would load the config from a file. Then on the client we'll need to check If the user has the config AND what does it contain - This config would need to be accessible from both the server & the client

TODO:

STAGE 1: Monorepo and architecture
[] Chat Interface ✓
[] Autocomplete of commands when hit ✓
[] Config service on the client & the server ✓
[] Setup API endpoint queries with Tanstack Query ✓
[] Setup import path alias for @shared ✓
[] Generate backend schemas for the FE - hey-api ✓
[] Setup husky for linting
[] Setup commit message standard

STAGE 2: Configure config - FE Onboarding & CLI subcommands /config
[] Onboarding LLM setup ✓
[] Config set commands
-- [] Find a way to have subcommands ✓
-- [] Set commands for LLM object
[] Config validation on server - Zod schemas to validate config structure before saving
[] Config get command - `/config get llm.type` to read individual values
[] Config list command - `/config list` to show current config (with secrets masked)
[] Config reset command - `/config reset` to return to defaults

STAGE 3: Private key storing and safety
[] Private key storage - Use ethers.js encrypted keystore in ~/.tradeshell/keystore/ (password-protected, never plain text) Will be done through the server
[] We MUST keep npm packages to the minimum, All cli and api packages must be reviewed
[] Environment variable support - Allow RPC URLs, API keys to be set via env vars (12-facto r app)
[] Audit logging - Log all wallet operations (deploys, transactions) to ~/.tradeshell/audit.log

STAGE 4: Agent service, extensible folder structure /tools in the agent module
[] Find a toolcall structure which the LLM can prompt user to confirm/select etc - ZOD validated
[] Tool response schemas - Zod validation for tool outputs (not just inputs)
[] Agent streaming - Real-time agent thinking/progress display in CLI
[] Tool execution confirmation - For dangerous operations (deploy, transfer), require explicit user confirmation
[] Dry-run mode - `/deploy wallet --dry-run` to see what agent would do without executing - OOS

STAGE 5: Wallet Operations
[] Wallet list command - List all deployed/imported wallets
[] Wallet import - Import existing wallet via private key
[] Transaction history - Query and display transaction history for a wallet
[] Balance checking - Multi-chain balance display
[] Gas estimation - Before any transaction, show estimated gas costs

STAGE 6: Testing & Quality
[] Unit tests - For critical services (wallet, config, agent tools)
[] Integration tests - Test CLI ↔ Server communication
[] E2E tests - Test full agent flows (deploy wallet from start to finish)
[] Security audit - Review all crypto operations, key storage, RPC interactions

STAGE 7: DevOps & Deployment
[] Docker compose setup - With network isolation (firewalled subnet)
[] Health check endpoints - /health endpoint for monitoring
[] Graceful shutdown - Handle SIGTERM/SIGINT properly (save sessions, close connections)
[] Logging strategy - Structured logging (JSON) for both CLI and server

---

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

WHERE DID I STOP?

index.tsx look at comment at line 24 - bye
