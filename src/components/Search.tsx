import { useEffect, useState } from 'react';

interface SearchResult {
  type: 'Blog Post' | 'Project' | 'Noise';
  title: string;
  description: string;
  url: string;
  publishedDate: Date;
  tags: string[];
  relevance: number;
}

interface SearchProps {
  blogPosts: any[];
  projects: any[];
  noiseEntries: any[];
}

export default function Search({ blogPosts, projects, noiseEntries }: SearchProps) {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Get initial query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q') || '';
    setQuery(q);
    if (q) {
      performSearch(q);
    }
  }, []);

  const performSearch = (searchQuery: string) => {
    setHasSearched(true);
    setSearchedQuery(searchQuery);
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search blog posts
    for (const post of blogPosts) {
      const titleMatch = post.title.toLowerCase().includes(q);
      const descMatch = post.description.toLowerCase().includes(q);
      const tagMatch = post.tags?.some((tag: string) => tag.toLowerCase().includes(q));

      if (titleMatch || descMatch || tagMatch) {
        searchResults.push({
          type: 'Blog Post',
          title: post.title,
          description: post.description,
          url: `/blog/${post.slug}`,
          publishedDate: new Date(post.pubDate),
          tags: post.tags || [],
          relevance: titleMatch ? 3 : descMatch ? 2 : 1,
        });
      }
    }

    // Search projects
    for (const project of projects) {
      const titleMatch = project.title.toLowerCase().includes(q);
      const descMatch = project.description.toLowerCase().includes(q);
      const tagMatch = project.tags?.some((tag: string) => tag.toLowerCase().includes(q));

      if (titleMatch || descMatch || tagMatch) {
        searchResults.push({
          type: 'Project',
          title: project.title,
          description: project.description,
          url: `/projects/${project.slug}`,
          publishedDate: new Date(project.startDate),
          tags: project.tags || [],
          relevance: titleMatch ? 3 : descMatch ? 2 : 1,
        });
      }
    }

    // Search noise entries
    for (const noise of noiseEntries) {
      const summaryMatch = noise.summary?.toLowerCase().includes(q);
      const contentMatch = noise.content?.toLowerCase().includes(q);

      if (summaryMatch || contentMatch) {
        searchResults.push({
          type: 'Noise',
          title: noise.summary || 'Untitled',
          description: noise.content ? noise.content.substring(0, 150) + '...' : '',
          url: `/noise#${noise.id}`,
          publishedDate: new Date(noise.publishedAt),
          tags: [],
          relevance: summaryMatch ? 2 : 1,
        });
      }
    }

    // Sort by relevance, then by date
    searchResults.sort((a, b) => {
      if (a.relevance !== b.relevance) {
        return b.relevance - a.relevance;
      }
      return b.publishedDate.getTime() - a.publishedDate.getTime();
    });

    setResults(searchResults);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div>
      {/* Search Form */}
      <form className="mb-8" onSubmit={handleSearch}>
        <div className="flex gap-4">
          <input
            type="search"
            name="q"
            value={query}
            onChange={handleInputChange}
            placeholder="Search blog posts, projects, and noise..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
            Search
          </button>
        </div>
      </form>

      {hasSearched && searchedQuery && (
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {results.length > 0
              ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchedQuery}"`
              : `No results found for "${searchedQuery}"`}
          </p>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result, index) => (
            <article key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {result.type}
                    </span>
                    <time
                      dateTime={result.publishedDate.toISOString()}
                      className="text-sm text-gray-500 dark:text-gray-400">
                      {result.publishedDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    <a
                      href={result.url}
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {result.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{result.description}</p>
                  {result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {hasSearched && searchedQuery && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No results found. Try different keywords or browse:
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/blog"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              All Blog Posts
            </a>
            <a
              href="/projects"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
              All Projects
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
