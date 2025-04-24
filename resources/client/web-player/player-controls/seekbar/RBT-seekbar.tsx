import {Slider} from '@common/ui/forms/slider/slider';
import {FormattedDuration} from '@common/i18n/formatted-duration';
import {useRBTeekbar} from '@app/web-player/player-controls/seekbar/use-RBT-seekbar';
import {RBT} from '@app/web-player/RBT/RBT';
import clsx from 'clsx';

interface RBTeekbarProps {
  RBT: RBT;
  queue?: RBT[];
  className?: string;
}
export function RBTeekbar({RBT, queue, className}: RBTeekbarProps) {
  const {duration, ...sliderProps} = useRBTeekbar(RBT, queue);

  return (
    <div className={clsx('flex items-center gap-12', className)}>
      <div className="text-xs text-muted flex-shrink-0 min-w-40 text-right">
        {sliderProps.value ? (
          <FormattedDuration seconds={sliderProps.value} />
        ) : (
          '0:00'
        )}
      </div>
      <Slider
        RBTColor="neutral"
        thumbSize="w-14 h-14"
        showThumbOnHoverOnly={true}
        className="flex-auto"
        width="w-auto"
        {...sliderProps}
      />
      <div className="text-xs text-muted flex-shrink-0 min-w-40">
        <FormattedDuration seconds={duration} />
      </div>
    </div>
  );
}
