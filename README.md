# Biskra CS Student Helper - PWA

A Progressive Web App for calculating semester averages for Computer Science students at Biskra University.

## ✨ Features

- 📱 **Installable** - Works as a standalone app on mobile and desktop
- 🔌 **Offline Support** - Full functionality without internet connection
- 💾 **Data Persistence** - Your grades are saved locally
- 🎨 **Dark/Light Theme** - Toggle between themes
- 📊 **Semester Calculators** - S1 through S6 with proper module coefficients

## 🚀 PWA Features Implemented

### ✅ What's Included

1. **Manifest File** (`manifest.json`)
   - App name and description
   - Theme colors
   - App icons (192x192 and 512x512)
   - Display mode: standalone
   - Orientation: portrait-primary

2. **Service Worker** (`sw.js`)
   - Cache-first strategy for offline support
   - Automatic cache updates
   - Navigation routing
   - Version management (v3)

3. **Icons**
   - `icon-192.png` - For mobile devices
   - `icon-512.png` - For high-res displays
   - `icon.png` - Fallback icon

4. **Offline Persistence**
   - LocalStorage for grades and settings
   - Theme preference saved
   - Auto-save on input changes

## 📦 Files Structure

```
biskra-cs-helper/
├── index.html          # Main HTML file
├── app.js             # Application logic
├── style.css          # Styles with dark/light theme
├── sw.js              # Service Worker
├── manifest.json      # PWA manifest
├── icon.png           # App icon (512x512)
├── icon-192.png       # Small icon (192x192)
└── icon-512.png       # Large icon (512x512)
```

**Note**: Service Workers require HTTPS in production. Only `localhost` works with HTTP.

## 📱 Installing the PWA

### On Mobile (Android/iOS)

1. **Open the app in browser**
   - Chrome (Android) or Safari (iOS)

2. **Install prompt**
   - Chrome: Tap the "Add to Home Screen" prompt
   - Safari: Tap Share → Add to Home Screen

3. **Use as app**
   - Find the icon on your home screen
   - Opens in standalone mode (no browser UI)

### On Desktop (Chrome/Edge)

1. **Open the app**
   - Visit your deployed URL

2. **Install**
   - Look for install icon in address bar
   - Or: Menu → Install App

3. **Launch**
   - Opens in its own window
   - Appears in app launcher

## 🔧 Configuration

### Customizing Theme Colors

Edit `manifest.json`:
```json
"background_color": "#0a0a0a",  // Dark background
"theme_color": "#3b82f6",       // Blue accent
```

### Updating Cache Version

When you make changes, update the cache version in `sw.js`:
```javascript
const CACHE = "biskra-cs-v4";  // Increment version
```

### Adding More Files to Cache

Edit `ASSETS` array in `sw.js`:
```javascript
const ASSETS = [
  "/",
  "/index.html",
  "/your-new-file.js"  // Add here
];
```

## 🧪 Testing PWA Features

### Using Chrome DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check:
   - **Manifest**: Should show all details
   - **Service Workers**: Should be active
   - **Cache Storage**: Should show cached files
   - **Storage**: LocalStorage should save data

### Using Lighthouse

1. Open DevTools → Lighthouse tab
2. Select "Progressive Web App"
3. Run audit
4. Should score 90+ for PWA

### Testing Offline

1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh page
4. App should still work!

## 📊 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Manifest | ✅ | ✅ | ✅ | ✅ |
| Add to Home | ✅ | ✅ | ✅ | ✅ |
| Standalone Mode | ✅ | ❌ | ✅ | ✅ |

## 🐛 Troubleshooting

### Service Worker not registering

**Issue**: Console shows registration failed

**Solutions**:
- Ensure you're using HTTPS (or localhost)
- Check browser console for errors
- Clear cache: DevTools → Application → Clear storage

### App not updating

**Issue**: Changes don't appear

**Solutions**:
1. Update cache version in `sw.js`
2. Unregister old service worker:
   ```javascript
   // In console
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister())
   })
   ```
3. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### Icons not showing

**Issue**: Generic icon appears

**Solutions**:
- Check icon files are in root directory
- Verify paths in manifest.json
- Ensure icons are 512x512 and 192x192 PNG

### Data not persisting

**Issue**: Grades disappear on refresh

**Solutions**:
- Check browser allows localStorage
- Check browser console for quota errors
- Try different browser

## 🔒 Security & Privacy

- All data stored locally on device
- No server communication
- No tracking or analytics
- No personal data collected

## 📝 License

Free to use for Biskra University CS students.

## 👥 Credits

Made by:
- Abderrazak Achour - [GitHub](https://github.com/abderazak-py/)
- Farhat - [GitHub](https://github.com/Farhat-141)

## 🤝 Contributing

Found a bug? Have a feature request?
- Open an issue on GitHub
- Submit a pull request

## 📮 Support

For questions or issues:
1. Check the Troubleshooting section
2. Open a GitHub issue
3. Contact the developers

---

**Happy Calculating! 🎓📊**
