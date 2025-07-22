import { SearchResults } from '@/components/search-results';
import { SearchBar } from '@/components/search-bar';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const initialQuery = searchParams.q || '';

  const handleSearchResult = (result: any) => {
    // Handle search result selection
    console.log('Selected search result:', result);
    // In a real app, this would navigate to the post or comment
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-orange-500">reddit</h1>
            <SearchBar 
              placeholder="Search Reddit"
              className="flex-1 max-w-2xl"
              onResultSelect={handleSearchResult}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <SearchResults 
          initialQuery={initialQuery}
          onResultSelect={handleSearchResult}
        />
      </main>
    </div>
  );
} 