#!/usr/bin/env node
import { StitchProxy } from '@google/stitch-sdk';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function main() {
  const apiKey = process.env.STITCH_API_KEY;
  if (!apiKey) {
    console.error('STITCH_API_KEY is required');
    process.exit(1);
  }

  const proxy = new StitchProxy({ apiKey });

  process.on('SIGINT', async () => {
    console.error('[stitch-proxy-wrapper] SIGINT received, closing');
    await proxy.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('[stitch-proxy-wrapper] SIGTERM received, closing');
    await proxy.close();
    process.exit(0);
  });

  try {
    await proxy.start(new StdioServerTransport());
    console.error('[stitch-proxy-wrapper] Proxy server running (stdio transport)');

    // Keep the process alive so the stdio transport remains active.
    await new Promise(() => {});
  } catch (error) {
    console.error('[stitch-proxy-wrapper] Error', error);
    process.exit(1);
  }
}

main();