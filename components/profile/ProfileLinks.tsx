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

  const typeToIconFile = (type: string): string => {
    switch (type) {
      case 'personUrl':
        return 'web.png';
      case 'youtubeUrl':
        return 'youtube.png';
      case 'facebookUrl':
        return 'facebook.png';
      case 'instagramUrl':
        return 'instagram.png';
      case 'twitterUrl':
        return 'X.png';
      case 'linkedinUrl':
        return 'linkedin.png';
      case 'githubUrl':
        return 'git.png';
      case 'notionUrl':
        return 'notion.png';
      case 'tiktokUrl':
        return 'tiktok.png';
      case 'behanceUrl':
        return 'behance.png';
      default:
        return 'blog.png';
    }
  };

  const getIcon = (type: string, url: string) => {
    if (type === 'number') {
      return <FiPhone size={28} color="#000" style={{ cursor: 'pointer' }} />;
    }
    if (type === 'email') {
      return <FiMail size={28} color="#000" style={{ cursor: 'pointer' }} />;
    }
    const fileName = typeToIconFile(type);
    return <img src={`/icon/${fileName}`} alt={type} width={28} height={28} style={{ objectFit: 'contain' }} />;
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
      <div style={{ width: '100%', textAlign: 'center', margin: '2px 0', marginBottom: '8px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'nowrap'
        }}>
        {sortedLinks.slice(0, 6).map(([type, url]) => (
          <div 
            key={type} 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {getIcon(type, url)}
            </div>
          </div>
        ))}
        </div>
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