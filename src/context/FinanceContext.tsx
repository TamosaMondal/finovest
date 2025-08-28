import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';
// Import Firestore functions
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path is correct

// --- TYPES (No changes needed) ---
export interface DailyExpense {
  id: string;
  date: string;
  category: 'Needs' | 'Wants' | 'Investments';
  subcategory: string;
  amount: number;
  notes: string;
}
export interface BudgetYear {
  year: number;
  startingSalary: number;
  increment: number;
  endingSalary: number;
  needs: number;
  wants: number;
  investments: number;
  needsPercent: number;
  wantsPercent: number;
  investmentsPercent: number;
}
export interface NeedsBreakdown {
  [key: string]: number;
}
export interface WantsBreakdown {
  [key: string]: number;
}
export interface InvestmentAllocation {
  [key: string]: number;
}
export interface InvestmentReturns {
  [key: string]: number;
  overall: number;
}
export interface FinanceState {
  monthlySalary: number;
  needsPercent: number;
  wantsPercent: number;
  investmentsPercent: number;
  inflationRate: number;
  incrementRates: {
    period1: number;
    period2: number;
    period3: number;
  };
  dailyExpenses: DailyExpense[];
  currentMonth: string;
  budgetYears: BudgetYear[];
  monthlySnapshots: MonthlySnapshot[];
  yearlySnapshots: YearlySnapshot[];
  needsBreakdown: NeedsBreakdown;
  wantsBreakdown: WantsBreakdown;
  needsCategories: { [key: string]: string };
  wantsCategories: { [key: string]: string };
  investmentCategories: { [key: string]: string };
  investmentAllocation: InvestmentAllocation;
  investmentReturns: InvestmentReturns;
}
export interface MonthlySnapshot {
  month: string;
  salary: number;
  totalExpenses: number;
  needsSpent: number;
  wantsSpent: number;
  investmentsSpent: number;
  savings: number;
  expenseCount: number;
  createdAt: string;
}
export interface YearlySnapshot {
  year: number;
  totalSalary: number;
  totalExpenses: number;
  totalSavings: number;
  averageMonthlySalary: number;
  monthsTracked: number;
  createdAt: string;
}
type FinanceAction = 
  | { type: 'UPDATE_SALARY'; payload: number }
  | { type: 'UPDATE_ALLOCATION'; payload: { needs: number; wants: number; investments: number } }
  | { type: 'UPDATE_INFLATION'; payload: number }
  | { type: 'ADD_EXPENSE'; payload: DailyExpense }
  | { type: 'UPDATE_EXPENSE'; payload: DailyExpense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'UPDATE_BUDGET_YEAR'; payload: BudgetYear }
  | { type: 'UPDATE_NEEDS_BREAKDOWN'; payload: NeedsBreakdown }
  | { type: 'UPDATE_WANTS_BREAKDOWN'; payload: WantsBreakdown }
  | { type: 'UPDATE_INVESTMENT_ALLOCATION'; payload: InvestmentAllocation }
  | { type: 'UPDATE_INVESTMENT_RETURNS'; payload: InvestmentReturns }
  | { type: 'ADD_NEEDS_CATEGORY'; payload: { key: string; name: string } }
  | { type: 'REMOVE_NEEDS_CATEGORY'; payload: string }
  | { type: 'ADD_WANTS_CATEGORY'; payload: { key: string; name: string } }
  | { type: 'REMOVE_WANTS_CATEGORY'; payload: string }
  | { type: 'ADD_INVESTMENT_CATEGORY'; payload: { key: string; name: string } }
  | { type: 'REMOVE_INVESTMENT_CATEGORY'; payload: string }
  | { type: 'CREATE_MONTHLY_SNAPSHOT'; payload: string }
  | { type: 'CREATE_YEARLY_SNAPSHOT'; payload: number }
  | { type: 'LOAD_DATA'; payload: FinanceState };

