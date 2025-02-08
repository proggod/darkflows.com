import TopNavBar from '@/app/components/TopNavBar';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <TopNavBar />
      <div className="py-6">
        {children}
      </div>
    </div>
  );
} 