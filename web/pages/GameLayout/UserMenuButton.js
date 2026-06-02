import {useNavigate} from 'react-router-dom';
import {AiOutlineUser} from 'react-icons/ai';

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
      <AiOutlineUser aria-hidden="true" className={css.userMenuIcon} size={24} />
    </Button>
  );
}
