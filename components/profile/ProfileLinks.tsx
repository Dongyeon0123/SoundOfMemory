import React, { useState } from 'react';
import styles from '../../styles/styles.module.css';
import { FiPhone, FiAtSign, FiMail, FiGlobe } from 'react-icons/fi';
import { FaChrome, FaYoutube, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaGithub, FaTiktok } from 'react-icons/fa';
import { SiNotion, SiBehance } from 'react-icons/si';
import CopyModal from './modal/CopyModal';

interface ProfileLinksProps {
  socialLinks?: {
    number?: string;
    email?: string;
    personUrl?: string;
    youtubeUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    bandUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    cafeUrl?: string;
    notionUrl?: string;
    tiktokUrl?: string;
    blogUrl?: string;
    behanceUrl?: string;
  };
  obscured?: boolean;
}

function ProfileLinks({ socialLinks, obscured = false }: ProfileLinksProps) {

  
  // URL이 있는 링크만 필터링
  const activeLinks = socialLinks ? Object.entries(socialLinks).filter(([key, url]) => url && url.trim() !== '') : [];
  
  // 링크 순서 정렬: 전화번호 → 이메일 → 나머지
  const sortedLinks = activeLinks.sort((a, b) => {
    const [keyA] = a;
    const [keyB] = b;
    
    // 전화번호가 가장 우선
    if (keyA === 'number') return -1;
    if (keyB === 'number') return 1;
    
    // 이메일이 두 번째 우선
    if (keyA === 'email') return -1;
    if (keyB === 'email') return 1;
    
    // 나머지는 원래 순서 유지
    return 0;
  });
  


  // 복사 모달 상태
  const [copyModal, setCopyModal] = useState<{
    visible: boolean;
    type: 'phone' | 'email';
    value: string;
  }>({
    visible: false,
    type: 'phone',
    value: ''
  });

  if (activeLinks.length === 0) {
    return null; // 링크가 없으면 아무것도 표시하지 않음
  }

  const getIcon = (type: string, url: string) => {
    switch (type) {
      case 'number':
        return <FiPhone size={28} color="#000" style={{ cursor: 'pointer' }} />;
      case 'email':
        return <FiMail size={28} color="#000" style={{ cursor: 'pointer' }} />;
      case 'personUrl':
        return <FiGlobe size={28} color="#000" style={{ cursor: 'pointer' }} />;
      case 'youtubeUrl':
        return <FaYoutube size={28} color="#FF0000" style={{ cursor: 'pointer' }} />;
      case 'facebookUrl':
        return <FaFacebook size={28} color="#1877F2" style={{ cursor: 'pointer' }} />;
      case 'instagramUrl':
        return <FaInstagram size={28} color="#E4405F" style={{ cursor: 'pointer' }} />;
      case 'twitterUrl':
        return <FaTwitter size={28} color="#1DA1F2" style={{ cursor: 'pointer' }} />;
      case 'linkedinUrl':
        return <FaLinkedin size={28} color="#0077B5" style={{ cursor: 'pointer' }} />;
      case 'githubUrl':
        return <FaGithub size={28} color="#000" style={{ cursor: 'pointer' }} />;
      case 'notionUrl':
        return <SiNotion size={28} color="#000" style={{ cursor: 'pointer' }} />;
      case 'tiktokUrl':
        return <FaTiktok size={28} color="#000" style={{ cursor: 'pointer' }} />;
      case 'behanceUrl':
        return <SiBehance size={28} color="#1769FF" style={{ cursor: 'pointer' }} />;
      default:
        return <FaChrome size={28} color="#000" style={{ cursor: 'pointer' }} />;
    }
  };

  const handleLinkClick = (type: string, url: string) => {
    // 전화번호나 이메일인 경우 모달 표시
    if (type === 'number') {
      setCopyModal({
        visible: true,
        type: 'phone',
        value: url
      });
      return;
    }
    
    if (type === 'email') {
      setCopyModal({
        visible: true,
        type: 'email',
        value: url
      });
      return;
    }
    
    // 다른 링크들은 기존 방식대로 처리
    let finalUrl = url;
    
    // URL이 http:// 또는 https://로 시작하지 않으면 https:// 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
    }
    
    window.open(finalUrl, '_blank');
  };

  return (
    <>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '20px 0',
        maxWidth: '100%'
      }}>
        {sortedLinks.slice(0, 6).map(([type, url]) => (
          <div 
            key={type} 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: obscured ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              filter: obscured ? 'blur(4px)' : 'none',
              pointerEvents: obscured ? 'none' : 'auto'
            }}
            onClick={() => !obscured && handleLinkClick(type, url)}
            onMouseEnter={(e) => {
              if (!obscured) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!obscured) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
            title={type}
          >
            {getIcon(type, url)}
          </div>
        ))}
      </div>
      
      <CopyModal
        visible={copyModal.visible}
        type={copyModal.type}
        value={copyModal.value}
        onClose={() => setCopyModal(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
}

export default ProfileLinks; 