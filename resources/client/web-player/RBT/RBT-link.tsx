import {Link, LinkProps} from 'react-router-dom';
import clsx from 'clsx';
import React, {useMemo} from 'react';
import {slugifyString} from '@common/utils/string/slugify-string';
import {RBT} from '@app/web-player/RBT/RBT';
import {getBootstrapData} from '@common/core/bootstrap-data/use-backend-bootstrap-data';

interface RBTLinkProps extends Omit<LinkProps, 'to'> {
  RBT: RBT;
  className?: string;
}
export function RBTLink({RBT, className, ...linkProps}: RBTLinkProps) {
  const finalUri = useMemo(() => {
    return getRBTLink(RBT);
  }, [RBT]);

  return (
    <Link
      {...linkProps}
      className={clsx(
        'hover:underline overflow-x-hidden overflow-ellipsis',
        className
      )}
      to={finalUri}
    >
      {RBT.name}
    </Link>
  );
}

export function getRBTLink(
  RBT: RBT,
  {absolute}: {absolute?: boolean} = {}
): string {
  let link = `/RBT/${RBT.id}/${slugifyString(RBT.name)}`;
  if (absolute) {
    link = `${getBootstrapData().settings.base_url}${link}`;
  }
  return link;
}
