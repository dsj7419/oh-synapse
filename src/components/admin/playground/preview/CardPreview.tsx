interface CardPreviewProps {
    theme: {
      primaryColor: string;
      panelBackground: string;
    };
  }
  
  export const CardPreview = ({ theme }: CardPreviewProps) => {
    const cardStyles = {
      backgroundColor: theme.panelBackground === 'solid' ? theme.primaryColor : 'rgba(255, 255, 255, 0.5)',
    };
  
    return (
      <div>
        <h3 className="text-lg font-medium">Card Preview</h3>
        <div style={cardStyles} className="p-4 rounded-lg shadow-md">
          This is a themed card.
        </div>
      </div>
    );
  };
  