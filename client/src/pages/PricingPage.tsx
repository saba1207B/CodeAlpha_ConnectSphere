import React from 'react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { PricingSection } from '../components/landing/PricingSection';

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between pt-16">
      <Navigation />
      <main className="flex-1">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};
