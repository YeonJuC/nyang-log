// src/utils/dateUtils.ts

export const getCurrentDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  };
  