import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Mail } from 'lucide-react';
import { SkillMascote } from './SkillMascote';

export function Footer() {
  return (
    <footer className="py-14 px-4 sm:px-6 lg:px-8 theme-footer transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9">
                <SkillMascote size="sm" animate={false} glow={false} className="opacity-80" />
              </div>
              <div>
                <p className="font-bold theme-text leading-tight">SkillMatch</p>
                <p className="text-xs text-neon-blue">Powered by Scout AI</p>
              </div>
            </div>
            <p className="text-sm theme-text-secondary leading-relaxed">
              Scout analisa seu currículo com IA para maximizar suas chances de sucesso.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4 theme-text">Produto</h4>
            <ul className="space-y-2.5 text-sm theme-text-secondary">
              <li>
                <Link to="/analyze" className="theme-link">
                  Analisar Currículo
                </Link>
              </li>
              <li>
                <Link to="/demo" className="theme-link">
                  Ver Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 theme-text">Empresa</h4>
            <ul className="space-y-2.5 text-sm theme-text-secondary">
              <li>
                <a
                  href="https://izcode.com.br/#features"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-link"
                >
                  Sobre
                </a>
              </li>
              <li>
                <a href="#" className="theme-link">
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="https://izcode.com.br/#cta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-link"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold mb-4 theme-text">Siga-nos</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com/Buenolherme"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub de Guilherme Rodrigues"
                className="theme-social-link"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/guilherme-rodrigues-072a89232"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn de Guilherme Rodrigues"
                className="theme-social-link"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/buenolherme/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Guilherme Rodrigues"
                className="theme-social-link"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="theme-social-link">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm theme-text-secondary">
          <p>© 2026 Guilherme Rodrigues / IZCODE. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="theme-link-strong">
              Privacidade
            </a>
            <a href="#" className="theme-link-strong">
              Termos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
