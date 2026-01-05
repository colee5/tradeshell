#!/usr/bin/env node
import Pastel from 'pastel'

// Clear terminal before starting
process.stdout.write('\x1Bc')

const app = new Pastel({
	importMeta: import.meta
})

await app.run()