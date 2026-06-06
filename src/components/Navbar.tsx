import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { SkillMascote } from './SkillMascote';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md theme-nav transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo with Scout */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="[&>div>img]:scale-110"
            >
              <SkillMascote size="sm" animate={false} glow={true} />
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-sm leading-tight bg-gradient-neon bg-clip-text text-transparent">
                SkillMatch
              </span>
              <span className="text-xs text-neon-blue leading-tight">AI</span>
            </div>
          </Link>

          {/* Nav items */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/analyze"
              className="text-sm font-medium theme-text-secondary hover:text-neon-blue transition-colors"
            >
              Analisar
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
