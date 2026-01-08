Would be best if we could run it somehow w/o a hosted server - it should be a standalone server AND possibly we need to make it so it's easy enough to attach your own running LLM - self hosted. On startup we'll need to have an onboarding sequence where the user is asked if he wants to overwrite the default RPC urls n such - which chains he wants to have supported, and most importantly if he wants to choose a cloud based LLM or a self hosted LLM. ALSO - the user needs to specify his own API keys for data streams like codex etc...

When running his CLI, for example when he writes tradeshell in his terminal - the server needs to run aswell.

What we need to overwrite is the baseURL of the langchain configuration - NO API Key needed for self hosted models.

How can some MEV & Arbitrage tools be integrated within this interface?

What's the best way to have this type of a configurable setup - do we just save the configuration in his own machine somewhere in a file OR it would be a database?

Regarding wallet interface - we'll need to show some kind of a self contained web interface, it could be a view coming from the nestjs standard way

Make a class which would load the config from a file. Then on the client we'll need to check If the user has the config AND what does it contain - This config would need to be accessible from both the server & the client

TODO:

[] Chat Interface ✓
[] Autocomplete of commands when hit ✓
[] Config service on the client & the server ✓
[] Setup API endpoint queries with Tanstack Query ✓
[] Onboarding config setup - Only if config is empty (default)
[] Config set command - `/config set llm.type cloud`, `/config set llm.baseURL https://...`, `/config set chains.enabled ethereum,polygon`, etc.
-- [] Find a way to have subcommands
[] Private key storage - Use ethers.js encrypted keystore in ~/.tradeshell/keystore/ (password-protected, never plain text) Will be done through the server
[] We MUST keep npm packages to the minimum, All cli and api packages must be reviewed
[] Find a toolcall structure which the LLM can prompt user to confirm/select etc - ZOD validated

---

CONFIG BRAINSTORM
What will we need in the config?
RPC URL, can add more and then can switch between them via the dropdown component, BUT this is tricky - how do we make the server easily prompt the client to pick options - MAYBE like this - user writes subcommand for picking between RPCs - then the client fetches all current RPCs available on the server and then maps through them via the option - then only with the PUT method updates the needed, We must also see which one is currently picked via an isActive field or something.

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
