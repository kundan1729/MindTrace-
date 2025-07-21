# 🧠 Rekno

A modern, beautiful web-based application for creating and managing a personal knowledge graph where concepts are connected with strength values that decay over time, simulating the natural forgetting process.

## ✨ Features

- **🎨 Modern UI/UX**: Beautiful, responsive design with smooth animations and glass morphism effects
- **🌓 Dark/Light Theme**: Toggle between dark and light modes with localStorage persistence (defaults to dark)
- **📊 Visual Knowledge Graph**: Interactive network visualization using vis.js with enhanced styling
- **🔧 Node Management**: Add, edit, and delete knowledge nodes with ease
- **🔗 Connection Strength**: Connect nodes with strength values (0-100)
- **⏲️ Automatic Decay**: Connections weaken over time (simulating forgetting)
- **💪 Manual Reinforcement**: Strengthen connections by double-clicking edges
- **🔍 Smart Search**: Find nodes by title with visual feedback and highlighting
- **💾 Persistent Storage**: Save and load your knowledge graph as JSON
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎯 Real-time Updates**: Automatic graph updates and manual decay application
- **✨ Enhanced Feedback**: Beautiful success/error messages and loading states
- **🔍 Zoom Controls**: Manual zoom in/out buttons (mouse wheel zoom disabled for better page scrolling)
- **📄 Export Options**: Export your graph as high-quality PNG images or professional PDF documents
- **🧠 Custom Favicon**: Beautiful brain emoji favicon with gradient design

## 🎨 Modern Design Features

### Visual Enhancements
- **Glass Morphism Design**: Modern glass-like effects with backdrop blur and transparency
- **Gradient Background**: Beautiful dynamic gradient that adapts to theme
- **Dark/Light Theme System**: Seamless theme switching with CSS custom properties
- **Card-based Layout**: Clean, modern card design with shadows and hover effects
- **Typography**: Modern Inter font for better readability across all devices
- **Color-coded Elements**: Intuitive color system for different actions and states
- **Smooth Animations**: Subtle animations and transitions for better user experience
- **Custom Favicon**: Professional brain emoji icon with gradient background

### User Experience Improvements
- **Theme Toggle**: Easy dark/light mode switching with visual feedback
- **Loading States**: Visual feedback during all operations with spinners
- **Toast Messages**: Non-intrusive success/error notifications with animations
- **Enhanced Modals**: Beautiful modal dialogs with backdrop blur and smooth transitions
- **Export Dialog**: Professional export options with format selection
- **Responsive Grid**: Adaptive layout for all screen sizes and orientations
- **Keyboard Shortcuts**: Escape key to close modals and theme toggle shortcuts
- **Hover Effects**: Interactive elements with smooth hover animations and states
- **Zoom Controls**: Dedicated zoom in/out buttons for precise graph navigation

## 🚀 How It Works

### Knowledge Graph Concept
- **Nodes** represent knowledge concepts (e.g., "Java Basics", "OOP Concepts")
- **Edges** represent connections between concepts with strength values
- **Strength Decay**: Connections automatically weaken by 5% every hour
- **Reinforcement**: Double-click edges to strengthen connections by 20 points

### Color Coding System
- **🟣 Purple**: Root nodes (nodes with no incoming connections)
- **🟢 Green**: Strong connections (70-100 strength)
- **🟡 Yellow**: Medium connections (30-69 strength)
- **🔴 Red**: Weak connections (0-29 strength)

## 🛠️ Installation & Setup

### Prerequisites
- Java 8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Running the Application

1. **Compile the project:**
   ```bash
   javac -cp ".;lib\gson-2.10.1.jar" -d out src\model\*.java src\persistence\*.java src\server\*.java src\Main.java
   ```

2. **Run the server:**
   ```bash
   java -cp ".;out;lib\gson-2.10.1.jar" Main
   ```

3. **Open your browser and navigate to:**
   ```
   http://localhost:8000
   ```

## 📖 Usage Guide

