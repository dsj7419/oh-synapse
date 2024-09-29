"use client";

import { Checkbox, Flex, Box, Text } from '@radix-ui/themes';
import type { Theme } from '@/defaults/themeDefaults';

interface CheckboxPreviewProps {
  theme: Theme;
}

const checkboxVariants: Array<'classic' | 'soft' | 'surface'> = ["classic", "soft", "surface"];
const checkboxColors = ["", "gray"];

export const CheckboxPreview = ({ theme }: CheckboxPreviewProps) => {
  const renderCheckboxes = () => {
    return checkboxVariants.map((variant) => (
      <tr key={variant} className="border-t border-gray-200">
        <td
          className="py-1 px-2 font-medium"
          style={{ color: 'var(--color-text)' }} 
        >
          {variant.charAt(0).toUpperCase() + variant.slice(1)}
        </td>
        {checkboxColors.map((color) => (
          <td key={color} className="py-1 px-2">
            <Flex gap="2" align="center">
              {/* Unchecked Checkbox */}
              <Checkbox
                variant={variant}
                data-accent-color={color} 
                className="rt-reset rt-Checkbox rt-r-size-2"
              />
              {/* Checked Checkbox */}
              <Checkbox
                defaultChecked
                variant={variant}
                data-accent-color={color} 
                className="rt-reset rt-Checkbox rt-r-size-2"
              />
            </Flex>
          </td>
        ))}
        {/* Disabled Checkboxes (Unchecked and Checked) */}
        <td className="py-1 px-2">
          <Flex gap="2" align="center">
            {/* Unchecked Disabled */}
            <Checkbox
              disabled
              variant={variant}
              className="rt-reset rt-Checkbox rt-r-size-2"
            />
            {/* Checked Disabled */}
            <Checkbox
              defaultChecked
              disabled
              variant={variant}
              className="rt-reset rt-Checkbox rt-r-size-2"
            />
          </Flex>
        </td>
      </tr>
    ));
  };

  return (
    <div className="checkbox-preview">
      {/* Header Section */}
      <div className="flex items-baseline">
        <h1 className="text-2xl font-semibold">Checkbox Grid Preview</h1>
      </div>

      {/* Checkbox Preview Table */}
      <div className="mt-4"> {/* Removed centering logic */}
        <table className="w-auto text-left table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-1 px-2"></th>
              <th className="py-1 px-2">Accent</th>
              <th className="py-1 px-2">Gray</th>
              <th className="py-1 px-2">Disabled</th>
            </tr>
          </thead>
          <tbody>{renderCheckboxes()}</tbody>
        </table>
      </div>
    </div>
  );
};
