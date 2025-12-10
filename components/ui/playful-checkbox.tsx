'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type PlayfulCheckboxProps = {
  id?: string;
  label: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  svgWidth?: number | string;
  className?: string;
};

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
});

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 1, ease: 'easeInOut' },
  opacity: { duration: 0.01, delay: isChecked ? 0 : 1 },
});

export function PlayfulCheckbox({
  id,
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  svgWidth = 340,
  className,
}: PlayfulCheckboxProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(!!defaultChecked);
  const current = isControlled ? !!checked : internalChecked;

  const handleChange = (val: boolean | 'indeterminate') => {
    const next = val === true;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <Checkbox checked={current} onCheckedChange={handleChange} id={id} />
        <div className="relative inline-block">
          <Label htmlFor={id}>{label}</Label>
          <motion.svg
            width={typeof svgWidth === 'number' ? svgWidth : svgWidth}
            height="32"
            viewBox={`0 0 ${svgWidth} 30`}
            className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-10"
          >
            <motion.path
              d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
              vectorEffect="non-scaling-stroke"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeMiterlimit={10}
              fill="none"
              initial={false}
              animate={getPathAnimate(!!current)}
              transition={getPathTransition(!!current)}
              className="stroke-neutral-900 dark:stroke-neutral-100"
            />
          </motion.svg>
        </div>
      </div>
    </div>
  );
}