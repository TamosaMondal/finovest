import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';
// Import Firestore functions - onSnapshot is added for real-time updates
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path is correct

// --- DATA STRUCTURES ---
export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
}

export interface Debt {
    id: string;
    name: string;
    originalAmount: number;
    totalAmount: number;
    interestRate: number;
    minimumPayment: number;
}

export interface DailyExpense {
  id: string;
  date: string;
  category: 'Needs' | 'Wants' | 'Investments' | 'Debt Repayment' | 'Goal Contributions';
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
  debtRepaymentPercent: number;
  goalContributionsPercent: number;
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
  goals: FinancialGoal[];
  debts: Debt[];
  notes: string[]; // 💡 ADDED: State for notes
}
export interface MonthlySnapshot {
  month: string;
  salary: number;
  totalExpenses: number;
  needsSpent: number;
  wantsSpent: number;
  investmentsSpent: number;
  debtRepaymentSpent: number;
  goalContributionsSpent: number;
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
  | { type: 'UPDATE_ALLOCATION'; payload: { needs: number; wants: number; investments: number; debtRepayment: number; goalContributions: number } }
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
  | { type: 'LOAD_DATA'; payload: FinanceState }
  | { type: 'ADD_GOAL'; payload: FinancialGoal }
  | { type: 'UPDATE_GOAL'; payload: FinancialGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'UPDATE_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'SET_NOTES'; payload: string[] }; // 💡 ADDED: Action for notes

// --- INITIAL STATE ---
const initialState: FinanceState = {
  monthlySalary: 36300,
  needsPercent: 45,
  wantsPercent: 25,
  investmentsPercent: 20,
  debtRepaymentPercent: 10,
  goalContributionsPercent: 0,
  inflationRate: 6,
  incrementRates: { period1: 10, period2: 8, period3: 6 },
  dailyExpenses: [],
  currentMonth: new Date().toISOString().slice(0, 7),
  monthlySnapshots: [],
  yearlySnapshots: [],
  budgetYears: [],
  needsCategories: { rent: 'Rent & Housing', food: 'Food & Groceries', utilities: 'Utilities', transport: 'Transportation', healthcare: 'Healthcare', others: 'Others' },
  wantsCategories: { savingsAccount: 'Savings Account', entertainment: 'Entertainment', shopping: 'Shopping', dining: 'Dining Out', others: 'Others' },
  investmentCategories: { nifty50: 'Nifty50', midCap: 'Mid-cap', smallCap: 'Small-cap' },
  needsBreakdown: { rent: 7969.20, food: 3410.23, utilities: 1707.90, transport: 1707.90, healthcare: 1707.90, others: 575.87 },
  wantsBreakdown: { savingsAccount: 0, entertainment: 1841.38, shopping: 1841.38, dining: 1841.38, others: 1841.38 },
  investmentAllocation: { nifty50: 4847.40, midCap: 2019.75, smallCap: 1211.85 },
  investmentReturns: { nifty50: 12, midCap: 15, smallCap: 18, overall: 15 },
  goals: [],
  debts: [],
  notes: [], // 💡 ADDED: Initialize notes
};

// --- REDUCER ---
function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    // 💡 ADDED: Case to handle setting notes
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload,
      };

