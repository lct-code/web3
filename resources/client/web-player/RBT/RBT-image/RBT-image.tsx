import {RBT} from '@app/web-player/RBT/RBT';
import {useTrans} from '@common/i18n/use-trans';
import {message} from '@common/i18n/message';
import clsx from 'clsx';
import {MusicNoteIcon} from '@common/icons/material/MusicNote';

interface RBTImageProps {
  RBT: RBT;
  className?: string;
  size?: string;
  background?: string;
}
export function RBTImage({
  RBT,
  className,
  size,
  background = 'bg-fg-base/4',
}: RBTImageProps) {
  const {trans} = useTrans();
  const src = getRBTImageSrc(RBT);
  const imgClassName = clsx(
    className,
    size,
    background,
    'object-cover',
    !src ? 'flex items-center justify-center' : 'block',
  );
  return src ? (
    <img
      className={imgClassName}
      draggable={false}
      loading="lazy"
      src={src}
      alt={trans(message('Image for :name', {values: {name: RBT.name}}))}
    />
  ) : (
    <span className={clsx(imgClassName, 'overflow-hidden')}>
      <MusicNoteIcon className="max-w-[60%] text-divider" size="text-9xl" />
    </span>
  );
}

export function getRBTImageSrc(RBT: RBT) {
  if (RBT.image) {
    return RBT.image;
  } else if (RBT.album?.image) {
    return RBT.album.image;
  }
}
