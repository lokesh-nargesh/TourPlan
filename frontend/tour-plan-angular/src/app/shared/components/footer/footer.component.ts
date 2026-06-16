import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <p>&copy; 2026 VibeTour. Made with ❤️ for Final Year College Project.</p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <span>&middot;</span>
          <a href="#">Terms of Use</a>
          <span>&middot;</span>
          <a href="#">Help Center</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--glass-border);
      background: rgba(10, 10, 22, 0.5);
      color: var(--text-muted);
      padding: 24px 16px;
      margin-top: auto;
      width: 100%;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }
    .footer-links {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: var(--transition-smooth);
    }
    .footer-links a:hover {
      color: var(--text-secondary);
    }
    @media (max-width: 768px) {
      .footer-container {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
