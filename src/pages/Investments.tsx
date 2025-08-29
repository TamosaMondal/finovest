import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { LineChart, PieChart } from '../components/ChartComponents';
import { TrendingUp, DollarSign, Percent, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function Investments() {
  const { state, dispatch } = useFinance();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const investmentAmount = (state.monthlySalary * state.investmentsPercent) / 100;
  const annualInvestment = investmentAmount * 12;

  const handleAllocationChange = (field: string, value: number) => {
    dispatch({
      type: 'UPDATE_INVESTMENT_ALLOCATION',
      payload: {
        ...state.investmentAllocation,
        [field]: value
      }
    });
  };

  const handleReturnsChange = (field: string, value: number) => {
    dispatch({
      type: 'UPDATE_INVESTMENT_RETURNS',
      payload: {
        ...state.investmentReturns,
        [field]: value
      }
    });
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const key = newCategoryName.toLowerCase().replace(/\s+/g, '');
      dispatch({
        type: 'ADD_INVESTMENT_CATEGORY',
        payload: { key, name: newCategoryName.trim() }
      });
      setNewCategoryName('');
    }
  };

  const removeCategory = (key: string) => {
    if (Object.keys(state.investmentCategories).length > 1) {
      dispatch({ type: 'REMOVE_INVESTMENT_CATEGORY', payload: key });
    }
  };

  const startEditing = (key: string) => {
    setEditingCategory(key);
    setEditingName(state.investmentCategories[key]);
  };

  const saveEdit = () => {
    if (editingCategory && editingName.trim()) {
      dispatch({
        type: 'ADD_INVESTMENT_CATEGORY',
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

  // Calculate future values
  const calculateFutureValue = (years: number) => {
    const monthlyInvestment = investmentAmount;
    const annualReturn = state.investmentReturns.overall / 100;
    const monthlyReturn = annualReturn / 12;
    const totalMonths = years * 12;

    // Future value of annuity formula
    const futureValue = monthlyInvestment * (((1 + monthlyReturn) ** totalMonths - 1) / monthlyReturn);
    
    // Adjust for inflation
    const inflationRate = state.inflationRate / 100;
    const realValue = futureValue / ((1 + inflationRate) ** years);
    
    return { nominal: futureValue, real: realValue };
  };

  const projectionYears = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const projections = projectionYears.map(years => ({
    years,
    ...calculateFutureValue(years)
  }));

  // Chart data
  const allocationData = {
    labels: Object.keys(state.investmentCategories).map(key => state.investmentCategories[key]),
    datasets: [{
      data: Object.keys(state.investmentCategories).map(key => state.investmentAllocation[key] || 0),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderColor: ['#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937'], // dark:bg-gray-800
      borderWidth: 2,
    }]
  };

  const growthProjectionData = {
    labels: projectionYears.map(y => `${y}Y`),
    datasets: [
      {
        label: 'Nominal Value',
        data: projections.map(p => p.nominal / 10000000), // Convert to crores
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Real Value (Inflation Adjusted)',
        data: projections.map(p => p.real / 10000000), // Convert to crores
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      }
    ]
  };

  const totalAllocation = Object.values(state.investmentAllocation).reduce((sum, val) => sum + val, 0);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Investment Planning</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your investment allocation and track long-term growth</p>
        </div>

        {/* Investment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50 mr-4">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Investment</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{investmentAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Annual Investment</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{annualInvestment.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-4">
                <Percent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Expected Return</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{state.investmentReturns.overall}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 mr-4">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">10Y Value</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{(projections[0].nominal / 10000000).toFixed(1)}Cr</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Category */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Investment Category</h2>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter investment type (e.g., Gold, Real Estate, Bonds)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <button
              onClick={addCategory}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </button>
          </div>
        </div>
        
        {/* Investment Allocation */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Investment Allocation</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="space-y-6">
                {Object.keys(state.investmentCategories).map((key) => {
                  const label = state.investmentCategories[key];
                  const amount = state.investmentAllocation[key] || 0;
                  const returnRate = state.investmentReturns[key] || 12;
                  const percentage = totalAllocation > 0 ? ((amount / totalAllocation) * 100) : 0;
                  
                  return (
                    <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        {editingCategory === key ? (
                          <div className="flex items-center space-x-2 flex-1">
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
                          <>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
                              <button
                                onClick={() => startEditing(key)}
                                className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              {Object.keys(state.investmentCategories).length > 1 && (
                                <button
                                  onClick={() => removeCategory(key)}
                                  className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {percentage.toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => handleAllocationChange(key, parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter amount"
                      />
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Expected Return:</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={returnRate}
                            onChange={(e) => handleReturnsChange(key, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            step="0.1"
                          />
                          <span className="text-gray-600 dark:text-gray-400">%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-200">Total Allocation:</span>
                    <span className="font-medium dark:text-gray-100">₹{totalAllocation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="font-medium text-gray-700 dark:text-gray-200">Overall Expected Return:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={state.investmentReturns.overall}
                        onChange={(e) => handleReturnsChange('overall', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        step="0.1"
                      />
                      <span className="text-gray-600 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allocation Breakdown</h3>
              <div className="h-64">
                <PieChart data={allocationData} />
              </div>
            </div>
          </div>
        </div>

        {/* Projections Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Investment Growth Projections</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Years</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Invested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nominal Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Real Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Real Returns</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {projections.map(({ years, nominal, real }) => {
                  const totalInvested = annualInvestment * years;
                  const realReturns = real - totalInvested;
                  
                  return (
                    <tr key={years} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{years}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        ₹{(totalInvested / 10000000).toFixed(2)}Cr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                        ₹{(nominal / 10000000).toFixed(2)}Cr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                        ₹{(real / 10000000).toFixed(2)}Cr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600 dark:text-orange-400">
                        ₹{(realReturns / 10000000).toFixed(2)}Cr
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Investment Growth Over Time</h2>
          <div className="h-80">
            <LineChart data={growthProjectionData} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            Values shown in crores (₹). Real values are adjusted for {state.inflationRate}% inflation.
          </p>
        </div>
      </div>
    </div>
  );
}
