"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useApp } from '@/context/AppContext';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, cartItemCount, isCartOpen, dispatch, logout } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await productsApi.search(value);
        setSearchResults(data.products.slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const navLinks = [
    { href: '/homepage', label: 'Home' },
    { href: '/products', label: 'Shop' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-card border-b border-cartiq-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <div className="flex-shrink-0">
              <AppLogo
                size={36}
                text="CartIQ"
                onClick={() => router.push('/homepage')}
                className="cursor-pointer"
              />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 font-heading ${
                    isActive(link.href)
                      ? 'bg-cartiq-bg-secondary text-cartiq-foreground'
                      : 'text-cartiq-muted hover:text-cartiq-foreground hover:bg-cartiq-bg-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-cartiq-muted hover:text-cartiq-foreground hover:bg-cartiq-bg-secondary transition-all duration-150"
                  aria-label="Search"
                >
                  <Icon name="MagnifyingGlassIcon" size={18} />
                </button>

                {isSearchOpen && (
                  <div className="absolute right-0 top-12 w-[340px] bg-white rounded-xl shadow-elevated border border-cartiq-border overflow-hidden z-50">
                    <form onSubmit={handleSearchSubmit} className="p-3">
                      <div className="relative">
                        <Icon
                          name="MagnifyingGlassIcon"
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-cartiq-subtle"
                        />
                        <input
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          placeholder="Search products…"
                          className="search-input w-full pl-9 pr-4 py-2.5 text-sm"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-cartiq-accent border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </form>

                    {searchResults.length > 0 && (
                      <div className="border-t border-cartiq-border-subtle">
                        {searchResults.map((product) => (
                          <Link
                            key={product._id}
                            href={`/product-detail?id=${product._id}`}
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-cartiq-bg-secondary transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-cartiq-bg-secondary overflow-hidden flex-shrink-0">
                              {product.images?.[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-cartiq-foreground truncate">{product.name}</p>
                              <p className="text-xs text-cartiq-muted">${product.price.toFixed(2)}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/products?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                          className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-cartiq-accent font-medium border-t border-cartiq-border-subtle hover:bg-cartiq-accent-light transition-colors"
                        >
                          View all results for &quot;{searchQuery}&quot;
                          <Icon name="ArrowRightIcon" size={14} />
                        </Link>
                      </div>
                    )}

                    {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-cartiq-muted border-t border-cartiq-border-subtle">
                        No products found for &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART', payload: true })}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center text-cartiq-muted hover:text-cartiq-foreground hover:bg-cartiq-bg-secondary transition-all duration-150"
                aria-label={`Cart (${cartItemCount} items)`}
              >
                <Icon name="ShoppingBagIcon" size={18} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-cartiq-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 font-mono">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* User */}
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-cartiq-bg-secondary transition-all duration-150"
                  >
                    <div className="w-7 h-7 rounded-full bg-cartiq-dark flex items-center justify-center text-white text-xs font-bold font-heading">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-cartiq-foreground hidden sm:block font-heading">
                      {user.name.split(' ')[0]}
                    </span>
                    <Icon name="ChevronDownIcon" size={14} className="text-cartiq-muted" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-elevated border border-cartiq-border overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-cartiq-border-subtle">
                        <p className="text-sm font-semibold text-cartiq-foreground font-heading">{user.name}</p>
                        <p className="text-xs text-cartiq-muted truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { setIsUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-cartiq-error hover:bg-red-50 transition-colors"
                        >
                          <Icon name="ArrowRightOnRectangleIcon" size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'login' })}
                  className="btn-primary px-4 py-2 text-sm hidden sm:flex items-center gap-2"
                >
                  <Icon name="UserIcon" size={15} />
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-cartiq-muted hover:bg-cartiq-bg-secondary transition-all duration-150"
                aria-label="Menu"
              >
                <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-cartiq-border px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium font-heading transition-all ${
                    isActive(link.href)
                      ? 'bg-cartiq-bg-secondary text-cartiq-foreground'
                      : 'text-cartiq-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'login' }); }}
                  className="btn-primary px-4 py-2.5 text-sm mt-2 flex items-center justify-center gap-2"
                >
                  <Icon name="UserIcon" size={15} />
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-16 md:h-18" />
    </>
  );
}