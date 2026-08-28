export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Gambia International Airlines. All rights reserved.</p>
          <p className="mt-2">Hajj Operations Management System v1.0</p>
        </div>
      </div>
    </footer>
  );
}
