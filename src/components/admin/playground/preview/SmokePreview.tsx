import { Box } from '@radix-ui/themes';
import InteractiveSmokeBackground from '@/components/background/InteractiveSmokeBackground';

interface SmokePreviewProps {
  theme: {
    smokeSpeed?: number;
    smokeOpacity?: number;
  };
}

export const SmokePreview: React.FC<SmokePreviewProps> = ({ theme }) => {
  const smokeSpeed = theme.smokeSpeed ?? 0.001;
  const smokeOpacity = theme.smokeOpacity ?? 0.3;

  return (
    <Box
      style={{
        width: '850px',
        height: '450px',
        position: 'relative',
        marginLeft: '0',
        overflow: 'hidden',
        borderRadius: '20px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', 
      }}
    >
      <InteractiveSmokeBackground
        smokeSpeed={smokeSpeed}
        smokeOpacity={smokeOpacity}
      />
    </Box>
  );
};

export default SmokePreview;
