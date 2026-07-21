'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ChatMessage } from '@/lib/nutrition';

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function ChatBubble({ message, isStreaming = false }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const renderLine = (line: string) => {
    const parts = line.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  // Simple markdown-like formatting
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      let isBullet = false;
      let cleanLine = line;
      if (line.startsWith('• ') || line.startsWith('- ')) {
        isBullet = true;
        cleanLine = line.slice(2);
      }

      const content = renderLine(cleanLine);

      if (isBullet) {
        return (
          <span key={i} style={{ display: 'block', paddingLeft: '12px' }}>
            • {content}
          </span>
        );
      }

      return (
        <span key={i} style={{ display: 'block' }}>
          {content.length > 0 && content[0] !== '' ? content : <br />}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: '4px 0',
        gap: '8px',
        alignItems: 'flex-end',
      }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--md-sys-color-primary-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          🤖
        </div>
      )}

      <div style={{ maxWidth: '80%' }}>
        {/* Bubble */}
        <div
          className="body-medium"
          style={{
            backgroundColor: isUser
              ? 'var(--md-sys-color-primary-container)'
              : 'var(--md-sys-color-surface-container-high)',
            color: isUser
              ? 'var(--md-sys-color-on-primary-container)'
              : 'var(--md-sys-color-on-surface)',
            padding: '12px 16px',
            borderRadius: isUser
              ? '16px 16px 4px 16px'
              : '4px 16px 16px 16px',
            lineHeight: 1.5,
          }}
        >
          {formatContent(message.content)}
          {message.actionInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                backgroundColor: 'var(--md-sys-color-tertiary-container)',
                color: 'var(--md-sys-color-on-tertiary-container)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>⚡</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{message.actionInfo.title}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>{message.actionInfo.detail}</div>
              </div>
            </motion.div>
          )}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{
                display: 'inline-block',
                width: '2px',
                height: '16px',
                backgroundColor: 'currentColor',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
              }}
            />
          )}
        </div>

        {/* Timestamp */}
        <div
          className="label-small"
          style={{
            color: 'var(--md-sys-color-on-surface-variant)',
            marginTop: '4px',
            textAlign: isUser ? 'right' : 'left',
            paddingInline: '4px',
            opacity: 0.7,
          }}
        >
          {time}
        </div>
      </div>
    </motion.div>
  );
}
