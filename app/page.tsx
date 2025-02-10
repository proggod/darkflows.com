import FeatureCarousel from '@/app/components/FeatureCarousel';
import ScrollReveal from '@/app/components/ScrollReveal';
import DataConnectSection from '@/app/components/DataConnectSection';
import TopNavBar from '@/app/components/TopNavBar';
import FAQ from '@/app/components/FAQ';
// import Footer from '@/app/components/Footer';
import siteContent from '@/data/site-content.json';
import { SiteContent } from '@/types';
// import VideoTutorials from './components/VideoTutorials'
//import FeaturedPost from '@/app/components/FeaturedPost';
import SwirlingParticles from '@/app/components/SwirlingParticles';

export default function Home() {
  const content = siteContent as SiteContent;

  return (
    <main className="min-h-screen">
      <SwirlingParticles />
      <div className="relative z-10 bg-transparent">
        <TopNavBar />
        {/* <FeaturedPost /> */}
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
      </div>
    </main>
  );
}