import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FiCopy, FiCheck } from 'react-icons/fi';
import styles from '../../../styles/profile.module.css';

interface CopyModalProps {
  visible: boolean;
  type: 'phone' | 'email';
  value: string;
  onClose: () => void;
}

const CopyModal: React.FC<CopyModalProps> = ({ visible, type, value, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  const handleCopy = async () => {
    try {
      let textToCopy = value;
      
      // 전화번호인 경우 tel: 접두사 추가
      if (type === 'phone' && !value.startsWith('tel:')) {
        textToCopy = `tel:${value}`;
      }
      
      // 이메일인 경우 mailto: 접두사 추가
      if (type === 'email' && !value.startsWith('mailto:')) {
        textToCopy = `mailto:${value}`;
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      alert('복사에 실패했습니다.');
    }
  };

  const handleCall = () => {
    if (type === 'phone') {
      window.location.href = `tel:${value}`;
    }
  };

  const handleEmail = () => {
    if (type === 'email') {
      window.location.href = `mailto:${value}`;
    }
  };

  const getIcon = () => {
    if (type === 'phone') return '📞';
    if (type === 'email') return '📧';
    return '📋';
  };

  const getTitle = () => {
    if (type === 'phone') return '전화번호';
    if (type === 'email') return '이메일';
    return '정보';
  };

  return (
    <div className={styles.socialModalOverlay} role="dialog" aria-modal="true">
      <div className={styles.socialModalContainer} style={{ maxWidth: '400px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{getIcon()}</span>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{getTitle()}</h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #e9ecef',
            fontSize: '16px',
            wordBreak: 'break-all'
          }}>
            {value}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: copied ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
            {copied ? '복사됨!' : '복사하기'}
          </button>
          
          {(type === 'phone' || type === 'email') && (
            <button
              onClick={type === 'phone' ? handleCall : handleEmail}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {type === 'phone' ? '전화걸기' : '이메일 보내기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyModal; 