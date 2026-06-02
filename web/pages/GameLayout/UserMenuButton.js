import {useNavigate} from 'react-router-dom';
import {PiUserCircleBold} from 'react-icons/pi';

import Button from '@/components/Button.js';

import css from './UserMenuButton.module.css';


export default function UserMenuButton() {
  const navigate = useNavigate();

  return (
    <Button
      aria-label="Edit Profile"
      className={css.userMenuButton}
      onClick={() => navigate('/edit-user')}
      type="button"
    >
      <PiUserCircleBold aria-hidden="true" className={css.userMenuIcon} size={24} />
    </Button>
  );
}
