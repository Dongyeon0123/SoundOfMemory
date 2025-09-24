import React, { useState, useEffect } from 'react';
import styles from '../../../styles/HistoryModal.module.css';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const currentYear = new Date().getFullYear();
const yearList = Array.from({ length: 60 }, (_, i) => (currentYear - i).toString());

export default function HistoryModal({
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
    // 길이 제한: 소속(학교/소속) 10자, 직무/역할 8자
    if (key === 'school') value = value.slice(0, 10);
    if (key === 'role') value = value.slice(0, 8);
    setList(prev =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [key]: value };
        // 연도 변경 시 period도 갱신
        if (key === 'periodStart' || key === 'periodEnd') {
          updated.period = `${updated.periodStart || ''} ~ ${updated.periodEnd || ''}`;
        }
        return updated;
      })
    );
  };

  const handleAddChange = (key: string, value: string) => {
    // 길이 제한: 소속 10자, 직무/역할 8자
    if (key === 'school') value = value.slice(0, 10);
    if (key === 'role') value = value.slice(0, 8);
    setAddForm(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = (idx: number) => {
    setList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    if (!addForm.school || !addForm.periodStart || !addForm.periodEnd || !addForm.role) return;
    setList(prev => [
      ...prev,
      {
        school: addForm.school,
        periodStart: addForm.periodStart,
        periodEnd: addForm.periodEnd,
        period: `${addForm.periodStart} ~ ${addForm.periodEnd}`,
        role: addForm.role,
      },
    ]);
    setAddForm({});
    setAddMode(false);
  };

  const handleSave = () => {
    let combined = list;
    const canAppend = addMode && addForm && addForm.school && addForm.periodStart && addForm.periodEnd && addForm.role;
    if (canAppend) {
      combined = [
        ...list,
        {
          school: addForm.school,
          periodStart: addForm.periodStart,
          periodEnd: addForm.periodEnd,
          period: `${addForm.periodStart} ~ ${addForm.periodEnd}`,
          role: addForm.role,
        },
      ];
      setAddForm({});
      setAddMode(false);
    }
    onSave(combined);
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxHeight: 480, overflowY: 'auto' }}>
        <h2 className={styles.modalTitle}>이력 관리</h2>
        <div className={styles.modalBoxList}>
          {list.map((item, idx) => (
            <div key={idx} className={styles.modalBoxItem}>
              <div className={styles.modalBoxRow}>
                <span className={styles.modalBoxLabel}>학교/소속</span>
                <input
                  className={styles.modalBoxInput}
                  value={item.school || ''}
                  onChange={e => handleChange(idx, 'school', e.target.value)}
                  placeholder="학교/소속"
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
          {addMode ? (
            <div className={styles.modalBoxItem}>
              <div className={styles.modalBoxRow}>
                <span className={styles.modalBoxLabel}>학교/소속</span>
                <input
                  className={styles.modalBoxInput}
                  value={addForm.school || ''}
                  onChange={e => handleAddChange('school', e.target.value)}
                  placeholder="학교/소속"
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
                <span className={styles.modalBoxLabel}>직무/역할</span>
                <input
                  className={styles.modalBoxInput}
                  value={addForm.role || ''}
                  onChange={e => handleAddChange('role', e.target.value)}
                  placeholder="직무/역할"
                />
              </div>
            </div>
          ) : (
            <button
              className={styles.modalAddBtn}
              onClick={() => setAddMode(true)}
            >
              <FiPlus size={18} style={{ marginRight: 6 }} /> 이력 추가
            </button>
          )}
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
