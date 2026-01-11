import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// VitePress Configuration for 9Boxer User Guide
// This is a proof-of-concept migration from MkDocs Material
// Goal: Eliminate Python dependency and use TypeScript/Node ecosystem

export default withMermaid(defineConfig({
  // Site metadata
  title: '9Boxer User Guide',
  description: 'Complete guide to using the 9Boxer desktop application for talent management',

  // Base path - for local file:// protocol compatibility
  // Similar to MkDocs use_directory_urls: false
  base: './',

  // Output directory
  outDir: '../site',

  // Theme configuration - aligned with 9Boxer brand colors
  themeConfig: {
    // Primary brand color (blue) - matches 9Boxer app
    // This affects links, buttons, and active states
    colorScheme: 'auto',
    // Logo
    logo: '/images/logo.png',

    // Site title
    siteTitle: '9Boxer User Guide',

    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/quickstart' },
      { text: 'Reference', link: '/keyboard-shortcuts' }
    ],

    // Sidebar navigation - matches MkDocs nav structure
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Overview', link: '/overview' },
          { text: 'Quickstart (2 min)', link: '/quickstart' },
          { text: 'Your First Calibration', link: '/getting-started' },
          { text: 'New to 9-Box?', link: '/new-to-9box' }
        ]
      },
      {
        text: 'Core Features',
        items: [
          { text: 'Employee Data', link: '/employee-data' },
          { text: 'The 9-Box Grid', link: '/understanding-grid' },
          { text: 'Employee Details', link: '/working-with-employees' },
          { text: 'Tracking Changes', link: '/tracking-changes' },
          { text: 'Filtering', link: '/filters' },
          { text: 'Statistics', link: '/statistics' },
          { text: 'Intelligence', link: '/intelligence' },
          { text: 'Donut Mode', link: '/donut-mode' },
          { text: 'Exporting', link: '/exporting' },
          { text: 'Settings', link: '/settings' }
        ]
      },
      {
        text: 'Running Calibration',
        items: [
          { text: 'Making Changes', link: '/making-changes' },
          { text: 'Adding Notes', link: '/adding-notes' },
          { text: 'Analyzing Distribution', link: '/analyzing-distribution' },
          { text: 'Identifying Flight Risks', link: '/identifying-flight-risks' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Keyboard Shortcuts', link: '/keyboard-shortcuts' },
          { text: 'Best Practices', link: '/best-practices' },
          { text: 'Large Datasets (100+)', link: '/large-dataset-guide' },
          { text: 'Detection Methodology', link: '/detection-methodology' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
          { text: 'FAQ', link: '/faq' }
        ]
      },
      {
        text: 'Calibration Deep Dives',
        collapsed: true,
        items: [
          { text: 'Filter Strategy', link: '/reference/filtering-decision-tree' },
          { text: 'Power Dynamics & Politics', link: '/reference/power-dynamics-and-politics' },
          { text: 'Psychological Safety', link: '/reference/psychological-safety' },
          { text: 'Difficult Scenarios', link: '/reference/difficult-scenarios' },
          { text: 'Post-Calibration Conversations', link: '/reference/post-calibration-conversations' },
          { text: 'Cultural Calibration', link: '/reference/cultural-calibration' },
          { text: 'Multi-Year Tracking', link: '/reference/multi-year-tracking' }
        ]
      },
      {
        text: 'About',
        items: [
          { text: 'How We Build', link: '/about/how-we-build' }
        ]
      }
    ],

    // Search
    search: {
      provider: 'local'
    },

    // Footer
    footer: {
      message: 'Built with VitePress',
      copyright: 'Copyright © 2024 9Boxer Team'
    },

    // Edit link disabled (docs are bundled with Electron app, not editable on GitHub)
    // editLink: {
    //   pattern: 'https://github.com/bencan1a/9boxer/edit/main/resources/user-guide-vitepress/docs/:path',
    //   text: 'Edit this page on GitHub'
    // },

    // Social links (optional)
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bencan1a/9boxer' }
    ],

    // Additional features
    outline: {
      level: [2, 3], // Show H2 and H3 in outline (matches MkDocs toc_depth: 2)
      label: 'On this page'
    },

    // Dark mode toggle (default to dark like MkDocs)
    appearance: 'dark',

    // Last updated timestamp
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  },

  // Markdown configuration
  markdown: {
    // Code block theme - matching MkDocs dark theme
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },

    // Line numbers in code blocks
    lineNumbers: true,

    // Custom containers (similar to MkDocs admonitions)
    container: {
      tipLabel: '💡 Tip',
      warningLabel: '⚠️ Warning',
      dangerLabel: '🚨 Danger',
      infoLabel: 'ℹ️ Info'
    }
  },

  // Head tags for custom styling
  head: [
    ['link', { rel: 'icon', href: '/images/logo.png' }],
    // Custom CSS for design system alignment
    ['link', { rel: 'stylesheet', href: '/stylesheets/design-tokens.css' }],
    ['link', { rel: 'stylesheet', href: '/stylesheets/extra.css' }]
  ],

  // Clean URLs - similar to MkDocs use_directory_urls: false
  cleanUrls: false,

  // Dead link checking enabled after full migration
  ignoreDeadLinks: false,

  // Language
  lang: 'en-US',

  // Title template
  titleTemplate: ':title | 9Boxer User Guide',

  // Mermaid configuration
  mermaid: {
    // Use dark theme for dark mode, default for light mode
    // This ensures diagrams are readable in both modes
  },

  // Mermaid plugin options
  mermaidPlugin: {
    class: 'mermaid'
  }
}))
