import {useNavigate} from 'react-router-dom';
import {TbUserCircle} from 'react-icons/tb';

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
      <TbUserCircle aria-hidden="true" className={css.userMenuIcon} size={24} />
    </Button>
  );
}
