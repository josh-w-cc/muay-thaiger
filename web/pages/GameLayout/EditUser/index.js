import {useNavigate} from 'react-router-dom';

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