### Theme Management
- **Toggle Theme**: Click the theme toggle button in the header (🌙/☀️)
- **Keyboard Shortcut**: Press Ctrl/Cmd + Shift + T to quickly switch themes
- **Default**: Application starts in dark mode with automatic preference saving

### Adding Nodes
1. Fill in the form at the top:
   - **Node ID**: Unique identifier (e.g., "java-basics")
   - **Knowledge Title**: Name of the concept (e.g., "Java Fundamentals")
   - **Parent ID**: (Optional) Connect to an existing node
2. Click "➕ Add Node"

### Managing Connections
- **Double-click edges** to reinforce connections (+20 strength)
- **Click nodes** to edit or delete them
- **Use the "⏲️ Apply Decay (5%)" button** to manually apply forgetting

### Graph Navigation
- **Zoom In**: Click the "🔍+ Zoom In" button for closer view
- **Zoom Out**: Click the "🔍- Zoom Out" button for wider view
- **Page Scrolling**: Use mouse wheel to scroll the page (zoom disabled on graph)
- **Drag Nodes**: Click and drag nodes to reposition them

### Searching
- Type in the search box and press Enter
- Matching nodes will be highlighted and focused with visual feedback
- Graph automatically centers on search results

### Export Features
- **Export Options**: Click the "📄 Export" button to choose format
- **PDF Export**: High-quality portrait PDF with professional layout and 3x scaling
- **PNG Export**: High-resolution image export with 2x scaling for crisp quality
- **Automatic Naming**: Files include timestamp for easy organization

### Saving Your Work
- Click the "💾 Save Graph" button to persist your knowledge graph
- Data is saved to `graph.json` in the project directory
- Automatic file backup and error handling

## 🎯 UI/UX Improvements

### Enhanced Visual Design
- **Modern Color Palette**: Consistent color scheme with CSS variables
- **Improved Typography**: Better font hierarchy and spacing
- **Card-based Components**: Clean, organized layout
- **Smooth Transitions**: Subtle animations for better feel

### Better User Feedback
- **Loading Indicators**: Visual feedback during operations
- **Success Messages**: Green toast notifications for successful actions
- **Error Handling**: Red toast notifications for errors
- **Interactive Elements**: Hover effects and focus states

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Flexible Layout**: Adaptive grid system
- **Touch-Friendly**: Large touch targets for mobile devices
- **Progressive Enhancement**: Works on all modern browsers

## 📁 Project Structure

```
Rekno/
├── src/
│   ├── Main.java                 # Application entry point
│   ├── model/
│   │   ├── KnowledgeGraph.java   # Graph data structure
│   │   └── KnowledgeNode.java    # Individual node representation
│   ├── persistence/
│   │   └── KnowledgePersistence.java  # JSON save/load functionality
│   └── server/
│       └── SimpleHttpServer.java # HTTP server and REST API
├── web/
│   ├── index.html               # Modern web interface
│   ├── script.js                # Enhanced frontend logic
│   └── style.css                # Modern styling with CSS variables
├── lib/
│   └── gson-2.10.1.jar          # JSON library
├── graph.json                   # Persistent data storage
├── demo-graph.json              # Sample data for testing
└── README.md                    # This file
```

## 🔌 API Endpoints

- `GET /graph` - Retrieve the complete knowledge graph
- `POST /addNode` - Add a new node
- `POST /editNode` - Edit an existing node
- `DELETE /deleteNode?id=X` - Delete a node
- `POST /reinforce?id=X&target=Y` - Strengthen a connection
- `POST /decay` - Apply decay to all connections
- `GET /save` - Save graph to file

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)
- **Gray Scale**: 50-900 range for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Sizes**: Responsive scale from 0.875rem to 2.5rem

### Spacing & Layout
- **Border Radius**: 8px (default), 12px (large)
- **Shadows**: 5-level shadow system
- **Transitions**: 0.2s ease-in-out for all interactive elements

## 🚀 Recent UI/UX Enhancements

