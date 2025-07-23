// Reddit Clone Documentation Website Scripts

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all features
  initSearch();
  initCodeCopy();
  initSmoothScrolling();
  initThemeToggle();
  initMobileMenu();
  initSyntaxHighlighting();
  initComponentShowcase();
  initAPIEndpointStyling();
});

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchBox = document.querySelector('.search-box');
  if (!searchBox) return;

  searchBox.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const content = document.querySelector('.content');
    const elements = content.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, code');

    elements.forEach(element => {
      const text = element.textContent.toLowerCase();
      if (text.includes(query)) {
        element.style.backgroundColor = query ? '#fff3cd' : '';
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        element.style.backgroundColor = '';
      }
    });
  });
}

/**
 * Initialize code copy functionality
 */
function initCodeCopy() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(block => {
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.className = 'copy-btn';
    copyButton.style.cssText = `
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      background: #0079d3;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    `;

    const pre = block.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(copyButton);

    pre.addEventListener('mouseenter', () => {
      copyButton.style.opacity = '1';
    });

    pre.addEventListener('mouseleave', () => {
      copyButton.style.opacity = '0';
    });

    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(block.textContent);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        copyButton.textContent = 'Failed';
      }
    });
  });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
  const themeToggle = document.createElement('button');
  themeToggle.textContent = '🌙';
  themeToggle.className = 'theme-toggle';
  themeToggle.style.cssText = `
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem;
    background: #0079d3;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    z-index: 1000;
    font-size: 1.2rem;
  `;

  document.body.appendChild(themeToggle);

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const mobileMenuButton = document.createElement('button');
  mobileMenuButton.textContent = '☰';
  mobileMenuButton.className = 'mobile-menu-btn';
  mobileMenuButton.style.cssText = `
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
  `;

  navbar.insertBefore(mobileMenuButton, navbar.firstChild);

  const navList = navbar.querySelector('ul');
  
  mobileMenuButton.addEventListener('click', () => {
    navList.style.display = navList.style.display === 'flex' ? 'none' : 'flex';
  });

  // Hide mobile menu on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navList.style.display = 'flex';
    }
  });
}

/**
 * Initialize syntax highlighting
 */
function initSyntaxHighlighting() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(block => {
    // Add language class based on content
    const content = block.textContent;
    if (content.includes('function') || content.includes('const') || content.includes('import')) {
      block.className = 'language-javascript';
    } else if (content.includes('<') && content.includes('>')) {
      block.className = 'language-html';
    } else if (content.includes('{') && content.includes('}')) {
      block.className = 'language-css';
    }
  });
}

/**
 * Initialize component showcase functionality
 */
function initComponentShowcase() {
  const showcases = document.querySelectorAll('.component-showcase');
  
  showcases.forEach(showcase => {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Code';
    toggleButton.className = 'btn btn-secondary';
    toggleButton.style.marginTop = '1rem';
    
    const codeBlock = showcase.querySelector('pre');
    if (codeBlock) {
      codeBlock.style.display = 'none';
      showcase.appendChild(toggleButton);
      
      toggleButton.addEventListener('click', () => {
        codeBlock.style.display = codeBlock.style.display === 'none' ? 'block' : 'none';
        toggleButton.textContent = codeBlock.style.display === 'none' ? 'Show Code' : 'Hide Code';
      });
    }
  });
}

/**
 * Initialize API endpoint styling
 */
function initAPIEndpointStyling() {
  const apiEndpoints = document.querySelectorAll('.api-endpoint');
  
  apiEndpoints.forEach(endpoint => {
    const method = endpoint.querySelector('.api-method');
    const url = endpoint.querySelector('.api-url');
    
    if (method && url) {
      // Add click to copy functionality
      url.style.cursor = 'pointer';
      url.title = 'Click to copy URL';
      
      url.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(url.textContent);
          url.style.backgroundColor = '#4caf50';
          url.style.color = 'white';
          setTimeout(() => {
            url.style.backgroundColor = '';
            url.style.color = '';
          }, 1000);
        } catch (err) {
          console.error('Failed to copy URL:', err);
        }
      });
    }
  });
}

/**
 * Add loading animation to content
 */
function addLoadingAnimation() {
  const content = document.querySelector('.content');
  if (content) {
    content.classList.add('fade-in');
  }
}

/**
 * Initialize table of contents
 */
function initTableOfContents() {
  const content = document.querySelector('.content');
  if (!content) return;

  const headings = content.querySelectorAll('h1, h2, h3');
  const toc = document.createElement('div');
  toc.className = 'table-of-contents';
  toc.innerHTML = '<h3>Table of Contents</h3><ul></ul>';
  
  const tocList = toc.querySelector('ul');
  
  headings.forEach((heading, index) => {
    const id = heading.id || `heading-${index}`;
    heading.id = id;
    
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = heading.textContent;
    a.style.paddingLeft = `${(parseInt(heading.tagName.charAt(1)) - 1) * 1}rem`;
    
    li.appendChild(a);
    tocList.appendChild(li);
  });
  
  content.insertBefore(toc, content.firstChild);
}

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchBox = document.querySelector('.search-box');
      if (searchBox) {
        searchBox.focus();
      }
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
      const searchBox = document.querySelector('.search-box');
      if (searchBox) {
        searchBox.value = '';
        searchBox.dispatchEvent(new Event('input'));
      }
    }
  });
}

/**
 * Initialize progress bar
 */
function initProgressBar() {
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #ff4500, #0079d3);
    z-index: 1001;
    transition: width 0.3s ease;
  `;
  
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });
}

/**
 * Initialize back to top button
 */
function initBackToTop() {
  const backToTop = document.createElement('button');
  backToTop.textContent = '↑';
  backToTop.className = 'back-to-top';
  backToTop.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    background: #ff4500;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    z-index: 1000;
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(backToTop);
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTop.style.opacity = '1';
    } else {
      backToTop.style.opacity = '0';
    }
  });
  
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
  initTableOfContents();
  initKeyboardShortcuts();
  initProgressBar();
  initBackToTop();
  addLoadingAnimation();
}); 