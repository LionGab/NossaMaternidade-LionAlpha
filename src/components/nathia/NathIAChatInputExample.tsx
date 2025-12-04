/**
 * NathIAChatInputExample - Exemplo de uso do componente de input de chat
 *
 * Demonstra como usar o NathIAChatInput em uma tela de chat
 */

import React, { useState } from 'react';
import { ScrollView } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

import { NathIAChatInput } from './NathIAChatInput';
import { NathIALayout } from './NathIALayout';

/**
 * Exemplo: Tela de chat completa com input
 */
export function NathIAChatInputExample() {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; isUser: boolean }>>(
    []
  );

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    logger.info('NathIA chat: sending message', { text, screen: 'NathIAChatInputExample' });

    // Adicionar mensagem do usuário
    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setSending(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: 'Obrigada por compartilhar isso comigo. Como posso te ajudar?',
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setSending(false);
    }, 1500);
  };

  const header = (
    <Box
      p="4"
      bg="card"
      rounded="xl"
      style={{
        borderWidth: 1,
        borderColor: colors.border.light,
      }}
    >
      <Text size="xl" weight="bold">
        NathIA
      </Text>
      <Text size="sm" color="tertiary">
        Assistente virtual disponível
      </Text>
    </Box>
  );

  return (
    <NathIALayout header={header} scrollable={false}>
      {/* Área de mensagens */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: Tokens.spacing['4'],
          gap: Tokens.spacing['4'],
        }}
      >
        {messages.length === 0 ? (
          <Box
            p="6"
            bg="card"
            rounded="xl"
            style={{
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Text size="md" color="tertiary" align="center">
              Olá! Como posso te ajudar hoje?
            </Text>
          </Box>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              p="4"
              bg={msg.isUser ? 'transparent' : 'card'}
              rounded="xl"
              style={{
                alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                backgroundColor: msg.isUser ? colors.primary.main : colors.background.card,
                borderWidth: msg.isUser ? 0 : 1,
                borderColor: colors.border.light,
              }}
            >
              <Text color={msg.isUser ? 'inverse' : 'primary'} size="md">
                {msg.text}
              </Text>
            </Box>
          ))
        )}
      </ScrollView>

      {/* Input de chat */}
      <NathIAChatInput
        value={message}
        onChangeText={setMessage}
        onSend={handleSend}
        sending={sending}
        placeholder="Responder a NathIA..."
      />
    </NathIALayout>
  );
}

export default NathIAChatInputExample;
