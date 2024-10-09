// components/admin/playground/preview/BlockquotePreview.tsx

interface BlockquotePreviewProps {
  theme: {
    primaryColor: string;
    font: string;
    typographyScale: string;
  };
}

export const BlockquotePreview = ({ theme }: BlockquotePreviewProps) => {
  const blockquoteStyles = {
    borderLeft: `4px solid ${theme.primaryColor}`,
    fontFamily: theme.font,
    fontSize: theme.typographyScale,
  };

  return (
    <div>
      <h3 className="text-lg font-medium">Blockquote Preview</h3>
      <blockquote style={blockquoteStyles} className="p-4">
        &quot;Perfect typography is certainly the most elusive of all arts. Sculpture in stone alone comes near it in obstinacy.&quot;
      </blockquote>
    </div>
  );
};