# Day 1 → Project Setup + Firebase + Auth
# Day 2 → Core State (FinanceContext) + Layout
# Day 3 → Budget Setup + Daily Budget Tracker
# Day 4 → Needs + Wants + Investments + Returns
# Day 5 → Goals + Debts
# Day 6 → Monthly Overview + Charts + PDF
# Day 7 → Polish + Dark Mode + Notes + Deploy

---

# PRE-SETUP (Before Day 1)

## Install Required Software

1. Download & install Node.js from nodejs.org (LTS version)
2. Download & install VS Code from code.visualstudio.com
3. Install VS Code extensions:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - TypeScript Hero
   - Prettier - Code formatter
4. Open terminal in VS Code (`Ctrl + \``)

---

# Overview Before Starting

- Day 1 → Project Setup + Firebase + Auth
- Day 2 → Core State (FinanceContext) + Layout
- Day 3 → Budget Setup + Daily Budget Tracker
- Day 4 → Needs + Wants + Investments + Returns
- Day 5 → Goals + Debts
- Day 6 → Monthly Overview + Charts + PDF
- Day 7 → Polish + Dark Mode + Notes + Deploy

---

# Day 1 — Project Setup + Firebase + Authentication

## Step 1: Initialize Project

```bash
npm create vite@latest finovest -- --template react-ts
cd finovest
npm install
```

---

## Step 2: Install All Dependencies at Once

```bash
npm install firebase react-router-dom tailwindcss postcss autoprefixer
npm install chart.js react-chartjs-2 lucide-react
npm install react-hot-toast papaparse jspdf jspdf-autotable
npm install @types/papaparse
npx tailwindcss init -p
```

---

## Step 3: Configure Tailwind

Edit `tailwind.config.js`
- add content paths
- enable `darkMode: 'class'`

Edit `index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 4: Create Firebase Project

- Go to console.firebase.google.com
- Create new project → `finovest`
- Enable Authentication → Email/Password
- Enable Firestore Database → Start in production mode
- Add Firestore rules (allow read/write if auth)
- Copy config keys

---

## Step 5: Create Files

```txt
src/
  firebase.ts          ← initializeApp, export auth, export db
  .env                 ← VITE_FIREBASE_API_KEY etc.
```

---

## Step 6: Build AuthContext

### `src/context/AuthContext.tsx`

- `onAuthStateChanged` listener
- fetch `userProfile` from Firestore `users/uid`
- provide:
  - currentUser
  - userProfile
  - isLoading
  - logout()

---

## Step 7: Build AuthModal

### `src/components/AuthModal.tsx`

- Login form (email + password)
- Signup form (name + email + password)
- `createUserWithEmailAndPassword`
- `sendEmailVerification`
  - signOut
  - show verify screen
- `signInWithEmailAndPassword`
  - check `emailVerified`
- error handling for all Firebase error codes

---

## Step 8: Build App.tsx Shell

### `src/App.tsx`

- import `useAuth`
- if `isLoading` → spinner
- if no user → landing page + AuthModal
- if user → placeholder `"Dashboard coming soon"`

---

# Day 1 Checklist

- ✓ Vite project running on localhost:5173
- ✓ Tailwind working (test with a colored div)
- ✓ Firebase connected (no console errors)
- ✓ Can sign up with email
- ✓ Verification email received
- ✓ Can log in after verifying
- ✓ Logout works
- ✓ App shows different screens for logged in/out

---

# Day 2 — FinanceContext (State) + Navigation + Routing

## Step 1: Define All TypeScript Interfaces

### `src/context/FinanceContext.tsx`

Add interfaces:

- DailyExpense
- FinancialGoal
- Debt
- BudgetYear
- MonthlySnapshot
- YearlySnapshot
- NeedsBreakdown
- WantsBreakdown
- InvestmentAllocation
- InvestmentReturns
- FinanceState (master interface)

---

## Step 2: Define initialState

- monthlySalary: 36300
- needsPercent: 45
- wantsPercent: 25
- investmentsPercent: 20
- debtRepaymentPercent: 10
- goalContributionsPercent: 0
- inflationRate: 6
- incrementRates:
  - period1: 10
  - period2: 8
  - period3: 6
- default categories for needs, wants, investments
- default breakdown values
- empty arrays for:
  - expenses
  - goals
  - debts
  - snapshots
  - notes

---

## Step 3: Define All Reducer Actions (type union)

```txt
UPDATE_SALARY
UPDATE_ALLOCATION
UPDATE_INFLATION

