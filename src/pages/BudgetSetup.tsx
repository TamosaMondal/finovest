// src/pages/BudgetSetup.tsx

import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Settings, Save, AlertTriangle, PiggyBank, Target, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast'; // Import Toaster and toast for better alerts

export default function BudgetSetup() {
  const { state, dispatch } = useFinance();

  const [localSalary, setLocalSalary] = useState(state.monthlySalary);
  const [needsAmount, setNeedsAmount] = useState(Math.round((state.monthlySalary * state.needsPercent) / 100));
  const [wantsAmount, setWantsAmount] = useState(Math.round((state.monthlySalary * state.wantsPercent) / 100));
  const [investmentsAmount, setInvestmentsAmount] = useState(Math.round((state.monthlySalary * state.investmentsPercent) / 100));
  const [debtRepaymentAmount, setDebtRepaymentAmount] = useState(Math.round((state.monthlySalary * state.debtRepaymentPercent) / 100));
  const [goalContributionsAmount, setGoalContributionsAmount] = useState(Math.round((state.monthlySalary * state.goalContributionsPercent) / 100));

  useEffect(() => {
    setLocalSalary(state.monthlySalary);
    const newNeedsAmount = Math.round((state.monthlySalary * state.needsPercent) / 100);
    const newWantsAmount = Math.round((state.monthlySalary * state.wantsPercent) / 100);
    const newInvestmentsAmount = Math.round((state.monthlySalary * state.investmentsPercent) / 100);
    const newDebtRepaymentAmount = Math.round((state.monthlySalary * state.debtRepaymentPercent) / 100);
    const newGoalContributionsAmount = Math.round((state.monthlySalary * state.goalContributionsPercent) / 100);
    
    setNeedsAmount(newNeedsAmount);
    setWantsAmount(newWantsAmount);
    setInvestmentsAmount(newInvestmentsAmount);
    setDebtRepaymentAmount(newDebtRepaymentAmount);
    setGoalContributionsAmount(newGoalContributionsAmount);

  }, [state.monthlySalary, state.needsPercent, state.wantsPercent, state.investmentsPercent, state.debtRepaymentPercent, state.goalContributionsPercent]);
   //need to be changed accordingly
  const needsPercent = localSalary > 0 ? ((needsAmount / localSalary) * 100) : 0;
  const wantsPercent = localSalary > 0 ? ((wantsAmount / localSalary) * 100) : 0;
  const investmentsPercent = localSalary > 0 ? ((investmentsAmount / localSalary) * 100) : 0;
  const debtRepaymentPercent = localSalary > 0 ? ((debtRepaymentAmount / localSalary) * 100) : 0;
  const goalContributionsPercent = localSalary > 0 ? ((goalContributionsAmount / localSalary) * 100) : 0;
  const totalPercent = needsPercent + wantsPercent + investmentsPercent + debtRepaymentPercent + goalContributionsPercent;
  const totalAllocatedAmount = needsAmount + wantsAmount + investmentsAmount + debtRepaymentAmount + goalContributionsAmount;
  const savingsAccountBalance = localSalary - totalAllocatedAmount;
  
  const handleSave = () => {
    if (totalPercent > 100) {
      toast.error('Total allocation exceeds 100%. Please adjust.');
      return;
    }

    dispatch({ type: 'UPDATE_SALARY', payload: Number(localSalary) });
    
    dispatch({
      type: 'UPDATE_ALLOCATION',
      payload: {
        needs: needsPercent,
        wants: wantsPercent,
        investments: investmentsPercent,
        debtRepayment: debtRepaymentPercent,
        goalContributions: goalContributionsPercent,
      },
    });
    
    toast.success('Budget settings saved successfully!');
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Budget Setup</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-8">
          {/* Monthly Salary Input Section */}
          <div>
            <label htmlFor="monthlySalary" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Monthly Salary (After Tax)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                id="monthlySalary"
                value={localSalary}
                onChange={(e) => setLocalSalary(Number(e.target.value))}
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          {/* Allocation Inputs Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Budget Allocation</h2>
            <div className="space-y-4">
              {/* Needs */}
              <div className="flex justify-between items-center">
                <label htmlFor="needs" className="font-medium text-green-700 dark:text-green-300">Needs</label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      id="needs"
                      value={needsAmount}
                      onChange={(e) => setNeedsAmount(parseInt(e.target.value) || 0)}
                      className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded-md text-sm text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-green-800 dark:text-green-200">{state.needsPercent.toFixed(1)}%</span>
                </div>
              </div>
              {/* Wants */}
              <div className="flex justify-between items-center">
                <label htmlFor="wants" className="font-medium text-yellow-700 dark:text-yellow-400">Wants</label>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      id="wants"
                      value={wantsAmount}
                      onChange={(e) => setWantsAmount(parseInt(e.target.value) || 0)}
                      className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded-md text-sm text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-yellow-800 dark:text-yellow-300">{state.wantsPercent.toFixed(1)}%</span>
                </div>
              </div>
              {/* Investments */}
              <div className="flex justify-between items-center">
                <label htmlFor="investments" className="font-medium text-indigo-700 dark:text-indigo-300">Investments</label>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      id="investments"
                      value={investmentsAmount}
                      onChange={(e) => setInvestmentsAmount(parseInt(e.target.value) || 0)}
                      className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded-md text-sm text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-indigo-800 dark:text-indigo-200">{state.investmentsPercent.toFixed(1)}%</span>
                </div>
              </div>
              {/* Debt Repayment Input */}
              <div className="flex justify-between items-center">
                <label htmlFor="debtRepayment" className="font-medium text-red-700 dark:text-red-400">Debt Repayment</label>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      id="debtRepayment"
                      value={debtRepaymentAmount}
                      onChange={(e) => setDebtRepaymentAmount(parseInt(e.target.value) || 0)}
                      className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded-md text-sm text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-red-800 dark:text-red-300">{state.debtRepaymentPercent.toFixed(1)}%</span>
                </div>
              </div>
              {/* Goal Contributions Input */}
              <div className="flex justify-between items-center">
                <label htmlFor="goalContributions" className="font-medium text-purple-700 dark:text-purple-400">Goal Contributions</label>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      id="goalContributions"
                      value={goalContributionsAmount}
                      onChange={(e) => setGoalContributionsAmount(parseInt(e.target.value) || 0)}
                      className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded-md text-sm text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-purple-800 dark:text-purple-300">{state.goalContributionsPercent.toFixed(1)}%
</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Allocation Bar */}
          <div className="space-y-2 pt-4">
              <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Total Allocated</span>
                  <span>{Math.floor(totalPercent)}% of 100%</span> 
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                  <div 
                      className={`h-4 rounded-full transition-all duration-300 ${totalPercent > 100 ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(totalPercent, 100)}%` }}
                  ></div>
              </div>
              {totalPercent > 100 && (
                  <div className="flex items-center text-red-600 dark:text-red-400 text-sm mt-1">
                      <AlertTriangle className="w-4 h-4 mr-2"/>
                      <span>Warning: Total allocation exceeds 100%.</span>
                  </div>
              )}
          </div>

          {/* Savings Account Hub Section */}
          <div className="pt-6 border-t dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Savings Hub</h2>
              <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center">
                      <PiggyBank className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-4" />
                      <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">Savings Account Balance (Leftover)</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₹{savingsAccountBalance.toLocaleString()}</p>
                      </div>
                  </div>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                      <Link to="/goals" className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Fund Goals
                      </Link>
                      <Link to="/debts" className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Pay Off Debt
                      </Link>
                  </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This is the extra cash you have left after all allocations. Use it to accelerate your goals or debt payments.
              </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}