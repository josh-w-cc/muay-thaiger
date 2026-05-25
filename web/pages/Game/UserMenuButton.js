import {FaCircleUser} from 'react-icons/fa6';

import Button from '@/components/Button.js';

import css from './UserMenuButton.module.css';


export default function UserMenuButton() {
  return (
    <Button aria-label="Edit Profile" className={css.userMenuButton} type="button">
      <FaCircleUser aria-hidden="true" className={css.userMenuIcon} size={24} />
    </Button>
  );
}
