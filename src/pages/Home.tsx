import React from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { PieChart } from '../components/ChartComponents';
import { DollarSign, TrendingUp, Calendar, Settings, Target, Wallet, BarChart3 } from 'lucide-react';

export default function Home() {
  const { state } = useFinance();

  const needsAmount = (state.monthlySalary * state.needsPercent) / 100;
  const wantsAmount = (state.monthlySalary * state.wantsPercent) / 100;
  const investmentsAmount = (state.monthlySalary * state.investmentsPercent) / 100;

  const allocationData = {
    labels: ['Needs', 'Wants', 'Investments'],
    datasets: [{
      data: [needsAmount, wantsAmount, investmentsAmount],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
      borderColor: ['#1f2937', '#1f2937', '#1f2937'], // dark:bg-gray-800
      borderWidth: 2,
    }],
  };

  const needsBreakdownData = {
    labels: Object.keys(state.needsCategories).map(key => state.needsCategories[key]),
    datasets: [{
      data: Object.keys(state.needsCategories).map(key => state.needsBreakdown[key] || 0),
      backgroundColor: ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
      borderColor: ['#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937'],
      borderWidth: 1,
    }],
  };

  const wantsBreakdownData = {
    labels: Object.keys(state.wantsCategories).map(key => state.wantsCategories[key]),
    datasets: [{
      data: Object.keys(state.wantsCategories).map(key => state.wantsBreakdown[key] || 0),
      backgroundColor: ['#065F46', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
      borderColor: ['#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937'],
      borderWidth: 1,
    }],
  };

  const investmentBreakdownData = {
    labels: Object.keys(state.investmentCategories).map(key => state.investmentCategories[key]),
    datasets: [{
      data: Object.keys(state.investmentCategories).map(key => state.investmentAllocation[key] || 0),
      backgroundColor: ['#92400E', '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FEF3C7'],
      borderColor: ['#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937', '#1f2937'],
      borderWidth: 1,
    }],
  };

  const quickActions = [
    { title: 'Daily Budget', icon: DollarSign, path: '/daily-budget', color: 'bg-blue-500', description: 'Track daily expenses' },
    { title: 'Budget Setup', icon: Settings, path: '/budget-setup', color: 'bg-purple-500', description: 'Configure allocations' },
    { title: 'Needs Breakdown', icon: Target, path: '/needs', color: 'bg-blue-600', description: 'Manage needs budget' },
    { title: 'Wants Breakdown', icon: Wallet, path: '/wants', color: 'bg-green-600', description: 'Manage wants budget' },
    { title: 'Investments', icon: TrendingUp, path: '/investments', color: 'bg-orange-500', description: 'Manage investments' },
    { title: 'Returns', icon: BarChart3, path: '/returns', color: 'bg-red-500', description: 'View returns analysis' },
    { title: 'Monthly Overview', icon: Calendar, path: '/monthly-overview', color: 'bg-teal-500', description: 'View monthly budgets' },
  ];

  const currentMonthExpenses = state.dailyExpenses.filter(expense => 
    expense.date.startsWith(new Date().toISOString().slice(0, 7))
  );

  const currentMonthSpent = {
    needs: currentMonthExpenses.filter(e => e.category === 'Needs').reduce((sum, e) => sum + e.amount, 0),
    wants: currentMonthExpenses.filter(e => e.category === 'Wants').reduce((sum, e) => sum + e.amount, 0),
    investments: currentMonthExpenses.filter(e => e.category === 'Investments').reduce((sum, e) => sum + e.amount, 0),
  };

  const remaining = {
    needs: needsAmount - currentMonthSpent.needs,
    wants: wantsAmount - currentMonthSpent.wants,
    investments: investmentsAmount - currentMonthSpent.investments,
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Finance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome to your personal finance management center</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-4">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Salary</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{state.monthlySalary.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-4">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Needs ({state.needsPercent.toFixed(1)}%)</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{needsAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining: ₹{remaining.needs.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 mr-4">
                <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Wants ({state.wantsPercent.toFixed(1)}%)</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{wantsAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining: ₹{remaining.wants.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50 mr-4">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Investments ({state.investmentsPercent.toFixed(1)}%)</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{investmentsAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining: ₹{remaining.investments.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {quickActions.map(({ title, icon: Icon, path, color, description }) => (
              <Link
                key={path}
                to={path}
                className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group active:scale-95"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full ${color} mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Allocation</h3>
            <div className="h-80">
              <PieChart data={allocationData} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Needs Breakdown</h3>
            <div className="h-80">
              <PieChart data={needsBreakdownData} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wants Breakdown</h3>
            <div className="h-80">
              <PieChart data={wantsBreakdownData} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Investment Allocation</h3>
            <div className="h-80">
              <PieChart data={investmentBreakdownData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
