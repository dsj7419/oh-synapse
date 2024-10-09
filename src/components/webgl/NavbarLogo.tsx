import React from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import EnhancedWebGLText from './components/EnhancedWebGLText';

const NavbarLogo: React.FC = () => {
  console.log('NavbarLogo: Component is being rendered');
  const { theme } = useThemeContext();

  const width = 180; 
  const height = 64; 

  return (
    <div className="h-full w-full" style={{ width: `${width}px`, height: `${height}px` }}>
      <EnhancedWebGLText
        width={width}
        height={height}
        isLogo={true}
        theme={theme}
      />
    </div>
  );
};

export default NavbarLogo;
