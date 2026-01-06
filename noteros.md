Would be best if we could run it somehow w/o a hosted server - it should be a standalone server AND possibly we need to make it so it's easy enough to attach your own running LLM - self hosted. On startup we'll need to have an onboarding sequence where the user is asked if he wants to overwrite the default RPC urls n such - which chains he wants to have supported, and most importantly if he wants to choose a cloud based LLM or a self hosted LLM.

When running his CLI, for example when he writes tradeshell in his terminal - the server needs to run aswell.

What we need to overwrite is the baseURL of the langchain configuration - NO API Key needed for self hosted models.

What's the best way to have this type of a configurable setup - do we just save the configuration in his own machine somewhere in a file OR it would be a database?

TODO:
[] Chat Interface
