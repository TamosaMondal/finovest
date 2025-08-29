import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { BarChart } from '../components/ChartComponents';
import { TrendingUp, Target, DollarSign, Calendar } from 'lucide-react';

export default function Returns() {
  const { state } = useFinance();

  const investmentAmount = (state.monthlySalary * state.investmentsPercent) / 100;
  const annualInvestment = investmentAmount * 12;

  // Calculate future values for different periods
  const calculateReturns = (years: number) => {
    const monthlyInvestment = investmentAmount;
    const annualReturn = state.investmentReturns.overall / 100;
    const monthlyReturn = annualReturn / 12;
    const totalMonths = years * 12;

    const futureValue = monthlyInvestment * (((1 + monthlyReturn) ** totalMonths - 1) / monthlyReturn);
    const totalInvested = monthlyInvestment * totalMonths;
    const gains = futureValue - totalInvested;
    
    // Adjust for inflation
    const inflationRate = state.inflationRate / 100;
    const realValue = futureValue / ((1 + inflationRate) ** years);
    const realGains = realValue - totalInvested;
    
    return {
      totalInvested,
      nominal: futureValue,
      real: realValue,
      nominalGains: gains,
      realGains
    };
  };

  const milestones = [
    { years: 5, label: '5 Years' },
    { years: 10, label: '10 Years' },
    { years: 15, label: '15 Years' },
    { years: 20, label: '20 Years' },
    { years: 25, label: '25 Years' },
    { years: 30, label: '30 Years' }
  ];

  const returns = milestones.map(milestone => ({
    ...milestone,
    ...calculateReturns(milestone.years)
  }));

  // Chart data for comparing nominal vs real returns
  const returnsChartData = {
    labels: milestones.map(m => m.label),
    datasets: [
      {
        label: 'Total Invested',
        data: returns.map(r => r.totalInvested / 10000000),
        backgroundColor: '#6B7280',
      },
      {
        label: 'Nominal Value',
        data: returns.map(r => r.nominal / 10000000),
        backgroundColor: '#3B82F6',
      },
      {
        label: 'Real Value (Inflation Adjusted)',
        data: returns.map(r => r.real / 10000000),
        backgroundColor: '#10B981',
      }
    ]
  };

  // Find best performing periods
  const bestReturns = returns.reduce((best, current) => {
    if (best.totalInvested === 0) return current;
    if (current.totalInvested === 0) return best;
    const currentROI = (current.realGains / current.totalInvested) * 100;
    const bestROI = (best.realGains / best.totalInvested) * 100;
    return currentROI > bestROI ? current : best;
  });

  const getReturnColor = (gains: number) => {
    if (gains > 0) return 'text-green-600 dark:text-green-400';
    if (gains < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Investment Returns Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyze your long-term investment returns and performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-4">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly SIP</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{investmentAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Expected Return</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{state.investmentReturns.overall}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50 mr-4">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">10Y Target</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{(returns[1].real / 10000000).toFixed(1)}Cr</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 mr-4">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Best Period</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{bestReturns.years}Y</p>
              </div>
            </div>
          </div>
        </div>

        {/* Returns Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Investment Returns Summary</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Invested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nominal Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Real Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nominal Gains</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Real Gains</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Real ROI</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {returns.map((period) => {
                  const realROI = period.totalInvested > 0 ? (period.realGains / period.totalInvested) * 100 : 0;
                  
                  return (
                    <tr key={period.years} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{period.label}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        ₹{(period.totalInvested / 10000000).toFixed(2)}Cr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                        ₹{(period.nominal / 10000000).toFixed(2)}Cr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                        ₹{(period.real / 10000000).toFixed(2)}Cr
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getReturnColor(period.nominalGains)}`}>
                        ₹{(period.nominalGains / 10000000).toFixed(2)}Cr
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getReturnColor(period.realGains)}`}>
                        ₹{(period.realGains / 10000000).toFixed(2)}Cr
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getReturnColor(period.realGains)}`}>
                        {realROI.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Power of Compounding</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>20Y Investment:</span>
                <span className="font-bold">₹{(returns[3].totalInvested / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between">
                <span>20Y Real Value:</span>
                <span className="font-bold">₹{(returns[3].real / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between border-t border-blue-400 pt-2 mt-2">
                <span>Wealth Multiplier:</span>
                <span className="font-bold">{returns[3].totalInvested > 0 ? (returns[3].real / returns[3].totalInvested).toFixed(1) : 0}x</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Inflation Impact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>10Y Nominal:</span>
                <span className="font-bold">₹{(returns[1].nominal / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between">
                <span>10Y Real Value:</span>
                <span className="font-bold">₹{(returns[1].real / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between border-t border-green-400 pt-2 mt-2">
                <span>Inflation Loss:</span>
                <span className="font-bold">₹{((returns[1].nominal - returns[1].real) / 10000000).toFixed(1)}Cr</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Early Start Advantage</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>5Y vs 10Y Gap:</span>
                <span className="font-bold">{returns[1].years - returns[0].years} Years</span>
              </div>
              <div className="flex justify-between">
                <span>Extra Investment:</span>
                <span className="font-bold">₹{((returns[1].totalInvested - returns[0].totalInvested) / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between border-t border-orange-400 pt-2 mt-2">
                <span>Extra Returns:</span>
                <span className="font-bold">₹{((returns[1].real - returns[0].real) / 10000000).toFixed(1)}Cr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Returns Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Investment Returns Comparison</h2>
          <div className="h-80">
            <BarChart data={returnsChartData} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All values in crores (₹). Real values adjusted for {state.inflationRate}% annual inflation.
            </p>
            <div className="flex justify-center space-x-6 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Invested</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Nominal Value</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Real Value</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