ADD/UPDATE/DELETE_EXPENSE

UPDATE_NEEDS/WANTS/INVESTMENT_BREAKDOWN

ADD/REMOVE_NEEDS/WANTS/INVESTMENT_CATEGORY

ADD/UPDATE/DELETE_GOAL

ADD/UPDATE/DELETE_DEBT

CREATE_MONTHLY/YEARLY_SNAPSHOT

UPDATE_BUDGET_YEAR

SET_NOTES
LOAD_DATA
```

---

## Step 4: Write financeReducer

- Write each case one by one
- `ADD_EXPENSE`
  - auto-updates goal/debt if category matches
- `UPDATE_SALARY`
  - proportionally rescales all breakdowns
- `CREATE_MONTHLY_SNAPSHOT`
  - aggregates expenses for that month
- `CREATE_YEARLY_SNAPSHOT`
  - aggregates monthly snapshots
- `LOAD_DATA`
  - spread initialState then override with payload

---

## Step 5: Write FinanceProvider

- `useReducer(financeReducer, initialState)`

### Effects

#### Effect 1
- load from Firestore on login

#### Effect 2
- save to Firestore on state change
- skip if not loaded
- auto-dispatch:
  - CREATE_MONTHLY_SNAPSHOT
  - CREATE_YEARLY_SNAPSHOT

#### Effect 3
- `onSnapshot` for notes (real-time)

### Functions

- `updateNotesInDatabase()`

### Provide

- state
- dispatch
- updateNotesInDatabase

---

## Step 6: Build Navigation

### `src/components/Navigation.tsx`

- Desktop nav:
  - Logo
  - Links (Dashboard/Goals/Debts)
  - buttons

- Mobile nav:
  - hamburger menu
  - same links

- Contact Us button
  - modal with email/phone

- Quick Note button
  - modal with add/delete notes

- Dark mode toggle
  - localStorage
  - document.documentElement.classList

- Download PDF button
  - calls `exportToPDF` (stub for now)

- User name display
- Logout button

---

## Step 7: Set Up Routing in App.tsx

### `src/App.tsx`

- wrap with:
  - `<FinanceProvider>`
  - `<Router>`

- add:
  - `<Navigation>`
  - `<Routes>`

- create placeholder routes for all 10 pages

---

## Step 8: Create Empty Page Files

```txt
src/pages/

