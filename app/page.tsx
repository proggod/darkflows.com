import FeatureCarousel from '@/components/FeatureCarousel';
import ScrollReveal from '@/components/ScrollReveal';
import DataConnectSection from '@/components/DataConnectSection';
import TopNavBar from '@/components/TopNavBar';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import siteContent from '@/data/site-content.json';
import { SiteContent } from '@/types';

export default function Home() {
  const content = siteContent as SiteContent;

  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />
      <ScrollReveal data={content.hero} />
      <div className="space-y-2">
        <DataConnectSection data={content.dataConnect} sectionId="data-section-1" imageOnRight={true} />
        <DataConnectSection data={content.dataConnect} sectionId="data-section-2" imageOnRight={false} />
        <DataConnectSection data={content.dataConnect} sectionId="data-section-3" imageOnRight={true} />
        <DataConnectSection data={content.dataConnect} sectionId="data-section-4" imageOnRight={false} />
      </div>
      <div>
        <FeatureCarousel />
      </div>
      <FAQ data={content.faq} />
      <Footer data={content.footer} />
    </main>
  );
}