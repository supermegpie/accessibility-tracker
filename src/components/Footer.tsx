import { useState } from 'react';
export function Footer() {
  const [copied, setCopied] = useState(false);

  const shareApp = async () => {
    const url = 'https://accessibility-tracker-sooty.vercel.app';
    const shareData = {
      title: 'Accessibility Tracker',
      text: 'Rate, review, and discover accessible businesses near you with Accessibility Tracker. Built by and for people with disabilities.',
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (_e) {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{
      backgroundColor: '#006978',
      color: 'white',
      padding: '24px 16px',
      marginTop: '40px',
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: '18px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        margin: '0 0 8px',
        color: '#00ACC1'
      }}>
        Accessibility benefits EVERYONE
      </p>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>
        Know someone who would find this useful? Share the app with your community.
      </p>
      <button
        onClick={shareApp}
        style={{
          padding: '10px 24px',
          backgroundColor: '#F06292',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          marginBottom: '16px'
        }}
      >
        {copied ? 'Link copied!' : 'Share this app'}
      </button>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>
        Contact us: contact@accessibilitytracker.com
      </p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        © {new Date().getFullYear()} Accessibility Tracker. Built by and for the disability community.
      </p>
    </div>
  );
}
