import React, {memo, Suspense, useContext, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useLocalStorage} from '@common/utils/hooks/local-storage';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {Track} from '@app/web-player/tracks/track';
import {useSilentTrack} from '@app/web-player/tracks/requests/use-track';
import {trackToMediaItem} from '@app/web-player/tracks/utils/track-to-media-item';
import {PlayerStoreContext} from '@common/player/player-context';
import {YoutubeProvider} from '@common/player/providers/youtube/youtube-provider';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {HtmlVideoProvider} from '@common/player/providers/html-video-provider';
import {HtmlAudioProvider} from '@common/player/providers/html-audio-provider';

const HlsProvider = React.lazy(
  () => import('@common/player/providers/hls-provider')
);
const DashProvider = React.lazy(
  () => import('@common/player/providers/dash-provider')
);

interface Props {
  className?: string;
}
export const PlayerOutlet = memo(({className}: Props) => {
  const {getState} = useContext(PlayerStoreContext);
  const navigate = useNavigate();
  const [, setRedirectedFrom] = useLocalStorage<string>('redirectedFrom');
  const {pathname} = useLocation();
  const player = usePlayerActions();
  const silentTrackQuery = useSilentTrack();

  function playDeniedHandler(e: Event) {
    //const silentTrack = silentTrackQuery.data;
    const silentTrack = {
      "id": 1,
      "name": "Silence",
      "number": 0,
      "duration": 10000,
      "youtube_id": null,
      "spotify_popularity": null,
      "owner_id": 1,
      "src": "misc/silence.mp3",
      "plays": 1,
      "created_at": "2024-04-04T19:17:15.000000Z",
      "description": null,
      "image": "misc/silence.png",
      "reposts_count": 0,
      "likes_count": 0,
      "model_type": "track",
      "tags": [],
      "genres": [],
      "artists": [],
      "album": null
    } as unknown as Track;

    if (silentTrack) {
      //console.log('PlayerOutlet setting silentTrack', {silentTrack});
      player.overrideQueue([trackToMediaItem(silentTrack)]);
    }

    setRedirectedFrom(pathname);
    navigate('/pricing?reason=denied')
  }

  useEffect(() => {
    window.addEventListener('playDenied', playDeniedHandler);
  }, []);

  useEffect(() => {
    getState().init();
    return getState().destroy;
  }, [getState]);

  return (
    <div className={className}>
      <Provider />
    </div>
  );
});

function Provider() {
  const provider = usePlayerStore(s => s.providerName);
  switch (provider) {
    case 'youtube':
      return <YoutubeProvider />;
    case 'htmlVideo':
      return <HtmlVideoProvider />;
    case 'htmlAudio':
      return <HtmlAudioProvider />;
    case 'hls':
      return (
        <Suspense>
          <HlsProvider />
        </Suspense>
      );
    case 'dash':
      return (
        <Suspense>
          <DashProvider />
        </Suspense>
      );
    default:
      return null;
  }
}
