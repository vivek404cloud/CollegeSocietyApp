import React from 'react';

import { DetailCard } from '@/components/common/DetailCard';

export function HomeDetailsScreen() {
  return (
    <DetailCard
      title="Home Details"
      description="This detail screen proves the Home tab owns its own stack navigator inside the bottom tabs."
    />
  );
}
