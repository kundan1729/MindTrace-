/* ──────────────────────────────────────────────────────────────
   Rekno – Enhanced Front‑End Logic
   Features: Dark/Light theme, modern UI/UX, better feedback, 
            loading states, improved animations, enhanced UX,
            onboarding, tooltips, debounced search
──────────────────────────────────────────────────────────────── */

let network, data, currentId = null;

/* ------------ Onboarding & First-time User Experience ------------ */
class OnboardingManager {
  constructor() {
    this.isFirstVisit = !localStorage.getItem('rekno_visited');
    this.init();
  }

  init() {
    if (this.isFirstVisit) {
      this.showWelcomeModal();
      localStorage.setItem('rekno_visited', 'true');
    }
  }

  showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'onboarding-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>🎉 Welcome to Rekno!</h2>
          <button class="close-btn" onclick="this.closest('.onboarding-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p>Your personal knowledge organizer is ready! Here's how to get started:</p>
          <div class="onboarding-steps">
            <div class="step">
              <span class="step-icon">1️⃣</span>
              <div>
                <h4>Create Your First Node</h4>
                <p>Use the form below to add your first knowledge node</p>
              </div>
            </div>
            <div class="step">
              <span class="step-icon">2️⃣</span>
              <div>
                <h4>Connect Ideas</h4>
                <p>Add related nodes by referencing parent IDs</p>
              </div>
            </div>
            <div class="step">
              <span class="step-icon">3️⃣</span>
              <div>
                <h4>Explore & Learn</h4>
                <p>Click, drag, zoom, and watch your knowledge grow!</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="window.open('guide.html', '_blank')">📖 Read Full Guide</button>
          <button class="btn-primary" onclick="this.closest('.onboarding-modal').remove()">🚀 Get Started</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Add modal styles
    if (!document.querySelector('#onboarding-styles')) {
      const styles = document.createElement('style');
      styles.id = 'onboarding-styles';
      styles.textContent = `
        .onboarding-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        
        .modal-content {
          background: var(--background-white);
          border-radius: 1rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 90%;
          position: relative;
          animation: modalSlideIn 0.3s ease;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid var(--border-200);
        }
        
        .modal-header h2 {
          margin: 0;
          color: var(--text-900);
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-600);
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }
        
        .close-btn:hover {
          background: var(--background-100);
          color: var(--text-900);
        }
        
        .modal-body {
          padding: 1.5rem 2rem;
        }
        
        .modal-body p {
          margin: 0 0 1.5rem 0;
          color: var(--text-700);
          line-height: 1.6;
        }
        
        .onboarding-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        
        .step-icon {
          font-size: 1.5rem;
        }
        
        .step h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-900);
          font-weight: 600;
        }
        
        .step p {
          margin: 0;
          color: var(--text-600);
          font-size: 0.9rem;
        }
        
        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1rem 2rem 2rem 2rem;
          justify-content: flex-end;
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `;
      document.head.appendChild(styles);
    }
  }
}

/* ------------ Enhanced Search with Debouncing ------------ */
class SearchManager {
  constructor() {
    this.searchInput = document.querySelector('#searchBox input');
    this.debounceTimer = null;
    this.init();
  }

  init() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.performSearch(e.target.value);
        }, 300); // 300ms debounce
      });

      // Add search shortcuts
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.clearSearch();
        }
      });
    }
  }

  performSearch(query) {
    if (!data || !data.nodes) return;

    if (query.trim() === '') {
      this.clearSearch();
      return;
    }

    const matchingNodes = data.nodes.filter(node => 
      node.label.toLowerCase().includes(query.toLowerCase()) ||
      node.id.toLowerCase().includes(query.toLowerCase())
    );

    if (matchingNodes.length > 0) {
      // Highlight matching nodes
      const highlightNodes = matchingNodes.map(node => node.id);
      
      network.setSelection({
        nodes: highlightNodes,
        edges: []
      });

      // Focus on first match
      if (highlightNodes.length > 0) {
        network.focus(highlightNodes[0], {
          scale: 1.5,
          animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad"
          }
        });
      }

      showMessage(`Found ${matchingNodes.length} matching node(s) 🔍`, 'success');
    } else {
      showMessage('No matching nodes found 🤷‍♂️', 'info');
    }
  }

  clearSearch() {
    this.searchInput.value = '';
    if (network) {
      network.setSelection({ nodes: [], edges: [] });
      network.fit({
        animation: {
          duration: 1000,
          easingFunction: "easeInOutQuad"
        }
      });
    }
  }
}

