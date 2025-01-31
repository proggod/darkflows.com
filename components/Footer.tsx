import { FaEnvelope, FaTwitter, FaDiscord, FaLinkedin, FaReddit, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';

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

interface FooterProps {
  data: {
    sections: FooterSection[];
    socials: Social[];
    tagline: string;
  };
}

const socialIcons: { [key: string]: React.ComponentType } = {
  envelope: FaEnvelope,
  twitter: FaTwitter,
  discord: FaDiscord,
  linkedin: FaLinkedin,
  reddit: FaReddit,
  youtube: FaYoutube,
};

export default function Footer({ data }: FooterProps) {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      <div className="py-4 flex justify-center">
        <div className="w-full max-w-[1024px] px-4">
          <div className="flex flex-wrap justify-between">
            {data.sections.map((section, index) => (
              <div key={index} className="flex flex-col shrink-0 basis-auto pr-8 last:pr-0">
                <h3 className="text-white font-medium text-base">{section.title}</h3>
                <ul className="-mt-1">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex} className="leading-tight">
                      <Link 
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200 block py-0.5"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
            <p className="text-gray-400 text-sm">{data.tagline}</p>
            <div className="flex items-center gap-3">
              {data.socials.map((social, index) => {
                const Icon = socialIcons[social.icon];
                return (
                  <Link
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 