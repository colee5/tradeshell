#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import Index from './index.js';

process.stdout.write('\x1Bc');

render(<Index />);
