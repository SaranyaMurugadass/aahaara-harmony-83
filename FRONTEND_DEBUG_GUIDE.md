# Frontend 400 Error Debug Guide

## 🎯 **The Problem**
You're getting 400 errors from the frontend, but the API is working perfectly. This means the issue is in the frontend request.

## ✅ **What's Working**
- ✅ Django Backend: Running perfectly
- ✅ API Endpoints: All working (201 responses)
- ✅ CORS: Properly configured
- ✅ Data Structure: Correct

## 🔍 **Debug Steps**

### 1. **Clear Browser Cache**
```bash
# Hard refresh your browser
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

### 2. **Check Browser Console**
1. Open your frontend: `http://localhost:8080`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try to register a doctor
5. Look for any error messages

### 3. **Check Network Tab**
1. In Developer Tools, go to **Network** tab
2. Try to register a doctor
3. Look for the request to `/api/auth/register/doctor/`
4. Click on it to see:
   - **Request Headers**
   - **Request Payload**
   - **Response**

### 4. **Check Form Fields**
Make sure all required fields are filled:
- ✅ Username
- ✅ Email
- ✅ Password (8+ characters)
- ✅ First Name
- ✅ Last Name
- ✅ Qualification
- ✅ Experience Years
- ✅ License Number
- ✅ Specialization

### 5. **Test with Different Data**
Try registering with:
- **Username**: `test_doctor_123`
- **Email**: `test_doctor_123@example.com`
- **Password**: `testpass123`
- **First Name**: `Test`
- **Last Name**: `Doctor`
- **Qualification**: `BAMS`
- **Experience**: `10`
- **License**: `LIC123`
- **Specialization**: `general`
- **Bio**: `Test doctor`
- **Consultation Fee**: `500`

## 🚀 **Quick Fixes**

### Fix 1: Restart Both Servers
```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Backend
python manage.py runserver

# Frontend (in new terminal)
npm run dev
```

### Fix 2: Check Ports
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000`

### Fix 3: Clear All Data
1. Clear browser cache
2. Clear localStorage
3. Try in incognito/private mode

## 🔧 **If Still Not Working**

### Check the Network Request
1. Open Network tab in browser
2. Try registration
3. Look for the request to `/api/auth/register/doctor/`
4. Check if it shows:
   - **Status**: 400
   - **Request Payload**: All fields present
   - **Response**: Error details

### Common Issues:
1. **Missing fields** - Form not sending all data
2. **Validation errors** - Frontend validation failing
3. **Network issues** - Request not reaching server
4. **CORS issues** - Browser blocking request
5. **Cache issues** - Old code running

## 📞 **Need Help?**
If you're still getting 400 errors, please share:
1. **Browser Console errors**
2. **Network tab request details**
3. **What fields you're filling**
4. **Any error messages**

The API is working perfectly, so it's definitely a frontend issue!
