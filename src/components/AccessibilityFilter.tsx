interface FilterState {
  minScore: number;
  category: string;
  businessType: string;
}

interface AccessibilityFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export type { FilterState };

export function AccessibilityFilter({ filters, onChange }: AccessibilityFilterProps) {
  return (
    <div style={{
      backgroundColor: '#E0F7FA', borderRadius: '8px',
      padding: '12px 16px', marginBottom: '12px',
      display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'
    }}>
      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#00ACC1' }}>
        Filter:
      </span>

      {/* Minimum Score Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '14px', color: '#444' }}>Min Score:</label>
        <select
          value={filters.minScore}
          onChange={e => onChange({ ...filters, minScore: Number(e.target.value) })}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
        >
          <option value={0}>Any</option>
          <option value={3}>3+ (Fair)</option>
          <option value={4}>4+ (Good)</option>
          <option value={4.5}>4.5+ (Excellent)</option>
        </select>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '14px', color: '#444' }}>Category:</label>
        <select
          value={filters.category}
          onChange={e => onChange({ ...filters, category: e.target.value })}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
        >
          <option value="all">All</option>
          <option value="mobility">Mobility & Physical Access</option>
          <option value="sensory">Sensory</option>
          <option value="service">Service Quality</option>
          <option value="restroom">Restrooms</option>
          <option value="parking">Parking</option>
        </select>
      </div>

      {/* Business Type Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '14px', color: '#444' }}>Type:</label>
        <select
          value={filters.businessType}
          onChange={e => onChange({ ...filters, businessType: e.target.value })}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
        >
          <option value="all">All Types</option>
          <option value="restaurant">Restaurants</option>
          <option value="establishment">General</option>
          <option value="lodging">Hotels</option>
          <option value="store">Shops</option>
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({ minScore: 0, category: 'all', businessType: 'all' })}
        style={{
          padding: '4px 12px', backgroundColor: 'white', border: '1px solid #ddd',
          borderRadius: '4px', cursor: 'pointer', fontSize: '14px', color: '#666'
        }}
      >
        Reset
      </button>
    </div>
  );
}
