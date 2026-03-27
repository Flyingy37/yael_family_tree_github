import { memo } from 'react';

interface GenerationBandNodeProps {
  data: {
    generation: number;
    language?: 'en' | 'he';
    isEven: boolean;
    bandHeight: number;
  };
}

export const GenerationBandNode = memo(({ data }: GenerationBandNodeProps) => {
  const { generation, language, isEven, bandHeight } = data;
  const label =
    language === 'he'
      ? `דור ${generation > 0 ? '+' : ''}${generation}`
      : `Gen ${generation > 0 ? '+' : ''}${generation}`;

  return (
    <div
      style={{
        width: 10000,
        height: bandHeight,
        backgroundColor: isEven ? '#f8fafc' : '#f1f5f9',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        borderTop: '1px solid #e2e8f0',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: '#94a3b8',
          fontWeight: 700,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          direction: 'ltr',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
});

GenerationBandNode.displayName = 'GenerationBandNode';
