import React from 'react';
import { TESTBENCH_DISCLOSURE } from '../data/catalogData';
import { NexusLogoMark } from './Header';

interface FooterProps {
  onOpenPolicyModal: (topic: string) => void;
  onFilterCategory: (category: 'Games' | 'Graphics Cards' | 'Processors' | 'Gaming Laptops') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPolicyModal,
  onFilterCategory,
}) => {
  const footerLinks = [
    'About',
    'Editorial Policy',
    'Review Methodology',
    'Contact',
    'Privacy',
    'Terms',
  ];

  return (
    <footer
      id="nexus-footer-section"
      className="nexus-scroll-section scroll-mt-36 mt-16 px-3 sm:px-6 lg:px-8 relative z-10"
    >
      <div className="nexus-editorial-panel max-w-[1360px] mx-auto rounded-3xl px-5 sm:px-8 py-10 text-[#4A5578]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-8 border-b border-[#2E276C]/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <NexusLogoMark className="w-6 h-6" />
              <span className="font-display text-lg font-extrabold tracking-[0.18em] text-[#312A75]">
                NEXUS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5578] leading-relaxed max-w-sm font-medium">
              Independent gaming reviews and hardware performance insights to help
              you play smarter and upgrade confidently.
            </p>
            <div className="pt-2 text-[11px] font-mono font-bold text-[#584CE8]">
              GAMING REVIEWS • HARDWARE INTELLIGENCE • BENCHMARKS
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 text-xs">
            <div>
              <h3 className="font-mono text-[11px] font-bold tracking-[0.14em] text-[#266D75] uppercase mb-3">
                PUBLICATION
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('nexus-faq-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        onOpenPolicyModal('NEXUS — Review Methodology & Benchmarking Accuracy');
                      }
                    }}
                    className="text-[#584CE8] hover:underline font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Benchmarking & Methodology FAQ</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#584CE8]/10 text-[#584CE8]">
                      NEW
                    </span>
                  </button>
                </li>
                {footerLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => onOpenPolicyModal(`NEXUS — ${link}`)}
                      className="text-[#4A5578] hover:text-[#584CE8] font-medium transition-colors cursor-pointer"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-[11px] font-bold tracking-[0.14em] text-[#266D75] uppercase mb-3">
                BENCHMARK INDEX
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => onFilterCategory('Games')}
                    className="text-[#4A5578] hover:text-[#584CE8] font-medium transition-colors cursor-pointer"
                  >
                    PC & Console Game Reviews
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onFilterCategory('Graphics Cards')}
                    className="text-[#4A5578] hover:text-[#584CE8] font-medium transition-colors cursor-pointer"
                  >
                    Graphics Card Hierarchy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onFilterCategory('Processors')}
                    className="text-[#4A5578] hover:text-[#584CE8] font-medium transition-colors cursor-pointer"
                  >
                    CPU Frame-Time Benchmarks
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onFilterCategory('Gaming Laptops')}
                    className="text-[#4A5578] hover:text-[#584CE8] font-medium transition-colors cursor-pointer"
                  >
                    Laptop TGP & Thermal Tests
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* How We Test Section */}
          <div className="nexus-editorial-well lg:col-span-4 p-5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-extrabold text-[#312A75]">
                How We Test
              </h3>
              <span className="text-[10px] font-mono font-bold text-[#266D75]">
                METHODOLOGY v2026.4
              </span>
            </div>
            <p className="text-xs text-[#4A5578] leading-relaxed">
              Every benchmark result published on NEXUS is accompanied by the exact
              test configuration ({TESTBENCH_DISCLOSURE.cpu},{' '}
              {TESTBENCH_DISCLOSURE.memory}), game build version, driver revision,
              ambient lab temperature, and test date. Sample records in this build
              are marked as{' '}
              <span className="text-[#312A75] font-mono font-bold">DEMO DATA</span>.
            </p>
            <button
              type="button"
              onClick={() =>
                onOpenPolicyModal('How We Test & Reference Testbench Specs')
              }
              className="text-xs font-mono font-bold text-[#584CE8] hover:text-[#2E276C] underline underline-offset-4 cursor-pointer"
            >
              Inspect Full Testbench Specifications →
            </button>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#515E7B] font-medium">
          <p>© 2026 NEXUS Gaming Intelligence & Hardware Lab. All rights reserved.</p>
          <p className="font-mono text-[11px] text-[#266D75] font-semibold">
            INR Pricing Referenced from Verified Indian Retail Channels
          </p>
        </div>
      </div>
    </footer>
  );
};
