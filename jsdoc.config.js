module.exports = {
  // Source files to document
  source: {
    include: [
      'src/components',
      'src/hooks',
      'src/lib',
      'src/app/api',
      'src/types'
    ],
    includePattern: '.+\\.(ts|tsx)$',
    excludePattern: '(node_modules/|__tests__/|__mocks__/)'
  },

  // Output directory for generated documentation
  destination: './docs/website',

  // Template configuration
  template: {
    cleverLinks: true,
    monospaceLinks: true
  },

  // JSDoc tags configuration
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc', 'closure']
  },

  // Templates configuration
  templates: {
    cleverLinks: true,
    monospaceLinks: true,
    default: {
      outputSourceFiles: true,
      includeDate: false
    }
  },

  // Documentation options
  opts: {
    destination: './docs/website',
    recurse: true,
    readme: './docs/homepage.md',
    tutorials: './docs/tutorials'
  },

  // Source type configuration
  sourceType: 'module',

  // Verbose output
  verbose: true,

  // Private members
  private: false,

  // Undocumented identifiers
  undocumented: true,

  // Access levels
  access: ['public', 'protected', 'private'],

  // Sort order
  sort: true,

  // Search
  search: true,

  // Custom CSS
  css: './docs/static/styles.css',

  // Custom JavaScript
  scripts: ['./docs/static/scripts.js']
}; 