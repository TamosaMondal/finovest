import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HookData } from 'jspdf-autotable';
import { FinanceState, DailyExpense } from '../context/FinanceContext'; // Adjust path as needed

// --- Helper Functions ---
const addHeader = (pdf: jsPDF, userName: string) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#1a237e'); // Darker blue for a premium feel
    pdf.text('Personal Finance Dashboard', pageWidth / 2, 25, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#424242'); // Dark gray
    pdf.text(`Report for: ${userName}`, pageWidth / 2, 33, { align: 'center' });
    pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 39, { align: 'center' });

    // Add a subtle line separator
    pdf.setDrawColor('#bbdefb'); // Light blue
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, pageWidth - 20, 45);
};

const addFooter = (pdf: jsPDF) => {
    const pageCount = (pdf as any).internal.getNumberOfPages(); // Correct way to get total pages
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(9);
    pdf.setTextColor('#757575'); // Medium gray

    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
};

const addSectionTitle = (pdf: jsPDF, title: string, y: number, icon?: string) => {
    const startX = 14;
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#3f51b5'); // Indigo color

    if (icon) {
        // Add a simple icon placeholder (can be replaced with actual image/vector later)
        // For now, we'll use text as an icon, or just leave it for visual effect.
        // Example: pdf.text('💰', startX, y + 5); // Unicode emoji
        pdf.text(title, startX + 0, y + 5); // Adjust position if we add a real icon
    } else {
        pdf.text(title, startX, y + 5);
    }

    pdf.setDrawColor('#c5cae9'); // Lighter indigo
    pdf.setLineWidth(0.3);
    pdf.line(startX, y + 7, pdf.internal.pageSize.getWidth() - startX, y + 7); // Underline for section title

    return y + 15; // Adjust Y for next content
};

