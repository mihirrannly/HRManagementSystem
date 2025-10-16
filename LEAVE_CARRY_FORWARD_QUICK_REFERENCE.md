# Leave Carry Forward System - Quick Reference

## 📋 Quick Overview

### Monthly Allocation Rules

| Leave Type | Monthly Base | Carry Forward | Max Per Month |
|------------|--------------|---------------|---------------|
| **Casual Leave** | 1 | ✅ Yes (up to 2) | 3 |
| **Sick Leave** | 1 | ❌ No | 1 |
| **Special Leave** | N/A | ❌ No | 3/year |

---

## 🎯 Carry Forward Logic

### Casual Leave Only

```
If you don't use casual leave for 2 consecutive months:
→ You get EXTRA leaves in the 3rd month!

Examples:
• Unused in June & July → 3 leaves in August (1 + 2 carry)
• Unused in June only → 2 leaves in August (1 + 1 carry)  
• Used in both months → 1 leave in August (1 base only)
```

### Sick Leave - No Carry Forward

```
Always 1 sick leave per month
No accumulation, no carry forward
```

---

## 🌟 Practical Examples

### Scenario 1: Save for a Long Break

```
Month    Action          Available
Jan      No leave        1
Feb      No leave        1  
Mar      Take 3 days     3 (1+2 carry) → Take mini vacation!
```

### Scenario 2: Regular Usage

```
Month    Action          Available
Jan      Take 1 day      1
Feb      Take 1 day      1
Mar      Take 1 day      1 (no carry forward)
```

### Scenario 3: Strategic Planning

```
Q1: Save both months → Get 3 leaves in March
Q2: Save both months → Get 3 leaves in June  
Q3: Save both months → Get 3 leaves in September
Q4: Save both months → Get 3 leaves in December

Result: Four 3-day breaks per year!
```

---

## 💡 Tips for Employees

### Maximize Your Leaves

1. **Plan Ahead:** Know when you want longer breaks
2. **Save Smart:** Don't use casual leaves for 2 months before planned vacation
3. **Track Usage:** Check your monthly balance regularly
4. **Combine Strategically:** Use carry forward + weekends for extended breaks

### Example: 5-Day Break Planning

```
Strategy: Save leaves in May & June for July vacation

May:     [Weekend] [5 workdays] [Weekend] → No leave
June:    [Weekend] [5 workdays] [Weekend] → No leave
July:    [Sat Sun] [3 CL days] [Thu Fri Weekend] = 7 days off!
         ↑         ↑            ↑
         Weekend   Carried      Take as unpaid
                   Forward      or plan around
```

---

## 📱 Where to See Your Balance

### Leave Management Page

**Location:** Navigation → Leave → Leave Management

**What You'll See:**

```
Leave Balances                Current Month: October 2025

┌─────────────────────────────┐
│ 🟢 Casual Leave              │
│                              │
│ This Month (October)         │
│ 3 / 3 available              │
│ Base: 1 + 2 carry forward    │
│ 🎉 Extra 2 leave(s)!         │
│                              │
│ Yearly Balance               │
│ 10 / 12 available            │
└─────────────────────────────┘
```

---

## ⚠️ Important Notes

### What You MUST Know

1. **Yearly Limit Still Applies**
   - Even with carry forward, you can't exceed yearly allocation
   - Example: If yearly balance is 10, you can't take 3 leaves even if monthly shows 3

2. **Consecutive Months Required**
   - Must be 2 consecutive months of no usage
   - Jan unused + Mar unused ≠ carry forward (Feb in between)

3. **Start of Year**
   - January: No carry forward (start of year)
   - February: Max 1 carry forward (only 1 previous month)
   - March onwards: Max 2 carry forward

4. **Sick Leaves Never Carry**
   - Always 1 per month
   - No exceptions

---

## 🚦 Quick Decision Guide

### Should I Take Leave This Month?

```
Ask yourself:

1. Do I really need leave now?
   NO → Save it for carry forward
   YES → Continue to Q2

2. Am I planning a trip in 2 months?
   YES → Save for carry forward
   NO → Continue to Q3

3. Did I already use leave last month?
   YES → Okay to use this month (no carry forward anyway)
   NO → Maybe save for carry forward

4. Is it an emergency?
   YES → Take the leave! (or use sick leave if applicable)
   NO → Consider saving
```

---

## 📞 Common Questions

**Q: Can I carry forward sick leaves?**
A: No, only casual leaves carry forward.

**Q: What's the maximum carry forward?**
A: 2 casual leaves (from 2 unused months).

**Q: Do carried leaves expire?**
A: Yes, they're only available in the next month. Use it or lose it.

**Q: Can I see my carry forward history?**
A: Yes, check the monthly breakdown in Leave Management.

**Q: What if I have 3 carried leaves but only 2 yearly balance left?**
A: You can only use 2 (yearly balance takes precedence).

**Q: Do special leaves carry forward?**
A: No, only casual leaves carry forward.

---

## 🎓 Pro Tips

### Advanced Strategies

1. **Weekend Extension**
   ```
   Plan leaves adjacent to weekends
   Example: 3 CL + Weekend = 5 days off
   ```

2. **Holiday Combination**
   ```
   Save for months with public holidays
   Example: 3 CL + Holiday + Weekend = 6+ days off
   ```

3. **Quarterly Planning**
   ```
   Target one 3-day break per quarter
   Save 2 months → Use carry forward in 3rd month
   ```

4. **Emergency Reserve**
   ```
   Don't always use carry forward
   Keep some balance for unexpected situations
   ```

---

## 📊 Visual Summary

### Carry Forward Flow

```
Month 1: Don't use CL → [Saved: 1]
           ↓
Month 2: Don't use CL → [Saved: 1+1 = 2]
           ↓
Month 3: Available → [Base: 1] + [Carry: 2] = 3 CL! ✨
```

### Usage Impact

```
Scenario A (Regular):
Jan [1] → Feb [1] → Mar [1] → Apr [1] → May [1]
Total used: 5 days across 5 months

Scenario B (Strategic):
Jan [0] → Feb [0] → Mar [3] → Apr [0] → May [0]
Total used: 3 days, still got 3-day break!
```

---

## ✅ Checklist

### Before Requesting Leave

- [ ] Check monthly available balance
- [ ] Check yearly available balance
- [ ] Consider carry forward opportunity
- [ ] Verify leave type (casual/sick)
- [ ] Check approval requirements
- [ ] Plan handover if needed

### After Leave Approved

- [ ] Verify balance updated
- [ ] Plan next month's usage
- [ ] Update personal calendar
- [ ] Inform team members

---

## 🔗 Need More Details?

See [LEAVE_CARRY_FORWARD_SYSTEM.md](LEAVE_CARRY_FORWARD_SYSTEM.md) for:
- Technical implementation details
- Database schema
- API documentation
- Troubleshooting guide

---

**Quick Help:** Navigate to Leave Management → Check "This Month" section for current balance

**Last Updated:** October 15, 2025

