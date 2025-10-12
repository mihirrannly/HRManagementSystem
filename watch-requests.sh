#!/bin/bash
echo "🔍 Watching for attendance requests..."
echo "Keep this terminal open and click 'Check In' in your browser"
echo "Press Ctrl+C to stop"
echo ""
echo "Waiting for requests..."
echo "================================"
tail -f backend.log | grep --line-buffered -E "(Check-in|checkin|checkout|Webhook|POST /api/attendance|📥|📤|Error|CODR034)"
