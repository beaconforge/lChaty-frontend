/**
 * Admin portal main component
 */

import { User } from '@/services/api.user';
import { ProvidersPage } from './pages/ProvidersPage';
import { ModelsPage } from './pages/ModelsPage';
import { AuditPage } from './pages/AuditPage';
import { HealthPage } from './pages/HealthPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

type AdminPage = 'providers' | 'models' | 'audit' | 'health' | 'users' | 'settings';

export class AdminPortal {
  private container: HTMLElement;
  private user: User;
  private currentPage: AdminPage = 'providers';
  private pages: Partial<Record<AdminPage, any>> = {};
  
  public onLogout?: () => void;

  constructor(container: HTMLElement, user: User) {
    this.container = container;
    this.user = user;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="admin-layout">
        <!-- Header -->
        <header class="admin-header">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold text-gray-900">lChaty Admin Portal</h1>
            <span id="adminPageTitle" class="ml-4 text-sm text-gray-600"></span>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              Welcome, <span class="font-medium">${this.user.username}</span>
            </span>
            <a href="/" class="text-sm text-primary-600 hover:text-primary-500">
              Back to lChaty
            </a>
            <button id="logoutButton" class="text-sm text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </div>
        </header>
        
        <!-- Sidebar Navigation -->
        <nav class="admin-sidebar">
          <div class="admin-nav">
            <a href="#" class="admin-nav-item ${this.currentPage === 'providers' ? 'active' : ''}" data-page="providers">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
              </svg>
              Providers
            </a>
            
            <a href="#" class="admin-nav-item ${this.currentPage === 'models' ? 'active' : ''}" data-page="models">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/>
              </svg>
              Models
            </a>
            
            <a href="#" class="admin-nav-item ${this.currentPage === 'audit' ? 'active' : ''}" data-page="audit">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Audit Logs
            </a>
            
            <a href="#" class="admin-nav-item ${this.currentPage === 'health' ? 'active' : ''}" data-page="health">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              System Health
            </a>

            <a href="#" class="admin-nav-item ${this.currentPage === 'users' ? 'active' : ''}" data-page="users">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5s-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3zm0 2c-2.667 0-8 1.333-8 4v1h18v-1c0-2.667-5.333-4-8-4zM16 13c-1.333 0-4 0-4 2v1h8v-1c0-2-2.667-2-4-2z"/>
              </svg>
              Users
            </a>

            <a href="#" class="admin-nav-item ${this.currentPage === 'settings' ? 'active' : ''}" data-page="settings">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-.667 0-1.333.333-1.667.667L8 12l2.333 3.333C10.667 15.667 11.333 16 12 16s1.333-.333 1.667-.667L16 12l-2.333-3.333C13.333 8.333 12.667 8 12 8zM3 12a9 9 0 1018 0 9 9 0 00-18 0z"/>
              </svg>
              Settings
            </a>
          </div>
        </nav>
        
        <!-- Main Content -->
        <main class="admin-main">
          <div id="pageContent">
            <!-- Page content will be rendered here -->
          </div>
        </main>
      </div>
    `;

    this.attachEventListeners();
    this.showPage(this.currentPage);
  }

  private attachEventListeners(): void {
    // Navigation
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const navItem = target.closest('[data-page]') as HTMLElement;
      
      if (navItem) {
        e.preventDefault();
        const page = navItem.getAttribute('data-page') as AdminPage;
        this.navigateToPage(page);
      }
    });

    // Logout
    const logoutButton = this.container.querySelector('#logoutButton');
    logoutButton?.addEventListener('click', () => {
      if (this.onLogout) {
        this.onLogout();
      }
    });
  }

  private navigateToPage(page: AdminPage): void {
    this.currentPage = page;
    this.updateNavigation();
    this.showPage(page);
  }

  private updateNavigation(): void {
    // Update active nav item
    const navItems = this.container.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
      const page = item.getAttribute('data-page');
      if (page === this.currentPage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  private showPage(page: AdminPage): void {
    const contentContainer = this.container.querySelector('#pageContent') as HTMLElement;
    if (!contentContainer) return;

    // Destroy existing page if any
    if (this.pages[this.currentPage]) {
      // Clean up if page has cleanup method
    }

    // Create and render new page
    switch (page) {
      case 'providers':
        this.pages[page] = new ProvidersPage(contentContainer);
        break;
      case 'models':
        this.pages[page] = new ModelsPage(contentContainer);
        break;
      case 'audit':
        this.pages[page] = new AuditPage(contentContainer);
        break;
      case 'health':
        this.pages[page] = new HealthPage(contentContainer);
        break;
      case 'users':
        this.pages[page] = new UsersPage(contentContainer);
        break;
      case 'settings':
        this.pages[page] = new SettingsPage(contentContainer);
        break;
    }

    if (this.pages[page]) {
      this.pages[page].render();
    }

    // Update page title in header
    const titleEl = this.container.querySelector('#adminPageTitle');
    if (titleEl) {
      const titles: Record<AdminPage, string> = {
        providers: 'Providers',
        models: 'Models',
        audit: 'Audit Logs',
        health: 'System Health',
        users: 'Users',
        settings: 'Settings',
      };
      titleEl.textContent = titles[page] || '';
    }
  }
}