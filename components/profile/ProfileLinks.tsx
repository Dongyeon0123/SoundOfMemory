import React from 'react';
import styles from '../../styles/styles.module.css';
import { FiPhone, FiAtSign, FiMail, FiGlobe } from 'react-icons/fi';
import { FaChrome, FaYoutube, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaGithub, FaTiktok } from 'react-icons/fa';
import { SiNotion, SiBehance } from 'react-icons/si';

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
}

function ProfileLinks({ socialLinks }: ProfileLinksProps) {
  console.log('ProfileLinks socialLinks:', socialLinks);
  
  // URL이 있는 링크만 필터링
  const activeLinks = socialLinks ? Object.entries(socialLinks).filter(([key, url]) => url && url.trim() !== '') : [];
  
  console.log('ProfileLinks activeLinks:', activeLinks);

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
    let finalUrl = url;
    
    // 전화번호인 경우 tel: 접두사 추가
    if (type === 'number' && !url.startsWith('tel:')) {
      finalUrl = `tel:${url}`;
    }
    
    // 이메일인 경우 mailto: 접두사 추가
    if (type === 'email' && !url.startsWith('mailto:')) {
      finalUrl = `mailto:${url}`;
    }
    
    // URL이 http:// 또는 https://로 시작하지 않으면 https:// 추가
    if (type !== 'number' && type !== 'email' && !url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
    }
    
    if (finalUrl.startsWith('tel:') || finalUrl.startsWith('mailto:')) {
      window.location.href = finalUrl;
    } else {
      window.open(finalUrl, '_blank');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 16 }}>
      {activeLinks.map(([type, url]) => (
        <div 
          key={type} 
          className={styles.profileIcons}
          onClick={() => handleLinkClick(type, url)}
          title={type}
        >
          {getIcon(type, url)}
        </div>
      ))}
    </div>
  );
}

export default ProfileLinks; 