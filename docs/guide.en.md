## What it's for

A profitable business can still run short of cash: the client pays in three months, the rent is due tomorrow. This script projects your cash month by month from your receipts and expenses (one-off or recurring), shows the **first negative month** and estimates your **runway**.

## Before you start

- A CSV: `date`, `label`, `amount` (positive = money in, negative = expense), `recurrence` (`none`, `weekly`, `monthly`, `yearly`), `end` (optional).
- Your current balance.

## Step by step

1. List your known flows: rent, salaries, subscriptions, expected invoices.
2. Run the 6-month projection:
   ```bash
   node src/cashflow-forecast.mjs samples/tresorerie.csv --balance 300000 --months 6
   ```
3. Test assumptions: push a receipt back in the CSV, run again, compare.

## Reading the output

A table: in, out, net and month-end balance, with `⚠` when the balance drops below zero. Runway = starting balance ÷ average monthly deficit (the sum of the deficits of negative months divided by the number of months projected). A "monthly" flow on the 31st falls back to the last day of shorter months.

## Automating it

Update the CSV weekly and re-run; the exit code is 2 if the balance goes negative, which allows an alert.

## Pitfalls

- It projects **what you put in**: without unexpected flows, it is optimistic.
- Plan for late payments: shift your receipts by 30 days to see the cautious scenario.
