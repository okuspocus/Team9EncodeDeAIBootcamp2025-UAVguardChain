'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function FlightAgent() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<string[]>([]);
  const [preparedTx, setPreparedTx] = useState<{
    to: `0x${string}`;
    data: `0x${string}`;
    chainId: number;
  } | null>(null);

  const { data: walletClient } = useWalletClient();
  const [clientReady, setClientReady] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (walletClient) {
      setClientReady(true);
    }
  }, [walletClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = input;
    setMessages(prev => [...prev, `🧑‍💻 ${userMessage}`]);
    setInput('');
    setPreparedTx(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, `🤖 ${data.reply}`]);

        const match = data.reply.match(
          /To:\s(0x[a-fA-F0-9]+)\nData:\s(0x[a-fA-F0-9]+)\nChain ID:\s(\d+)/
        );
        if (match) {
          setPreparedTx({
            to: match[1] as `0x${string}`,
            data: match[2] as `0x${string}`,
            chainId: parseInt(match[3]),
          });
        }
      } else {
        setMessages(prev => [...prev, '🤖 No se recibió respuesta del agente.']);
      }

      setTools(data.mcpConnections || []);
    } catch (error) {
      console.error('Error al comunicarse con el agente:', error);
      setMessages(prev => [...prev, '🤖 Ocurrió un error al procesar tu solicitud.']);
    } finally {
      setLoading(false);
    }
  };

  const signAndSendTx = async () => {
    if (!walletClient || !preparedTx) return;

    try {
      const hash = await walletClient.sendTransaction({
        account: walletClient.account!,
        chain: {
          id: preparedTx.chainId,
          name: 'polygon-amoy',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: { default: { http: ['https://rpc-amoy.polygon.technology'] } },
        },
        to: preparedTx.to,
        data: preparedTx.data,
        value: parseEther('0'),
      });

      const explorerUrl = `https://amoy.polygonscan.com/tx/${hash}`;

      setMessages(prev => [
        ...prev,
        `🛰️ Tx enviada! <a href="${explorerUrl}" target="_blank" class="text-blue-600 underline">Ver en Polygonscan</a>`,
      ]);
    } catch (error) {
      console.error('Error al enviar la transacción:', error);
      setMessages(prev => [...prev, '🤖 Ocurrió un error al enviar la transacción.']);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 border rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2">Asistente AI – Registro de Vuelo de Drones</h2>

      <div className="mb-4">
        <ConnectButton />
      </div>

      <div className="bg-gray-100 text-gray-800 p-2 rounded h-64 overflow-y-auto mb-4 whitespace-pre-wrap">
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">
            <span dangerouslySetInnerHTML={{ __html: msg }} />
          </div>
        ))}
        {loading && (
          <div className="italic text-gray-500 animate-pulse">🤖 Escribiendo...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <input
        className="w-full border px-3 py-2 rounded mb-2"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        placeholder="Describe tu vuelo, por ejemplo, 'Registrar vuelo con dron 42 en 41.38, 2.17'"
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={sendMessage}
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Enviar'}
      </button>

      {clientReady && preparedTx && (
        <button
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={signAndSendTx}
        >
          ✍️ Firmar y Enviar Transacción
        </button>
      )}

      <div className="mt-4 text-sm text-gray-500">
        🔌 Herramientas MCP activas: {tools.length > 0 ? tools.join(', ') : 'ninguna'}
      </div>
    </div>
  );
}
