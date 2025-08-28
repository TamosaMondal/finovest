import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, BarChart } from '../components/ChartComponents';
import { Plus, Trash2, Download, Upload, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';

export default function DailyBudget() {
  const { state, dispatch } = useFinance();
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Needs' as 'Needs' | 'Wants' | 'Investments',
    subcategory: '',
    amount: 0,
    notes: ''
  });

  const needsAmount = (state.monthlySalary * state.needsPercent) / 100;
  const wantsAmount = (state.monthlySalary * state.wantsPercent) / 100;
  const investmentsAmount = (state.monthlySalary * state.investmentsPercent) / 100;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = state.dailyExpenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );

  const spentByCategory = {
    needs: currentMonthExpenses.filter(e => e.category === 'Needs').reduce((sum, e) => sum + e.amount, 0),
    wants: currentMonthExpenses.filter(e => e.category === 'Wants').reduce((sum, e) => sum + e.amount, 0),
    investments: currentMonthExpenses.filter(e => e.category === 'Investments').reduce((sum, e) => sum + e.amount, 0),
  };

  const remaining = {
    needs: needsAmount - spentByCategory.needs,
    wants: wantsAmount - spentByCategory.wants,
    investments: investmentsAmount - spentByCategory.investments,
  };

  const getSubcategories = (category: string) => {
    switch (category) {
      case 'Needs':
        return Object.keys(state.needsCategories).map(key => state.needsCategories[key]);
      case 'Wants':
        return Object.keys(state.wantsCategories).map(key => state.wantsCategories[key]);
      case 'Investments':
        return Object.keys(state.investmentCategories).map(key => state.investmentCategories[key]);
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

  const spentChartData = {
    labels: ['Needs', 'Wants', 'Investments'],
    datasets: [{
      label: 'Spent',
      data: [spentByCategory.needs, spentByCategory.wants, spentByCategory.investments],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
    }, {
      label: 'Remaining',
      data: [remaining.needs, remaining.wants, remaining.investments],
      backgroundColor: ['#93C5FD', '#6EE7B7', '#FCD34D'],
    }]
  };

  const expenseDistribution = {
    labels: ['Needs', 'Wants', 'Investments'],
    datasets: [{
      data: [spentByCategory.needs, spentByCategory.wants, spentByCategory.investments],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
    }]
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Budget Tracker</h1>
            <p className="text-gray-600">Track and manage your daily expenses</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { name: 'Needs', budget: needsAmount, spent: spentByCategory.needs, color: 'blue' },
            { name: 'Wants', budget: wantsAmount, spent: spentByCategory.wants, color: 'green' },
            { name: 'Investments', budget: investmentsAmount, spent: spentByCategory.investments, color: 'orange' }
          ].map(({ name, budget, spent, color }) => {
            const alertLevel = getAlertLevel(spent, budget);
            const percentage = (spent / budget) * 100;
            
            return (
              <div key={name} className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                  {alertLevel !== 'green' && (
                    <AlertTriangle className={`h-5 w-5 ${alertLevel === 'red' ? 'text-red-500' : 'text-yellow-500'}`} />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="font-medium">₹{budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Spent:</span>
                    <span className={`font-medium ${alertLevel === 'red' ? 'text-red-600' : alertLevel === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`}>
                      ₹{spent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining:</span>
                    <span className={`font-medium ${budget - spent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{(budget - spent).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        alertLevel === 'red' ? 'bg-red-500' : alertLevel === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-medium ${
                      alertLevel === 'red' ? 'text-red-600' : alertLevel === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {percentage.toFixed(1)}% used
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Expense */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Expense</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ 
                  ...newExpense, 
                  category: e.target.value as 'Needs' | 'Wants' | 'Investments',
                  subcategory: ''
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Needs">Needs</option>
                <option value="Wants">Wants</option>
                <option value="Investments">Investments</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={newExpense.subcategory}
                onChange={(e) => setNewExpense({ ...newExpense, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {getSubcategories(newExpense.category).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddExpense}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Expenses</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.dailyExpenses.slice(-10).reverse().map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        expense.category === 'Needs' ? 'bg-blue-100 text-blue-800' :
                        expense.category === 'Wants' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.subcategory}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Spent</h3>
            <div className="h-80">
              <BarChart data={spentChartData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h3>
            <div className="h-80">
              <PieChart data={expenseDistribution} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}