    // ... (All your other cases remain unchanged)
    case 'ADD_EXPENSE': {
      const newExpense = action.payload;
      const newExpenses = [...state.dailyExpenses, newExpense];
      let newGoals = state.goals;
      let newDebts = state.debts;

      if (newExpense.subcategory === 'Savings Account' && state.goals.length > 0) {
        const firstGoal = { ...state.goals[0] };
        firstGoal.savedAmount = (firstGoal.savedAmount || 0) + newExpense.amount;
        newGoals = state.goals.map(g => g.id === firstGoal.id ? firstGoal : g);
      }

      if (newExpense.category === 'Debt Repayment') {
          const debtToUpdate = state.debts.find(d => d.name === newExpense.subcategory);
          if (debtToUpdate) {
              const updatedDebt = { ...debtToUpdate, totalAmount: debtToUpdate.totalAmount - newExpense.amount };
              newDebts = state.debts.map(d => d.id === updatedDebt.id ? updatedDebt : d);
          }
      } else if (newExpense.category === 'Goal Contributions') {
        const goalToUpdate = state.goals.find(g => g.name === newExpense.subcategory);
        if (goalToUpdate) {
            const updatedGoal = { ...goalToUpdate, savedAmount: (goalToUpdate.savedAmount || 0) + newExpense.amount };
            newGoals = state.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
        }
      }

      return { ...state, dailyExpenses: newExpenses, goals: newGoals, debts: newDebts };
    }
    case 'UPDATE_ALLOCATION': {
      const { needs, wants, investments, debtRepayment, goalContributions } = action.payload;
      return {
        ...state,
        needsPercent: needs,
        wantsPercent: wants,
        investmentsPercent: investments,
        debtRepaymentPercent: debtRepayment,
        goalContributionsPercent: goalContributions,
      };
    }
    case 'CREATE_MONTHLY_SNAPSHOT': {
        const monthToSnapshot = action.payload;
        const expensesForMonth = state.dailyExpenses.filter(e => e.date.startsWith(monthToSnapshot));
        const needsSpent = expensesForMonth.filter(e => e.category === 'Needs').reduce((sum, e) => sum + e.amount, 0);
        const wantsSpent = expensesForMonth.filter(e => e.category === 'Wants').reduce((sum, e) => sum + e.amount, 0);
        const investmentsSpent = expensesForMonth.filter(e => e.category === 'Investments').reduce((sum, e) => sum + e.amount, 0);
        const debtRepaymentSpent = expensesForMonth.filter(e => e.category === 'Debt Repayment').reduce((sum, e) => sum + e.amount, 0);
        const goalContributionsSpent = expensesForMonth.filter(e => e.category === 'Goal Contributions').reduce((sum, e) => sum + e.amount, 0);
        const totalExpenses = needsSpent + wantsSpent + investmentsSpent + debtRepaymentSpent + goalContributionsSpent;
        const savings = state.monthlySalary - totalExpenses;
        const newSnapshot: MonthlySnapshot = {
          month: monthToSnapshot,
          salary: state.monthlySalary,
          totalExpenses,
          needsSpent,
          wantsSpent,
          investmentsSpent,
          debtRepaymentSpent,
          goalContributionsSpent,
          savings,
          expenseCount: expensesForMonth.length,
          createdAt: new Date().toISOString(),
        };
        const otherSnapshots = state.monthlySnapshots.filter(s => s.month !== monthToSnapshot);
        return { ...state, monthlySnapshots: [...otherSnapshots, newSnapshot] };
    }
    case 'ADD_DEBT': {
        const newDebt = { ...action.payload, originalAmount: action.payload.totalAmount };
        return { ...state, debts: [...state.debts, newDebt] };
    }
    case 'UPDATE_DEBT': {
        const originalDebt = state.debts.find(d => d.id === action.payload.id);
        const updatedDebt = { ...action.payload, originalAmount: originalDebt?.originalAmount || action.payload.totalAmount };
        return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? updatedDebt : d) };
    }
    case 'UPDATE_SALARY': {
      const newSalary = action.payload;
      const needsAllocated = (newSalary * state.needsPercent) / 100;
      const wantsAllocated = (newSalary * state.wantsPercent) / 100;
      const investmentsAllocated = (newSalary * state.investmentsPercent) / 100;
      const needsKeys = Object.keys(state.needsBreakdown);
      const wantsKeys = Object.keys(state.wantsBreakdown);
      const investmentKeys = Object.keys(state.investmentAllocation);
      const needsTotalCurrent = Object.values(state.needsBreakdown).reduce((sum, val) => sum + val, 0);
      const wantsTotalCurrent = Object.values(state.wantsBreakdown).reduce((sum, val) => sum + val, 0);
      const investmentTotalCurrent = Object.values(state.investmentAllocation).reduce((sum, val) => sum + val, 0);
      return {
        ...state,
        monthlySalary: newSalary,
        needsBreakdown: { ...needsKeys.reduce((acc, key) => ({ ...acc, [key]: needsTotalCurrent > 0 ? (state.needsBreakdown[key] / needsTotalCurrent) * needsAllocated : needsAllocated / needsKeys.length }), {}) },
        wantsBreakdown: { ...wantsKeys.reduce((acc, key) => ({ ...acc, [key]: wantsTotalCurrent > 0 ? (state.wantsBreakdown[key] / wantsTotalCurrent) * wantsAllocated : wantsAllocated / wantsKeys.length }), {}) },
        investmentAllocation: { ...investmentKeys.reduce((acc, key) => ({ ...acc, [key]: investmentTotalCurrent > 0 ? (state.investmentAllocation[key] / investmentTotalCurrent) * investmentsAllocated : investmentsAllocated / investmentKeys.length }), {}) }
      };
    }
    case 'UPDATE_EXPENSE':
      return { ...state, dailyExpenses: state.dailyExpenses.map(expense => expense.id === action.payload.id ? action.payload : expense) };
    case 'DELETE_EXPENSE':
      return { ...state, dailyExpenses: state.dailyExpenses.filter(expense => expense.id !== action.payload) };
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
    case 'ADD_GOAL':
        return { ...state, goals: [...state.goals, { ...action.payload, savedAmount: 0 }] };
    case 'UPDATE_GOAL':
        return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL':
        return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'DELETE_DEBT':
        return { ...state, debts: state.debts.filter(d => d.id !== action.payload) };
    case 'LOAD_DATA':
      return {
        ...initialState, // Start with a clean slate to avoid merging issues
        ...action.payload,
        notes: action.payload.notes || [], // Ensure notes is always an array
      };
    default:
      return state;
  }
}

