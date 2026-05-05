import React from 'react';

import { DetailCard } from '@/components/common/DetailCard';
import { useAuth } from '@/store/AuthContext';

export function ProfileDetailsScreen() {
  const { profile } = useAuth();

  return (
    <DetailCard
      title="Profile Details"
      description={
        profile
          ? `Name: ${profile.name || 'Not set'} | College: ${profile.college || 'Not set'} | Branch: ${profile.branch || 'Not set'} | Year: ${profile.year || 'Not set'} | Role: ${profile.role}`
          : 'No profile data loaded yet.'
      }
    />
  );
}