Home.tsx
DailyBudget.tsx
BudgetSetup.tsx
Needs.tsx
Wants.tsx
Investments.tsx
Returns.tsx
Goals.tsx
Debts.tsx
MonthlyOverview.tsx
```

Each just returns:

```tsx
<div>Page Name</div>
```

---

# Day 2 Checklist

- ✓ FinanceContext loads data from Firestore on login
- ✓ FinanceContext saves data to Firestore on change
- ✓ Navigation renders on desktop and mobile
- ✓ Dark mode toggle works
- ✓ All 10 routes accessible (showing placeholder text)
- ✓ No TypeScript errors

---

# Day 3 — Budget Setup + Daily Budget Tracker

## Step 1: Build ChartComponents

### `src/components/ChartComponents.tsx`

- Register all Chart.js components at top

Export:
- PieChart
- BarChart
- LineChart

Props:
- data
- title?

All use:

```ts
responsive: true
```

---

## Step 2: Build BudgetSetup Page

### `src/pages/BudgetSetup.tsx`

## STATE

- localSalary
- needsAmount
- wantsAmount
- investmentsAmount
- debtRepaymentAmount
- goalContributionsAmount

All initialized from context state.

Use `useEffect` to sync when context state changes.

---

## COMPUTED

- needsPercent = needsAmount / localSalary * 100
- totalAllocatedAmount
- totalPercent
- savingsAccountBalance

---

## UI

- Salary input (₹ prefix)
- 5 allocation inputs
  - Needs
  - Wants
  - Investments
  - Debt
  - Goals

Each shows:
- ₹ input
- auto % label

Features:
- Total allocation progress bar
  - red if > 100%
- Savings Hub card
- Save button
  - dispatch:
    - UPDATE_SALARY
    - UPDATE_ALLOCATION

Use:

```tsx
value || ''
```

on all number inputs.

---

## Step 3: Build DailyBudget Page

### `src/pages/DailyBudget.tsx`

## STATE

```ts
newExpense: {
  date,
  category,
  subcategory,
  amount,
  notes
}
```

- showBudgetAlert
- expenseToAdd
- alertDetails

---

## COMPUTED

- categoryBudgets
- currentMonthExpenses
- spentByCategory

---

## FUNCTIONS

### `getSubcategories(category)`

Returns:
- Needs → needsCategories values
- Wants → wantsCategories values
- Investments → investmentCategories values
- Debt Repayment → debts[].name
- Goal Contributions → goals[].name

---

### `handleAddExpense()`

- validate amount > 0
- validate subcategory selected
- find subcategory budget
- if limit exceeded:
  - show alert modal
- else:
  - confirmAndAddExpense()

---

### `confirmAndAddExpense()`

- dispatch ADD_EXPENSE
- reset form

---

## UI

- 5 budget overview cards
  - budget
  - spent
  - remaining

- AlertTriangle icon if near/over limit

- Add transaction form (6 columns)

- Info box explaining Goals/Debts tracking

- Recent transactions table
  - last 10
  - reversed
  - category badges
  - delete button

- Budget Alert Modal
  - budget
  - spent
  - new balance

Buttons:
- Cancel
- Proceed Anyway

- Export CSV button (`Papa.unparse`)
- Import CSV (`Papa.parse`)

---

# Day 3 Checklist

- ✓ Can set salary and allocations, save persists to Firestore
- ✓ % auto-calculates as you type amounts
- ✓ Can add expense with all 5 categories
- ✓ Subcategory dropdown changes based on category
- ✓ Budget alert fires when limit exceeded
- ✓ Can proceed anyway or cancel
- ✓ Transactions appear in table
- ✓ Can delete a transaction
- ✓ Export CSV downloads file
- ✓ Import CSV adds expenses
- ✓ 0 stays blank in inputs (`value || '' fix`)

---

# Day 4 — Needs + Wants + Investments + Returns

## Step 1: Build Needs Page

### `src/pages/Needs.tsx`

## STATE

- newCategoryName
- editingCategory
- editingName

---

## FUNCTIONS

- `handleBreakdownChange`
- `addCategory`
- `removeCategory`
- `startEditing`
- `saveEdit`
- `cancelEdit`

---

## UI

- 4 overview cards
- Add category input
- Category allocation list
- Progress bars
- Total summary
- Pie chart
- Category summary
- Tips section

---

## Step 2: Build Wants Page

### `src/pages/Wants.tsx`

Identical structure to Needs.tsx

Changes:
- uses `wantsBreakdown`
- uses `wantsCategories`
- dispatch:
  - UPDATE_WANTS_BREAKDOWN
  - ADD/REMOVE_WANTS_CATEGORY
- green color theme

---

## Step 3: Build Investments Page

### `src/pages/Investments.tsx`

## FUNCTIONS

- handleAllocationChange
- handleReturnsChange
- addCategory
- removeCategory
- startEditing
- saveEdit
- cancelEdit

### `calculateFutureValue(years)`

```txt
monthlyReturn = annualReturn / 12

