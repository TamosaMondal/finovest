// src/pages/Goals.tsx

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, Plus, Trash2, Edit2, Save, X, TrendingUp, AlertCircle } from 'lucide-react';

export default function Goals() {
  const { state, dispatch } = useFinance();
  
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    deadline: '',
  });

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    targetAmount: 0,
    savedAmount: 0,
    deadline: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: name.includes('Amount') ? Number(value) : value }));
  };

  const handleAddGoal = () => {
    if (newGoal.name.trim() && newGoal.targetAmount > 0) {
      const goalToAdd = {
        id: Date.now().toString(),
        ...newGoal,
        savedAmount: 0,
      };
      dispatch({ type: 'ADD_GOAL', payload: goalToAdd });
      setNewGoal({ name: '', targetAmount: 0, deadline: '' });
    } else {
      alert('Please provide a goal name and a target amount greater than zero.');
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      dispatch({ type: 'DELETE_GOAL', payload: id });
    }
  };

  const handleStartEdit = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditFormData(goal);
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
  };

  const handleUpdateGoal = () => {
    if (editingGoalId) {
      dispatch({ type: 'UPDATE_GOAL', payload: { id: editingGoalId, ...editFormData } });
      setEditingGoalId(null);
    }
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: name.includes('Amount') ? Number(value) : value }));
  };

  const getGoalSuggestion = (goal: any) => {
    if (!goal.deadline) return null;

    const now = new Date();
    const deadline = new Date(goal.deadline);
    if (deadline <= now) return { type: 'error', message: 'This goal\'s deadline has passed.' };

    const monthsRemaining = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
    if (monthsRemaining <= 0) return { type: 'error', message: 'This goal is due this month!' };
    
    const amountRemaining = goal.targetAmount - goal.savedAmount;
    if (amountRemaining <= 0) return { type: 'success', message: 'Congratulations, you\'ve reached your goal!' };

    const requiredMonthlySaving = amountRemaining / monthsRemaining;
    const savingsAllocation = state.goalContributionsPercent > 0 
      ? (state.monthlySalary * state.goalContributionsPercent) / 100 
      : (state.wantsBreakdown.savingsAccount || 0);

    if (savingsAllocation >= requiredMonthlySaving) {
      return { type: 'success', message: `You're on track! Keep saving ₹${requiredMonthlySaving.toLocaleString()} per month.` };
    } else {
      const shortfall = requiredMonthlySaving - savingsAllocation;
      return { type: 'warning', message: `You're behind. Try to save an extra ₹${Math.ceil(shortfall).toLocaleString()} per month.` };
    }
  };

  // A helper class for form inputs to avoid repetition
  const inputStyles = "w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Financial Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Set, track, and achieve your financial ambitions.</p>
        </div>

        {/* Add New Goal Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add a New Goal</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
              <input type="text" name="name" value={newGoal.name} onChange={handleInputChange} placeholder="e.g., New Laptop" className={inputStyles} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount (₹)</label>
              <input type="number" name="targetAmount" value={newGoal.targetAmount} onChange={handleInputChange} className={inputStyles} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
              <input type="date" name="deadline" value={newGoal.deadline} onChange={handleInputChange} className={inputStyles} />
            </div>
            <button onClick={handleAddGoal} className="w-full bg-blue-600 text-white rounded-md hover:bg-blue-700 h-10 flex items-center justify-center">
              <Plus className="h-4 w-4 mr-2" /> Add Goal
            </button>
          </div>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
            const isEditing = editingGoalId === goal.id;
            const suggestion = getGoalSuggestion(goal);

            return (
              <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between">
                {isEditing ? (
                  <div className="space-y-4">
                    <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} className={`${inputStyles} font-bold`} />
                    <input type="number" name="targetAmount" value={editFormData.targetAmount} onChange={handleEditInputChange} className={inputStyles} />
                    <input type="number" name="savedAmount" value={editFormData.savedAmount} disabled className={`${inputStyles} bg-gray-100 dark:bg-gray-600`} />
                    <input type="date" name="deadline" value={editFormData.deadline} onChange={handleEditInputChange} className={inputStyles} />
                    <div className="flex justify-end space-x-2">
                      <button onClick={handleCancelEdit} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X size={18} /></button>
                      <button onClick={handleUpdateGoal} className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"><Save size={18} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{goal.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Deadline: {goal.deadline || 'N/A'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleStartEdit(goal)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div className="text-right mb-1">
                        <span className="font-bold text-gray-700 dark:text-gray-200">₹{goal.savedAmount.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400"> / ₹{goal.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-green-500 h-4 rounded-full text-white text-xs flex items-center justify-center"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                          {progress > 10 && `${progress.toFixed(0)}%`}
                        </div>
                      </div>
                    </div>
                    {suggestion && (
                      <div className={`mt-4 p-3 rounded-lg flex items-start text-sm ${
                        suggestion.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                        suggestion.type === 'warning' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                        'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      }`}>
                        {suggestion.type === 'success' ? <TrendingUp size={16} className="mr-2 mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />}
                        <span>{suggestion.message}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