const FinanceContext = createContext<{
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  updateNotesInDatabase: (notes: string[]) => Promise<void>; // 💡 ADDED: Function to save notes
} | undefined>(undefined);

// --- PROVIDER ---
export function FinanceProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Effect for loading main finance data
  useEffect(() => {
    const loadDataFromFirestore = async () => {
      if (currentUser) {
        const userFinanceDocRef = doc(db, 'financeData', currentUser.uid);
        try {
          const docSnap = await getDoc(userFinanceDocRef);
          if (docSnap.exists()) {
            dispatch({ type: 'LOAD_DATA', payload: docSnap.data() as FinanceState });
          } else {
            dispatch({ type: 'LOAD_DATA', payload: initialState });
          }
        } catch (error) {
          console.error("Error loading finance data:", error);
          dispatch({ type: 'LOAD_DATA', payload: initialState });
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

  // 💡 --- START: NOTES LOGIC --- 💡
  // Effect for loading and listening to notes in real-time
  useEffect(() => {
    if (currentUser) {
      const userNotesDocRef = doc(db, 'userNotes', currentUser.uid);

      // onSnapshot listens for real-time updates to the notes document
      const unsubscribe = onSnapshot(userNotesDocRef, (docSnap) => {
        if (docSnap.exists()) {
          dispatch({ type: 'SET_NOTES', payload: docSnap.data().notes || [] });
        } else {
          // If the document doesn't exist, initialize notes in the state
          dispatch({ type: 'SET_NOTES', payload: [] });
        }
      });

      // Cleanup the listener when the component unmounts or user changes
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Function to save notes to Firestore
  const updateNotesInDatabase = async (newNotes: string[]) => {
    if (currentUser) {
      try {
        const userNotesDocRef = doc(db, 'userNotes', currentUser.uid);
        // setDoc will create the document if it doesn't exist, or overwrite it if it does.
        await setDoc(userNotesDocRef, { notes: newNotes });
      } catch (error) {
        console.error("Error saving notes to Firestore:", error);
      }
    }
  };
  // 💡 --- END: NOTES LOGIC --- 💡


  // Effect for saving main finance data and creating snapshots
  useEffect(() => {
    if (!currentUser || !isDataLoaded) {
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear();
    const expensesForCurrentMonth = state.dailyExpenses.filter(e => e.date.startsWith(currentMonth));
    const currentMonthSnapshot = state.monthlySnapshots.find(s => s.month === currentMonth);

    if (!currentMonthSnapshot && expensesForCurrentMonth.length > 0) {
      dispatch({ type: 'CREATE_MONTHLY_SNAPSHOT', payload: currentMonth });
    } else if (currentMonthSnapshot && currentMonthSnapshot.expenseCount !== expensesForCurrentMonth.length) {
      dispatch({ type: 'CREATE_MONTHLY_SNAPSHOT', payload: currentMonth });
    }

    const monthlySnapshotsForCurrentYear = state.monthlySnapshots.filter(s => s.month.startsWith(currentYear.toString()));
    const currentYearSnapshot = state.yearlySnapshots.find(s => s.year === currentYear);

    if (!currentYearSnapshot && monthlySnapshotsForCurrentYear.length > 0) {
        dispatch({ type: 'CREATE_YEARLY_SNAPSHOT', payload: currentYear });
    } else if (currentYearSnapshot && currentYearSnapshot.monthsTracked !== monthlySnapshotsForCurrentYear.length) {
        dispatch({ type: 'CREATE_YEARLY_SNAPSHOT', payload: currentYear });
    }

    const saveDataToFirestore = async () => {
      try {
        const userFinanceDocRef = doc(db, 'financeData', currentUser.uid);
        // We exclude notes from this save operation, as they are handled separately
        const { notes, ...financeDataToSave } = state;
        await setDoc(userFinanceDocRef, financeDataToSave);
      } catch (error) {
        console.error("Error saving finance data to Firestore:", error);
      }
    };

    saveDataToFirestore();
  }, [state, currentUser, isDataLoaded]);

  return (
    <FinanceContext.Provider value={{ state, dispatch, updateNotesInDatabase }}>
      {children}
    </FinanceContext.Provider>
  );
}

// --- HOOK ---
export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
