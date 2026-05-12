export function Footer() {
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
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>
        Contact us: contact@accessibilitytracker.com
      </p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        © {new Date().getFullYear()} Accessibility Tracker. Built by and for the disability community.
      </p>
    </div>
  );
}