/* ------------ Tooltip Manager ------------ */
class TooltipManager {
  constructor() {
    this.tooltip = null;
    this.init();
  }

  init() {
    this.addTooltips();
  }

  addTooltips() {
    // Add tooltips to form fields
    const tooltips = {
      'input[name="id"]': 'Enter a unique identifier (e.g., "ai-basics", "python-101")',
      'input[name="title"]': 'Enter a descriptive title that will be displayed on the node',
      'input[name="parentId"]': 'Optional: Enter the ID of an existing node to connect to',
      '#saveBtn': 'Save your current knowledge graph to persistent storage',
      '#decayBtn': 'Apply daily natural decay to connection strengths (5% per day - weakens unused connections)',
      '#exportBtn': 'Export your knowledge graph as a PDF document',
      '#zoomInBtn': 'Zoom into the knowledge graph for better detail',
      '#zoomOutBtn': 'Zoom out to see the bigger picture'
    };

    Object.entries(tooltips).forEach(([selector, text]) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute('title', text);
        this.bindTooltipEvents(element);
      }
    });
  }

  bindTooltipEvents(element) {
    element.addEventListener('mouseenter', (e) => this.showTooltip(e, element.getAttribute('title')));
    element.addEventListener('mouseleave', () => this.hideTooltip());
    element.addEventListener('focus', (e) => this.showTooltip(e, element.getAttribute('title')));
    element.addEventListener('blur', () => this.hideTooltip());
  }

  showTooltip(e, text) {
    this.hideTooltip(); // Remove any existing tooltip

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'rekno-tooltip';
    this.tooltip.textContent = text;
    this.tooltip.style.cssText = `
      position: absolute;
      background: var(--background-800);
      color: var(--text-100);
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      z-index: 10000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      max-width: 250px;
      line-height: 1.4;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      white-space: normal;
    `;

    document.body.appendChild(this.tooltip);

    // Position tooltip
    const rect = e.target.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 8;

    // Adjust if tooltip goes off screen
    if (left < 8) left = 8;
    if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }
    if (top < 8) {
      top = rect.bottom + 8;
    }

    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';

    // Fade in
    setTimeout(() => {
      if (this.tooltip) this.tooltip.style.opacity = '1';
    }, 10);
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }
}

/* ------------ Theme Management ------------ */
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }
  
  init() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.updateThemeUI();
    this.bindEvents();
  }
  
  toggle() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
    this.updateThemeUI();
    
    // Update network colors if it exists
    if (network) {
      setTimeout(() => fetchGraph(), 100);
    }
    
    showMessage(`Switched to ${this.currentTheme} theme ✨`, 'info');
  }
  
  updateThemeUI() {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (this.currentTheme === 'dark') {
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Light';
    } else {
      themeIcon.textContent = '🌙';
      themeText.textContent = 'Dark';
    }
  }
  
  bindEvents() {
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggle();
    });
    
    // Keyboard shortcut: Ctrl/Cmd + Shift + T
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  getThemeColors() {
    const isDark = this.currentTheme === 'dark';
    return {
      // ✅ Fix 1: Improved node text contrast - darker color for light mode
      nodeText: isDark ? '#f8fafc' : '#1e293b',
      nodeTextLight: isDark ? '#f8fafc' : '#ffffff', // For colored node backgrounds
      edgeText: isDark ? '#cbd5e1' : '#475569',
      networkBg: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.25)',
      networkBorder: isDark ? '#475569' : '#e2e8f0',
      nodeBorder: isDark ? '#64748b' : '#475569',
      nodeHighlight: isDark ? '#94a3b8' : '#334155',
      nodeStroke: isDark ? '#0f172a' : '#ffffff'
    };
  }
}

