import Button from '@/components/Button.js';

import css from './UserMenuButton.module.css';


export default function UserMenuButton() {
  return (
    <Button aria-label="Edit Profile" className={css.userMenuButton} type="button">
      <svg
        aria-hidden="true"
        className={css.userMenuIcon}
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
      >
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    </Button>
  );
}