// --- INITIAL STATE (No changes needed) ---
const initialState: FinanceState = {
  monthlySalary: 36300,
  needsPercent: 47,
  wantsPercent: 30.5,
  investmentsPercent: 22.5,
  inflationRate: 6,
  incrementRates: { period1: 10, period2: 8, period3: 6 },
  dailyExpenses: [],
  currentMonth: new Date().toISOString().slice(0, 7),
  monthlySnapshots: [],
  yearlySnapshots: [],
  budgetYears: [{ year: 2025, startingSalary: 36300, increment: 10, endingSalary: 39930, needs: 17079, wants: 11079, investments: 8079, needsPercent: 47, wantsPercent: 30.5, investmentsPercent: 22.2 }],
  needsCategories: { rent: 'Rent & Housing', food: 'Food & Groceries', utilities: 'Utilities', transport: 'Transportation', healthcare: 'Healthcare', others: 'Others' },
  wantsCategories: { savingsAccount: 'Savings Account', emi: 'EMI & Loans', entertainment: 'Entertainment', shopping: 'Shopping', dining: 'Dining Out', others: 'Others' },
  investmentCategories: { nifty50: 'Nifty50', midCap: 'Mid-cap', smallCap: 'Small-cap' },
  needsBreakdown: { rent: 7969.20, food: 3410.23, utilities: 1707.90, transport: 1707.90, healthcare: 1707.90, others: 575.87 },
  wantsBreakdown: { savingsAccount: 3682.76, emi: 3682.76, entertainment: 1841.38, shopping: 1841.38, dining: 1841.38, others: 1841.38 },
  investmentAllocation: { nifty50: 4847.40, midCap: 2019.75, smallCap: 1211.85 },
  investmentReturns: { nifty50: 12, midCap: 15, smallCap: 18, overall: 15 }
};

