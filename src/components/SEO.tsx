import { Helmet } from 'react-helmet-async';
import config from '@/lib/config';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  noindex?: boolean;
}

export function SEO({
  title = 'CoachOS - Your Personal Health & Fitness Coach',
  description = 'Track nutrition, workouts, sleep, medication, and discover recipes. Your all-in-one health and fitness companion.',
  image = `${config.app.url}/og-image.png`,
  url,
  type = 'website',
  keywords = ['health', 'fitness', 'nutrition', 'workout', 'recipes', 'meal tracking'],
  noindex = false,
}: SEOProps) {
  const fullTitle = title.includes('CoachOS') ? title : `${title} | CoachOS`;
  const canonicalUrl = url || config.app.url;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="CoachOS" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebApplication',
          name: fullTitle,
          description,
          url: canonicalUrl,
          image,
          author: {
            '@type': 'Organization',
            name: 'CoachOS',
          },
        })}
      </script>
    </Helmet>
  );
}

// Pre-made SEO components
export function RecipeSEO({ recipe }: { recipe: any }) {
  return (
    <SEO
      title={recipe.name}
      description={recipe.description || `${recipe.name} - ${recipe.calories_per_serving} calories`}
      image={recipe.images?.[0]}
      url={`${config.app.url}/recipe/${recipe.id}`}
      type="article"
      keywords={['recipe', ...(recipe.tags || []), ...(recipe.cuisine_types || [])]}
    />
  );
}

export function DashboardSEO() {
  return (
    <SEO
      title="Dashboard"
      description="Track your health and fitness progress all in one place"
      noindex={true}
    />
  );
}
