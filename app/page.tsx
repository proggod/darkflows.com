import FeatureCarousel from '@/components/FeatureCarousel';
import ScrollReveal from '@/components/ScrollReveal';
import DataConnectSection from '@/components/DataConnectSection';
import TopNavBar from '@/components/TopNavBar';
import FAQ from '@/components/FAQ';
// import Footer from '@/components/Footer';
import siteContent from '@/data/site-content.json';
import { SiteContent } from '@/types';
// import VideoTutorials from './components/VideoTutorials'

export default function Home() {
  const content = siteContent as SiteContent;

  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />
      <ScrollReveal data={content.hero} />
      <div className="space-y-2">
        {content.dataConnectSections.map((section, index) => (
          <DataConnectSection
            key={section.id}
            data={section}
            sectionId={section.id}
            imageOnRight={index % 2 === 0}
          />
        ))}
      </div>
      <div>
        <FeatureCarousel />
      </div>
      {/* <VideoTutorials /> */}
      <FAQ data={content.faq} />
      {/* <Footer data={content.footer} /> */}
    </main>
  );
}