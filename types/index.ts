export interface HeroSection {
  title: string;
  subtitle: string;
  finalTitle: string;
  finalSubtitle: string;
  image: string;
}

export interface Feature {
  title: string;
  subtitle: string;
}

export interface DataConnectSection {
  id: string;
  title: string;
  description: string;
  features: Feature[];
  image: string;
}

export interface CarouselItem {
  title: string;
  description: string;
  imageSrc: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQ {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

interface FooterLink {
  text: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface Social {
  platform: string;
  href: string;
  icon: string;
}

interface Footer {
  sections: FooterSection[];
  socials: Social[];
  tagline: string;
}

export interface SiteContent {
  hero: HeroSection;
  dataConnectSections: DataConnectSection[];
  carousel: CarouselItem[];
  faq: FAQ;
  footer: Footer;
} 