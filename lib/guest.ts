export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') {
    // SSR 안전장치: 임시 ID 반환
    return 'guest_ssr';
  }

  try {
    const key = 'som_guest_id';
    let guestId = window.localStorage.getItem(key);
    if (guestId && guestId.length > 0) {
      return guestId;
    }

    // 간단한 UUID v4 생성기 (의존성 없이)
    const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    window.localStorage.setItem(key, newId);
    return newId;
  } catch (_e) {
    // localStorage 접근 불가 시, 메모리 기반 임시값
    return 'guest_' + Math.random().toString(36).slice(2);
  }
}