// ✅ Fix 1: Utility function for intelligent text color selection
function getOptimalTextColor(backgroundColor, isDarkTheme = false) {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using W3C formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Enhanced contrast logic considering theme
  if (isDarkTheme) {
    return luminance > 0.7 ? '#1e293b' : '#f8fafc';
  } else {
    return luminance > 0.5 ? '#1e293b' : '#ffffff';
  }
}

// ✅ Fix 1: Enhanced text stroke for better readability
function getTextStroke(backgroundColor, textColor, isDarkTheme = false) {
  const isLightText = textColor === '#ffffff' || textColor === '#f8fafc';
  
  if (isDarkTheme) {
    return {
      width: isLightText ? 2 : 1,
      color: isLightText ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.3)'
    };
  } else {
    return {
      width: isLightText ? 2 : 1,
      color: isLightText ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)'
    };
  }
}

const themeManager = new ThemeManager();

/* ------------ Enhanced Helpers ------------ */
const colourByStrength = s => s < 30 ? '#ef4444' : s < 70 ? '#f59e0b' : '#10b981';
const avg = obj => {
  const v = Object.values(obj);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 100;
};

// Enhanced message system
function showMessage(message, type = 'success') {
  // Remove existing messages
  document.querySelectorAll('.message').forEach(msg => msg.remove());
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  
  // Insert after the header
  const header = document.querySelector('.header');
  header.parentNode.insertBefore(messageDiv, header.nextSibling);
  
  // Auto-remove after 3 seconds with animation
  setTimeout(() => {
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(-20px)';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Enhanced loading state management
function setLoading(element, isLoading) {
  if (isLoading) {
    element.classList.add('loading');
    element.disabled = true;
  } else {
    element.classList.remove('loading');
    element.disabled = false;
  }
}

/* ------------ Enhanced vis options with theme support ------------ */
function getVisOptions() {
  const themeColors = themeManager.getThemeColors();
  
  return {
    physics: { 
      enabled: false 
    },
    layout: {
      hierarchical: {
        enabled: true,
        direction: 'UD',
        nodeSpacing: 200,
        treeSpacing: 300,
        levelSeparation: 150
      }
    },
    interaction: { 
      dragNodes: true, 
      multiselect: true,
      hover: true,
      tooltipDelay: 300,
      zoomView: false,
      navigationButtons: false
    },
    nodes: {
      font: {
        size: 14,
        face: 'Inter',
        color: themeColors.nodeText,
        strokeWidth: 3,
        strokeColor: themeColors.nodeStroke
      },
      borderWidth: 2,
      shadow: {
        enabled: true,
        color: themeManager.currentTheme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
        size: 10,
        x: 0,
        y: 2
      },
      shape: 'ellipse',
      margin: 10,
      chosen: {
        node: function(values, id, selected, hovering) {
          values.shadow = true;
          values.shadowSize = 15;
        }
      }
    },
    edges: {
      font: {
        size: 12,
        face: 'Inter',
        color: themeColors.edgeText,
        strokeWidth: 3,
        strokeColor: themeManager.currentTheme === 'dark' ? '#1e293b' : '#ffffff'
      },
      shadow: {
        enabled: true,
        color: themeManager.currentTheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
        size: 5
      },
      smooth: {
        type: 'cubicBezier',
        forceDirection: 'none',
        roundness: 0.4
      },
      chosen: {
        edge: function(values, id, selected, hovering) {
          values.shadow = true;
          values.shadowSize = 8;
        }
      }
    }
  };
}

/* ------------ Enhanced graph rendering with theme support ------------ */
async function fetchGraph() {
  try {
    setLoading(document.getElementById('network'), true);
    
    const res = await fetch('/graph');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    data = await res.json();

    const nodes = [];
    const edges = [];

    Object.entries(data).forEach(([id, node]) => {
      const isRoot = !Object.values(data).some(n =>
        Object.keys(n.connections).includes(id)
      );
      
      const avgStrength = avg(node.connections);
      const nodeColor = isRoot ? '#8b5cf6' : colourByStrength(avgStrength);
      
      // Enhanced node styling with theme support
      nodes.push({
        id,
        label: node.title,
        title: `${node.title}\n${node.description || 'No description'}\nConnections: ${Object.keys(node.connections).length}`,
        color: {
          background: nodeColor,
          border: themeManager.getThemeColors().nodeBorder,
          highlight: {
            background: nodeColor,
            border: themeManager.getThemeColors().nodeHighlight
          }
        },
        size: isRoot ? 35 : 28,
        font: {
          size: isRoot ? 16 : 14,
          face: 'Inter',
          // ✅ Fix 1: Intelligent text color based on background and theme
          color: isRoot ? '#ffffff' : getOptimalTextColor(nodeColor, themeManager.currentTheme === 'dark'),
          weight: isRoot ? 'bold' : '600', // Reduced boldness for non-root nodes
          strokeWidth: (() => {
            const textColor = isRoot ? '#ffffff' : getOptimalTextColor(nodeColor, themeManager.currentTheme === 'dark');
            const stroke = getTextStroke(nodeColor, textColor, themeManager.currentTheme === 'dark');
            return stroke.width;
          })(),
          strokeColor: (() => {
            const textColor = isRoot ? '#ffffff' : getOptimalTextColor(nodeColor, themeManager.currentTheme === 'dark');
            const stroke = getTextStroke(nodeColor, textColor, themeManager.currentTheme === 'dark');
            return stroke.color;
          })()
        },
        borderWidth: 3,
        shadow: {
          enabled: true,
          color: themeManager.currentTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)',
          size: 8,
          x: 0,
          y: 2
        }
      });

      Object.entries(node.connections).forEach(([targetId, strength]) => {
        if (data[targetId]) {
          edges.push({
            from: id,
            to: targetId,
            label: `${strength}`,
            arrows: 'to',
            color: {
              color: colourByStrength(strength),
              highlight: colourByStrength(Math.min(100, strength + 20))
            },
            width: Math.max(1, strength / 20),
            title: `Connection strength: ${strength}/100`,
            font: {
              size: 11,
              face: 'Inter',
              color: themeManager.getThemeColors().edgeText
            }
          });
        }
      });
    });

    const networkData = { nodes, edges };
    const container = document.getElementById('network');
    
    // Use theme-aware options
    network = new vis.Network(container, networkData, getVisOptions());
    
    // Enhanced event handlers
    network.on('doubleClick', handleDoubleClick);
    network.on('click', handleSingleClick);
    network.on('hoverNode', function(params) {
      container.style.cursor = 'pointer';
    });
    network.on('blurNode', function(params) {
      container.style.cursor = 'default';
    });
    
    setLoading(container, false);
    
  } catch (error) {
    console.error('Error fetching graph:', error);
    showMessage('Failed to load graph', 'error');
    setLoading(document.getElementById('network'), false);
  }
}

/* ------------ Enhanced event handlers ------------ */
function handleDoubleClick(params) {
  if (!params.edges.length) return;
  
  const edge = network.body.edges[params.edges[0]];
  if (!edge) return;
  
  // Visual feedback
  const originalColor = edge.options.color.color;
  edge.setOptions({ color: { color: '#10b981', opacity: 1 } });
  
  fetch(`/reinforce?id=${edge.fromId}&target=${edge.toId}`, { method: 'POST' })
    .then(response => {
      if (response.ok) {
        showMessage('Connection reinforced! 💪', 'success');
        fetchGraph();
      } else {
        showMessage('Failed to reinforce connection', 'error');
        edge.setOptions({ color: { color: originalColor, opacity: 0.8 } });
      }
    })
    .catch(error => {
      console.error('Error reinforcing connection:', error);
      showMessage('Error reinforcing connection', 'error');
      edge.setOptions({ color: { color: originalColor, opacity: 0.8 } });
    });
}

function handleSingleClick(params) {
  if (params.nodes.length) {
    openModal(params.nodes[0]);
  }
}

/* ------------ Enhanced search functionality ------------ */
function setupSearch() {
  const searchInput = document.querySelector('#searchBox input');
  
  searchInput.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim().toLowerCase();
      if (!query) return;
      
      const matches = Object.values(data).filter(node =>
        node.title.toLowerCase().includes(query) ||
        (node.description && node.description.toLowerCase().includes(query))
      );
      
      if (matches.length === 0) {
        showMessage('No matching nodes found 🔍', 'info');
        return;
      }
      
      // Focus on the first match
      const firstMatch = matches[0];
      network.focus(firstMatch.id, {
        scale: 1.2,
        animation: { duration: 1000, easingFunction: 'easeInOutQuad' }
      });
      
      // Highlight all matches
      const nodeIds = matches.map(n => n.id);
      network.selectNodes(nodeIds);
      
      showMessage(`Found ${matches.length} matching node(s) ✨`, 'success');
    }
  });
}

