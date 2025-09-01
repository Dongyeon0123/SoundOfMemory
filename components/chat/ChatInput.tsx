import React from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import styles from '../../styles/chat.module.css';

type ChatInputProps = {
  input: string;
  onInputChange: (value: string) => void;
  onResize: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  isWaitingForReply: boolean;
  onSend: () => void;
  onCancel: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
};

const ChatInput: React.FC<ChatInputProps> = ({
  input, onInputChange, onResize, onKeyDown, disabled,
  isWaitingForReply, onSend, onCancel, textareaRef,
}) => (
  <div className={styles.inputSection}>
    <textarea
      ref={textareaRef}
      className={styles.textarea}
      value={input}
      placeholder="메시지를 입력하세요."
      onChange={e => onInputChange(e.target.value)}
      onInput={onResize}
      onKeyDown={onKeyDown}
      rows={1}
      maxLength={500}
      disabled={disabled}
    />
    <button
      className={styles.button}
      onClick={isWaitingForReply ? onCancel : onSend}
      aria-label={isWaitingForReply ? "취소" : "전송"}
      disabled={(!input.trim() && !isWaitingForReply) || isWaitingForReply}
      type="button"
      style={{
        borderRadius: isWaitingForReply ? '8px' : '50%',
        transition: 'all 0.2s ease',
      }}
    >
      {isWaitingForReply ? (
        <FiX className="icon" style={{ color: '#fff' }} />
      ) : (
        <FiSend className="icon" />
      )}
    </button>
  </div>
);

export default ChatInput;