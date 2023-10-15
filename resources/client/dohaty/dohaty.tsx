import {useNavigate} from 'react-router-dom';

export function Dohaty() {
  const navigate = useNavigate();

  const playDeniedHandler = (e: Event) => {
    navigate('/pricing?reason=denied')
  }

  window.addEventListener('playDenied', playDeniedHandler);
  return <></>
}