/* ------------ Enhanced modal functionality ------------ */
function openModal(nodeId) {
  currentId = nodeId;
  const node = data[nodeId];
  if (!node) return;
  
  document.getElementById('editTitle').value = node.title;
  document.getElementById('editDesc').value = node.description || '';
  document.getElementById('modal').classList.remove('hidden');
  
  // Focus on title field
  setTimeout(() => document.getElementById('editTitle').focus(), 100);
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  currentId = null;
}

/* ------------ Enhanced form handling ------------ */
function setupEventHandlers() {
  // Add node form
  document.getElementById('addForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    setLoading(btn, true);
    
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    
    try {
      const res = await fetch('/addNode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        showMessage('Node added successfully! 🎉', 'success');
        e.target.reset();
        fetchGraph();
      } else {
        showMessage('Failed to add node', 'error');
      }
    } catch (error) {
      console.error('Error adding node:', error);
      showMessage('Error adding node', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
  
  // Save button
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveBtn');
    setLoading(btn, true);
    
    try {
      const res = await fetch('/save');
      if (res.ok) {
        showMessage('Graph saved successfully! 💾', 'success');
      } else {
        showMessage('Failed to save graph', 'error');
      }
    } catch (error) {
      console.error('Error saving graph:', error);
      showMessage('Error saving graph', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
  
  // Decay button
  document.getElementById('decayBtn').addEventListener('click', async () => {
    const btn = document.getElementById('decayBtn');
    setLoading(btn, true);
    
    try {
      const res = await fetch('/decay', { method: 'POST' });
      if (res.ok) {
        showMessage('Daily decay applied! Connections weakened by 5% 📅', 'info');
        fetchGraph();
      } else {
        showMessage('Failed to apply decay', 'error');
      }
    } catch (error) {
      console.error('Error applying decay:', error);
      showMessage('Error applying decay', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
  
  // Zoom In button
  document.getElementById('zoomInBtn').addEventListener('click', () => {
    if (network) {
      const scale = network.getScale();
      network.moveTo({ scale: scale * 1.2 });
      showMessage('Zoomed in 🔍+', 'info');
    }
  });
  
  // Zoom Out button
  document.getElementById('zoomOutBtn').addEventListener('click', () => {
    if (network) {
      const scale = network.getScale();
      network.moveTo({ scale: scale * 0.8 });
      showMessage('Zoomed out 🔍-', 'info');
    }
  });
  
  // Export button - Show options dialog
  document.getElementById('exportBtn').addEventListener('click', () => {
    showExportOptions();
  });
  
  // Modal save button
  document.getElementById('saveEdit').addEventListener('click', async () => {
    const btn = document.getElementById('saveEdit');
    setLoading(btn, true);
    
    try {
      const res = await fetch('/editNode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentId,
          title: document.getElementById('editTitle').value,
          description: document.getElementById('editDesc').value
        })
      });
      
      if (res.ok) {
        showMessage('Node updated successfully! ✏️', 'success');
        closeModal();
        fetchGraph();
      } else {
        showMessage('Failed to update node', 'error');
      }
    } catch (error) {
      console.error('Error updating node:', error);
      showMessage('Error updating node', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
  
  // Modal delete button
  document.getElementById('deleteNode').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this node? This action cannot be undone.')) {
      return;
    }
    
    const btn = document.getElementById('deleteNode');
    setLoading(btn, true);
    
    try {
      const res = await fetch(`/deleteNode?id=${currentId}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('Node deleted successfully! 🗑️', 'success');
        closeModal();
        fetchGraph();
      } else {
        showMessage('Failed to delete node', 'error');
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      showMessage('Error deleting node', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
  
  // Modal cancel button
  document.getElementById('cancelEdit').addEventListener('click', closeModal);
  
  // Close modal on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modal').classList.contains('hidden')) {
      closeModal();
    }
  });
  
  // Close modal on backdrop click
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  });
}

/* ------------ Export Functions ------------ */
function showExportOptions() {
  if (!network) {
    showMessage('No graph to export', 'error');
    return;
  }
  
  // Create export option modal
  const exportModal = document.createElement('div');
  exportModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
    padding: 1rem;
  `;
  
  const exportContent = document.createElement('div');
  exportContent.style.cssText = `
    background: var(--bg-glass);
    backdrop-filter: var(--blur-lg);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-xl);
    padding: 2.5rem;
    max-width: 400px;
    width: 100%;
    box-shadow: var(--shadow-xl);
    text-align: center;
  `;
  
  exportContent.innerHTML = `
    <h3 style="margin: 0 0 1.5rem 0; color: var(--text-primary); font-size: 1.5rem; font-weight: 700;">
      📄 Export Graph
    </h3>
    <p style="margin: 0 0 2rem 0; color: var(--text-secondary); font-size: 1rem;">
      Choose your preferred export format:
    </p>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
      <button id="exportPdfBtn" class="btn-primary" style="flex: 1; min-width: 120px;">
        📄 PDF Format
      </button>
      <button id="exportPngBtn" class="btn-secondary" style="flex: 1; min-width: 120px;">
        🖼️ PNG Image
      </button>
    </div>
    <button id="cancelExportBtn" class="btn-secondary" style="margin-top: 1rem; width: 100%;">
      ❌ Cancel
    </button>
  `;
  
  exportModal.appendChild(exportContent);
  document.body.appendChild(exportModal);
  
  // Add event listeners
  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    document.body.removeChild(exportModal);
    exportToPDF();
  });
  
  document.getElementById('exportPngBtn').addEventListener('click', () => {
    document.body.removeChild(exportModal);
    exportToPNG();
  });
  
  document.getElementById('cancelExportBtn').addEventListener('click', () => {
    document.body.removeChild(exportModal);
  });
  
  // Close on backdrop click
  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
      document.body.removeChild(exportModal);
    }
  });
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(exportModal);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function exportToPNG() {
  if (!network) {
    showMessage('No graph to export', 'error');
    return;
  }
  
  showMessage('Preparing PNG export... �️', 'info');
  
  try {
    // Get the network canvas
    const canvas = document.querySelector('#network canvas');
    if (!canvas) {
      showMessage('Unable to find graph canvas', 'error');
      return;
    }
    
    // Create a temporary canvas for better quality
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    // Set high resolution for better quality
    const scale = 2;
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    ctx.scale(scale, scale);
    
    // Draw the network canvas onto our temp canvas
    ctx.drawImage(canvas, 0, 0);
    
    // Convert to data URL
    const dataURL = tempCanvas.toDataURL('image/png', 1.0);
    
    // Create download link
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `rekno-graph-${timestamp}.png`;
    link.href = dataURL;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('PNG exported successfully! 🖼️✨', 'success');
    
  } catch (error) {
    console.error('PNG export error:', error);
    showMessage('Failed to export PNG', 'error');
  }
}

function exportToPDF() {
  if (!network) {
    showMessage('No graph to export', 'error');
    return;
  }
  
  showMessage('Preparing PDF export... 📄', 'info');
  
  try {
    // Get the network canvas
    const canvas = document.querySelector('#network canvas');
    if (!canvas) {
      showMessage('Unable to find graph canvas', 'error');
      return;
    }
    
    // Create a temporary canvas for better quality
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    // Set high resolution for better quality
    const scale = 2;
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    ctx.scale(scale, scale);
    
    // Draw the network canvas onto our temp canvas
    ctx.drawImage(canvas, 0, 0);
    
    // Convert to data URL
    const dataURL = tempCanvas.toDataURL('image/png', 1.0);
    
    // Create PDF using jsPDF - Always use portrait orientation
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate optimal image dimensions to maximize page usage
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Use very minimal margins for maximum graph size
    const margin = 3; // Extremely small margin
    const headerHeight = 12; // Minimal space for header
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2) - headerHeight;
    
    // Prioritize width scaling to make graph much wider and more readable
    const widthScale = availableWidth / imgWidth;
    const heightScale = availableHeight / imgHeight;
    
    // Use the larger scale factor to maximize graph size, but ensure it fits
    let finalScale = Math.max(widthScale, heightScale * 0.9);
    
    // If using width scale makes height too big, then use height scale
    if (imgHeight * finalScale > availableHeight) {
      finalScale = heightScale;
    }
    
    // Apply 3x scaling to the current perfect ratio
    finalScale = finalScale * 3;
    
    const finalWidth = imgWidth * finalScale;
    const finalHeight = imgHeight * finalScale;
    
    // If the scaled image is larger than available space, fit it properly
    let actualWidth = finalWidth;
    let actualHeight = finalHeight;
    
    if (finalWidth > availableWidth) {
      const ratio = availableWidth / finalWidth;
      actualWidth = availableWidth;
      actualHeight = finalHeight * ratio;
    }
    
    if (actualHeight > availableHeight) {
      const ratio = availableHeight / actualHeight;
      actualHeight = availableHeight;
      actualWidth = actualWidth * ratio;
    }
    
    // Center the image on the page
    const x = (pageWidth - actualWidth) / 2;
    const y = margin + headerHeight + (availableHeight - actualHeight) / 2;
    
    // Add minimal header info at top
    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    pdf.text('Rekno Graph', margin, margin + 7);
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    const timestamp = new Date().toLocaleDateString();
    pdf.text(timestamp, pageWidth - margin - 25, margin + 7);
    
    // Add the image to PDF with maximum size and readability
    pdf.addImage(dataURL, 'PNG', x, y, actualWidth, actualHeight, '', 'FAST');
    
    // Generate filename with timestamp
    const fileTimestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `rekno-graph-${fileTimestamp}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
    
    showMessage('PDF exported successfully! 📄✨', 'success');
    
  } catch (error) {
    console.error('PDF export error:', error);
    showMessage('Failed to export PDF. Trying PNG fallback...', 'error');
    
    // Fallback to PNG if PDF fails
    exportToPNG();
  }
}

/* ------------ Enhanced initialization ------------ */
window.addEventListener('DOMContentLoaded', () => {
  // Initialize managers
  const themeManager = new ThemeManager();
  const onboardingManager = new OnboardingManager();
  const searchManager = new SearchManager();
  const tooltipManager = new TooltipManager();
  
  showMessage('Loading your graph... 📚', 'info');
  fetchGraph();
  setupEventHandlers();
  setupSearch();

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      document.getElementById('saveBtn').click();
    }
    
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const searchInput = document.querySelector('#searchBox input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // ? key to open guide
    if (e.key === '?' && !e.target.matches('input, textarea')) {
      window.open('guide.html', '_blank');
    }
  });

  // Add performance optimization
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (network) {
        network.redraw();
        network.fit();
      }
    }, 250);
  });

  // Add visibility change handler for better performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Pause any expensive operations when tab is hidden
      if (network) {
        network.setOptions({ physics: { enabled: false } });
      }
    } else {
      // Resume when tab becomes visible
      if (network) {
        network.setOptions({ physics: { enabled: true } });
        setTimeout(() => {
          network.setOptions({ physics: { enabled: false } });
        }, 3000); // Disable physics after 3 seconds
      }
    }
  });
});
