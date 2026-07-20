export function About() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 16px' }}>
      <h2 style={{ color: '#00ACC1', fontSize: '28px', marginBottom: '8px' }}>About</h2>
      <div style={{ width: '48px', height: '4px', backgroundColor: '#F06292', borderRadius: '2px', marginBottom: '32px' }} />

      <div style={{
        backgroundColor: 'white', borderRadius: '8px',
        padding: '28px', marginBottom: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ color: '#006978', fontSize: '18px', marginBottom: '16px' }}>Our Mission</h3>
        <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.8', margin: 0 }}>
          Navigating the world as a disabled person can be challenging, but having access to the knowledge and experience of others in our community can make it a little bit easier. This app was built by and for individuals with disabilities. Our goal is to provide an interactive space for travelers with disabilities to rate businesses and locations on their accessibility and make their reviews visible to other users.
        </p>
      </div>

      <div style={{
        backgroundColor: 'white', borderRadius: '8px',
        padding: '28px', marginBottom: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ color: '#006978', fontSize: '18px', marginBottom: '16px' }}>How It Works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10%', backgroundColor: '#F06292', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', flexShrink: 0 }}>1</div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#222', fontSize: '15px'}}>Search for businesses</p>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Use the map page to search for restaurants, stores, hotels, and much more in any city. Initial results are pulled from Google Places and enhanced with verified community accessibility data.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10%',backgroundColor: '#F06292', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', flexShrink: 0 }}>2</div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#222', fontSize: '15px' }}>Save and rate businesses</p>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Save any business to the tracker and submit a personalized accessibility review across five categories: mobility, sensory, service, restrooms, and parking.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10%', backgroundColor: '#F06292', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', flexShrink: 0 }}>3</div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#222', fontSize: '15px' }}>Plan accessible trips</p>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Use the Trip Planner to find the top 5 most accessible destinations for any search, combining Google data, community scores, and real-time transit status for Chicago, NYC, and Seattle (more cities will be added pending available transit data). </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10%', backgroundColor: '#F06292', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', flexShrink: 0 }}>4</div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#222', fontSize: '15px' }}>Plan accessible day</p>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Use the Plan a Day tool to plan an full accessible day out. Choose what kind of day (e.g., date night, family-friendly, adventure), how many stops (e.g., 3-5), and we'll suggest accessible options. </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10%', backgroundColor: '#F06292', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', flexShrink: 0 }}>5</div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#222', fontSize: '15px' }}>View community elevator guide</p>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Use the Community Elevator Guide to help others by sharing where elevators are located and whether they were working on your visit. </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white', borderRadius: '8px',
        padding: '28px', marginBottom: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ color: '#006978', fontSize: '18px', marginBottom: '16px' }}>What We Track</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Mobility & Physical Access', desc: 'Ramps, elevators, door width, accessible restrooms' },
            { label: 'Sensory Accessibility', desc: 'Braille menus, hearing loops, volume level, lighting' },
            { label: 'Staff & Service Quality', desc: 'Obvious training and accommodation' },
            
            { label: 'Parking & Transportation', desc: 'Designated spots, drop-off zones, proximity' },
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: '#E0F7FA', borderRadius: '6px',
              padding: '14px', borderTop: '4px solid #F06292'
            }}>
              <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '13px', color: '#006978' }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        backgroundColor: '#00ACC1', borderRadius: '8px',
        padding: '28px', textAlign: 'center'
      }}>
        <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>Want to contribute?</h3>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: '0 0 16px', lineHeight: '1.6' }}>
          Search for a business in your city and share your experience! The more reviews we have, the more useful this website becomes for EVERYONE (because as we know accessibility doesn't just help people with disabilities).
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block', backgroundColor: '#F06292',
            color: 'white', padding: '10px 24px', borderRadius: '4px',
            fontWeight: '1000', textDecoration: 'none', fontSize: '14px'
          }}
        >
          Start Exploring
        </a>
      </div>
    </div>
  );
}
