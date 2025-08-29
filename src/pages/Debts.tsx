// src/pages/Debts.tsx

import React, { useState, useMemo } from 'react';
import { useFinance, Debt } from '../context/FinanceContext'; // Import the Debt type
import { Shield, Plus, Trash2, Edit2, Save, X, TrendingUp, Zap } from 'lucide-react';

export default function Debts() {
  const { state, dispatch } = useFinance();
  
  const [newDebt, setNewDebt] = useState({
    name: '',
    totalAmount: 0,
    interestRate: 0,
    minimumPayment: 0,
  });

  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Debt | null>(null);

  const [scenarioExtraPayment, setScenarioExtraPayment] = useState(0);
  const [scenarioDuration, setScenarioDuration] = useState(12);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'name' ? value : Number(value);
    setNewDebt(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleAddDebt = () => {
    if (newDebt.name.trim() && newDebt.totalAmount > 0 && newDebt.interestRate > 0 && newDebt.minimumPayment > 0) {
      const debtToAdd: Debt = {
        id: Date.now().toString(),
        originalAmount: newDebt.totalAmount,
        ...newDebt,
      };
      dispatch({ type: 'ADD_DEBT', payload: debtToAdd });
      setNewDebt({ name: '', totalAmount: 0, interestRate: 0, minimumPayment: 0 });
    } else {
      alert('Please fill in all fields with valid numbers greater than zero.');
    }
  };

  const handleDeleteDebt = (id: string) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      dispatch({ type: 'DELETE_DEBT', payload: id });
    }
  };

  const handleStartEdit = (debt: Debt) => {
    setEditingDebtId(debt.id);
    setEditFormData(debt);
  };

  const handleCancelEdit = () => {
    setEditingDebtId(null);
  };

  const handleUpdateDebt = () => {
    if (editingDebtId && editFormData) {
      dispatch({ type: 'UPDATE_DEBT', payload: editFormData });
      setEditingDebtId(null);
    }
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'name' ? value : Number(value);
    setEditFormData(prev => prev ? ({ ...prev, [name]: processedValue }) : null);
  };

  const calculatePayoff = (debts: Debt[], baseExtra: number, boostExtra: number, boostDuration: number, strategy: 'snowball' | 'avalanche') => {
    if (debts.length === 0) return { months: 0, totalInterest: 0, suggestion: null };

    let sortedDebts = [...debts.map(d => ({ ...d, balance: d.totalAmount }))];
    if (strategy === 'snowball') {
      sortedDebts.sort((a, b) => a.totalAmount - b.totalAmount);
    } else { // avalanche
      sortedDebts.sort((a, b) => b.interestRate - a.interestRate);
    }

    let months = 0;
    let totalInterest = 0;
    let snowballPayment = baseExtra;

    while (sortedDebts.some(d => d.balance > 0)) {
      months++;
      const currentMonthExtra = (months <= boostDuration) ? snowballPayment + boostExtra : snowballPayment;
      let availableExtra = currentMonthExtra;
      
      for (const debt of sortedDebts) {
        if (debt.balance > 0) {
          const interest = (debt.balance * (debt.interestRate / 100)) / 12;
          totalInterest += interest;
          debt.balance += interest;
          
          const payment = debt.minimumPayment;
          debt.balance -= payment;

          if (debt.id === sortedDebts.find(d => d.balance > 0)?.id) {
            const appliedExtra = Math.min(availableExtra, debt.balance);
            debt.balance -= appliedExtra;
            availableExtra -= appliedExtra;
          }

          if (debt.balance <= 0) {
            snowballPayment += debt.minimumPayment;
          }
        }
      }
      if (months > 1200) break; // Safety break for infinite loops
    }

    const suggestion = sortedDebts.find(d => d.totalAmount > 0);
    return { months, totalInterest, suggestion };
  };

  const debtRepaymentAllocation = (state.monthlySalary * state.debtRepaymentPercent) / 100;

  const snowballPlan = useMemo(() => calculatePayoff(state.debts, debtRepaymentAllocation, 0, 0, 'snowball'), [state.debts, debtRepaymentAllocation]);
  const avalanchePlan = useMemo(() => calculatePayoff(state.debts, debtRepaymentAllocation, 0, 0, 'avalanche'), [state.debts, debtRepaymentAllocation]);
  
  const acceleratedPlan = useMemo(() => calculatePayoff(state.debts, debtRepaymentAllocation, scenarioExtraPayment, scenarioDuration, 'avalanche'), [state.debts, debtRepaymentAllocation, scenarioExtraPayment, scenarioDuration]);

  const inputStyles = "w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Debt Payoff Planner</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a strategy to become debt-free faster.</p>
        </div>

        {/* Add New Debt Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add a New Debt</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Debt Name</label>
              <input type="text" name="name" value={newDebt.name} onChange={handleInputChange} placeholder="e.g., Credit Card" className={inputStyles} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Amount (₹)</label>
              <input type="number" name="totalAmount" value={newDebt.totalAmount} onChange={handleInputChange} className={inputStyles} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
              <input type="number" name="interestRate" value={newDebt.interestRate} onChange={handleInputChange} className={inputStyles} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. Payment (₹)</label>
              <input type="number" name="minimumPayment" value={newDebt.minimumPayment} onChange={handleInputChange} className={inputStyles} />
            </div>
            <button onClick={handleAddDebt} className="w-full bg-blue-600 text-white rounded-md hover:bg-blue-700 h-10 flex items-center justify-center">
              <Plus className="h-4 w-4 mr-2" /> Add Debt
            </button>
          </div>
        </div>

        {/* Debt Strategy Suggestions */}
        {state.debts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-green-800 dark:text-green-300 flex items-center"><Zap size={18} className="mr-2"/>Debt Snowball (Fastest Wins)</h3>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">Pay off smallest debts first for quick motivation.</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-4">{snowballPlan.months} months</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">to be debt-free.</p>
                    {snowballPlan.suggestion && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Suggestion: Focus extra payments on **{snowballPlan.suggestion.name}**.</p>}
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-500 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 flex items-center"><TrendingUp size={18} className="mr-2"/>Debt Avalanche (Cheapest)</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">Pay off highest interest debts first to save money.</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-4">{avalanchePlan.months} months</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">to be debt-free.</p>
                    {avalanchePlan.suggestion && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Suggestion: Focus extra payments on **{avalanchePlan.suggestion.name}**.</p>}
                </div>
            </div>
        )}

        {/* Payoff Accelerator Section */}
        {state.debts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payoff Accelerator (What-If Scenario)</h2>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">What if I add an extra</p>
                    <input type="number" value={scenarioExtraPayment} onChange={(e) => setScenarioExtraPayment(Number(e.target.value))} className={`${inputStyles} w-32`} />
                    <p className="text-sm text-gray-600 dark:text-gray-300">per month for the next</p>
                    <input type="number" value={scenarioDuration} onChange={(e) => setScenarioDuration(Number(e.target.value))} className={`${inputStyles} w-24`} />
                    <p className="text-sm text-gray-600 dark:text-gray-300">months?</p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold">New Payoff Time</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{acceleratedPlan.months} months</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-300 font-semibold">Time Saved</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{avalanchePlan.months - acceleratedPlan.months} months</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-300 font-semibold">Interest Saved</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{(avalanchePlan.totalInterest - acceleratedPlan.totalInterest).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Debts List */}
        <div className="space-y-4">
          {state.debts.map((debt) => {
            if (!debt) return null;
            const isEditing = editingDebtId === debt.id;
            const amountPaid = (debt.originalAmount || 0) - (debt.totalAmount || 0);
            const progress = (debt.originalAmount || 0) > 0 ? (amountPaid / debt.originalAmount) * 100 : 0;

            return (
              <div key={debt.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {isEditing && editFormData ? (
                  <div className="grid grid-cols-5 gap-4">
                    <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} className={`${inputStyles} col-span-2`} />
                    <input type="number" name="totalAmount" value={editFormData.totalAmount} onChange={handleEditInputChange} className={inputStyles} />
                    <input type="number" name="interestRate" value={editFormData.interestRate} onChange={handleEditInputChange} className={inputStyles} />
                    <input type="number" name="minimumPayment" value={editFormData.minimumPayment} onChange={handleEditInputChange} className={inputStyles} />
                    <div className="flex justify-end space-x-2">
                      <button onClick={handleCancelEdit} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X size={18} /></button>
                      <button onClick={handleUpdateDebt} className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"><Save size={18} /></button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{debt.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{debt.interestRate}% Interest Rate</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleStartEdit(debt)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteDebt(debt.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="text-right mb-1">
                      <span className="font-bold text-gray-700 dark:text-gray-200">₹{(debt.totalAmount || 0).toLocaleString()}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400"> / ₹{(debt.originalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-red-500 h-4 rounded-full text-white text-xs flex items-center justify-center"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      >
                        {progress > 10 && `${progress.toFixed(0)}% Paid`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
