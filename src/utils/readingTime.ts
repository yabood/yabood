export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  if (minutes === 1) {
    return '1 min read';
  } else {
    return `${minutes} min read`;
  }
}