FV = monthly * (((1 + monthlyReturn)^months - 1) / monthlyReturn)

realValue = FV / (1 + inflationRate)^years
```

---

## UI

- 4 overview cards
- Add category input
- Investment allocation list
- return % input
- Pie chart
- Projections table
- Line chart

---

## Step 4: Build Returns Page

### `src/pages/Returns.tsx`

## FUNCTIONS

### `calculateReturns(years)`

- same FV formula as Investments
- calculates:
  - totalInvested
  - gains
  - realGains

---

## DATA

```ts
milestones = [5, 10, 15, 20, 25, 30]
```

---

## UI

- 4 cards
- Returns summary table
- 3 insight cards
- Bar chart

---

# Day 4 Checklist

- ✓ Needs: can add/rename/delete categories, amounts save
- ✓ Wants: same as Needs
- ✓ Investments: allocation + return % inputs work
- ✓ Investments: projections table calculates correctly
- ✓ Returns: all milestones calculate correctly
- ✓ Charts render on all 4 pages
- ✓ All inputs use `value || ''`

---

# Day 5 — Goals + Debts

## Step 1: Build Goals Page

### `src/pages/Goals.tsx`

## STATE

```ts
newGoal: {
  name,
  targetAmount,
  deadline
}
```

- editingGoalId
- editFormData

---

## FUNCTIONS

- handleAddGoal
- handleDeleteGoal
- handleStartEdit
- handleUpdateGoal

### `getGoalSuggestion(goal)`

- calculate monthsRemaining
- calculate requiredMonthlySaving
- compare with goal allocation
- return:
  - success
  - warning
  - error

---

## UI

- Add goal form
- Goals grid
- Progress bars
- Suggestion badges

---

## Step 2: Build Debts Page

### `src/pages/Debts.tsx`

## STATE

```ts
newDebt: {
  name,
  totalAmount,
  interestRate,
  minimumPayment
}
```

- editingDebtId
- editFormData
- scenarioExtraPayment
- scenarioDuration

---

## FUNCTIONS

- handleAddDebt
- handleDeleteDebt
- handleStartEdit
- handleUpdateDebt
- handleCancelEdit

### `calculatePayoff()`

Strategies:
- snowball
- avalanche

Logic:
- apply monthly interest
- pay minimums
- apply extra payments
- move snowball balance when debt closes

Returns:
- months
- totalInterest

---

## COMPUTED

```ts
snowballPlan
avalanchePlan
acceleratedPlan
```

---

## UI

- Add debt form
- Strategy cards
- Payoff Accelerator
- Debt list
- Progress bars

---

# Day 5 Checklist

- ✓ Can add/edit/delete goals
- ✓ Progress bar updates when expense logged as Goal Contribution
- ✓ Goal suggestion shows correct status
- ✓ Can add/edit/delete debts
- ✓ Snowball and Avalanche show different month counts
- ✓ Accelerator scenario updates when extra payment changes
- ✓ Debt progress bar updates when expense logged as Debt Repayment
- ✓ All inputs use `value || ''`

---

# Day 6 — Monthly Overview + Home Dashboard + PDF Export

## Step 1: Build MonthlyOverview Page

### `src/pages/MonthlyOverview.tsx`

## STATE

```ts
editingYear
editData {
  year,
  startingSalary,
  increment
}
```

---

## COMPUTED

- loop 11 years
- calculate:
  - startingSalary
  - endingSalary
  - increment
  - allocations

---

## FUNCTIONS

- handleEdit
- handleSave

### CSV Export

- exportMonthlyData()
- exportYearlyData()

Uses:
- `Papa.unparse`

---

## UI

- Monthly history panel
- Yearly summary panel
- Budget projections table
- Salary growth chart
- Allocation growth chart

---

## Step 2: Build Home Dashboard

### `src/pages/Home.tsx`

## COMPUTED

- needsAmount
- wantsAmount
- investmentsAmount
- currentMonthExpenses
- remaining balances

---

## UI

- 4 overview cards
- Quick actions grid
- 4 pie charts

---

## Step 3: Build PDF Export

### `src/components/PDFExport.tsx`

## HELPERS

- addHeader
- addFooter
- addSectionTitle
- addSummaryCard

---

## MAIN

### `exportToPDF(state, userName)`

- new jsPDF
- addHeader
- Summary cards
- Budget Overview
- Needs/Wants tables
- Goals table
- Debts table
- Recent expenses
- addFooter
- save PDF

---

## Step 4: Wire PDF into Navigation

### `Navigation.tsx`

```ts
handleExportPDF = () => exportToPDF(state, userProfile?.name)
```

Connect to:
- Download PDF button

---

# Day 6 Checklist

- ✓ Home shows correct remaining amounts per category
- ✓ All 4 pie charts render with real data
- ✓ Quick action links all work
- ✓ Monthly overview table shows 11 years
- ✓ Increment % is editable and saves
- ✓ Monthly/yearly snapshots appear after adding expenses
- ✓ Export CSV works for both monthly and yearly
- ✓ PDF downloads with all sections
- ✓ PDF shows goals with progress bars

---

# Day 7 — Polish + Dark Mode + Notes + Deploy

## Step 1: Dark Mode

- `tailwind.config.js`
  - `darkMode: 'class'`

- `Navigation.tsx`
  - toggle adds/removes `dark`

- use:
  - `localStorage.getItem('theme')`

- verify all pages

---

## Step 2: Quick Notes

- Verify `onSnapshot`
- Verify Firestore save
- Add note → refresh → persists
- Delete note → removed

---

## Step 3: Responsive Mobile Check

- Test mobile nav
- Test all pages at 375px
- Fix overflow issues
- Fix responsive grids

---

## Step 4: Input Zero Bug Verification

Test all pages:
- BudgetSetup
- DailyBudget
- Needs
- Wants
- Investments
- Goals
- Debts

Verify:
- clicking field clears 0
- typing works normally

---

## Step 5: Error Handling Check

Test:
- expense with no subcategory
- budget > 100%
- invalid goal
- invalid debt
- wrong password
- unverified email login

---

## Step 6: Firebase Security Rules

```js
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
```

---

## Step 7: Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

Options:
- public directory: `dist`
- single page app: `yes`
- overwrite index.html: `no`

---

## Build & Deploy

```bash
npm run build
firebase deploy
```

---

# Day 7 Checklist

- ✓ Dark mode works on all pages
- ✓ Notes persist after refresh
- ✓ Mobile layout works on all pages
- ✓ All number inputs clear properly
- ✓ All error states show correct messages
- ✓ Firestore security rules deployed
- ✓ npm run build has no errors
- ✓ firebase deploy succeeds
- ✓ Live URL works end to end
- ✓ Sign up → verify → login → add data → PDF → logout

---

# File Creation Order (Master List)

## DAY 1

```txt
firebase.ts
.env
AuthContext.tsx
AuthModal.tsx
App.tsx
```

---

## DAY 2

```txt
FinanceContext.tsx
Navigation.tsx
App.tsx (routing)
pages/ (10 empty files)
```

---

## DAY 3

```txt
ChartComponents.tsx
BudgetSetup.tsx
DailyBudget.tsx
```

---

## DAY 4

```txt
Needs.tsx
Wants.tsx
Investments.tsx
Returns.tsx
```

---

## DAY 5

```txt
Goals.tsx
Debts.tsx
```

---

## DAY 6

```txt
MonthlyOverview.tsx
Home.tsx
PDFExport.tsx
```

---

## DAY 7

```txt
Polish
Rules
Deploy
```
