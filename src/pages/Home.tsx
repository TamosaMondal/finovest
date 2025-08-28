import React from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { PieChart } from '../components/ChartComponents';
import { DollarSign, TrendingUp, Calendar, PieChart as PieIcon, BarChart3, Settings, Target, Wallet } from 'lucide-react';

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
      borderColor: ['#2563EB', '#059669', '#D97706'],
      borderWidth: 2,
    }],
  };

  const needsBreakdownData = {
    labels: Object.keys(state.needsCategories).map(key => state.needsCategories[key]),
    datasets: [{
      data: Object.keys(state.needsCategories).map(key => state.needsBreakdown[key] || 0),
      backgroundColor: ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
      borderWidth: 1,
    }],
  };

  const wantsBreakdownData = {
    labels: Object.keys(state.wantsCategories).map(key => state.wantsCategories[key]),
    datasets: [{
      data: Object.keys(state.wantsCategories).map(key => state.wantsBreakdown[key] || 0),
      backgroundColor: ['#065F46', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
      borderWidth: 1,
    }],
  };

  const investmentBreakdownData = {
    labels: Object.keys(state.investmentCategories).map(key => state.investmentCategories[key]),
    datasets: [{
      data: Object.keys(state.investmentCategories).map(key => state.investmentAllocation[key] || 0),
      backgroundColor: ['#92400E', '#D97706', '#F59E0B'],
      borderWidth: 1,
    }],
  };

  const quickActions = [
    { title: 'Daily Budget', icon: DollarSign, path: '/daily-budget', color: 'bg-blue-500', description: 'Track daily expenses' },
    { title: 'Monthly Overview', icon: Calendar, path: '/monthly-overview', color: 'bg-green-500', description: 'View monthly budgets' },
    { title: 'Budget Setup', icon: Settings, path: '/budget-setup', color: 'bg-purple-500', description: 'Configure allocations' },
    { title: 'Investments', icon: TrendingUp, path: '/investments', color: 'bg-orange-500', description: 'Manage investments' },
    { title: 'Returns', icon: BarChart3, path: '/returns', color: 'bg-red-500', description: 'View returns analysis' },
    { title: 'Needs Breakdown', icon: Target, path: '/needs', color: 'bg-blue-600', description: 'Manage needs budget' },
    { title: 'Wants Breakdown', icon: Wallet, path: '/wants', color: 'bg-green-600', description: 'Manage wants budget' },
  ];

  // Calculate current month expenses
  const currentMonthExpenses = state.dailyExpenses.filter(expense => 
    expense.date.startsWith(state.currentMonth)
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
          <p className="text-gray-600">Welcome to your personal finance management center</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Salary</p>
                <p className="text-2xl font-bold text-gray-900">₹{state.monthlySalary.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Needs ({state.needsPercent}%)</p>
                <p className="text-2xl font-bold text-blue-600">₹{needsAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Remaining: ₹{remaining.needs.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Wants ({state.wantsPercent}%)</p>
                <p className="text-2xl font-bold text-green-600">₹{wantsAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Remaining: ₹{remaining.wants.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 mr-4">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Investments ({state.investmentsPercent}%)</p>
                <p className="text-2xl font-bold text-orange-600">₹{investmentsAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Remaining: ₹{remaining.investments.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map(({ title, icon: Icon, path, color, description }) => (
              <Link
                key={path}
                to={path}
                className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group active:scale-95"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full ${color} mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 hidden md:block">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation</h3>
            <div className="h-80">
              <PieChart data={allocationData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Needs Breakdown</h3>
            <div className="h-80">
              <PieChart data={needsBreakdownData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wants Breakdown</h3>
            <div className="h-80">
              <PieChart data={wantsBreakdownData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Allocation</h3>
            <div className="h-80">
              <PieChart data={investmentBreakdownData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}