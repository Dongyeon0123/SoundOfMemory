import React from 'react';
import Image from 'next/image';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';

export default function Header() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 100
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', background: '#fff', height: 70
      }}>
        <Image src="/logo.png" alt="logo" width={36} height={36} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FiSearch size={24} style={{ marginLeft: 16 }} />
          <div style={{ position: 'relative', marginLeft: 16 }}>
            <IoNotificationsOutline size={24} />
            <span style={{
              position: 'absolute', right: -4, top: -4, background: '#fff',
              border: '1px solid #000', borderRadius: 8, width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
            }}>+</span>
          </div>
          <div style={{ position: 'relative', marginLeft: 16 }}>
            <FaUser size={24} />
            <span style={{
              position: 'absolute', right: -4, top: -4, background: '#fff',
              border: '1px solid #000', borderRadius: 8, width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
            }}>+</span>
          </div>
          <FiSettings size={24} style={{ marginLeft: 16 }} />
        </div>
      </div>
      <div style={{ width: '100%', height: 1, background: '#D3D3D3' }} />
    </div>
  );
} 