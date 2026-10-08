export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const calculateRemainingDays = (weddingDate: string): number => {
  if (!weddingDate) return 0;
  const today = new Date();
  const wedding = new Date(weddingDate);
  const diffTime = wedding.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const calculateRemainingMonths = (weddingDate: string): number => {
  if (!weddingDate) return 0;
  const today = new Date();
  const wedding = new Date(weddingDate);
  const diffTime = wedding.getTime() - today.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths > 0 ? diffMonths : 0;
};

export const calculateTotalBudget = (budgetItems: any[]): number => {
  return budgetItems.reduce((total, item) => total + item.estimatedCost, 0);
};

export const calculateTotalActual = (budgetItems: any[]): number => {
  return budgetItems.reduce((total, item) => total + item.actualCost, 0);
};

export const calculateTotalSavings = (savings: any[]): number => {
  return savings.reduce((total, entry) => total + entry.amount, 0);
};

export const calculateFundingGap = (totalBudget: number, totalSavings: number): number => {
  return Math.max(0, totalBudget - totalSavings);
};

export const checkEmergencyBufferStatus = (totalBudget: number, totalActual: number, bufferPercentage: number = 15): {
  bufferAmount: number;
  totalWithBuffer: number;
  remainingSafe: number;
  remainingBuffer: number;
  isBufferTouched: boolean;
  bufferUsagePercentage: number;
} => {
  const bufferAmount = totalBudget * (bufferPercentage / 100);
  const totalWithBuffer = totalBudget + bufferAmount;
  const remainingSafe = Math.max(0, totalBudget - totalActual);
  const remainingBuffer = Math.max(0, totalWithBuffer - totalActual);
  const isBufferTouched = totalActual > totalBudget;
  const bufferUsagePercentage = isBufferTouched ? Math.min(100, ((totalActual - totalBudget) / bufferAmount) * 100) : 0;

  return {
    bufferAmount,
    totalWithBuffer,
    remainingSafe,
    remainingBuffer,
    isBufferTouched,
    bufferUsagePercentage,
  };
};

export const calculateMonthlyTarget = (fundingGap: number, remainingMonths: number): number => {
  if (remainingMonths <= 0) return fundingGap;
  return Math.ceil(fundingGap / remainingMonths);
};

export const calculateProgressPercentage = (totalSavings: number, totalBudget: number): number => {
  if (totalBudget === 0) return 0;
  return Math.min(100, Math.round((totalSavings / totalBudget) * 100));
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
