import {redirect, useNavigate} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/auth.js';
import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';


export default function EditUser() {
  const navigate = useNavigate();

  return (
    <Section>
      <h1>Check back later</h1>
      <Button onClick={() => navigate('/hub')}>Return to Hub</Button>
    </Section>
  );
}

export async function loader() {
  if(!loadPlayerToken()) {
    return redirect('/');
  }
  return null;
}
