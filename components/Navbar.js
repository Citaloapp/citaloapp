import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-lg mx-auto">
        <Link href="/">
          <Image src="/logo.svg" alt="Citalo" width={110} height={28} priority />
        </Link>
      </div>
    </nav>
  );
}
