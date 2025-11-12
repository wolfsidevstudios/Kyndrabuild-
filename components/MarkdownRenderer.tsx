import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderInlineFormatting = (text: string) => {
    // Split text by markdown markers, process them, and re-join.
    // This handles multiple formats on the same line.
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.substring(2, part.length - 2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-gray-200 text-gray-800 rounded px-1 py-0.5 text-xs font-mono">{part.substring(1, part.length - 1)}</code>;
      }
      return part; // Just text
    });
  };

  const lines = content.trim().split('\n');
  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const elements: React.ReactElement[] = [];
  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  let currentList: React.ReactElement[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="space-y-1 my-2 ml-5 list-disc">{currentList}</ul>);
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    // Heading
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={index} className="text-md font-semibold mb-2 mt-3">{line.substring(4)}</h3>);
      return;
    }
    
    // Unordered list item
    if (line.startsWith('* ') || line.startsWith('- ')) {
      currentList.push(
        <li key={index} className="text-sm">
          {renderInlineFormatting(line.substring(2))}
        </li>
      );
      return;
    }

    // If it's not a list item, flush any existing list and add the new element.
    flushList();
    if (line.trim()) { // Avoid adding empty paragraphs
        elements.push(<p key={index} className="text-sm my-1">{renderInlineFormatting(line)}</p>);
    }
  });

  // Flush any remaining list items at the end
  flushList();

  return <div className="markdown-content">{elements}</div>;
};

export default MarkdownRenderer;