import GoldDisplay from './GoldDisplay.js';
import NavHeader from './NavHeader.js';
import UserMenuButton from './UserMenuButton.js';

import css from './Header.module.css';


export default function Header() {
  return (
    <div className={css.headerLayout}>
      <div className={css.headerControls}>
        <GoldDisplay />
        <UserMenuButton />
      </div>
      <NavHeader />
    </div>
  );
}
