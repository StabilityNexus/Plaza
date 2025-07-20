# Mapbox Setup Instructions

## Required for Map Location Picker Feature

To enable the interactive map location selector in your Create Project form, you need to configure a Mapbox access token.

### Steps:

1. **Get a Mapbox Access Token** (Free)
   - Go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
   - Sign up for a free account if you don't have one
   - Create a new access token or use the default public token

2. **Create Environment File**
   - Navigate to your `src/` folder
   - Create a new file named `.env.local`
   - Add the following line to the file:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_actual_token_here
   ```
   - Replace `your_actual_token_here` with the token you got from Mapbox

3. **Restart Your Development Server**
   - Stop your current `npm run dev` process (Ctrl+C)
   - Start it again: `npm run dev`

### Example `.env.local` file:
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsaXNuaXJuOTBybDMza2w3cjIxMTg1NTQifQ.example_token_string
```

### Security Note:
- The `.env.local` file is automatically ignored by git (it's in `.gitignore`)
- Never commit your actual token to version control
- The `NEXT_PUBLIC_` prefix makes it available in the browser (required for Mapbox)

### After Setup:
Once configured, the map location picker will work perfectly:
- ✅ Interactive Mapbox map
- ✅ Click to select coordinates
- ✅ Visual pin markers
- ✅ Automatic coordinate population
- ✅ Responsive design

---

**Free Tier Limits**: Mapbox offers 50,000 free map loads per month, which is plenty for development and small projects. 