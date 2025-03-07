import Link from 'next/link';

const Navbar = () => {
  return (
    <div className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center space-x-4">
            <Link href="/cv-generator" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              CV Generator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 