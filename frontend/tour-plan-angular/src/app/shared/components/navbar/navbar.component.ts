import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="glass-header">
      <div class="nav-container">
        <a routerLink="/" class="logo-group">
          <span class="logo-icon">✈</span>
          <span class="logo-text">Vibe<span class="gradient-text">Tour</span></span>
        </a>

        <!-- Menu for Authenticated Users -->
        <div class="nav-links" *ngIf="isLoggedIn">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
          <a routerLink="/planner" routerLinkActive="active" class="nav-item">Create Plan</a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">Profile</a>
        </div>

        <div class="nav-actions">
          <!-- Notification Bell -->
          <div class="notif-wrapper" *ngIf="isLoggedIn">
            <button class="icon-btn" (click)="toggleNotifications($event)">
              <span class="bell-icon">🔔</span>
              <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </button>

            <!-- Notifications Dropdown -->
            <div class="notif-dropdown glass-panel" *ngIf="showNotifications">
              <div class="dropdown-header">
                <h3>Notifications</h3>
                <span class="mark-read" (click)="clearNotifications()">Clear all</span>
              </div>
              <div class="dropdown-body">
                <div class="notif-item" *ngFor="let n of notifications">
                  <div class="notif-title">{{ n.title }}</div>
                  <div class="notif-message">{{ n.message }}</div>
                </div>
                <div class="empty-state" *ngIf="notifications.length === 0">
                  No notifications yet
                </div>
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown / Auth Buttons -->
          <ng-container *ngIf="isLoggedIn; else authButtons">
            <div class="profile-group" (click)="toggleProfileMenu($event)">
              <img [src]="avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'" alt="Avatar" class="avatar">
              <span class="username">{{ username }}</span>
              <div class="profile-dropdown glass-panel" *ngIf="showProfileMenu">
                <a routerLink="/profile" class="dropdown-item">My Preferences</a>
                <div class="dropdown-divider"></div>
                <button (click)="logout()" class="dropdown-item logout-btn">Logout</button>
              </div>
            </div>
          </ng-container>

          <ng-template #authButtons>
            <div class="auth-buttons">
              <a routerLink="/login" class="btn btn-secondary btn-sm">Login</a>
              <a routerLink="/register" class="btn btn-primary btn-sm">Register</a>
            </div>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .glass-header {
      background: rgba(10, 10, 22, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--glass-border);
      position: sticky;
      top: 0;
      z-index: 100;
      width: 100%;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo-group {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      font-size: 1.5rem;
      font-family: var(--font-display);
      font-weight: 800;
      color: var(--text-primary);
    }
    .logo-icon {
      font-size: 1.8rem;
    }
    .nav-links {
      display: flex;
      gap: 24px;
    }
    .nav-item {
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.95rem;
      transition: var(--transition-smooth);
      padding: 6px 12px;
      border-radius: 20px;
    }
    .nav-item:hover, .nav-item.active {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .notif-wrapper {
      position: relative;
    }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      position: relative;
      padding: 8px;
      border-radius: 50%;
      transition: var(--transition-smooth);
    }
    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .bell-icon {
      font-size: 1.25rem;
    }
    .notif-wrapper .badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: var(--accent-secondary);
      color: white;
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 10px;
    }
    .notif-dropdown {
      position: absolute;
      top: 45px;
      right: 0;
      width: 320px;
      border-radius: var(--border-radius-md);
      padding: 16px;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }
    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 8px;
    }
    .dropdown-header h3 {
      font-size: 1rem;
    }
    .mark-read {
      font-size: 0.75rem;
      color: var(--accent-cyan);
      cursor: pointer;
    }
    .dropdown-body {
      max-height: 240px;
      overflow-y: auto;
    }
    .notif-item {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .notif-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .notif-message {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.3;
      margin-top: 2px;
    }
    .empty-state {
      padding: 20px 0;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .profile-group {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      position: relative;
      padding: 6px 12px;
      border-radius: 30px;
      transition: var(--transition-smooth);
    }
    .profile-group:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--glass-border);
    }
    .username {
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--text-primary);
    }
    .profile-dropdown {
      position: absolute;
      top: 45px;
      right: 0;
      width: 180px;
      border-radius: var(--border-radius-sm);
      padding: 8px;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }
    .dropdown-item {
      display: block;
      width: 100%;
      padding: 10px 12px;
      text-align: left;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-decoration: none;
      cursor: pointer;
      border-radius: 4px;
      transition: var(--transition-smooth);
    }
    .dropdown-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }
    .dropdown-divider {
      height: 1px;
      background: var(--glass-border);
      margin: 4px 0;
    }
    .logout-btn {
      color: var(--color-danger);
    }
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--color-danger);
    }
    .auth-buttons {
      display: flex;
      gap: 12px;
    }
    .btn-sm {
      padding: 8px 16px;
      font-size: 0.85rem;
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username = '';
  avatarUrl = '';
  unreadCount = 0;
  notifications: Notification[] = [];
  
  showNotifications = false;
  showProfileMenu = false;

  private userSub!: Subscription;
  private notifInterval: any;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userSub = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.username = user.username;
        this.avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;
        this.loadNotifications(user.id);
        
        // Poll notifications every 15 seconds
        this.notifInterval = setInterval(() => {
          this.loadNotifications(user.id);
        }, 15000);
      } else {
        this.username = '';
        this.avatarUrl = '';
        this.notifications = [];
        this.unreadCount = 0;
        if (this.notifInterval) {
          clearInterval(this.notifInterval);
        }
      }
    });

    // Close dropdowns on outside click
    window.addEventListener('click', () => {
      this.showNotifications = false;
      this.showProfileMenu = false;
    });
  }

  loadNotifications(userId: number) {
    this.notificationService.getNotifications(userId).subscribe(res => {
      if (res && res.success) {
        this.notifications = res.data.slice(0, 5); // show last 5
        this.unreadCount = res.data.length; // simulate total count as unread
      }
    });
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  clearNotifications() {
    this.notifications = [];
    this.unreadCount = 0;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
    if (this.notifInterval) clearInterval(this.notifInterval);
  }
}
