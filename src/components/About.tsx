export function About() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 16px' }}>
      <h2 style={{ color: '#00ACC1', fontSize: '28px', marginBottom: '8px' }}>About</h2>
      <div style={{ width: '48px', height: '4px', backgroundColor: '#F06292', borderRadius: '2px', marginBottom: '32px' }} />

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#006978', fontSize: '18px', marginBottom: '16px' }}>Our Mission</h3>
        <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.8', margin: 0 }}>
          Accessibility Tracker was built by and for people with disabilities. Navigating the world as a disabled person can be challenging, but gaining access to the knowledge and experience of others in the community can make it easier. Our goal is to create a space where disabled travelers can share honest, structured accessibility reviews and help each other find places that actually work for them.
        </p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#006978', fontSize: '18px', marginBottom: '16px' }}>Why Community Data Matters</h3>
        <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.8', marginBottom: '12px' }}>
          Official accessibility ratings tell you whether a ramp exists. They do not tell you whether the ramp is steep, whether the accessible entrance is around the back through a parking lot, or whether the staff actually know how to help. That kind of knowledge lives in the disability community and right now it is scattered across private conversations, Facebook groups, and word of mouth.
        </p>
        <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.8', margin: 0 }}>
          Every review you submit makes the app more useful for the next person. The more reviews we have, the more accurately we can surface the places that are genuinely accessible and flag the ones that are not.
        </p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#006978', fontSize: '18px', marginBottom: '16px' }}>How It Works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { n: 1, label: 'Search for a business', desc: 'Use the map to find restaurants, shops, hotels, museums, and more in any city. Search by city or by specific business name.' },
            { n: 2, label: 'Submit a structured review', desc: 'Rate the business across the accessibility categories relevant to your disability. Our tiered review form asks objective questions so scores are meaningful and comparable across reviewers.' },
            { n: 3, label: 'Help others find accessible places', desc: 'Your review is immediately visible to other users. Scores update automatically as more reviews come in, giving a more accurate picture over time.' },
          ].map(item => (
            <div key={item.n} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#00ACC1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', flexShrink: 0, fontSize: '15px' }}>
                {item.n}
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#222', fontSize: '15px' }}>{item.label}</p>
                <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#006978', fontSize: '18px', marginBottom: '16px' }}>What We Track</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
          Reviews are structured around four disability-specific categories. When you create an account you tell us which categories are relevant to you so the review form only shows what matters to your experience.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Mobility & Physical Access', desc: 'Step-free entry, ramps, door width, aisle clearance, accessible restrooms, parking' },
            { label: 'Vision Accessibility', desc: 'Lighting, contrast, braille signage, large print menus, wayfinding' },
            { label: 'Hearing Accessibility', desc: 'Visual alerts, hearing loops, sign language staff, written communication' },
            { label: 'Cognitive & Sensory', desc: 'Noise levels, predictable layout, sensory-friendly hours, low-stimulation areas' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: '#E0F7FA', borderRadius: '8px', padding: '14px', borderTop: '3px solid #00ACC1' }}>
              <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '13px', color: '#006978' }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: '4px solid #F06292' }}>
        <h3 style={{ color: '#F06292', fontSize: '18px', marginBottom: '12px' }}>Coming Soon</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
          We are building additional features that will unlock as our community grows and we have enough data to make them useful.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Accessible Trip Planner', desc: 'Find the top 5 most accessible destinations for any search, with real-time CTA, MTA, and Sound Transit elevator alerts.' },
            //{ label: 'Plan an Accessible Day', desc: 'Build a full day itinerary of accessible stops near each other, with transit directions between each one.' },
            { label: 'Community Elevator Guide', desc: 'Crowdsourced elevator locations and working status for CTA, Metra, MTA, and Sound Transit stations.' },
            //{ label: 'City Accessibility Dashboard', desc: 'City-wide accessibility scores by neighborhood, business type, and disability category.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F06292', flexShrink: 0, marginTop: '6px' }} />
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '14px', color: '#333' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#00ACC1', borderRadius: '8px', padding: '28px', textAlign: 'center' }}>
        <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>Start contributing today</h3>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: '0 0 16px', lineHeight: '1.6' }}>
          The app is only as useful as the community behind it. If you have visited a business recently, your review takes less than two minutes and makes a real difference for the next disabled traveler searching for that place.
        </p>
        <a href="/" style={{ display: 'inline-block', backgroundColor: 'white', color: '#00ACC1', padding: '10px 24px', borderRadius: '4px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
          Open the Map
        </a>
      </div>
    </div>
  );
}
