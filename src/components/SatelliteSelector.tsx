import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSatellite } from '@/contexts/SatelliteContext';

export function SatelliteSelector() {
  const { satellites, activeSatellite, setActiveSatellite, isLoading } = useSatellite();

  const items = useMemo(
    () =>
      Object.entries(satellites).map(([slug, label]) => ({
        slug,
        label,
      })),
    [satellites]
  );

  if (items.length === 0) return null;

  return (
    <Select
      value={activeSatellite}
      onValueChange={(value) => {
        void setActiveSatellite(value);
      }}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select satellite" />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.slug} value={item.slug}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

