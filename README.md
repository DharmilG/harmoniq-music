# 🎵 Harmoniq Music Academy

A modern, animated music education website built with Vite + React, featuring smooth animations, responsive design, and a premium user experience.

## ✨ Features

### 🎯 Core Functionality
- **Music Lessons**: Course catalog with instructor profiles and pricing
- **Instrument Store**: Product catalog with shopping cart functionality
- **Strategic Partnerships**: Red Bull and Yamaha collaboration showcase
- **Contact System**: Interactive contact forms and information

### 🎨 Design & Animations
- **Modern UI**: Glass-morphism effects, gradients, and premium styling
- **Smooth Animations**: Page transitions, hover effects, and micro-interactions
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **Accessibility**: Reduced motion support and semantic HTML

### 🛠 Technical Features
- **Vite + React**: Fast development and optimized builds
- **CSS Custom Properties**: Consistent design system
- **Context API**: Global cart state management
- **Hash Routing**: Static hosting compatibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) in your browser.

### Building for Production

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

### Static Hosting

The built site can be opened directly from the `dist` folder:

```bash
# After building, open in browser
open dist/index.html
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation with animations
│   ├── Footer.jsx      # Footer with links
│   └── PageTransition.jsx # Route transition wrapper
├── pages/              # Route components
│   ├── Home.jsx        # Hero section and features
│   ├── Lessons.jsx     # Course catalog and instructors
│   ├── Store.jsx       # Product catalog and cart
│   ├── Partnerships.jsx # Red Bull & Yamaha showcase
│   ├── About.jsx       # Company information
│   └── Contact.jsx     # Contact forms and info
├── context/            # React Context providers
│   └── CartContext.jsx # Shopping cart state
├── data/               # Static data
│   ├── products.js     # Instrument catalog
│   └── lessons.js      # Course and instructor data
├── styles.css          # Global styles and animations
├── main.jsx           # App entry point
└── App.jsx            # Main app component with routing
```

## 🎨 Design System

### Color Palette
- **Primary**: Deep space blues (#0a0e1a, #0f1419)
- **Accent**: Purple gradient (#8b5cf6 → #ec4899)
- **Success**: Emerald (#10b981)
- **Text**: Light grays (#f8fafc, #cbd5e1, #94a3b8)

### Typography
- **Primary Font**: Inter (clean, modern)
- **Code Font**: JetBrains Mono
- **Weights**: 300, 400, 500, 600, 700

### Animations
- **Transitions**: 150ms-350ms with easing curves
- **Page Transitions**: Fade + slide effects
- **Hover Effects**: Scale, glow, and color transitions
- **Loading States**: Shimmer and spinner animations

## 🛒 Shopping Cart Features

- Add/remove items with animations
- Quantity controls with instant feedback
- Real-time total calculation
- Persistent state during session
- Smooth micro-interactions

## 📱 Mobile Experience

- **Responsive Navigation**: Collapsible menu for mobile
- **Touch Interactions**: Optimized for touch devices
- **Mobile-First Grid**: Adaptive layouts for all screen sizes
- **Performance**: Optimized animations for mobile devices

## 🎯 Accessibility

- **Reduced Motion**: Respects user preferences
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and descriptions

## 🔧 Customization

### Adding New Products
Edit `src/data/products.js`:

```javascript
{
  id: 'unique-id',
  name: 'Product Name',
  price: 299,
  category: 'guitars', // or keyboards, drums, accessories
  specs: ['Feature 1', 'Feature 2'],
  img: 'https://image-url.com'
}
```

### Adding New Courses
Edit `src/data/lessons.js`:

```javascript
{
  id: 'course-id',
  instrument: 'Guitar',
  level: 'Beginner',
  duration: '8 weeks',
  price: 199,
  summary: 'Course description'
}
```

### Styling Changes
Modify CSS custom properties in `src/styles.css`:

```css
:root {
  --accent-primary: #your-color;
  --transition-normal: 250ms ease-out;
  /* ... other variables */
}
```

## 🚀 Deployment

### Static Hosting (Recommended)
1. Run `npm run build`
2. Upload the `dist` folder to any static host:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3

### Configuration for SPA Hosting
For proper routing on SPA hosts, ensure redirects are configured to serve `index.html` for all routes.

## 🎵 Demo Content

The site includes placeholder content for:
- 4 sample courses across different instruments
- 3 instructor profiles with photos
- 5 products in the instrument store
- Partnership details for Red Bull and Yamaha

## 📄 License

This project is for educational/demonstration purposes. Replace placeholder content and images with your own before commercial use.

---

**Built with ❤️ using Vite + React**
