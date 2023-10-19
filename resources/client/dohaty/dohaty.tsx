import {useNavigate, useLocation} from 'react-router-dom';
import {useLocalStorage} from '@common/utils/hooks/local-storage';

export function Dohaty() {
  const navigate = useNavigate();
  const [redirectedFrom, setRedirectedFrom] = useLocalStorage<string>('redirectedFrom');
  const {pathname} = useLocation();

  const playDeniedHandler = (e: Event) => {
    setRedirectedFrom(pathname);
    navigate('/pricing?reason=denied')
  }

  window.addEventListener('playDenied', playDeniedHandler);
  return <></>
}
