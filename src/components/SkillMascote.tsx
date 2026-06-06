import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface SkillMascoteProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
  glow?: boolean;
}

const sizeMap = {
  sm: { container: 'w-10 h-10', px: 40 },
  md: { container: 'w-20 h-20', px: 80 },
  lg: { container: 'w-32 h-32', px: 128 },
  xl: { container: 'w-48 h-48', px: 192 },
};

export function SkillMascote({ size = 'md', animate = true, className = '', glow = true }: SkillMascoteProps) {
  const { container } = sizeMap[size];

  const floatVariants: Variants = {
    float: {
      y: [0, -8, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    static: {},
  };

  return (
    <motion.div
      variants={floatVariants}
      animate={animate ? 'float' : 'static'}
      className={`${container} relative ${className}`}
      style={{ filter: glow ? 'drop-shadow(0 0 12px rgba(138,77,255,0.5)) drop-shadow(0 0 24px rgba(39,201,255,0.25))' : undefined }}
    >
      <img
        src="/Scout_transparente.png"
        alt="Scout - SkillMatch AI"
        className="w-full h-full object-contain"
        style={{ background: 'none', mixBlendMode: 'normal' }}
        draggable={false}
      />
    </motion.div>
  );
}
