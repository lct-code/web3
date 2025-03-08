import {Lyric} from './lyrics/lyric';
import {Genre} from '../genres/genre';
import {Tag} from '@common/tags/tag';
import {Artist} from '@app/web-player/artists/artist';
import {Album} from '@app/web-player/albums/album';

export const RBT_MODEL = 'RBT';

export interface RBT {
  id: number;
  name: string;
  duration?: number;
  artists?: Artist[];
  plays?: number;
  popularity?: number;
  src?: string;
  image?: string;
  lyric?: Omit<Lyric, 'RBT'>;
  album?: Album;
  owner_id?: number;
  description?: string;
  tags: Tag[];
  genres?: Genre[];
  likes_count?: number;
  reposts_count?: number;
  comments_count?: number;
  updated_at?: string;
  created_at?: string;
  // available in library RBT page only
  added_at?: string;
  model_type: 'RBT';
}
