Day 1 → Project Setup + Firebase + Auth
Day 2 → Core State (FinanceContext) + Layout
Day 3 → Budget Setup + Daily Budget Tracker
Day 4 → Needs + Wants + Investments + Returns
Day 5 → Goals + Debts
Day 6 → Monthly Overview + Charts + PDF
Day 7 → Polish + Dark Mode + Notes + Deploy

**PRE-SETUP (Before Day 1)
**
Install Required Software
1. Download & install Node.js from nodejs.org (LTS version)
2. Download & install VS Code from code.visualstudio.com
3. Install VS Code extensions:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - TypeScript Hero
   - Prettier - Code formatter
4. Open terminal in VS Code (Ctrl + `)


Overview Before Starting
Day 1 → Project Setup + Firebase + Auth
Day 2 → Core State (FinanceContext) + Layout
Day 3 → Budget Setup + Daily Budget Tracker
Day 4 → Needs + Wants + Investments + Returns
Day 5 → Goals + Debts
Day 6 → Monthly Overview + Charts + PDF
Day 7 → Polish + Dark Mode + Notes + Deploy

.
Day 1 — Project Setup + Firebase + Authentication
Step 1: Initialize Project
npm create vite@latest finovest -- --template react-ts
cd finovest
npm install

.
Step 2: Install All Dependencies at Once
npm install firebase react-router-dom tailwindcss postcss autoprefixer
npm install chart.js react-chartjs-2 lucide-react
npm install react-hot-toast papaparse jspdf jspdf-autotable
npm install @types/papaparse
npx tailwindcss init -p

Step 3: Configure Tailwind
Edit tailwind.config.js → add content paths + enable darkMode: 'class'

Edit index.css → add @tailwind base/components/utilities

Step 4: Create Firebase Project
- Go to console.firebase.google.com
- Create new project → "finovest"
- Enable Authentication → Email/Password
- Enable Firestore Database → Start in production mode
- Add Firestore rules (allow read/write if auth)
- . config keys


Step 5: Create Files
src/
  firebase.ts          ← initializeApp, export auth, export db
  .env                 ← VITE_FIREBASE_API_KEY etc.

.
Step 6: Build AuthContext
src/context/AuthContext.tsx
  - onAuthStateChanged listener
  - fetch userProfile from Firestore "users/uid"
  - provide: currentUser, userProfile, isLoading, logout()

.
Step 7: Build AuthModal
src/components/AuthModal.tsx
  - Login form (email + password)
  - Signup form (name + email + password)
  - createUserWithEmailAndPassword
  - sendEmailVerification → signOut → show verify screen
  - signInWithEmailAndPassword → check emailVerified
  - error handling for all Firebase error codes

.
Step 8: Build App.tsx Shell
src/App.tsx
  - import useAuth
  - if isLoading → spinner
  - if no user   → landing page + AuthModal
  - if user      → placeholder "Dashboard coming soon"


Day 1 Checklist
✓ Vite project running on localhost:5173
✓ Tailwind working (test with a colored div)
✓ Firebase connected (no console errors)
✓ Can sign up with email
✓ Verification email received
✓ Can log in after verifying
✓ Logout works
✓ App shows different screens for logged in/out

.
Day 2 — FinanceContext (State) + Navigation + Routing
Step 1: Define All TypeScript Interfaces
src/context/FinanceContext.tsx — add interfaces:
  - DailyExpense
  - FinancialGoal
  - Debt
  - BudgetYear
  - MonthlySnapshot
  - YearlySnapshot
  - NeedsBreakdown, WantsBreakdown
  - InvestmentAllocation, InvestmentReturns
  - FinanceState (master interface)

.
Step 2: Define initialState
  - monthlySalary: 36300
  - needsPercent: 45, wantsPercent: 25, investmentsPercent: 20
  - debtRepaymentPercent: 10, goalContributionsPercent: 0
  - inflationRate: 6
  - incrementRates: { period1: 10, period2: 8, period3: 6 }
  - default categories for needs, wants, investments
  - default breakdown values
  - empty arrays for expenses, goals, debts, snapshots, notes

.
Step 3: Define All Reducer Actions (type union)
  UPDATE_SALARY, UPDATE_ALLOCATION, UPDATE_INFLATION
  ADD/UPDATE/DELETE_EXPENSE
  UPDATE_NEEDS/WANTS/INVESTMENT_BREAKDOWN
  ADD/REMOVE_NEEDS/WANTS/INVESTMENT_CATEGORY
  ADD/UPDATE/DELETE_GOAL
  ADD/UPDATE/DELETE_DEBT
  CREATE_MONTHLY/YEARLY_SNAPSHOT
  UPDATE_BUDGET_YEAR
  SET_NOTES, LOAD_DATA

.
Step 4: Write financeReducer
  - Write each case one by one
  - ADD_EXPENSE: also auto-updates goal/debt if category matches
  - UPDATE_SALARY: proportionally rescales all breakdowns
  - CREATE_MONTHLY_SNAPSHOT: aggregates expenses for that month
  - CREATE_YEARLY_SNAPSHOT: aggregates monthly snapshots
  - LOAD_DATA: spread initialState then override with payload

.
Step 5: Write FinanceProvider
  - useReducer(financeReducer, initialState)
  - Effect 1: load from Firestore on login
  - Effect 2: save to Firestore on state change (skip if not loaded)
              + auto-dispatch CREATE_MONTHLY/YEARLY_SNAPSHOT
  - Effect 3: onSnapshot for notes (real-time)
  - updateNotesInDatabase() function
  - provide: state, dispatch, updateNotesInDatabase

.
Step 6: Build Navigation
src/components/Navigation.tsx
  - Desktop nav: Logo, Links (Dashboard/Goals/Debts), buttons
  - Mobile nav: hamburger menu, same links
  - Contact Us button → modal with email/phone
  - Quick Note button → modal with add/delete notes
  - Dark mode toggle → localStorage + document.documentElement.classList
  - Download PDF button → calls exportToPDF (stub for now)
  - User name display + Logout button

.
Step 7: Set Up Routing in App.tsx
src/App.tsx
  - wrap with <FinanceProvider> + <Router>
  - add <Navigation>
  - add <Routes> with placeholder routes for all 10 pages
  - create empty placeholder page files in src/pages/

.
Step 8: Create Empty Page Files
src/pages/
  Home.tsx, DailyBudget.tsx, BudgetSetup.tsx
  Needs.tsx, Wants.tsx, Investments.tsx, Returns.tsx
  Goals.tsx, Debts.tsx, MonthlyOverview.tsx
  (each just returns a <div>Page Name</div> for now)

.
Day 2 Checklist
✓ FinanceContext loads data from Firestore on login
✓ FinanceContext saves data to Firestore on change
✓ Navigation renders on desktop and mobile
✓ Dark mode toggle works
✓ All 10 routes accessible (showing placeholder text)
✓ No TypeScript errors

.
Day 3 — Budget Setup + Daily Budget Tracker
Step 1: Build ChartComponents
src/components/ChartComponents.tsx
  - Register all Chart.js components at top
  - export PieChart  (props: data, title?)
  - export BarChart  (props: data, title?)
  - export LineChart (props: data, title?)
  - all use responsive: true

.
Step 2: Build BudgetSetup Page
src/pages/BudgetSetup.tsx

  STATE:
  - localSalary, needsAmount, wantsAmount
  - investmentsAmount, debtRepaymentAmount, goalContributionsAmount
  - all initialized from context state
  - useEffect to sync when context state changes

  COMPUTED:
  - needsPercent = needsAmount / localSalary * 100  (and so on)
  - totalAllocatedAmount = sum of all amounts
  - totalPercent = totalAllocatedAmount / localSalary * 100
  - savingsAccountBalance = localSalary - totalAllocatedAmount

  UI:
  - Salary input (₹ prefix)
  - 5 allocation inputs (Needs/Wants/Investments/Debt/Goals)
    each shows ₹ input + auto % label
  - Total allocation progress bar (red if > 100%)
  - Savings Hub card showing leftover
  - Save button → dispatch UPDATE_SALARY + UPDATE_ALLOCATION
  - use value || '' pattern on all number inputs

.
Step 3: Build DailyBudget Page
src/pages/DailyBudget.tsx

  STATE:
  - newExpense: { date, category, subcategory, amount, notes }
  - showBudgetAlert, expenseToAdd, alertDetails

  COMPUTED:
  - categoryBudgets (from state percentages)
  - currentMonthExpenses (filter by current month)
  - spentByCategory (reduce by category)

  FUNCTIONS:
  - getSubcategories(category) → returns correct list
    Needs → needsCategories values
    Wants → wantsCategories values
    Investments → investmentCategories values
    Debt Repayment → debts[].name
    Goal Contributions → goals[].name

  - handleAddExpense():
    → validate amount > 0 and subcategory selected
    → find subcategory budget
    → if new total > budget → show alert modal
    → else → confirmAndAddExpense()

  - confirmAndAddExpense() → dispatch ADD_EXPENSE + reset form

  UI:
  - 5 budget overview cards (budget/spent/remaining per category)
    with AlertTriangle icon if near/over limit
  - Add transaction form (6 columns)
  - Info box explaining Goals/Debts tracking
  - Recent transactions table (last 10, reversed)
    with category color badges + delete button
  - Budget Alert Modal (shows budget, spent, new balance)
    with Cancel + Proceed Anyway buttons
  - Export CSV button (Papa.unparse)
  - Import CSV label/input (Papa.parse)


.
Day 3 Checklist
✓ Can set salary and allocations, save persists to Firestore
✓ % auto-calculates as you type amounts
✓ Can add expense with all 5 categories
✓ Subcategory dropdown changes based on category
✓ Budget alert fires when limit exceeded
✓ Can proceed anyway or cancel
✓ Transactions appear in table
✓ Can delete a transaction
✓ Export CSV downloads file
✓ Import CSV adds expenses
✓ 0 stays blank in inputs (value || '' fix)

.
Day 4 — Needs + Wants + Investments + Returns
Step 1: Build Needs Page
src/pages/Needs.tsx

  STATE: newCategoryName, editingCategory, editingName

  FUNCTIONS:
  - handleBreakdownChange(key, value) → dispatch UPDATE_NEEDS_BREAKDOWN
  - addCategory() → dispatch ADD_NEEDS_CATEGORY
  - removeCategory(key) → dispatch REMOVE_NEEDS_CATEGORY (min 1)
  - startEditing / saveEdit / cancelEdit

  UI:
  - 4 overview cards (budget, allocated, difference, category count)
  - Add category input + button
  - Category allocation list:
    each card has: icon, label, edit/delete buttons,
    number input (value || ''), progress bar
  - Total summary box
  - Pie chart of breakdown
  - Category summary list
  - Tips section at bottom


Step 2: Build Wants Page
src/pages/Wants.tsx
  - Identical structure to Needs.tsx
  - Change: uses wantsBreakdown, wantsCategories
  - Change: dispatch UPDATE_WANTS_BREAKDOWN, ADD/REMOVE_WANTS_CATEGORY
  - Change: color theme green instead of blue

.
Step 3: Build Investments Page
src/pages/Investments.tsx

  FUNCTIONS:
  - handleAllocationChange(key, value) → dispatch UPDATE_INVESTMENT_ALLOCATION
  - handleReturnsChange(key, value) → dispatch UPDATE_INVESTMENT_RETURNS
  - addCategory / removeCategory / startEditing / saveEdit / cancelEdit
  - calculateFutureValue(years):
      monthlyReturn = annualReturn / 12
      FV = monthly * (((1 + monthlyReturn)^months - 1) / monthlyReturn)
      realValue = FV / (1 + inflationRate)^years

  UI:
  - 4 overview cards (monthly, annual, expected return, 10Y value)
  - Add category input
  - Investment allocation list:
    each card: label, edit/delete, amount input, return % input
  - Total allocation + overall return % input
  - Pie chart of allocation
  - Projections table (10Y to 50Y): invested, nominal, real, returns
  - Line chart: nominal vs real growth over time

.
Step 4: Build Returns Page
src/pages/Returns.tsx

  FUNCTIONS:
  - calculateReturns(years):
      same FV formula as Investments
      also calculates: totalInvested, gains, realGains

  DATA:
  - milestones: [5, 10, 15, 20, 25, 30 years]
  - returns = milestones.map(m => calculateReturns(m.years))

  UI:
  - 4 cards: monthly SIP, expected return, 10Y target, best period
  - Returns summary table (all milestones with all metrics)
  - 3 insight cards: compounding, inflation impact, early start
  - Bar chart: invested vs nominal vs real for all periods

.
Day 4 Checklist
✓ Needs: can add/rename/delete categories, amounts save
✓ Wants: same as Needs
✓ Investments: allocation + return % inputs work
✓ Investments: projections table calculates correctly
✓ Returns: all milestones calculate correctly
✓ Charts render on all 4 pages
✓ All inputs use value || '' (no zero-stuck bug)

.
Day 5 — Goals + Debts
Step 1: Build Goals Page
src/pages/Goals.tsx

  STATE:
  - newGoal: { name, targetAmount, deadline }
  - editingGoalId, editFormData

  FUNCTIONS:
  - handleAddGoal() → validate → dispatch ADD_GOAL → reset
  - handleDeleteGoal(id) → confirm → dispatch DELETE_GOAL
  - handleStartEdit(goal) → set editingGoalId + editFormData
  - handleUpdateGoal() → dispatch UPDATE_GOAL
  - getGoalSuggestion(goal):
      calculate monthsRemaining from deadline
      calculate requiredMonthlySaving
      compare with goalContributionsPercent allocation
      return: success / warning / error message

  UI:
  - Add goal form (name, targetAmount, deadline, add button)
  - Goals grid (3 columns):
    each card:
      view mode: name, deadline, saved/target, progress bar, suggestion
      edit mode: inputs for name, targetAmount, savedAmount(disabled), deadline
  - Progress bar fills green based on %
  - Suggestion badge: green/yellow/red


.
Step 2: Build Debts Page
src/pages/Debts.tsx

  STATE:
  - newDebt: { name, totalAmount, interestRate, minimumPayment }
  - editingDebtId, editFormData
  - scenarioExtraPayment, scenarioDuration

  FUNCTIONS:
  - handleAddDebt() → validate all fields > 0 → dispatch ADD_DEBT
  - handleDeleteDebt(id) → confirm → dispatch DELETE_DEBT
  - handleStartEdit / handleUpdateDebt / handleCancelEdit

  - calculatePayoff(debts, baseExtra, boostExtra, boostDuration, strategy):
      sort by: totalAmount (snowball) or interestRate desc (avalanche)
      loop months:
        apply interest each month
        pay minimum on each debt
        apply extra to priority debt
        when debt paid → add its minimum to snowball pool
      return: months, totalInterest

  COMPUTED (useMemo):
  - snowballPlan = calculatePayoff(..., 'snowball')
  - avalanchePlan = calculatePayoff(..., 'avalanche')
  - acceleratedPlan = calculatePayoff(...extra scenario..., 'avalanche')

  UI:
  - Add debt form (name, amount, interest, min payment)
  - Strategy cards: Snowball vs Avalanche (months to debt-free)
  - Payoff Accelerator: extra ₹ input + duration input
    → shows new payoff time, months saved, interest saved
  - Debts list:
    each card: name, interest rate, remaining/original, progress bar
    edit mode: inline inputs


.
Day 5 Checklist
✓ Can add/edit/delete goals
✓ Progress bar updates when expense logged as Goal Contribution
✓ Goal suggestion shows correct status
✓ Can add/edit/delete debts
✓ Snowball and Avalanche show different month counts
✓ Accelerator scenario updates when extra payment changes
✓ Debt progress bar updates when expense logged as Debt Repayment
✓ All inputs use value || '' fix

.
Day 6 — Monthly Overview + Home Dashboard + PDF Export
Step 1: Build MonthlyOverview Page
src/pages/MonthlyOverview.tsx

  STATE: editingYear, editData { year, startingSalary, increment }

  COMPUTED (useMemo → budgetYears array):
  - loop 11 years from current year
  - year 0: startingSalary = monthlySalary
  - year N: startingSalary = previous year endingSalary
  - increment: use saved value OR period rate based on offset
    (≤ baseYear+7 → period1, ≤ baseYear+17 → period2, else period3)
  - endingSalary = startingSalary * (1 + increment/100)
  - calculate needs/wants/investments/debt/goals from endingSalary

  FUNCTIONS:
  - handleEdit(yearData) → set editingYear + editData
  - handleSave() → calculate endingSalary → dispatch UPDATE_BUDGET_YEAR
  - exportMonthlyData() → Papa.unparse(monthlySnapshots) → download
  - exportYearlyData() → Papa.unparse(yearlySnapshots) → download

  UI:
  - Monthly history panel (scrollable, reversed)
  - Yearly summary panel (scrollable, reversed)
  - Budget projections table (11 rows, editable increment column)
  - Salary growth line chart
  - Budget allocation growth line chart (5 datasets)


.
Step 2: Build Home Dashboard
src/pages/Home.tsx

  COMPUTED:
  - needsAmount, wantsAmount, investmentsAmount from state
  - currentMonthExpenses (filter dailyExpenses by current month)
  - currentMonthSpent per category (reduce)
  - remaining per category (budget - spent)

  UI:
  - 4 overview cards: salary, needs remaining, wants remaining, investments remaining
  - Quick actions grid (7 links to all pages with icons)
  - 4 Pie charts:
    Budget Allocation (needs/wants/investments)
    Needs Breakdown
    Wants Breakdown
    Investment Allocation

.
Step 3: Build PDF Export
src/components/PDFExport.tsx

  HELPERS:
  - addHeader(pdf, userName) → title, user, date, separator line
  - addFooter(pdf) → page X of Y on every page
  - addSectionTitle(pdf, title, y) → styled heading + underline
  - addSummaryCard(pdf, title, value, y, x, color) → colored rect + text

  MAIN: exportToPDF(state, userName)
  - new jsPDF('p', 'mm', 'a4')
  - addHeader
  - Summary cards: income, expenses, savings
  - autoTable: Budget Overview
  - autoTable: Needs + Wants Breakdown (side by side)
  - autoTable: Goals with drawn progress bars (didDrawCell)
  - autoTable: Debts with paid %
  - autoTable: Recent 20 expenses
  - addFooter
  - pdf.save(filename)

.
Step 4: Wire PDF into Navigation
Navigation.tsx
  - import exportToPDF
  - handleExportPDF = () => exportToPDF(state, userProfile?.name)
  - connect to Download PDF button

.
Day 6 Checklist
✓ Home shows correct remaining amounts per category
✓ All 4 pie charts render with real data
✓ Quick action links all work
✓ Monthly overview table shows 11 years
✓ Increment % is editable and saves
✓ Monthly/yearly snapshots appear after adding expenses
✓ Export CSV works for both monthly and yearly
✓ PDF downloads with all sections
✓ PDF shows goals with progress bars

.
Day 7 — Polish + Dark Mode + Notes + Deploy
Step 1: Dark Mode
- tailwind.config.js → darkMode: 'class'
- Navigation.tsx → toggle adds/removes 'dark' on document.documentElement
- localStorage.getItem('theme') on init
- Every component already has dark: classes → verify all pages look correct
- Test: toggle dark mode on every page

.
Step 2: Quick Notes (already in Navigation)
- Verify onSnapshot listener fires when notes change
- Verify updateNotesInDatabase saves to Firestore
- Test: add note → refresh → note still there
- Test: delete note → gone from Firestore

.
Step 3: Responsive Mobile Check
- Test Navigation hamburger menu on small screen
- Test all pages on mobile width (375px)
- Fix any overflow issues with tables (overflow-x-auto)
- Fix any grid columns that break on mobile

.
Step 4: Input Zero Bug Verification
- Test every number input on every page:
  BudgetSetup, DailyBudget, Needs, Wants,
  Investments, Goals, Debts
- Confirm: clicking field clears 0, can type new value

.
Step 5: Error Handling Check
- Try adding expense with no subcategory → toast error
- Try saving budget with > 100% allocation → toast error
- Try adding goal with 0 amount → alert
- Try adding debt with missing fields → alert
- Try logging in with wrong password → error message
- Try logging in without verifying email → blocked

.
Step 6: Firebase Security Rules
Firestore Rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /financeData/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /userNotes/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}

.
Step 7: Deploy to Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting
  → public directory: dist
  → single page app: yes
  → overwrite index.html: no

npm run build
firebase deploy

.
Day 7 Checklist
✓ Dark mode works on all pages
✓ Notes persist after refresh
✓ Mobile layout works on all pages
✓ All number inputs clear properly
✓ All error states show correct messages
✓ Firestore security rules deployed
✓ npm run build has no errors
✓ firebase deploy succeeds
✓ Live URL works end to end
✓ Sign up → verify → login → add data → PDF → logout

.
File Creation Order (Master List)
DAY 1:  firebase.ts, .env, AuthContext.tsx, AuthModal.tsx, App.tsx

DAY 2:  FinanceContext.tsx, Navigation.tsx, App.tsx (routing),
        pages/ (10 empty files)

DAY 3:  ChartComponents.tsx, BudgetSetup.tsx, DailyBudget.tsx

DAY 4:  Needs.tsx, Wants.tsx, Investments.tsx, Returns.tsx

DAY 5:  Goals.tsx, Debts.tsx

DAY 6:  MonthlyOverview.tsx, Home.tsx, PDFExport.tsx

DAY 7:  Polish, Rules, Deploy

