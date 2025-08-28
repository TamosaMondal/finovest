// src/pages/BudgetSetup.tsx

import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Settings, Save, AlertTriangle } from 'lucide-react';

export default function BudgetSetup() {
  const { state, dispatch } = useFinance();

  // Local state for salary
  const [localSalary, setLocalSalary] = useState(state.monthlySalary);

  // **NEW**: Local state for the raw money amounts
  const [needsAmount, setNeedsAmount] = useState(Math.round((state.monthlySalary * state.needsPercent) / 100));
  const [wantsAmount, setWantsAmount] = useState(Math.round((state.monthlySalary * state.wantsPercent) / 100));
  const [investmentsAmount, setInvestmentsAmount] = useState(Math.round((state.monthlySalary * state.investmentsPercent) / 100));

  // Keep local state synchronized with the global context
  useEffect(() => {
    setLocalSalary(state.monthlySalary);
    const newNeedsAmount = Math.round((state.monthlySalary * state.needsPercent) / 100);
    const newWantsAmount = Math.round((state.monthlySalary * state.wantsPercent) / 100);
    const newInvestmentsAmount = Math.round((state.monthlySalary * state.investmentsPercent) / 100);
    setNeedsAmount(newNeedsAmount);
    setWantsAmount(newWantsAmount);
    setInvestmentsAmount(newInvestmentsAmount);
  }, [state.monthlySalary, state.needsPercent, state.wantsPercent, state.investmentsPercent]);

  // Recalculate percentages whenever money amounts or salary change
  const needsPercent = localSalary > 0 ? Math.round((needsAmount / localSalary) * 100) : 0;
  const wantsPercent = localSalary > 0 ? Math.round((wantsAmount / localSalary) * 100) : 0;
  const investmentsPercent = localSalary > 0 ? Math.round((investmentsAmount / localSalary) * 100) : 0;
  const totalPercent = needsPercent + wantsPercent + investmentsPercent;

  const handleSave = () => {
    if (totalPercent > 100) {
      alert('Your total allocation exceeds 100%. Please adjust your budget before saving.');
      return;
    }

    dispatch({ type: 'UPDATE_SALARY', payload: Number(localSalary) });
    
    dispatch({
      type: 'UPDATE_ALLOCATION',
      payload: {
        needs: needsPercent,
        wants: wantsPercent,
        investments: investmentsPercent,
      },
    });
    
    alert('Budget settings have been saved!');
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Budget Setup</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
        {/* Monthly Salary Input Section */}
        <div>
          <label htmlFor="monthlySalary" className="block text-lg font-medium text-gray-700 mb-2">
            Your Monthly Salary (After Tax)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
            <input
              type="number"
              id="monthlySalary"
              value={localSalary}
              onChange={(e) => setLocalSalary(Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md text-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 50000"
            />
          </div>
        </div>

        {/* Allocation Inputs Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-4">Budget Allocation</h2>
          <div className="space-y-4">
            {/* Needs */}
            <div className="flex justify-between items-center">
              <label htmlFor="needs" className="font-medium text-green-700">Needs</label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    id="needs"
                    value={needsAmount}
                    onChange={(e) => setNeedsAmount(parseInt(e.target.value) || 0)}
                    className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded-md text-sm text-center"
                  />
                </div>
                <span className="w-16 text-right font-bold text-green-800">{needsPercent}%</span>
              </div>
            </div>
            {/* Wants */}
            <div className="flex justify-between items-center">
              <label htmlFor="wants" className="font-medium text-yellow-700">Wants</label>
              <div className="flex items-center space-x-3">
                 <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    id="wants"
                    value={wantsAmount}
                    onChange={(e) => setWantsAmount(parseInt(e.target.value) || 0)}
                    className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded-md text-sm text-center"
                  />
                </div>
                <span className="w-16 text-right font-bold text-yellow-800">{wantsPercent}%</span>
              </div>
            </div>
            {/* Investments */}
            <div className="flex justify-between items-center">
              <label htmlFor="investments" className="font-medium text-indigo-700">Investments</label>
              <div className="flex items-center space-x-3">
                 <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    id="investments"
                    value={investmentsAmount}
                    onChange={(e) => setInvestmentsAmount(parseInt(e.target.value) || 0)}
                    className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded-md text-sm text-center"
                  />
                </div>
                <span className="w-16 text-right font-bold text-indigo-800">{investmentsPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Allocation Bar */}
        <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Total Allocated</span>
                <span>{totalPercent}% of 100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                    className={`h-4 rounded-full ${totalPercent > 100 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(totalPercent, 100)}%` }}
                ></div>
            </div>
            {totalPercent > 100 && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                    <AlertTriangle className="w-4 h-4 mr-2"/>
                    <span>Warning: Total allocation exceeds 100%.</span>
                </div>
            )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
