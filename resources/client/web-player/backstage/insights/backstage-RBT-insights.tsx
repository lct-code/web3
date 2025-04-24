import {useParams} from 'react-router-dom';
import {BackstageInsightsLayout} from '@app/web-player/backstage/insights/backstage-insights-layout';
import {InsightsReportCharts} from '@app/admin/reports/insights-report-charts';
import React from 'react';
import {useRBT} from '@app/web-player/RBT/requests/use-RBT';
import {BackstageInsightsTitle} from '@app/web-player/backstage/insights/backstage-insights-title';
import {RBTImage} from '@app/web-player/RBT/RBT-image/RBT-image';
import {RBTLink} from '@app/web-player/RBT/RBT-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';

interface Props {
  isNested?: boolean;
}
export function BackstageRBTInsights({isNested}: Props) {
  const {RBTId} = useParams();
  const {data} = useRBT({loader: 'RBT'});
  return (
    <BackstageInsightsLayout
      reportModel={`RBT=${RBTId}`}
      title={
        data?.RBT && (
          <BackstageInsightsTitle
            image={<RBTImage RBT={data.RBT} />}
            name={<RBTLink RBT={data.RBT} />}
            description={<ArtistLinks artists={data.RBT.artists} />}
          />
        )
      }
      isNested={isNested}
    >
      <InsightsReportCharts />
    </BackstageInsightsLayout>
  );
}
