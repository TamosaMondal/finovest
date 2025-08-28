import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { LineChart } from '../components/ChartComponents';
import { Edit2, Save, X, Download } from 'lucide-react';
import Papa from 'papaparse';

export default function MonthlyOverview() {
  const { state, dispatch } = useFinance();
  const [editingYear, setEditingYear] = useState<number | null>(null);
  
  // State to hold the data for the year being edited
  const [editData, setEditData] = useState({
    year: 0,
    startingSalary: 0,
    increment: 0,
  });

  // The budgetYears projection is now memoized for performance and correctness
  type BudgetYear = {
    year: number;
    startingSalary: number;
    increment: number;
    endingSalary: number;
    needs: number;
    wants: number;
    investments: number;
    needsPercent: number;
    wantsPercent: number;
    investmentsPercent: number;
  };

  const budgetYears = useMemo(() => {
    const years: BudgetYear[] = [];
    let currentSalary: number = state.monthlySalary;
    
    const baseYear = new Date().getFullYear();

    for (let i = 0; i < 11; i++) {
        const year = baseYear + i;
        // Check if there's a user-saved override for this year
        const existingYearData = state.budgetYears.find((by: BudgetYear) => by.year === year);

        let startingSalary: number;
        if (i === 0) {
          startingSalary = currentSalary;
        } else {
          startingSalary = years[i-1].endingSalary;
        }
        
        // Use the saved increment if it exists, otherwise use the default period rate
        const increment = existingYearData?.increment ?? (year <= 2032 ? state.incrementRates.period1 : year <= 2042 ? state.incrementRates.period2 : state.incrementRates.period3);
        
        const endingSalary = Math.round(startingSalary * (1 + increment / 100));
        
        years.push({
            year,
            startingSalary,
            increment,
            endingSalary,
            needs: Math.round((endingSalary * state.needsPercent) / 100),
            wants: Math.round((endingSalary * state.wantsPercent) / 100),
            investments: Math.round((endingSalary * state.investmentsPercent) / 100),
            needsPercent: state.needsPercent,
            wantsPercent: state.wantsPercent,
            investmentsPercent: state.investmentsPercent
        });
    }
    return years;
  }, [state.monthlySalary, state.needsPercent, state.wantsPercent, state.investmentsPercent, state.incrementRates, state.budgetYears]);

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

  const handleEdit = (yearData: any) => {
    setEditingYear(yearData.year);
    setEditData(yearData);
  };

  const handleSave = () => {
    // Recalculate all fields based on the edited increment before saving
    const endingSalary = Math.round(editData.startingSalary * (1 + editData.increment / 100));
    const fullYearDataToSave = {
        ...editData,
        endingSalary,
        needs: Math.round((endingSalary * state.needsPercent) / 100),
        wants: Math.round((endingSalary * state.wantsPercent) / 100),
        investments: Math.round((endingSalary * state.investmentsPercent) / 100),
        needsPercent: state.needsPercent,
        wantsPercent: state.wantsPercent,
        investmentsPercent: state.investmentsPercent,
    };
    dispatch({ type: 'UPDATE_BUDGET_YEAR', payload: fullYearDataToSave });
    setEditingYear(null);
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
      { label: 'Investments', data: budgetYears.map(y => y.investments), borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.2, fill: true }
    ]
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projections & History</h1>
          <p className="text-gray-600">View your long-term budget projections and historical financial snapshots.</p>
        </div>

        {/* Historical Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Monthly History</h2>
              <button onClick={exportMonthlyData} className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm">
                <Download className="h-3 w-3 mr-1" /> Export
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {state.monthlySnapshots.length > 0 ? (
                <div className="space-y-3">
                  {state.monthlySnapshots.slice().reverse().map((snapshot) => (
                    <div key={snapshot.month} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{snapshot.month}</span>
                        <span className="text-sm text-green-600 font-semibold">₹{snapshot.savings.toLocaleString()} saved</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No monthly data yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Yearly Summary</h2>
              <button onClick={exportYearlyData} className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm">
                <Download className="h-3 w-3 mr-1" /> Export
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {state.yearlySnapshots.length > 0 ? (
                <div className="space-y-3">
                  {state.yearlySnapshots.slice().reverse().map((snapshot) => (
                    <div key={snapshot.year} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{snapshot.year}</span>
                        <span className="text-sm text-green-600 font-semibold">₹{snapshot.totalSavings.toLocaleString()} saved</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No yearly data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Budget Table */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Projections</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Starting Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Increment (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ending Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Needs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetYears.map((year) => (
                  <tr key={year.year} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{year.year}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editingYear === year.year ? (
                        <input
                          type="number"
                          value={editData.startingSalary}
                          disabled
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      ) : ( `₹${year.startingSalary.toLocaleString()}` )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editingYear === year.year ? (
                        <input
                          type="number"
                          value={editData.increment}
                          onChange={(e) => setEditData({ ...editData, increment: Number(e.target.value) })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : ( `${year.increment}%` )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">₹{year.endingSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">₹{year.needs.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-yellow-600">₹{year.wants.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600">₹{year.investments.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {editingYear === year.year ? (
                        <div className="flex space-x-2">
                          <button onClick={handleSave} className="text-green-600 hover:text-green-900"><Save className="h-4 w-4" /></button>
                          <button onClick={handleCancel} className="text-red-600 hover:text-red-900"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(year)} className="text-blue-600 hover:text-blue-900"><Edit2 className="h-4 w-4" /></button>
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Growth Over Time</h3>
            <div className="h-80"><LineChart data={salaryGrowthData} /></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation Growth</h3>
            <div className="h-80"><LineChart data={allocationGrowthData} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