const addSummaryCard = (pdf: jsPDF, title: string, value: string, y: number, x: number, fillColor: string, textColor: string) => {
    const cardWidth = 60;
    const cardHeight = 30;
    const cornerRadius = 3;

    pdf.setFillColor(fillColor);
    pdf.roundedRect(x, y, cardWidth, cardHeight, cornerRadius, cornerRadius, 'F'); // Filled rectangle

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#ffffff'); // White text for title on colored card
    pdf.text(title, x + cardWidth / 2, y + 10, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(textColor); // Text color for value
    pdf.text(value, x + cardWidth / 2, y + 22, { align: 'center' });

    return y + cardHeight + 5;
};


// --- Main Export Function ---
export const exportToPDF = (state: FinanceState, userName: string) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 45; // Starting Y position

    addHeader(pdf, userName);
    y = 50; // Adjust Y after header and line

    // --- Key Financial Summary Cards ---
    y = addSectionTitle(pdf, 'Financial Snapshot', y);
    const cardStartX = 14;
    const cardSpacing = 5;
    const cardWidth = 60;

    const totalExpenses = state.dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentSavings = state.monthlySalary - totalExpenses; // A simplified current savings calculation

    addSummaryCard(pdf, 'Monthly Income', `₹${state.monthlySalary.toLocaleString('en-IN')}`, y, cardStartX, '#4caf50', '#ffffff'); // Green
    addSummaryCard(pdf, 'Total Expenses', `₹${totalExpenses.toLocaleString('en-IN')}`, y, cardStartX + cardWidth + cardSpacing, '#f44336', '#ffffff'); // Red
    addSummaryCard(pdf, 'Current Savings', `₹${currentSavings.toLocaleString('en-IN')}`, y, cardStartX + (cardWidth + cardSpacing) * 2, '#2196f3', '#ffffff'); // Blue
    y += 40; // Space for the summary cards

    // --- Budget Overview Section ---
    y = addSectionTitle(pdf, 'Budget Overview', y, '📊');
    const needsAmount = (state.monthlySalary * state.needsPercent) / 100;
    const wantsAmount = (state.monthlySalary * state.wantsPercent) / 100;
    const investmentsAmount = (state.monthlySalary * state.investmentsPercent) / 100;

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
        headStyles: { fillColor: '#5c6bc0', fontStyle: 'bold', textColor: '#ffffff' }, // Indigo header
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: '#e0e0e0', // Lighter grid lines
            lineWidth: 0.1
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
            2: { halign: 'right' }
        },
        didDrawPage: (data: HookData) => {
            if (data.cursor) {
                y = data.cursor.y;
            }
        }
    });
    y += 15;

    // --- Detailed Breakdowns ---
    const breakdownBody: string[][] = [];
    const allCategories = new Set([...Object.keys(state.needsCategories), ...Object.keys(state.wantsCategories)]);

    allCategories.forEach(key => {
        const needsValue = state.needsBreakdown[key] || 0;
        const wantsValue = state.wantsBreakdown[key] || 0;

        const needsText = state.needsCategories[key] ?
            `${state.needsCategories[key]}: ₹${needsValue.toLocaleString('en-IN')}` :
            '';
        const wantsText = state.wantsCategories[key] ?
            `${state.wantsCategories[key]}: ₹${wantsValue.toLocaleString('en-IN')}` :
            '';
        breakdownBody.push([needsText, wantsText]);
    });

    y = addSectionTitle(pdf, 'Detailed Breakdowns', y, '🧾');
    autoTable(pdf, {
        startY: y,
        head: [['Needs Breakdown', 'Wants Breakdown']],
        body: breakdownBody,
        theme: 'striped',
        headStyles: { fillColor: '#66bb6a', fontStyle: 'bold', textColor: '#ffffff' }, // Green header
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: '#e0e0e0',
            lineWidth: 0.1
        },
        alternateRowStyles: { fillColor: '#f1f8e9' }, // Light green for alternate rows
        didDrawPage: (data: HookData) => {
            if (data.cursor) {
                y = data.cursor.y;
            }
        }
    });
    y += 15;

    // --- Financial Goals Section ---
    if (state.goals && state.goals.length > 0) {
        y = addSectionTitle(pdf, 'Financial Goals', y, '🎯');
        autoTable(pdf, {
            startY: y,
            head: [['Goal', 'Target', 'Saved', 'Progress']],
            body: state.goals.map(goal => {
                const progress = ((goal.savedAmount / goal.targetAmount) * 100);
                return [
                    goal.name,
                    `₹${goal.targetAmount.toLocaleString('en-IN')}`,
                    `₹${goal.savedAmount.toLocaleString('en-IN')}`,
                    `${progress.toFixed(1)}%`
                ];
            }),
            theme: 'striped',
            headStyles: { fillColor: '#9575cd', fontStyle: 'bold', textColor: '#ffffff' }, // Purple Header
            styles: {
                fontSize: 10,
                cellPadding: 3,
                lineColor: '#e0e0e0',
                lineWidth: 0.1
            },
            alternateRowStyles: { fillColor: '#ede7f6' }, // Light purple for alternate rows
            columnStyles: {
                3: {
                    cellWidth: 30 // Make progress column wider for bar
                }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 3) {
                    const progressText = data.cell.text[0];
                    const progressValue = parseFloat(progressText.replace('%', ''));
                    const x = data.cell.x + 2;
                    const y = data.cell.y + data.cell.height / 2 - 2;
                    const width = data.cell.width - 4;
                    const height = 4;

                    // Draw background of progress bar
                    pdf.setFillColor('#e0e0e0');
                    pdf.rect(x, y, width, height, 'F');

                    // Draw actual progress
                    pdf.setFillColor('#4caf50'); // Green progress
                    pdf.rect(x, y, (width * progressValue) / 100, height, 'F');

                    // Add text on top
                    pdf.setFontSize(8);
                    pdf.setTextColor('#212121');
                    pdf.text(progressText, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
                }
            },
            didDrawPage: (data: HookData) => {
                if (data.cursor) {
                    y = data.cursor.y;
                }
            }
        });
        y += 15;
    }

    // --- Debt Summary Section ---
    // --- Debt Summary Section ---
if (state.debts && state.debts.length > 0) {
    y = addSectionTitle(pdf, 'Debt Summary', y, '📉');
    autoTable(pdf, {
        startY: y,
        head: [['Debt', 'Total Amount', 'Interest Rate', 'Paid (%)']],
        body: state.debts.map(debt => {
            const paidPercentage = debt.originalAmount > 0
                ? ((debt.originalAmount - debt.totalAmount) / debt.originalAmount * 100)
                : 0;

            return [
                debt.name,
                `₹${debt.totalAmount.toLocaleString('en-IN')}`,
                `${debt.interestRate}%`,
                `${paidPercentage.toFixed(1)}%`
            ];
        }),
    });
    y = (pdf as any).lastAutoTable.finalY + 10;
}


    // --- Recent Expenses Table ---
    y = addSectionTitle(pdf, 'Recent Expenses', y, '💸');
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
            headStyles: { fillColor: '#e57373', fontStyle: 'bold', textColor: '#ffffff' }, // Lighter Red Header
            styles: {
                fontSize: 10,
                cellPadding: 3,
                lineColor: '#e0e0e0',
                lineWidth: 0.1
            },
            alternateRowStyles: { fillColor: '#fbe9e7' }, // Light coral for alternate rows
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