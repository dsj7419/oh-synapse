"use client";

interface LayoutPreviewProps {
  theme: {
    layout: string;
  };
}

const LayoutPreview = ({ theme }: LayoutPreviewProps) => {
  const isGrid = theme.layout === 'Grid';

  return (
    <div>
      <h3 className="text-lg font-medium">Layout Preview</h3>
      <div style={{ display: 'grid', gridTemplateColumns: isGrid ? 'repeat(3, 1fr)' : 'none' }}>
        {/* Render preview items */}
        <div className="p-4 bg-gray-200">Item 1</div>
        <div className="p-4 bg-gray-300">Item 2</div>
        <div className="p-4 bg-gray-400">Item 3</div>
      </div>
    </div>
  );
};

export default LayoutPreview;
