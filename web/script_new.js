/* ──────────────────────────────────────────────────────────────
   Rekno – Enhanced Front‑End Logic
   Features: Dark/Light theme, modern UI/UX, better feedback, 
            loading states, improved animations, enhanced UX
──────────────────────────────────────────────────────────────── */

let network, data, currentId = null;

/* ------------ Theme Management ------------ */
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
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
      nodeText: isDark ? '#f8fafc' : '#374151',
      edgeText: isDark ? '#94a3b8' : '#6b7280',
      networkBg: isDark ? '#1e293b' : '#ffffff',
      networkBorder: isDark ? '#334155' : '#e2e8f0'
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
      tooltipDelay: 300
    },
    nodes: {
      font: {
        size: 14,
        face: 'Inter',
        color: themeColors.nodeText,
        strokeWidth: 2,
        strokeColor: themeManager.currentTheme === 'dark' ? '#1e293b' : '#ffffff'
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
          border: themeManager.currentTheme === 'dark' ? '#475569' : '#334155',
          highlight: {
            background: nodeColor,
            border: themeManager.currentTheme === 'dark' ? '#64748b' : '#1e293b'
          }
        },
        size: isRoot ? 30 : 25,
        font: {
          size: isRoot ? 16 : 14,
          face: 'Inter',
          color: isRoot ? '#ffffff' : themeManager.getThemeColors().nodeText,
          bold: isRoot
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
  const searchBox = document.getElementById('searchBox');
  
  searchBox.addEventListener('keydown', async e => {
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
        showMessage('Decay applied! Connections weakened by 5% ⏲️', 'info');
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

/* ------------ Enhanced initialization ------------ */
window.addEventListener('DOMContentLoaded', () => {
  showMessage('Loading your graph... 📚', 'info');
  fetchGraph();
  setupEventHandlers();
  setupSearch();
});
