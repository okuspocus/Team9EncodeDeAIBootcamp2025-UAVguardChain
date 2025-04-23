// File: agent-server/index.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { z } from 'zod';
import { StructuredTool } from 'langchain/tools';
import { ChatOpenAI } from '@langchain/openai';
import { Tool } from 'langchain/tools';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

class GoogleMapsTool extends StructuredTool {
  name = 'google-maps';
  description = 'Use this tool when the user provides a location name that needs to be converted to coordinates (lat/lon).';

  schema = z.object({
    location: z.string().describe('The name of the location to geocode')
  });

  async _call({ location }: { location: string }) {
    try {
      const res = await fetch('http://localhost:3002/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'geocode', input: location })
      });
      const data = await res.json();

      return `Lat: ${data.result.lat}, Lng: ${data.result.lng}, Address: ${data.result.formatted_address}`;
    } catch (err: any) {
      return `Google Maps MCP failed: ${err.message}`;
    }
  }
}
class EvmTool extends Tool {
  name = 'evm-smart-contract';
  description = 'Use this tool to prepare a smart contract transaction when you have the drone ID and a valid lat/lon pair.';

  async _call(input: string) {
    try {
      const res = await fetch('http://localhost:3001/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'contract', input })
      });

      const data = await res.json();

      if (data.result && data.result.to && data.result.data && data.result.chainId) {
        return `Prepared transaction:\nTo: ${data.result.to}\nData: ${data.result.data}\nChain ID: ${data.result.chainId}`;
      }

      return data.result || 'EVM MCP did not return valid transaction data.';
    } catch (err: any) {
      return `EVM MCP fetch failed: ${err.message}`;
    }
  }
}

app.post('/mcp', async (req, res) => {
  try {
    const { input, chat_history } = req.body;

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      temperature: 0.3,
      modelName: 'gpt-3.5-turbo-0125'
    });

    const tools = [new GoogleMapsTool(), new EvmTool()];

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are UAV-GPT, a polite and focused assistant whose only job is to help users register drone flights on the blockchain.

Start every conversation with this greeting (unless flight data was already provided):
"Welcome to the Drone Flight Registry. I will help you register your drone flight on the blockchain."

You must collect the following information:
1. Drone ID (a number)
2. Drone Model (a short name)
3. Flight Location (either coordinates or a location name to be geocoded)

For each step:
- Confirm the user's input.
- Wait for each value before continuing.
- If all data is available, prepare a contract call like: registerFlight(ID, LAT, LON)

Only use the 'google-maps' tool if the user gives a place name.
Only use 'evm-smart-contract' if all flight data is ready.

If the user asks anything unrelated, respond:
"Sorry, I can only assist with drone flight registration."

Always stay in character.`
      ],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad')
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt
    });

    const executor = new AgentExecutor({
      agent,
      tools,
      verbose: true
    });

    const result = await executor.invoke({ input, chat_history: chat_history || [] });

    res.json({
      result: result?.output || 'No response generated.',
      tools: result?.intermediateSteps?.map((s: any) => s.tool) || []
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Agent failed', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ MCP Agent Server running at http://localhost:${port}/mcp`);
});
