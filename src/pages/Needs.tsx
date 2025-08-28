import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart } from '../components/ChartComponents';
import { Home, UtensilsCrossed, Zap, Car, Heart, MoreHorizontal, Plus, Trash2, Edit2 } from 'lucide-react';

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
      rent: 'bg-blue-100 text-blue-600',
      food: 'bg-green-100 text-green-600',
      utilities: 'bg-yellow-100 text-yellow-600',
      transport: 'bg-purple-100 text-purple-600',
      healthcare: 'bg-red-100 text-red-600',
      others: 'bg-gray-100 text-gray-600'
    };
    return colorMap[key] || 'bg-gray-100 text-gray-600';
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
      borderWidth: 2,
    }]
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Needs Breakdown</h1>
          <p className="text-gray-600">Manage your essential expenses and track spending in each category</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Needs Budget</h3>
            <p className="text-3xl font-bold text-blue-600">₹{needsAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{state.needsPercent}% of salary</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Allocated</h3>
            <p className="text-3xl font-bold text-green-600">₹{total.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{((total / needsAmount) * 100).toFixed(1)}% allocated</p>
          </div>

          <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${difference >= 0 ? 'border-orange-500' : 'border-red-500'}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Difference</h3>
            <p className={`text-3xl font-bold ${difference >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
              ₹{Math.abs(difference).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">{difference >= 0 ? 'Remaining' : 'Over budget'}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
            <p className="text-3xl font-bold text-purple-600">{Object.keys(state.needsCategories).length}</p>
            <p className="text-sm text-gray-500 mt-1">Essential categories</p>
          </div>
        </div>

        {/* Add New Category */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Category</h2>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name (e.g., Insurance, Childcare)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Allocation</h2>
            
            <div className="space-y-6">
              {Object.keys(state.needsCategories).map((key) => {
                const label = state.needsCategories[key];
                const Icon = getIconForCategory(key);
                const color = getColorForCategory(key);
                const amount = state.needsBreakdown[key] || 0;
                const percentage = ((amount / needsAmount) * 100);
                
                return (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
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
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            />
                            <button onClick={saveEdit} className="text-green-600 hover:text-green-800">
                              <Plus className="h-4 w-4" />
                            </button>
                            <button onClick={cancelEdit} className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{label}</h3>
                              <p className="text-sm text-gray-500">Essential expense category</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditing(key)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {Object.keys(state.needsCategories).length > 1 && (
                                <button
                                  onClick={() => removeCategory(key)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => handleBreakdownChange(key, parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount"
                      />
                      <div className="w-24 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          ₹{amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
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

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Allocated:</span>
                <span className={`font-bold text-lg ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Budget:</span>
                <span className="text-sm text-gray-900">₹{needsAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Difference:</span>
                <span className={`text-sm font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {difference >= 0 ? '+' : ''}₹{difference.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Visual Breakdown</h2>
            <div className="h-80 mb-6">
              <PieChart data={chartData} />
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 mb-3">Category Summary</h3>
              {Object.keys(state.needsCategories).map((key) => {
                const label = state.needsCategories[key];
                const amount = state.needsBreakdown[key] || 0;
                const percentage = ((amount / needsAmount) * 100);
                
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{label}:</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">₹{amount.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tips and Suggestions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Smart Needs Management Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Cost Optimization</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Review and negotiate rent annually</li>
                <li>• Plan meals and buy groceries in bulk</li>
                <li>• Use energy-efficient appliances</li>
                <li>• Consider carpooling or public transport</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Budget Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-1">
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