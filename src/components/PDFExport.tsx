import jsPDF from 'jspdf';
// 1. Import autoTable directly
import autoTable from 'jspdf-autotable';
import { HookData } from 'jspdf-autotable'; 
import { FinanceState, DailyExpense } from '../context/FinanceContext'; // Adjust path as needed

// This is no longer needed as we are not extending the jsPDF interface
// declare module 'jspdf' {
//   interface jsPDF {
//     autoTable: (options: any) => jsPDF;
//   }
// }

// --- Helper Functions (No changes needed) ---

const addHeader = (pdf: jsPDF, userName: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor('#2c3e50');
  pdf.text('Personal Finance Report', pageWidth / 2, 20, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor('#7f8c8d');
  pdf.text(`Report for: ${userName}`, pageWidth / 2, 28, { align: 'center' });
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, 34, { align: 'center' });
};

const addFooter = (pdf: jsPDF) => {
  const pageCount = pdf.internal.pages.length - 1;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFontSize(9);
  pdf.setTextColor('#bdc3c7');
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
};

const addSectionTitle = (pdf: jsPDF, title: string, y: number) => {
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor('#34495e');
  pdf.text(title, 14, y);
  return y + 8;
};

// --- Main Export Function ---

export const exportToPDF = (state: FinanceState, userName: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  let y = 45;

  addHeader(pdf, userName);

  // --- Budget Overview Section ---
  y = addSectionTitle(pdf, 'Budget Overview', y);
  const needsAmount = (state.monthlySalary * state.needsPercent) / 100;
  const wantsAmount = (state.monthlySalary * state.wantsPercent) / 100;
  const investmentsAmount = (state.monthlySalary * state.investmentsPercent) / 100;

  // 2. Call autoTable as a function, passing the pdf instance
  autoTable(pdf, {
    startY: y,
    head: [['Category', 'Allocation (%)', 'Amount (₹)']],
    body: [
        ['Monthly Salary', '100%', state.monthlySalary.toLocaleString('en-IN')],
        ['Needs', `${state.needsPercent}%`, needsAmount.toLocaleString('en-IN')],
        ['Wants', `${state.wantsPercent}%`, wantsAmount.toLocaleString('en-IN')],
        ['Investments', `${state.investmentsPercent}%`, investmentsAmount.toLocaleString('en-IN')],
    ],
    theme: 'grid',
    headStyles: { fillColor: '#3498db' },
    didDrawPage: (data: HookData) => {
      if (data.cursor) {
        y = data.cursor.y;
      }
    }
  });
  y += 15;

  // --- Breakdowns and Allocations ---
  const breakdownBody: string[][] = [];
  const maxRows = Math.max(
    Object.keys(state.needsCategories).length,
    Object.keys(state.wantsCategories).length
  );
  for (let i = 0; i < maxRows; i++) {
    const needsKey = Object.keys(state.needsCategories)[i];
    const wantsKey = Object.keys(state.wantsCategories)[i];
    const needsText = needsKey
      ? `${state.needsCategories[needsKey]}: ₹${(state.needsBreakdown[needsKey] || 0).toLocaleString('en-IN')}`
      : '';
    const wantsText = wantsKey
      ? `${state.wantsCategories[wantsKey]}: ₹${(state.wantsBreakdown[wantsKey] || 0).toLocaleString('en-IN')}`
      : '';
    breakdownBody.push([needsText, wantsText]);
  }

  y = addSectionTitle(pdf, 'Detailed Breakdowns', y);
  autoTable(pdf, {
    startY: y,
    head: [['Needs Breakdown', 'Wants Breakdown']],
    body: breakdownBody,
    theme: 'striped',
    headStyles: { fillColor: '#2ecc71' },
    didDrawPage: (data: HookData) => {
      if (data.cursor) {
        y = data.cursor.y;
      }
    }
  });
  y += 15;
  
  // --- Investment Projections ---
  y = addSectionTitle(pdf, 'Investment Projections', y);
  const calculateFutureValue = (years: number) => {
    const monthlyInvestment = investmentsAmount;
    const annualReturn = state.investmentReturns.overall / 100;
    const monthlyReturn = annualReturn / 12;
    const totalMonths = years * 12;
    const futureValue = monthlyInvestment * (((1 + monthlyReturn) ** totalMonths - 1) / monthlyReturn);
    return (futureValue / 10000000).toFixed(2);
  };
  autoTable(pdf, {
    startY: y,
    head: [['Term (Years)', 'Projected Value (in Cr)']],
    body: [10, 15, 20, 25, 30].map(years => [
        `${years} Years`,
        `₹${calculateFutureValue(years)} Cr`
    ]),
    theme: 'grid',
    headStyles: { fillColor: '#9b59b6' },
    didDrawPage: (data: HookData) => {
      if (data.cursor) {
        y = data.cursor.y;
      }
    }
  });
  y += 15;

  // --- Historical Summary Section ---
  if (state.monthlySnapshots && state.monthlySnapshots.length > 0) {
    y = addSectionTitle(pdf, 'Historical Summary', y);
    autoTable(pdf, {
        startY: y,
        head: [['Month', 'Salary', 'Expenses', 'Savings']],
        body: state.monthlySnapshots.map(snapshot => [
            snapshot.month,
            `₹${snapshot.salary.toLocaleString('en-IN')}`,
            `₹${snapshot.totalExpenses.toLocaleString('en-IN')}`,
            `₹${snapshot.savings.toLocaleString('en-IN')}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: '#f39c12' }, // Orange Header
        didDrawPage: (data: HookData) => {
            if (data.cursor) {
                y = data.cursor.y;
            }
        }
    });
    y += 15;
  }

  // --- Recent Expenses Table ---
  y = addSectionTitle(pdf, 'Recent Expenses', y);
  const recentExpenses = state.dailyExpenses ? state.dailyExpenses.slice(-20).reverse() : [];
  if (recentExpenses.length > 0) {
    autoTable(pdf, {
      startY: y,
      head: [['Date', 'Category', 'Subcategory', 'Amount (₹)']],
      body: recentExpenses.map((exp: DailyExpense) => [
        exp.date,
        exp.category,
        exp.subcategory,
        exp.amount.toLocaleString('en-IN'),
      ]),
      theme: 'striped',
      headStyles: { fillColor: '#e74c3c' },
    });
  } else {
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor('#7f8c8d');
    pdf.text('No recent expenses to display.', 14, y);
  }

  addFooter(pdf);

  const fileName = `Finance_Report_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};
