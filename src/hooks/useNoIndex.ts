import { useEffect } from 'react';

export function useNoIndex() {
  useEffect(() => {
    const getPrev = (name: string) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || null;
    const prevRobots = getPrev('robots');
    const prevGooglebot = getPrev('googlebot');

    const ensure = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
      return tag as HTMLMetaElement;
    };

    const robotsTag = ensure('robots', 'noindex, nofollow');
    const googlebotTag = ensure('googlebot', 'noindex, nofollow');

    return () => {
      if (robotsTag) {
        if (prevRobots) robotsTag.setAttribute('content', prevRobots);
        else robotsTag.remove();
      }
      if (googlebotTag) {
        if (prevGooglebot) googlebotTag.setAttribute('content', prevGooglebot);
        else googlebotTag.remove();
      }
    };
  }, []);
}