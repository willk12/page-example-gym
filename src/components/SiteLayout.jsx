import { useState } from 'react'
import { ArrowUpRight, Menu, X, MapPin, Phone } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { navigation } from '../data/content.js'

function Brand({ footer = false }) {
  return (
    <Link className={`brand${footer ? ' brand--footer' : ''}`} to="/" aria-label="Viva Academia, início">
      <span className="brand__mark" aria-hidden="true">v.</span>
      <span className="brand__name">viva<span>academia de bairro</span></span>
    </Link>
  )
}

export default function SiteLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className="announcement">
        <span>Gente de verdade. Treino que cabe na vida.</span>
        <Link to="/contato">Marque uma aula experimental <ArrowUpRight size={14} /></Link>
      </div>
      <header className="site-header">
        <div className="header-inner wrap">
          <Brand />
          <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
          <nav id="primary-navigation" className={`main-nav${menuOpen ? ' main-nav--open' : ''}`} aria-label="Navegação principal">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                {item.label}
              </NavLink>
            ))}
            <Link className="button button--small button--dark nav-cta" to="/contato" onClick={closeMenu}>Faça uma aula <ArrowUpRight size={15} /></Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-main wrap">
          <div className="footer-brand-block">
            <Brand footer />
            <p>Um lugar para se mexer, respirar e voltar amanhã.</p>
            <span className="fictional-note">Academia fictícia · informações ilustrativas</span>
          </div>
          <div className="footer-column">
            <span className="footer-label">Explore</span>
            <Link to="/sobre">A academia</Link><Link to="/modalidades">Modalidades</Link><Link to="/planos">Planos</Link>
          </div>
          <div className="footer-column footer-contact">
            <span className="footer-label">Encontre a gente</span>
            <span><MapPin size={15} /> Rua das Palmeiras, 248 · São Paulo, SP</span>
            <span><Phone size={15} /> (11) 4000-2026 · contato fictício</span>
            <Link className="footer-contact-link" to="/contato">Fale com a equipe <ArrowUpRight size={14} /></Link>
          </div>
        </div>
        <div className="footer-bottom wrap"><span>© 2026 Viva Academia. Projeto demonstrativo.</span><span>Feito para viver em movimento.</span></div>
      </footer>
    </>
  )
}