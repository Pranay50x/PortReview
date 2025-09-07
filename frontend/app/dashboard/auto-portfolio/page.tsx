"use client";
import AutoPortfolioGenerator from '@/components/AutoPortfolioGenerator';

export default function AutoPortfolioPage() {
  const handlePortfolioCreated = (portfolioData: any) => {
    console.log('Portfolio created:', portfolioData);
    // You can add more logic here, like redirecting to the portfolio view
  };

  return (
    <div>
      <AutoPortfolioGenerator onPortfolioCreated={handlePortfolioCreated} />
    </div>
  );
}
