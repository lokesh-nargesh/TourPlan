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
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
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
