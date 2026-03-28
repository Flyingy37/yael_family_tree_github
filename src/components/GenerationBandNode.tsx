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
        backgroundColor: isEven ? '#fafbfc' : '#f4f6f9',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        borderTop: '1px solid #dde3ec',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          color: '#a0aec0',
          fontWeight: 700,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          direction: 'ltr',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          background: '#ffffff',
          border: '1px solid #dde3ec',
          borderRadius: 5,
          padding: '2px 7px',
          lineHeight: 1.6,
        }}
      >
        {label}
      </span>
    </div>
  );
});

GenerationBandNode.displayName = 'GenerationBandNode';
