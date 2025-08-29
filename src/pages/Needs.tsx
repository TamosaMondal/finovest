import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart } from '../components/ChartComponents';
import { Home, UtensilsCrossed, Zap, Car, Heart, MoreHorizontal, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function Needs() {
  const { state, dispatch } = useFinance();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const needsAmount = (state.monthlySalary * state.needsPercent) / 100;

  const handleBreakdownChange = (field: string, value: number) => {
    dispatch({
      type: 'UPDATE_NEEDS_BREAKDOWN',
      payload: {
        ...state.needsBreakdown,
        [field]: value
      }
    });
  };

  const getIconForCategory = (key: string) => {
    const iconMap: { [key: string]: any } = {
      rent: Home,
      food: UtensilsCrossed,
      utilities: Zap,
      transport: Car,
      healthcare: Heart,
      others: MoreHorizontal
    };
    return iconMap[key] || MoreHorizontal;
  };

  const getColorForCategory = (key: string) => {
    const colorMap: { [key: string]: string } = {
      rent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
      food: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300',
      utilities: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300',
      transport: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
      healthcare: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300',
      others: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300'
    };
    return colorMap[key] || 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300';
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const key = newCategoryName.toLowerCase().replace(/\s+/g, '');
      dispatch({
        type: 'ADD_NEEDS_CATEGORY',
        payload: { key, name: newCategoryName.trim() }
      });
      setNewCategoryName('');
    }
  };

  const removeCategory = (key: string) => {
    if (Object.keys(state.needsCategories).length > 1) {
      dispatch({ type: 'REMOVE_NEEDS_CATEGORY', payload: key });
    }
  };

  const startEditing = (key: string) => {
    setEditingCategory(key);
    setEditingName(state.needsCategories[key]);
  };

  const saveEdit = () => {
    if (editingCategory && editingName.trim()) {
      dispatch({
        type: 'ADD_NEEDS_CATEGORY',
        payload: { key: editingCategory, name: editingName.trim() }
      });
    }
    setEditingCategory(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditingName('');
  };

  const total = Object.values(state.needsBreakdown).reduce((sum, value) => sum + value, 0);
  const difference = needsAmount - total;

  const chartData = {
    labels: Object.keys(state.needsCategories).map(key => state.needsCategories[key]),
    datasets: [{
      data: Object.keys(state.needsCategories).map(key => state.needsBreakdown[key] || 0),
      backgroundColor: [
        '#1E40AF', '#059669', '#D97706', '#7C3AED', '#DC2626', '#6B7280'
      ],
      borderColor: [
        '#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937'
      ], // dark:bg-gray-800
      borderWidth: 2,
    }]
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Needs Breakdown</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your essential expenses and track spending</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500 dark:border-blue-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Needs Budget</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{needsAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{state.needsPercent.toFixed(1)}% of salary</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500 dark:border-green-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Allocated</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{total.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{needsAmount > 0 ? ((total / needsAmount) * 100).toFixed(1) : 0}% allocated</p>
          </div>

          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 ${difference >= 0 ? 'border-orange-500 dark:border-orange-400' : 'border-red-500 dark:border-red-400'}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Difference</h3>
            <p className={`text-3xl font-bold ${difference >= 0 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
              ₹{Math.abs(difference).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{difference >= 0 ? 'Remaining' : 'Over budget'}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500 dark:border-purple-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categories</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Object.keys(state.needsCategories).length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Essential categories</p>
          </div>
        </div>

        {/* Add New Category */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Category</h2>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name (e.g., Insurance, Childcare)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <button
              onClick={addCategory}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </button>
          </div>
        </div>

        {/* Breakdown Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Category Allocation</h2>
            
            <div className="space-y-6">
              {Object.keys(state.needsCategories).map((key) => {
                const label = state.needsCategories[key];
                const Icon = getIconForCategory(key);
                const color = getColorForCategory(key);
                const amount = state.needsBreakdown[key] || 0;
                const percentage = needsAmount > 0 ? ((amount / needsAmount) * 100) : 0;
                
                return (
                  <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className={`p-2 rounded-lg ${color} mr-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        {editingCategory === key ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            />
                            <button onClick={saveEdit} className="text-green-600 hover:text-green-800 dark:hover:text-green-400">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={cancelEdit} className="text-red-600 hover:text-red-800 dark:hover:text-red-400">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Essential expense category</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditing(key)}
                                className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {Object.keys(state.needsCategories).length > 1 && (
                                <button
                                  onClick={() => removeCategory(key)}
                                  className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => handleBreakdownChange(key, parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter amount"
                      />
                      <div className="w-24 text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ₹{amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">Total Allocated:</span>
                <span className={`font-bold text-lg ${difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ₹{total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Budget:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">₹{needsAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Difference:</span>
                <span className={`text-sm font-medium ${difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {difference >= 0 ? '+' : ''}₹{difference.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Visual Breakdown</h2>
            <div className="h-80 mb-6">
              <PieChart data={chartData} />
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Category Summary</h3>
              {Object.keys(state.needsCategories).map((key) => {
                const label = state.needsCategories[key];
                const amount = state.needsBreakdown[key] || 0;
                const percentage = needsAmount > 0 ? ((amount / needsAmount) * 100) : 0;
                
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{label}:</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">₹{amount.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tips and Suggestions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-800/70 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">💡 Smart Needs Management Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cost Optimization</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Review and negotiate rent annually</li>
                <li>• Plan meals and buy groceries in bulk</li>
                <li>• Use energy-efficient appliances</li>
                <li>• Consider carpooling or public transport</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Budget Guidelines</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Housing should not exceed 30% of income</li>
                <li>• Food costs typically range 10-15% of income</li>
                <li>• Keep a 5-10% buffer for unexpected needs</li>
                <li>• Review and adjust categories monthly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
