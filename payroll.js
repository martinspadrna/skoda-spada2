function isPayrollWorkday(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return !getSpecialWorkInfo(date);
}

function getPayrollDateForMonth(year, monthIndex) {
  const cursor = new Date(year, monthIndex, 1);
  cursor.setHours(0, 0, 0, 0);
  let workdayCount = 0;

  while (cursor.getMonth() === monthIndex) {
    if (isPayrollWorkday(cursor)) {
      workdayCount += 1;
      if (workdayCount === 4) {
        return new Date(cursor);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return null;
}

function getNextPayrollDate(now) {
  const today = new Date(now || new Date());
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 24; i += 1) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const payDate = getPayrollDateForMonth(monthDate.getFullYear(), monthDate.getMonth());
    if (payDate && payDate >= today) {
      return payDate;
    }
  }

  return null;
}

function pluralizeDays(count) {
  if (count === 1) return 'den';
  if (count >= 2 && count <= 4) return 'dny';
  return 'dní';
}

function getPayrollTileText(now) {
  const payDate = getNextPayrollDate(now || new Date());
  const today = new Date(now || new Date());
  today.setHours(0, 0, 0, 0);

  if (!payDate) return '💸 Výplata: bez termínu';

  const diffDays = Math.round((payDate.getTime() - today.getTime()) / 86400000);
  if (diffDays <= 0) return '💸 Výplata přijde dnes';
  if (diffDays === 1) return '💸 Výplata přijde zítra';
  return '💸 Výplata přijde za ' + diffDays + ' ' + pluralizeDays(diffDays);
}
