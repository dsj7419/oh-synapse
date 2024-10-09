import React from 'react';
import { useThemeContext } from '@/context/ThemeContext';

const AbstractBackground: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2560 1920"
        className="w-full h-full opacity-80"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="grad1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-804.109 -2036.8) rotate(64.9401) scale(6436.87 6304.81)">
            <stop stopColor="var(--color-background)" />
            <stop offset="0.083" stopColor={`var(--${theme.accentColor}-7)`} />
            <stop offset="0.364" stopColor={`var(--${theme.accentColor}-5)`} />
            <stop offset="0.658" stopColor="var(--color-background)" />
            <stop offset="0.798" stopColor={`var(--${theme.accentColor}-9)`} />
            <stop offset="1" stopColor="var(--color-background)" />
          </radialGradient>
          <radialGradient id="grad2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(201.6 -1080.02) rotate(64.9401) scale(6436.87 6304.81)">
            <stop stopColor="var(--color-background)" />
            <stop offset="0.083" stopColor={`var(--${theme.accentColor}-2)`} />
            <stop offset="0.333" stopColor={`var(--${theme.accentColor}-1)`} />
            <stop offset="0.658" stopColor="var(--color-background)" />
            <stop offset="0.798" stopColor={`var(--${theme.accentColor}-9)`} />
            <stop offset="1" stopColor="var(--color-background)" />
          </radialGradient>
        </defs>
        <path d="M-119.809 -1055.99L859.027 -684.98C915.435 -663.6 955.626 -624.994 968.519 -579.807L1129.49 -15.6245L1860.47 -241.727C1919.02 -259.836 1985.68 -257.939 2042.09 -236.559L3020.93 134.453C3124.79 173.822 3164.97 266.777 3110.66 342.073L2850.06 703.385C2827.36 734.857 2790.34 759.666 2745.28 773.604L1467.45 1168.86L1748.58 2154.16C1758.67 2189.52 1751.28 2226.32 1727.72 2258.12L1361.75 2752.01L203.258 2312.91C146.85 2291.53 106.659 2252.92 93.7664 2207.73L-67.2076 1643.55L-798.184 1869.65C-856.73 1887.76 -923.398 1885.87 -979.806 1864.48L-2138.3 1425.38L-1787.63 925.687C-1765.05 893.507 -1727.57 868.111 -1681.77 853.942L-405.167 459.07L-686.568 -527.183C-696.491 -561.961 -689.511 -598.157 -666.811 -629.629L-406.21 -990.941C-351.902 -1066.24 -223.676 -1095.36 -119.809 -1055.99Z" fill="url(#grad1)" />
        <path d="M885.9 -99.2158L1864.74 271.796C1921.14 293.177 1961.34 331.783 1974.23 376.97L2135.2 941.152L2866.18 715.049C2924.72 696.94 2991.39 698.837 3047.8 720.218L4026.64 1091.23C4130.5 1130.6 4170.68 1223.55 4116.37 1298.85L3855.77 1660.16C3833.07 1691.63 3796.05 1716.44 3750.99 1730.38L2473.16 2125.63L2754.29 3110.94C2764.38 3146.29 2756.99 3183.09 2733.43 3214.9L2367.46 3708.79L1208.97 3269.68C1152.56 3248.3 1112.37 3209.7 1099.48 3164.51C816.824 2173.87 747.087 1929.46 319.141 429.593C309.218 394.815 316.198 358.619 338.898 327.147L599.499 -34.1647C653.807 -109.461 782.033 -138.585 885.9 -99.2158Z" fill="url(#grad2)" />
      </svg>
    </div>
  );
};

export default AbstractBackground;