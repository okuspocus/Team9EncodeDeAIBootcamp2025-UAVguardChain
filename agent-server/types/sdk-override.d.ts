// File: types/sdk-override.d.ts

declare module '@modelcontextprotocol/sdk/client/stdio' {
  import { Writable, Readable } from 'node:stream'

  export interface StdioClientTransportOptions {
    process: {
      stdin: Writable
      stdout: Readable
    }
  }

  export class StdioClientTransport {
    constructor(options: StdioClientTransportOptions)
  }
}

declare module '@modelcontextprotocol/sdk/client' {
  import { Tool } from '@modelcontextprotocol/sdk/types'
  import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio'

  export class Client {
    constructor(options: {
      name: string
      version: string
      transport: StdioClientTransport
    })

    callTool(input: {
      name: string
      arguments: Record<string, any>
    }): Promise<{ content?: Array<{ text: string }>; isError?: boolean }>
  }
}
