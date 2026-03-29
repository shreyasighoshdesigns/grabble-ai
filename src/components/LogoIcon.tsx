import { SVGProps } from 'react';

export function LogoIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g stroke="currentColor" strokeWidth="20" strokeLinecap="butt" strokeLinejoin="miter">
        {/* Main circular bowl of the g */}
        <circle cx="43.75" cy="30" r="20" />
        
        {/* Right ear protruding perfectly horizontal */}
        <path d="M 63.75,10 L 86.25,10" />
        
        {/* Vertical right stem dropping down */}
        <path d="M 63.75,10 L 63.75,70" />
        
        {/* Lower hook sweeping left and ending in a flat horizontal cut pointing up */}
        <path d="M 63.75,70 A 20 20 0 0 1 23.75,70" />
      </g>
    </svg>
  );
}
