import {Album} from '@app/web-player/albums/album';

export function assignAlbumToRBT(album: Album): Album {
  album.RBT = album.RBT?.map(RBT => {
    if (!RBT.album) {
      RBT.album = {...album, RBT: undefined};
    }
    return RBT;
  });
  return album;
}
