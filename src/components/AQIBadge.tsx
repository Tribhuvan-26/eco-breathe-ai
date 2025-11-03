interface AQIBadgeProps {
  aqi: number;
}

const AQIBadge = ({ aqi }: AQIBadgeProps) => {
  const getAQIInfo = (aqi: number) => {
    if (aqi === 1) return { label: 'Good', color: 'hsl(var(--aqi-good))', bg: 'hsl(var(--aqi-good) / 0.1)' };
    if (aqi === 2) return { label: 'Moderate', color: 'hsl(var(--aqi-moderate))', bg: 'hsl(var(--aqi-moderate) / 0.1)' };
    if (aqi === 3) return { label: 'Unhealthy (Sensitive)', color: 'hsl(var(--aqi-unhealthy-sensitive))', bg: 'hsl(var(--aqi-unhealthy-sensitive) / 0.1)' };
    if (aqi === 4) return { label: 'Unhealthy', color: 'hsl(var(--aqi-unhealthy))', bg: 'hsl(var(--aqi-unhealthy) / 0.1)' };
    if (aqi === 5) return { label: 'Very Unhealthy', color: 'hsl(var(--aqi-very-unhealthy))', bg: 'hsl(var(--aqi-very-unhealthy) / 0.1)' };
    return { label: 'Hazardous', color: 'hsl(var(--aqi-hazardous))', bg: 'hsl(var(--aqi-hazardous) / 0.1)' };
  };

  const info = getAQIInfo(aqi);

  return (
    <div 
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
      style={{ 
        backgroundColor: info.bg,
        color: info.color
      }}
    >
      <div 
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: info.color }}
      />
      {info.label}
    </div>
  );
};

export default AQIBadge;