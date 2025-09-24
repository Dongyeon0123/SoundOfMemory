import React, { useState, useEffect } from 'react';
import styles from '../../../styles/HistoryModal.module.css';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const currentYear = new Date().getFullYear();
const yearList = Array.from({ length: 60 }, (_, i) => (currentYear - i).toString());

export default function CareerModal({
  open,
  items = [],
  onClose,
  onSave,
}: {
  open: boolean;
  items?: any[];
  onClose: () => void;
  onSave: (data: any[]) => void;
}) {
  const [list, setList] = useState<any[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [addForm, setAddForm] = useState<any>({});

  useEffect(() => {
    setList(items ?? []);
  }, [items, open]);

  const handleChange = (idx: number, key: string, value: string) => {
    // 길이 제한: 소속 10자, 직무/역할 8자
    if (key === 'org') value = value.slice(0, 10);
    if (key === 'role') value = value.slice(0, 8);
    setList(prev =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    );
  };

  const handleAddChange = (key: string, value: string) => {
    // 길이 제한: 소속 10자, 직무/역할 8자
    if (key === 'org') value = value.slice(0, 10);
    if (key === 'role') value = value.slice(0, 8);
    setAddForm(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = (idx: number) => {
    setList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    if (!addForm.org || !addForm.dept || !addForm.periodStart || !addForm.periodEnd || !addForm.months || !addForm.role) return;
    setList(prev => [
      ...prev,
      {
        org: addForm.org,
        dept: addForm.dept,
        period: `${addForm.periodStart} ~ ${addForm.periodEnd}`,
        months: addForm.months,
        role: addForm.role,
      },
    ]);
    setAddForm({});
    // addMode 유지하여 계속 추가 가능하게
  };

  const handleSave = () => {
    onSave(list);
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxHeight: 480, overflowY: 'auto' }}>
        <h2 className={styles.modalTitle}>경력 관리</h2>
        <div className={styles.modalBoxList}>
          {list.map((item, idx) => (
            <div key={idx} className={styles.modalBoxItem}>
              <div className={styles.modalBoxRow}>
                <span className={styles.modalBoxLabel}>소속</span>
                <input
                  className={styles.modalBoxInput}
                  value={item.org || ''}
                  onChange={e => handleChange(idx, 'org', e.target.value)}
                  placeholder="소속"
                />
                <span className={styles.modalBoxLabel}>담당부서</span>
                <input
                  className={styles.modalBoxInput}
                  value={item.dept || ''}
                  onChange={e => handleChange(idx, 'dept', e.target.value)}
                  placeholder="담당부서"
                />
                <span className={styles.modalBoxLabel}>기간</span>
                <select
                  className={styles.modalBoxInput}
                  value={item.periodStart || ''}
                  onChange={e => handleChange(idx, 'periodStart', e.target.value)}
                >
                  <option value="">시작년도</option>
                  {yearList.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                ~
                <select
                  className={styles.modalBoxInput}
                  value={item.periodEnd || ''}
                  onChange={e => handleChange(idx, 'periodEnd', e.target.value)}
                >
                  <option value="">종료년도</option>
                  {yearList.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className={styles.modalBoxLabel}>재직 개월</span>
                <input
                  className={styles.modalBoxInput}
                  value={item.months || ''}
                  onChange={e => handleChange(idx, 'months', e.target.value)}
                  placeholder="개월"
                  type="number"
                />
                <span className={styles.modalBoxLabel}>직무/역할</span>
                <input
                  className={styles.modalBoxInput}
                  value={item.role || ''}
                  onChange={e => handleChange(idx, 'role', e.target.value)}
                  placeholder="직무/역할"
                />
              </div>
              <div className={styles.modalBoxActions}>
                <button
                  className={styles.actionBtn + ' ' + styles.delete}
                  onClick={() => handleDelete(idx)}
                  aria-label="삭제"
                >
                  <FiTrash2 size={22} />
                </button>
              </div>
            </div>
          ))}

          {addMode && (
            <div className={styles.modalBoxItem}>
              <div className={styles.modalBoxRow}>
                <span className={styles.modalBoxLabel}>소속</span>
                <input
                  className={styles.modalBoxInput}
                  value={addForm.org || ''}
                  onChange={e => handleAddChange('org', e.target.value)}
                  placeholder="소속"
                />
                <span className={styles.modalBoxLabel}>담당부서</span>
                <input
                  className={styles.modalBoxInput}
                  value={addForm.dept || ''}
                  onChange={e => handleAddChange('dept', e.target.value)}
                  placeholder="담당부서"
                />
                <span className={styles.modalBoxLabel}>기간</span>
                <select
                  className={styles.modalBoxInput}
                  value={addForm.periodStart || ''}
                  onChange={e => handleAddChange('periodStart', e.target.value)}
                >
                  <option value="">시작년도</option>
                  {yearList.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                ~
                <select
                  className={styles.modalBoxInput}
                  value={addForm.periodEnd || ''}
                  onChange={e => handleAddChange('periodEnd', e.target.value)}
                >
                  <option value="">종료년도</option>
                  {yearList.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className={styles.modalBoxLabel}>재직 개월</span>
                <input
                  className={styles.modalBoxInput}
                  value={addForm.months || ''}
                  onChange={e => handleAddChange('months', e.target.value)}
                  placeholder="개월"
                  type="number"
                />
                <span className={styles.modalBoxLabel}>직무/역할</span>
                <input
                  className={styles.modalBoxInput}
                  value={addForm.role || ''}
                  onChange={e => handleAddChange('role', e.target.value)}
                  placeholder="직무/역할"
                />
              </div>
              <div className={styles.modalBoxActions}>
                <button
                  className={styles.actionBtn}
                  onClick={handleAdd}
                  aria-label="추가"
                  style={{ color: '#636AE8FF' }}
                >
                  추가
                </button>
              </div>
            </div>
          )}

          <button
            className={styles.modalAddBtn}
            onClick={() => { setAddForm({}); setAddMode(true); }}
          >
            <FiPlus size={18} style={{ marginRight: 6 }} /> 경력 추가
          </button>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalButton} onClick={onClose}>
            닫기
          </button>
          <button
            className={`${styles.modalButton} ${styles.save}`}
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}