// --- REDUCER (Logic for snapshots added) ---
function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'UPDATE_SALARY': {
      const newSalary = action.payload;
      const needs = (newSalary * state.needsPercent) / 100;
      const wants = (newSalary * state.wantsPercent) / 100;
      const investments = (newSalary * state.investmentsPercent) / 100;
      const needsKeys = Object.keys(state.needsBreakdown);
      const wantsKeys = Object.keys(state.wantsBreakdown);
      const investmentKeys = Object.keys(state.investmentAllocation);
      const needsTotal = Object.values(state.needsBreakdown).reduce((sum, val) => sum + val, 0);
      const wantsTotal = Object.values(state.wantsBreakdown).reduce((sum, val) => sum + val, 0);
      const investmentTotal = Object.values(state.investmentAllocation).reduce((sum, val) => sum + val, 0);
      return {
        ...state,
        monthlySalary: newSalary,
        needsBreakdown: { ...needsKeys.reduce((acc, key) => ({ ...acc, [key]: needsTotal > 0 ? (state.needsBreakdown[key] / needsTotal) * needs : needs / needsKeys.length }), {}) },
        wantsBreakdown: { ...wantsKeys.reduce((acc, key) => ({ ...acc, [key]: wantsTotal > 0 ? (state.wantsBreakdown[key] / wantsTotal) * wants : wants / wantsKeys.length }), {}) },
        investmentAllocation: { ...investmentKeys.reduce((acc, key) => ({ ...acc, [key]: investmentTotal > 0 ? (state.investmentAllocation[key] / investmentTotal) * investments : investments / investmentKeys.length }), {}) }
      };
    }
    case 'UPDATE_ALLOCATION': {
      const { needs, wants, investments } = action.payload;
      const salary = state.monthlySalary;
      const needsAmount = (salary * needs) / 100;
      const wantsAmount = (salary * wants) / 100;
      const investmentsAmount = (salary * investments) / 100;
      const needsKeys = Object.keys(state.needsBreakdown);
      const wantsKeys = Object.keys(state.wantsBreakdown);
      const investmentKeys = Object.keys(state.investmentAllocation);
      const needsTotal = Object.values(state.needsBreakdown).reduce((sum, val) => sum + val, 0);
      const wantsTotal = Object.values(state.wantsBreakdown).reduce((sum, val) => sum + val, 0);
      const investmentTotal = Object.values(state.investmentAllocation).reduce((sum, val) => sum + val, 0);
      return {
        ...state,
        needsPercent: needs,
        wantsPercent: wants,
        investmentsPercent: investments,
        needsBreakdown: { ...needsKeys.reduce((acc, key) => ({ ...acc, [key]: needsTotal > 0 ? (state.needsBreakdown[key] / needsTotal) * needsAmount : needsAmount / needsKeys.length }), {}) },
        wantsBreakdown: { ...wantsKeys.reduce((acc, key) => ({ ...acc, [key]: wantsTotal > 0 ? (state.wantsBreakdown[key] / wantsTotal) * wantsAmount : wantsAmount / wantsKeys.length }), {}) },
        investmentAllocation: { ...investmentKeys.reduce((acc, key) => ({ ...acc, [key]: investmentTotal > 0 ? (state.investmentAllocation[key] / investmentTotal) * investmentsAmount : investmentsAmount / investmentKeys.length }), {}) }
      };
    }
    case 'ADD_EXPENSE':
      return { ...state, dailyExpenses: [...state.dailyExpenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return { ...state, dailyExpenses: state.dailyExpenses.map(expense => expense.id === action.payload.id ? action.payload : expense) };
    case 'DELETE_EXPENSE':
      return { ...state, dailyExpenses: state.dailyExpenses.filter(expense => expense.id !== action.payload) };
    
    // **START OF CORRECTION**
    case 'UPDATE_BUDGET_YEAR': {
      const updatedYear = action.payload;
      const yearExists = state.budgetYears.some(year => year.year === updatedYear.year);

      return {
        ...state,
        budgetYears: yearExists
          ? state.budgetYears.map(year => 
              year.year === updatedYear.year ? updatedYear : year
            )
          : [...state.budgetYears, updatedYear],
      };
    }
    // **END OF CORRECTION**

    case 'UPDATE_NEEDS_BREAKDOWN':
      return { ...state, needsBreakdown: action.payload };
    case 'UPDATE_WANTS_BREAKDOWN':
      return { ...state, wantsBreakdown: action.payload };
    case 'UPDATE_INVESTMENT_ALLOCATION':
      return { ...state, investmentAllocation: action.payload };
    case 'UPDATE_INVESTMENT_RETURNS':
      return { ...state, investmentReturns: action.payload };
    case 'ADD_NEEDS_CATEGORY':
      return { ...state, needsCategories: { ...state.needsCategories, [action.payload.key]: action.payload.name }, needsBreakdown: { ...state.needsBreakdown, [action.payload.key]: 0 } };
    case 'REMOVE_NEEDS_CATEGORY': {
      const { [action.payload]: removedNeeds, ...remainingNeedsBreakdown } = state.needsBreakdown;
      const { [action.payload]: removedNeedsCategory, ...remainingNeedsCategories } = state.needsCategories;
      return { ...state, needsCategories: remainingNeedsCategories, needsBreakdown: remainingNeedsBreakdown };
    }
    case 'ADD_WANTS_CATEGORY':
      return { ...state, wantsCategories: { ...state.wantsCategories, [action.payload.key]: action.payload.name }, wantsBreakdown: { ...state.wantsBreakdown, [action.payload.key]: 0 } };
    case 'REMOVE_WANTS_CATEGORY': {
      const { [action.payload]: removedWants, ...remainingWantsBreakdown } = state.wantsBreakdown;
      const { [action.payload]: removedWantsCategory, ...remainingWantsCategories } = state.wantsCategories;
      return { ...state, wantsCategories: remainingWantsCategories, wantsBreakdown: remainingWantsBreakdown };
    }
    case 'ADD_INVESTMENT_CATEGORY':
      return { ...state, investmentCategories: { ...state.investmentCategories, [action.payload.key]: action.payload.name }, investmentAllocation: { ...state.investmentAllocation, [action.payload.key]: 0 }, investmentReturns: { ...state.investmentReturns, [action.payload.key]: 12 } };
    case 'REMOVE_INVESTMENT_CATEGORY': {
      const { [action.payload]: removedInvestment, ...remainingInvestmentAllocation } = state.investmentAllocation;
      const { [action.payload]: removedInvestmentCategory, ...remainingInvestmentCategories } = state.investmentCategories;
      const newInvestmentReturns = { ...state.investmentReturns };
      delete newInvestmentReturns[action.payload];
      return { ...state, investmentCategories: remainingInvestmentCategories, investmentAllocation: remainingInvestmentAllocation, investmentReturns: newInvestmentReturns };
    }
    case 'CREATE_MONTHLY_SNAPSHOT': {
      const monthToSnapshot = action.payload;
      const expensesForMonth = state.dailyExpenses.filter(e => e.date.startsWith(monthToSnapshot));
      if (expensesForMonth.length === 0) return state;
      const needsSpent = expensesForMonth.filter(e => e.category === 'Needs').reduce((sum, e) => sum + e.amount, 0);
      const wantsSpent = expensesForMonth.filter(e => e.category === 'Wants').reduce((sum, e) => sum + e.amount, 0);
      const investmentsSpent = expensesForMonth.filter(e => e.category === 'Investments').reduce((sum, e) => sum + e.amount, 0);
      const totalExpenses = needsSpent + wantsSpent + investmentsSpent;
      const savings = state.monthlySalary - totalExpenses;
      const newSnapshot: MonthlySnapshot = {
        month: monthToSnapshot,
        salary: state.monthlySalary,
        totalExpenses,
        needsSpent,
        wantsSpent,
        investmentsSpent,
        savings,
        expenseCount: expensesForMonth.length,
        createdAt: new Date().toISOString(),
      };
      const otherSnapshots = state.monthlySnapshots.filter(s => s.month !== monthToSnapshot);
      return { ...state, monthlySnapshots: [...otherSnapshots, newSnapshot] };
    }
    case 'CREATE_YEARLY_SNAPSHOT': {
        const yearToSnapshot = action.payload;
        const monthsForYear = state.monthlySnapshots.filter(s => s.month.startsWith(yearToSnapshot.toString()));
        if (monthsForYear.length === 0) return state;
        const totalSalary = monthsForYear.reduce((sum, s) => sum + s.salary, 0);
        const totalExpenses = monthsForYear.reduce((sum, s) => sum + s.totalExpenses, 0);
        const totalSavings = monthsForYear.reduce((sum, s) => sum + s.savings, 0);
        const newYearlySnapshot: YearlySnapshot = {
            year: yearToSnapshot,
            totalSalary,
            totalExpenses,
            totalSavings,
            averageMonthlySalary: totalSalary / monthsForYear.length,
            monthsTracked: monthsForYear.length,
            createdAt: new Date().toISOString(),
        };
        const otherYearlySnapshots = state.yearlySnapshots.filter(s => s.year !== yearToSnapshot);
        return { ...state, yearlySnapshots: [...otherYearlySnapshots, newYearlySnapshot] };
    }
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

const FinanceContext = createContext<{
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
} | undefined>(undefined);

// --- PROVIDER (Automation logic added) ---
export function FinanceProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadDataFromFirestore = async () => {
      if (currentUser) {
        const userFinanceDocRef = doc(db, 'financeData', currentUser.uid);
        try {
          const docSnap = await getDoc(userFinanceDocRef);
          if (docSnap.exists()) {
            dispatch({ type: 'LOAD_DATA', payload: docSnap.data() as FinanceState });
          }
        } catch (error) {
          console.error("Error loading finance data:", error);
        } finally {
          setIsDataLoaded(true);
        }
      } else {
        dispatch({ type: 'LOAD_DATA', payload: initialState });
        setIsDataLoaded(false);
      }
    };
    loadDataFromFirestore();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !isDataLoaded) {
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const hasMonthlySnapshot = state.monthlySnapshots.some(s => s.month === currentMonth);
    if (!hasMonthlySnapshot && state.dailyExpenses.some(e => e.date.startsWith(currentMonth))) {
      dispatch({ type: 'CREATE_MONTHLY_SNAPSHOT', payload: currentMonth });
    }
    
    const currentYear = new Date().getFullYear();
    const hasYearlySnapshot = state.yearlySnapshots.some(s => s.year === currentYear);
    if (!hasYearlySnapshot && state.monthlySnapshots.some(s => s.month.startsWith(currentYear.toString()))) {
        dispatch({ type: 'CREATE_YEARLY_SNAPSHOT', payload: currentYear });
    }

    const saveDataToFirestore = async () => {
      try {
        const userFinanceDocRef = doc(db, 'financeData', currentUser.uid);
        await setDoc(userFinanceDocRef, state);
      } catch (error) {
        console.error("Error saving finance data to Firestore:", error);
      }
    };
    
    saveDataToFirestore();
  }, [state, currentUser, isDataLoaded]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}

// --- HOOK (No changes needed) ---
export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
