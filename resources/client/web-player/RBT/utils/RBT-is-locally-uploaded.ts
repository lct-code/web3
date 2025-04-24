import {RBT} from '@app/web-player/RBT/RBT';

export function RBTIsLocallyUploaded(RBT: RBT): boolean {
  return (
    RBT?.src != null &&
    (RBT.src.startsWith('storage') ||
      RBT.src.includes('storage/RBT_media'))
  );
}
