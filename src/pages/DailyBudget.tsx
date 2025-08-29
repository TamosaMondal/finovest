import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
// Note: PieChart and BarChart were imported but not used, consider removing if not needed.
import { Plus, Trash2, Download, Upload, AlertTriangle, Info } from 'lucide-react';
import Papa from 'papaparse';

export default function DailyBudget() {
  const { state, dispatch } = useFinance();
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Needs' as 'Needs' | 'Wants' | 'Investments' | 'Debt Repayment' | 'Goal Contributions',
    subcategory: '',
    amount: 0,
    notes: ''
  });

  const needsAmount = (state.monthlySalary * state.needsPercent) / 100;
  const wantsAmount = (state.monthlySalary * state.wantsPercent) / 100;
  const investmentsAmount = (state.monthlySalary * state.investmentsPercent) / 100;
  const debtRepaymentAmount = (state.monthlySalary * state.debtRepaymentPercent) / 100;
  const goalContributionsAmount = (state.monthlySalary * state.goalContributionsPercent) / 100;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = state.dailyExpenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );

  const spentByCategory = {
    needs: currentMonthExpenses.filter(e => e.category === 'Needs').reduce((sum, e) => sum + e.amount, 0),
    wants: currentMonthExpenses.filter(e => e.category === 'Wants').reduce((sum, e) => sum + e.amount, 0),
    investments: currentMonthExpenses.filter(e => e.category === 'Investments').reduce((sum, e) => sum + e.amount, 0),
    debtRepayment: currentMonthExpenses.filter(e => e.category === 'Debt Repayment').reduce((sum, e) => sum + e.amount, 0),
    goalContributions: currentMonthExpenses.filter(e => e.category === 'Goal Contributions').reduce((sum, e) => sum + e.amount, 0),
  };

  const remaining = {
    needs: needsAmount - spentByCategory.needs,
    wants: wantsAmount - spentByCategory.wants,
    investments: investmentsAmount - spentByCategory.investments,
    debtRepayment: debtRepaymentAmount - spentByCategory.debtRepayment,
    goalContributions: goalContributionsAmount - spentByCategory.goalContributions,
  };

  const getSubcategories = (category: string) => {
    switch (category) {
      case 'Needs':
        return Object.keys(state.needsCategories).map(key => state.needsCategories[key]);
      case 'Wants':
        return Object.keys(state.wantsCategories).map(key => state.wantsCategories[key]);
      case 'Investments':
        return Object.keys(state.investmentCategories).map(key => state.investmentCategories[key]);
      case 'Debt Repayment':
        return state.debts.map(debt => debt.name);
      case 'Goal Contributions':
        return state.goals.map(goal => goal.name);
      default:
        return [];
    }
  };

  const handleAddExpense = () => {
    if (newExpense.amount > 0 && newExpense.subcategory) {
      dispatch({
        type: 'ADD_EXPENSE',
        payload: {
          id: Date.now().toString(),
          ...newExpense
        }
      });
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'Needs',
        subcategory: '',
        amount: 0,
        notes: ''
      });
    }
  };

  const handleDeleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const getAlertLevel = (spent: number, budget: number) => {
    if (budget <= 0) return 'green';
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'red';
    if (percentage >= 90) return 'yellow';
    return 'green';
  };

  const exportCSV = () => {
    const csv = Papa.unparse(state.dailyExpenses);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily-expenses.csv';
    a.click();
  };

  const importCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          results.data.forEach((expense: any) => {
            if (expense.date && expense.category && expense.amount) {
              dispatch({
                type: 'ADD_EXPENSE',
                payload: {
                  id: Date.now().toString() + Math.random(),
                  date: expense.date,
                  category: expense.category,
                  subcategory: expense.subcategory || '',
                  amount: parseFloat(expense.amount),
                  notes: expense.notes || ''
                }
              });
            }
          });
        }
      });
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Budget Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400">Track and manage your daily expenses</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={importCSV}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { name: 'Needs', budget: needsAmount, spent: spentByCategory.needs, color: 'blue' },
            { name: 'Wants', budget: wantsAmount, spent: spentByCategory.wants, color: 'green' },
            { name: 'Investments', budget: investmentsAmount, spent: spentByCategory.investments, color: 'orange' },
            { name: 'Debt Repayment', budget: debtRepaymentAmount, spent: spentByCategory.debtRepayment, color: 'red' },
            { name: 'Goal Contributions', budget: goalContributionsAmount, spent: spentByCategory.goalContributions, color: 'purple' }
          ].map(({ name, budget, spent, color }) => {
            const alertLevel = getAlertLevel(spent, budget);
            
            return (
              <div key={name} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-${color}-500 dark:border-${color}-400 transition-colors`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
                  {alertLevel !== 'green' && (
                    <AlertTriangle className={`h-5 w-5 ${alertLevel === 'red' ? 'text-red-500' : 'text-yellow-500'}`} />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Budget:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">₹{budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Spent:</span>
                    <span className={`font-medium ${alertLevel === 'red' ? 'text-red-600 dark:text-red-400' : alertLevel === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                      ₹{spent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Remaining:</span>
                    <span className={`font-medium ${budget - spent < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      ₹{(budget - spent).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Expense */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Transaction</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ 
                  ...newExpense, 
                  category: e.target.value as any,
                  subcategory: ''
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Needs">Needs</option>
                <option value="Wants">Wants</option>
                <option value="Investments">Investments</option>
                <option value="Debt Repayment">Debt Repayment</option>
                <option value="Goal Contributions">Goal Contributions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subcategory</label>
              <select
                value={newExpense.subcategory}
                onChange={(e) => setNewExpense({ ...newExpense, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select...</option>
                {getSubcategories(newExpense.category).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <input
                type="text"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Optional notes"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddExpense}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-300 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">How to Track Your Goals & Debts</h3>
                <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc pl-5 mt-1 space-y-1">
                  <li><strong>To contribute to a Goal:</strong> Select the category <span className="font-bold">"Goal Contributions"</span> and then choose the specific goal.</li>
                  <li><strong>To make a Debt Payment:</strong> Select the category <span className="font-bold">"Debt Repayment"</span> and then choose the specific debt.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subcategory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {state.dailyExpenses.slice(-10).reverse().map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{expense.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        expense.category === 'Needs' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        expense.category === 'Wants' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        expense.category === 'Investments' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        expense.category === 'Debt Repayment' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{expense.subcategory}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">₹{expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{expense.notes}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}