# Quick Visual Test Guide

## Before You Click Check-In:

1. Open: http://localhost:5175
2. Login as: CODR034
3. Go to: Dashboard (should be the default page)

## Look for this section:
```
┌─────────────────────────────────┐
│ Today's Status                  │
│ Thursday, October 10, 2025      │
│                                 │
│ Status: _____________           │  ← What does it say?
│ Buttons: _____________          │  ← What buttons do you see?
└─────────────────────────────────┘
```

## Write down:
- Current Status: _______________
- Buttons visible: _______________
- Current time shown: _______________

## Now Click "Check In"

## What happens IMMEDIATELY:
1. Green notification appears? YES / NO
2. What does the notification say? _______________
3. Button changes? YES / NO
4. Time appears? YES / NO

## After 2 seconds:
1. Check-in time shows? YES / NO
2. If yes, what time: _______________
3. Status changed? YES / NO
4. If yes, new status: _______________

## Then run this command:
```bash
node check-attendance-status.js
```

Did it save to database? YES / NO

