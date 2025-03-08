import {RBT} from '../RBT';

export interface Lyric {
  id: number;
  text: string;
  RBT_id: number;
  RBT?: RBT;
  is_synced: boolean;
  duration: number | null;
  updated_at: string;
}
