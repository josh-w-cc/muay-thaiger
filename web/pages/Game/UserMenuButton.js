import Button from '@/components/Button.js';

import css from './UserMenuButton.module.css';


export default function UserMenuButton() {
  return (
    <Button className={css.userMenuButton} type="button">
      Edit Profile
    </Button>
  );
}
