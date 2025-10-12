# Webhook Monitor Test UI - User Guide

## ✅ What Was Created

A **Fingerprint Monitor** component has been added to the Employee Dashboard that helps you test if your fingerprint machine is sending data to the webhook.

---

## 📍 Where to Find It

1. Open: http://localhost:5175
2. Login as: CODR034 (or any employee)
3. Go to: **Dashboard** (default page)
4. Look for: **"Fingerprint Monitor"** card (below Quick Actions)

---

## 🎯 How to Use

### **Step 1: Start Monitoring**

1. Find the "Fingerprint Monitor" card
2. Click **"Start Monitoring"** button
3. The card will turn blue and show "Monitoring Active"

### **Step 2: Punch on Fingerprint Machine**

1. Go to your fingerprint machine
2. **Punch your finger**
3. Watch the monitor on your dashboard

### **Step 3: See the Result**

**If Data is Received (Success):**
```
✅ Data Received!
Check-in at 14:30
Just now
```

**If No Data (Waiting):**
```
⏳ Waiting for fingerprint...
Punch on the machine now
Checking every 3 seconds... (9s)
```

---

## 🔍 What It Shows

### **When Monitoring:**
- 🔵 Blue border (monitoring active)
- ⏳ Spinning loader
- 📊 "Waiting for fingerprint..." message
- ⏱️ Time elapsed since monitoring started
- ⚠️ Warning if no data received

### **When Data Received:**
- ✅ Green checkmark icon
- 📅 Punch time (e.g., "14:30")
- ⏰ How long ago (e.g., "Just now" or "2 minutes ago")
- 🔴 Late badge (if late)
- 📊 Status (check-in or check-out)

### **Configuration Info:**
Shows at the bottom:
```
Webhook Configuration:
URL: http://192.168.68.133:5001/api/webhook/attendance  
Auth Key: c2750e75957b4c7c8627d0ca699409f3
```

---

## 🧪 Testing Flow

### **Normal Flow:**
1. Click "Start Monitoring"
2. See: "Waiting for fingerprint..."
3. Punch on machine
4. Within 3 seconds, see: "✅ Data Received!"
5. Click "Stop Monitoring" when done

### **If Nothing Happens:**
If you punch but still see "Waiting for fingerprint..." after 10+ seconds:

**This means your fingerprint machine is NOT configured correctly.**

You'll see a warning message:
```
⚠️ No data received yet
Make sure your fingerprint machine is configured to send data to:
http://192.168.68.133:5001/api/webhook/attendance
```

---

## 🔄 How It Works

### **Auto-Refresh:**
- Checks every **3 seconds** for new attendance data
- Updates automatically when data arrives
- Shows elapsed time

### **Manual Refresh:**
- Click **"Check Now"** button to check immediately
- Useful if you think data was received but not shown

### **Stop Monitoring:**
- Click **"Stop Monitoring"** to turn off
- Monitoring will stop checking
- Card returns to default state

---

## 💡 Use Cases

### **Use Case 1: Initial Setup**
When first setting up your fingerprint machine:
1. Start monitoring
2. Punch on machine  
3. Check if data arrives
4. If not → configure the machine

### **Use Case 2: Troubleshooting**
When employees say "my punch didn't work":
1. Start monitoring
2. Ask employee to punch again
3. See if data arrives
4. If yes → UI refresh issue
5. If no → machine configuration issue

### **Use Case 3: Testing After Configuration**
After configuring fingerprint machine:
1. Start monitoring
2. Test punch
3. Verify "✅ Data Received!" appears
4. Check time and status are correct

---

## 📊 Display Examples

### **Example 1: Successful Check-In**
```
╔══════════════════════════════════════╗
║  🔵 Fingerprint Monitor              ║
║  [Monitoring Active]                 ║
╠══════════════════════════════════════╣
║                                      ║
║  ✅ Data Received!                   ║
║  Check-in at 14:30                   ║
║  Just now                            ║
║  [Late by 270 mins]                  ║
║                                      ║
╠══════════════════════════════════════╣
║  [Check Now]  [Stop Monitoring]      ║
╚══════════════════════════════════════╝
```

