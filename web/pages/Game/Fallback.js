import {useNavigate} from 'react-router-dom';


export default function Fallback() {
  const navigate = useNavigate();

  return (
    <>
      <h1>You broke it!?</h1>
      <button onClick={() => navigate('/hub')}>We have to go back</button>
    </>
  );
}
