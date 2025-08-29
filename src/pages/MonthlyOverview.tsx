import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { LineChart } from '../components/ChartComponents';
import { Edit2, Save, X, Download } from 'lucide-react';
import Papa from 'papaparse';
import { Toaster, toast } from 'react-hot-toast'; // 💡 1. Import Toaster and toast

export default function MonthlyOverview() {
  const { state, dispatch } = useFinance();
  const [editingYear, setEditingYear] = useState<number | null>(null);
  
  const [editData, setEditData] = useState({
    year: 0,
    startingSalary: 0,
    increment: 0,
  });

  type BudgetYear = {
    year: number;
    startingSalary: number;
    increment: number;
    endingSalary: number;
    needs: number;
    wants: number;
    investments: number;
    debtRepayment: number;
    goalContributions: number;
    needsPercent: number;
    wantsPercent: number;
    investmentsPercent: number;
    debtRepaymentPercent: number;
    goalContributionsPercent: number;
  };

  const budgetYears = useMemo(() => {
    const years: BudgetYear[] = [];
    let currentSalary: number = state.monthlySalary; 
    const baseYear = new Date().getFullYear();

    for (let i = 0; i < 11; i++) {
        const year = baseYear + i;
        const existingYearData = state.budgetYears.find((by: any) => by.year === year);
        let startingSalary: number;
        if (i === 0) {
          startingSalary = currentSalary;
        } else {
          startingSalary = years[i-1].endingSalary;
        }
        
        const increment = existingYearData?.increment ?? 
                          (year <= 2032 ? (state.incrementRates?.period1 ?? 5) :
                           year <= 2042 ? (state.incrementRates?.period2 ?? 4) :
                           (state.incrementRates?.period3 ?? 3));
        
        const endingSalary = Math.round(startingSalary * (1 + increment / 100));
        
        years.push({
            year,
            startingSalary,
            increment,
            endingSalary,
            needs: Math.round((endingSalary * state.needsPercent) / 100),
            wants: Math.round((endingSalary * state.wantsPercent) / 100),
            investments: Math.round((endingSalary * state.investmentsPercent) / 100),
            debtRepayment: Math.round((endingSalary * state.debtRepaymentPercent) / 100),
            goalContributions: Math.round((endingSalary * state.goalContributionsPercent) / 100),
            needsPercent: state.needsPercent,
            wantsPercent: state.wantsPercent,
            investmentsPercent: state.investmentsPercent,
            debtRepaymentPercent: state.debtRepaymentPercent,
            goalContributionsPercent: state.goalContributionsPercent
        });
    }
    return years;
  }, [
    state.monthlySalary, 
    state.needsPercent, 
    state.wantsPercent, 
    state.investmentsPercent, 
    state.debtRepaymentPercent,
    state.goalContributionsPercent,
    state.incrementRates, 
    state.budgetYears
  ]);

  const exportMonthlyData = () => {
    const data = state.monthlySnapshots.map(snapshot => ({
      Month: snapshot.month,
      Salary: snapshot.salary,
      'Total Expenses': snapshot.totalExpenses,
      Savings: snapshot.savings,
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-history.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportYearlyData = () => {
    const data = state.yearlySnapshots.map(snapshot => ({
      Year: snapshot.year,
      'Total Salary': snapshot.totalSalary,
      'Total Expenses': snapshot.totalExpenses,
      'Total Savings': snapshot.totalSavings,
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yearly-history.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleEdit = (yearData: BudgetYear) => {
    setEditingYear(yearData.year);
    setEditData({
      year: yearData.year,
      startingSalary: yearData.startingSalary,
      increment: yearData.increment,
    });
  };

  const handleSave = () => {
    const endingSalary = Math.round(editData.startingSalary * (1 + editData.increment / 100));
    const fullYearDataToSave = {
        ...editData,
        endingSalary,
        needs: Math.round((endingSalary * state.needsPercent) / 100),
        wants: Math.round((endingSalary * state.wantsPercent) / 100),
        investments: Math.round((endingSalary * state.investmentsPercent) / 100),
        debtRepayment: Math.round((endingSalary * state.debtRepaymentPercent) / 100),
        goalContributions: Math.round((endingSalary * state.goalContributionsPercent) / 100),
        needsPercent: state.needsPercent,
        wantsPercent: state.wantsPercent,
        investmentsPercent: state.investmentsPercent,
        debtRepaymentPercent: state.debtRepaymentPercent,
        goalContributionsPercent: state.goalContributionsPercent,
    };
    dispatch({ type: 'UPDATE_BUDGET_YEAR', payload: fullYearDataToSave });
    setEditingYear(null);
    toast.success('Projection updated successfully!'); // 💡 2. Add toast notification
  };

  const handleCancel = () => {
    setEditingYear(null);
  };

  const salaryGrowthData = {
    labels: budgetYears.map(y => y.year.toString()),
    datasets: [
      {
        label: 'Ending Salary',
        data: budgetYears.map(y => y.endingSalary),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.2,
        fill: true,
      }
    ]
  };

  const allocationGrowthData = {
    labels: budgetYears.map(y => y.year.toString()),
    datasets: [
      { label: 'Needs', data: budgetYears.map(y => y.needs), borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.2, fill: true },
      { label: 'Wants', data: budgetYears.map(y => y.wants), borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.2, fill: true },
      { label: 'Investments', data: budgetYears.map(y => y.investments), borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.2, fill: true },
      { label: 'Debt Repayment', data: budgetYears.map(y => y.debtRepayment), borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.2, fill: true },
      { label: 'Goal Contributions', data: budgetYears.map(y => y.goalContributions), borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.2, fill: true }
    ]
  };

  return (
    // Add dark mode classes to the main container
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <Toaster position="top-center" /> {/* 💡 3. Add Toaster component */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Projections & Monthly Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">View your long-term budget projections and historical financial snapshots.</p>
        </div>

        {/* Historical Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly History</h2>
              <button onClick={exportMonthlyData} className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900 text-sm">
                <Download className="h-3 w-3 mr-1" /> Export
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {state.monthlySnapshots && state.monthlySnapshots.length > 0 ? (
                <div className="space-y-3">
                  {state.monthlySnapshots.slice().reverse().map((snapshot) => (
                    <div key={snapshot.month} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{snapshot.month}</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                          ₹{(snapshot.savings ?? 0).toLocaleString()} saved
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expenses: ₹{(snapshot.totalExpenses ?? 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No monthly data yet. Make some transactions!</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Yearly Summary</h2>
              <button onClick={exportYearlyData} className="flex items-center px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900 text-sm">
                <Download className="h-3 w-3 mr-1" /> Export
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {state.yearlySnapshots && state.yearlySnapshots.length > 0 ? (
                <div className="space-y-3">
                  {state.yearlySnapshots.slice().reverse().map((snapshot) => (
                    <div key={snapshot.year} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{snapshot.year}</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                          ₹{(snapshot.totalSavings ?? 0).toLocaleString()} saved
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expenses: ₹{(snapshot.totalExpenses ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Income: ₹{(snapshot.totalSalary ?? 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No yearly data yet. Keep tracking your budget!</p>
              )}
            </div>
          </div>
        </div>

        {/* Budget Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Budget Projections</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Starting Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Increment (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ending Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Needs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Wants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Investments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Debt Repayment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Goals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {budgetYears.map((year) => (
                  <tr key={year.year} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{year.year}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {editingYear === year.year ? (
                        <input type="number" value={editData.startingSalary} disabled className="w-24 px-2 py-1 border rounded text-sm bg-gray-200 dark:bg-gray-600 dark:border-gray-500" />
                      ) : ( `₹${year.startingSalary.toLocaleString()}` )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {editingYear === year.year ? (
                        <input type="number" value={editData.increment} onChange={(e) => setEditData({ ...editData, increment: Number(e.target.value) })} className="w-16 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:border-gray-500" />
                      ) : ( `${year.increment}%` )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">₹{year.endingSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">₹{year.needs.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-yellow-600 dark:text-yellow-400">₹{year.wants.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600 dark:text-indigo-400">₹{year.investments.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400">₹{year.debtRepayment.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-purple-600 dark:text-purple-400">₹{year.goalContributions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {editingYear === year.year ? (
                        <div className="flex space-x-2">
                          <button onClick={handleSave} className="text-green-600 hover:text-green-800 dark:hover:text-green-400"><Save className="h-4 w-4" /></button>
                          <button onClick={handleCancel} className="text-red-600 hover:text-red-800 dark:hover:text-red-400"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(year)} className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"><Edit2 className="h-4 w-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Salary Growth Over Time</h3>
            {/* 💡 4. Handle empty state for charts */}
            {state.monthlySalary > 0 ? (
              <div className="h-80"><LineChart data={salaryGrowthData} /></div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Set your monthly salary in Budget Setup to see projections.
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Allocation Growth</h3>
            {state.monthlySalary > 0 ? (
              <div className="h-80"><LineChart data={allocationGrowthData} /></div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Set your monthly salary in Budget Setup to see projections.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}