### **Example 2: Waiting for Punch**
```
╔══════════════════════════════════════╗
║  🔵 Fingerprint Monitor              ║
║  [Monitoring Active]                 ║
╠══════════════════════════════════════╣
║                                      ║
║  ⏳ Waiting for fingerprint...       ║
║  Punch on the machine now            ║
║  Checking every 3 seconds... (15s)   ║
║                                      ║
╠══════════════════════════════════════╣
║  ⚠️  No data received yet            ║
║  Make sure your fingerprint machine  ║
║  is configured correctly             ║
╠══════════════════════════════════════╣
║  [Check Now]  [Stop Monitoring]      ║
╚══════════════════════════════════════╝
```

### **Example 3: Not Monitoring**
```
╔══════════════════════════════════════╗
║  🔷 Fingerprint Monitor              ║
║  [Monitoring Off]                    ║
╠══════════════════════════════════════╣
║  ℹ️  Click "Start Monitoring" then   ║
║  punch on your fingerprint machine.  ║
║  This will show when data is         ║
║  received.                           ║
╠══════════════════════════════════════╣
║                                      ║
║  👆 Start monitoring to test         ║
║                                      ║
╠══════════════════════════════════════╣
║  [Start Monitoring]                  ║
╚══════════════════════════════════════╝
```

---

## 🐛 Troubleshooting

### **Problem 1: "Waiting..." Never Changes**

**Symptom:** Monitoring shows "Waiting..." even after punching

**Cause:** Fingerprint machine not sending data

**Solution:**
1. Check machine configuration
2. Verify URL is correct
3. Verify auth key is correct
4. Check network connectivity
5. See `WEBHOOK_IMPLEMENTATION_COMPLETE.md` for configuration

### **Problem 2: Shows Old Data**

**Symptom:** Monitor shows check-in from earlier today

**Cause:** No new data received, showing existing record

**Fix:** 
- If the time shown is more than 5 minutes ago, it will show "[Old Record]" badge
- Click "Check Now" to refresh
- Try punching again

### **Problem 3: Monitor Not Visible**

**Symptom:** Can't find the Fingerprint Monitor

**Solution:**
1. Make sure you're on the Dashboard page
2. Scroll down below "Quick Actions"
3. Look for blue/gray card with fingerprint icon
4. Refresh the page (F5)

---

## 🎨 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔵 Blue border | Monitoring active |
| ⚪ Gray border | Monitoring off |
| ✅ Green checkmark | Data received |
| ⏳ Spinning loader | Waiting for data |
| 🔴 Red/Orange badge | Late check-in |
| ⚠️ Warning box | No data received (configure machine) |
| ℹ️ Info box | Instructions |

---

## ⚡ Quick Reference

| Action | Button | Result |
|--------|--------|--------|
| Start testing | "Start Monitoring" | Begins checking every 3s |
| Check immediately | "Check Now" | Checks right away |
| Stop testing | "Stop Monitoring" | Stops checking |
| View config | Scroll to bottom | Shows webhook URL & key |

---

## 📱 Mobile View

The monitor is **responsive** and works on:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile phone

On mobile, it appears full-width below Quick Actions.

---

## 🔐 Security

- Only shows data for the **logged-in employee**
- Requires authentication (login)
- Auth key is displayed for configuration reference
- No sensitive data exposed

---

## 🎯 Success Criteria

**You know it's working when:**
1. ✅ You click "Start Monitoring"
2. ✅ You punch on the fingerprint machine
3. ✅ Within 3-10 seconds, you see "✅ Data Received!"
4. ✅ The time matches when you punched
5. ✅ The status is correct (check-in/check-out)

---

## 📞 Next Steps

### **If It Works:**
1. ✅ Fingerprint machine is configured correctly
2. ✅ Webhook is receiving data
3. ✅ Data is being saved to database
4. ✅ UI will update automatically when employees punch

### **If It Doesn't Work:**
1. ❌ Configure your fingerprint machine
2. ❌ Use the webhook URL and auth key shown
3. ❌ See `WEBHOOK_IMPLEMENTATION_COMPLETE.md` for help
4. ❌ Test with cURL first (see documentation)

---

## 📖 Related Documentation

- `WEBHOOK_IMPLEMENTATION_COMPLETE.md` - Full webhook setup guide
- `WEBHOOK_API_DOCUMENTATION.md` - API reference
- `DEBUG_UI_NOT_UPDATING.md` - Troubleshooting guide

---

**The Fingerprint Monitor makes it easy to test if your biometric device is sending data to the system!** 🎉

