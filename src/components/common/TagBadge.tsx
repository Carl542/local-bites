import React from 'react';
import type { ProductTag } from '../../types';


interface TagBadgeProps {
  tag: ProductTag;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  showDescription?: boolean;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  size = 'md',
  selected = false,
  onClick,
  showDescription = false,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const clickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium transition-all select-none ${sizeClasses} ${
        clickable ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${
        selected
          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/50'
          : `${tag.bgColor} ${tag.color} border ${tag.borderColor}`
      }`}
      title={tag.description}
    >
      <span className="text-sm leading-none">{tag.icon}</span>
      <span>{tag.name}</span>
      {showDescription && (
        <span className="text-[10px] opacity-75 hidden sm:inline">
          • {tag.description}
        </span>
      )}
    </div>
  );
};