### Major Feature Additions
1. **Dark/Light Theme System**: Complete theme management with localStorage persistence
2. **Export Functionality**: Professional PDF and high-quality PNG export options
3. **Zoom Controls**: Manual zoom in/out buttons replacing problematic mouse wheel zoom
4. **Glass Morphism Design**: Modern glass effects with backdrop blur throughout the UI
5. **Enhanced Typography**: Improved font hierarchy with Inter font family

### Visual Improvements
1. **Modern Design**: Complete redesign with glass morphism and modern aesthetics
2. **Dynamic Gradients**: Theme-aware gradient backgrounds that adapt to light/dark modes
3. **Card Layout**: Clean, organized card-based design with consistent shadows
4. **Enhanced Color System**: Comprehensive CSS custom properties for consistent theming
5. **Professional Favicon**: Custom brain emoji icon with gradient design

### User Experience Enhancements
1. **Loading States**: Comprehensive visual feedback during all operations
2. **Toast Messages**: Beautiful non-intrusive notifications with animations
3. **Enhanced Modals**: Professional modal dialogs with backdrop effects
4. **Export Dialog**: User-friendly format selection with clear options
5. **Responsive Design**: Mobile-first approach with touch-friendly interactions
6. **Keyboard Navigation**: Enhanced keyboard shortcuts and accessibility features

### Interactive Elements
1. **Hover Effects**: Subtle animations on all interactive elements
2. **Focus States**: Clear focus indicators for better accessibility
3. **Button States**: Loading, disabled, and hover states for all buttons
4. **Visual Feedback**: Immediate feedback for all user actions
5. **Smooth Transitions**: Consistent 0.2s transitions throughout the application

## 💡 Tips for Effective Use

1. **Start with Core Concepts**: Create root nodes for major topics
2. **Use Descriptive IDs**: Make IDs meaningful (e.g., "java-basics", "oop-inheritance")
3. **Choose Your Theme**: Select dark or light mode based on your preference and environment
4. **Regular Review**: Use the decay feature to identify forgotten concepts
5. **Reinforce Important Connections**: Double-click edges for concepts you want to remember
6. **Use Zoom Controls**: Utilize zoom in/out buttons for better graph navigation
7. **Export Regularly**: Save your progress as PDF or PNG for backup and sharing
8. **Save Frequently**: Use the save button to preserve your work
9. **Explore Search**: Use the search feature to quickly locate specific concepts
10. **Optimize Layout**: Drag nodes to create clear, organized visual layouts

## 🔧 Troubleshooting

### Common Issues
- **Server won't start**: Check if port 8000 is already in use
- **Graph not loading**: Ensure `graph.json` exists and is valid JSON
- **Changes not saving**: Check file permissions in the project directory
- **UI not loading properly**: Clear browser cache and refresh

### Performance
- The application works best with graphs under 1000 nodes
- Large graphs may experience slower rendering
- Consider breaking large knowledge domains into separate graphs

## 🎯 Future Enhancements

Potential improvements for future versions:
- **Variable Decay Rates**: Different decay rates based on knowledge categories and importance
- **Advanced Analytics**: Learning progress tracking and knowledge retention insights  
- **Import Features**: Import from external sources (CSV, XML, other knowledge formats)
- **Collaborative Features**: Multi-user knowledge graphs with real-time collaboration
- **Advanced Search**: Full-text search with filters and category-based searching
- **Cloud Storage**: Sync graphs across devices with cloud persistence
- **Mobile App**: Native mobile application for iOS and Android
- **Offline Support**: Work without internet connection with local storage
- **Backup System**: Automated backups with version history
- **Integration APIs**: Connect with learning platforms and note-taking apps

---

**Happy Knowledge Organizing with Rekno! 🧠📚✨** 










Quick Implementation Ideas:
Add a category field to nodes
Add a decayRate property to connections
Allow users to mark connections as "important"
Track "last accessed" timestamps

Keep it single-user for now and focus on:

Polish the current features ✨
Implement the decay rate enhancements 📈
Add comprehensive documentation 📚
Write clean, well-commented code 🧹
Deploy it somewhere public (Heroku/Railway) 🌐