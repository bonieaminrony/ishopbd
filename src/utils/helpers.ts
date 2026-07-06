export const getOrderLocalDateString = (order: any) => {
  if (order.createdAt) {
    let dateObj: Date;
    if (typeof order.createdAt.toDate === 'function') {
      dateObj = order.createdAt.toDate();
    } else if (order.createdAt.seconds) {
      dateObj = new Date(order.createdAt.seconds * 1000);
    } else {
      dateObj = new Date(order.createdAt);
    }
    if (!isNaN(dateObj.getTime())) {
      return dateObj;
    }
  }
  
  if (order.date && order.date !== "N/A") {
    const datePart = order.date.split(',')[0].trim();
    return datePart;
  }
  return "N/A";
};

export const formatOrderGroupDate = (dateStrOrObj: any) => {
  if (!dateStrOrObj || dateStrOrObj === "N/A") return "অন্যান্য";
  
  let datePart = "";
  let dateObj: Date | null = null;
  
  if (dateStrOrObj instanceof Date) {
    dateObj = dateStrOrObj;
    datePart = dateObj.toLocaleDateString("bn-BD");
  } else {
    datePart = String(dateStrOrObj).trim();
  }
  
  if (!dateObj) {
    const parts = datePart.split(/[\/\-]/);
    if (parts.length === 3) {
      const bengaliToEnglishMap: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
      };
      const toEnglishDigits = (str: string) => str.replace(/[০-৯]/g, m => bengaliToEnglishMap[m] || m);
      
      const p0 = parseInt(toEnglishDigits(parts[0]));
      const p1 = parseInt(toEnglishDigits(parts[1]));
      const p2 = parseInt(toEnglishDigits(parts[2]));
      
      if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
        if (p0 > 1000) {
          dateObj = new Date(p0, p1 - 1, p2);
        } else {
          dateObj = new Date(p2, p1 - 1, p0);
        }
      }
    }
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  const todayStrBn = today.toLocaleDateString("bn-BD");
  const yesterdayStrBn = yesterday.toLocaleDateString("bn-BD");
  const todayStrEn = today.toLocaleDateString("en-US");
  const yesterdayStrEn = yesterday.toLocaleDateString("en-US");

  const bnMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const toBengaliDigits = (num: number | string) => {
    const englishToBengaliMap: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return String(num).replace(/[0-9]/g, m => englishToBengaliMap[m] || m);
  };

  const getFormattedDateText = (d: Date) => {
    const day = d.getDate();
    const month = bnMonths[d.getMonth()];
    const year = d.getFullYear();
    return `${toBengaliDigits(day)} ${month}, ${toBengaliDigits(year)}`;
  };
  
  if (dateObj && !isNaN(dateObj.getTime())) {
    const isToday = dateObj.toDateString() === today.toDateString();
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `আজ (${getFormattedDateText(dateObj)})`;
    } else if (isYesterday) {
      return `গতকাল (${getFormattedDateText(dateObj)})`;
    } else {
      return getFormattedDateText(dateObj);
    }
  }
  
  if (datePart === todayStrBn || datePart === todayStrEn) {
    return `আজ (${datePart})`;
  } else if (datePart === yesterdayStrBn || datePart === yesterdayStrEn) {
    return `গতকাল (${datePart})`;
  }
  
  return datePart;
};

export const toBengaliNumber = (num: number | string) => {
  const englishToBengaliMap: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(num).replace(/[0-9]/g, m => englishToBengaliMap[m] || m);
};

export const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

export const cleanLatex = (text: string) => {
  if (!text) return text;
  let cleaned = text;
  cleaned = cleaned.replace(/\\times/g, "x");
  cleaned = cleaned.replace(/\\text\{([^}]*)\}/g, "$1");
  cleaned = cleaned.replace(/\$/g, "");
  return cleaned;
};

export const sumValues = (obj: Record<string, number>): number => { const vals = Object.values(obj); let s = 0; for (const v of vals) s += Number(v); return s; };