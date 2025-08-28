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
    const currentROI = (current.realGains / current.totalInvested) * 100;
    const bestROI = (best.realGains / best.totalInvested) * 100;
    return currentROI > bestROI ? current : best;
  });

  const getReturnColor = (gains: number) => {
    if (gains > 0) return 'text-green-600';
    if (gains < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Returns Analysis</h1>
          <p className="text-gray-600">Analyze your long-term investment returns and performance projections</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly SIP</p>
                <p className="text-2xl font-bold text-blue-600">₹{investmentAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Return</p>
                <p className="text-2xl font-bold text-green-600">{state.investmentReturns.overall}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 mr-4">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">10Y Target</p>
                <p className="text-2xl font-bold text-orange-600">₹{(returns[1].real / 10000000).toFixed(1)}Cr</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Best Period</p>
                <p className="text-2xl font-bold text-purple-600">{bestReturns.years}Y</p>
              </div>
            </div>
          </div>
        </div>

        {/* Returns Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Investment Returns Summary</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Invested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal Gains</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Gains</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real ROI</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returns.map((period) => {
                  const realROI = (period.realGains / period.totalInvested) * 100;
                  
                  return (
                    <tr key={period.years} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.label}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(period.totalInvested / 10000000).toFixed(2)}Cr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        ₹{(period.nominal / 10000000).toFixed(2)}Cr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Power of Compounding</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>20Y Investment:</span>
                <span className="font-bold">₹{(returns[3].totalInvested / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between">
                <span>20Y Real Value:</span>
                <span className="font-bold">₹{(returns[3].real / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between border-t border-blue-400 pt-2">
                <span>Wealth Multiplier:</span>
                <span className="font-bold">{(returns[3].real / returns[3].totalInvested).toFixed(1)}x</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Inflation Impact</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>10Y Nominal:</span>
                <span className="font-bold">₹{(returns[1].nominal / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between">
                <span>10Y Real Value:</span>
                <span className="font-bold">₹{(returns[1].real / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between border-t border-green-400 pt-2">
                <span>Inflation Loss:</span>
                <span className="font-bold">₹{((returns[1].nominal - returns[1].real) / 10000000).toFixed(1)}Cr</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Early Start Advantage</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>5Y vs 10Y Gap:</span>
                <span className="font-bold">{returns[1].years - returns[0].years} Years</span>
              </div>
              <div className="flex justify-between">
                <span>Extra Investment:</span>
                <span className="font-bold">₹{((returns[1].totalInvested - returns[0].totalInvested) / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between border-t border-orange-400 pt-2">
                <span>Extra Returns:</span>
                <span className="font-bold">₹{((returns[1].real - returns[0].real) / 10000000).toFixed(1)}Cr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Returns Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Investment Returns Comparison</h2>
          <div className="h-80">
            <BarChart data={returnsChartData} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              All values in crores (₹). Real values adjusted for {state.inflationRate}% annual inflation.
            </p>
            <div className="flex justify-center space-x-6 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Total Invested</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Nominal Value</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Real Value</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}