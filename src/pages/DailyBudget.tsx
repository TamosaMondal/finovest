import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Download, Upload, AlertTriangle, Info, X } from 'lucide-react';
import Papa from 'papaparse';
import { Toaster, toast } from 'react-hot-toast';

export default function DailyBudget() {
  const { state, dispatch } = useFinance();
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Needs' as 'Needs' | 'Wants' | 'Investments' | 'Debt Repayment' | 'Goal Contributions',
    subcategory: '',
    amount: 0,
    notes: ''
  });

  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [expenseToAdd, setExpenseToAdd] = useState<any | null>(null);
  const [alertDetails, setAlertDetails] = useState({ 
    category: '', 
    budget: 0, 
    spentSoFar: 0, 
    newExpenseAmount: 0 
  });

  const categoryBudgets = {
    Needs: (state.monthlySalary * state.needsPercent) / 100,
    Wants: (state.monthlySalary * state.wantsPercent) / 100,
    Investments: (state.monthlySalary * state.investmentsPercent) / 100,
    'Debt Repayment': (state.monthlySalary * state.debtRepaymentPercent) / 100,
    'Goal Contributions': (state.monthlySalary * state.goalContributionsPercent) / 100,
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = state.dailyExpenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );

  const spentByCategory = {
    Needs: currentMonthExpenses.filter(e => e.category === 'Needs').reduce((sum, e) => sum + e.amount, 0),
    Wants: currentMonthExpenses.filter(e => e.category === 'Wants').reduce((sum, e) => sum + e.amount, 0),
    Investments: currentMonthExpenses.filter(e => e.category === 'Investments').reduce((sum, e) => sum + e.amount, 0),
    'Debt Repayment': currentMonthExpenses.filter(e => e.category === 'Debt Repayment').reduce((sum, e) => sum + e.amount, 0),
    'Goal Contributions': currentMonthExpenses.filter(e => e.category === 'Goal Contributions').reduce((sum, e) => sum + e.amount, 0),
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
  
  const confirmAndAddExpense = (expense: any) => {
    dispatch({
        type: 'ADD_EXPENSE',
        payload: {
          id: Date.now().toString(),
          ...expense
        }
      });
      toast.success('Transaction added!');
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'Needs',
        subcategory: '',
        amount: 0,
        notes: ''
      });
      setShowBudgetAlert(false);
      setExpenseToAdd(null);
  }

  const handleAddExpense = () => {
    if (newExpense.amount <= 0 || !newExpense.subcategory) {
        toast.error('Please provide a valid amount and subcategory.');
        return;
    }

    let budgetToCheck = -1;
    let spentSoFar = 0;
    let budgetScope = newExpense.subcategory; // Default to subcategory name for the alert

    // Determine the budget and current spending based on the category
    switch (newExpense.category) {
        case 'Needs':
        case 'Wants':
        case 'Investments': {
            let subcategoryKey: string | undefined;
            if (newExpense.category === 'Needs') {
                subcategoryKey = Object.keys(state.needsCategories).find(key => state.needsCategories[key] === newExpense.subcategory);
                if (subcategoryKey) budgetToCheck = state.needsBreakdown[subcategoryKey] || 0;
            } else if (newExpense.category === 'Wants') {
                subcategoryKey = Object.keys(state.wantsCategories).find(key => state.wantsCategories[key] === newExpense.subcategory);
                if (subcategoryKey) budgetToCheck = state.wantsBreakdown[subcategoryKey] || 0;
            } else { // Investments
                subcategoryKey = Object.keys(state.investmentCategories).find(key => state.investmentCategories[key] === newExpense.subcategory);
                if (subcategoryKey) budgetToCheck = state.investmentAllocation[subcategoryKey] || 0;
            }
            
            if(subcategoryKey === undefined) {
                confirmAndAddExpense(newExpense);
                return;
            }

            spentSoFar = currentMonthExpenses
                .filter(e => e.category === newExpense.category && e.subcategory === newExpense.subcategory)
                .reduce((sum, e) => sum + e.amount, 0);
            break;
        }
        case 'Debt Repayment':
        case 'Goal Contributions': {
            budgetToCheck = categoryBudgets[newExpense.category];
            spentSoFar = spentByCategory[newExpense.category];
            budgetScope = newExpense.category; // For the alert, use the main category name
            break;
        }
        default:
            confirmAndAddExpense(newExpense);
            return;
    }

    const newTotalSpent = spentSoFar + newExpense.amount;

    if (budgetToCheck !== -1 && newTotalSpent > budgetToCheck) {
        setAlertDetails({
            category: budgetScope,
            budget: budgetToCheck,
            spentSoFar: spentSoFar,
            newExpenseAmount: newExpense.amount
        });
        setExpenseToAdd(newExpense);
        setShowBudgetAlert(true);
    } else {
        confirmAndAddExpense(newExpense);
    }
  };

  const handleDeleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    toast.success('Transaction deleted.');
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
          toast.success('CSV data imported!');
        }
      });
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <Toaster position="top-center" />
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
            { name: 'Needs', budget: categoryBudgets.Needs, spent: spentByCategory.Needs, color: 'blue' },
            { name: 'Wants', budget: categoryBudgets.Wants, spent: spentByCategory.Wants, color: 'green' },
            { name: 'Investments', budget: categoryBudgets.Investments, spent: spentByCategory.Investments, color: 'orange' },
            { name: 'Debt Repayment', budget: categoryBudgets['Debt Repayment'], spent: spentByCategory['Debt Repayment'], color: 'red' },
            { name: 'Goal Contributions', budget: categoryBudgets['Goal Contributions'], spent: spentByCategory['Goal Contributions'], color: 'purple' }
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

      {/* --- The Budget Alert Modal (Now for Subcategories) --- */}
      {showBudgetAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-start">
              <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full mr-4 flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Alert</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  You are about to exceed your budget for **{alertDetails.category}**.
                </p>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md text-sm space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Budget for {alertDetails.category}:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">₹{alertDetails.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Spent so far:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">₹{alertDetails.spentSoFar.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <span className="text-gray-600 dark:text-gray-300 font-bold">Remaining Balance:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ₹{(alertDetails.budget - alertDetails.spentSoFar).toLocaleString()}
                    </span>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                This new transaction of **₹{alertDetails.newExpenseAmount.toLocaleString()}** will exceed your remaining balance.
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold mt-1">
                Your new balance will be ₹{(alertDetails.budget - (alertDetails.spentSoFar + alertDetails.newExpenseAmount)).toLocaleString()}.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => { setShowBudgetAlert(false); setExpenseToAdd(null); }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAndAddExpense(expenseToAdd)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

