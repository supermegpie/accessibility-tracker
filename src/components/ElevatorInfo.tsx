import { useState, useEffect } from 'react';
import { auth } from '../firebase';

interface ElevatorEntry {
  id: number;
  station_name: string;
  transit_line: string;
  city: string;
  entrance_location: string;
  notes: string;
  is_working: boolean;
  created_at: string;
  contribution_count?: number;
  last_updated?: string;
  latest_entrance?: string;
  latest_notes?: string;
  all_working?: boolean;
}

const STATIONS_BY_LINE: Record<string, string[]> = {
  'CTA Red Line': [
    'Howard', 'Jarvis', 'Morse', 'Loyola', 'Granville', 'Thorndale',
    'Bryn Mawr', 'Berwyn', 'Argyle', 'Lawrence', 'Wilson', 'Sheridan',
    'Addison', 'Belmont', 'Fullerton', 'North/Clybourn', 'Clark/Division',
    'Chicago', 'Grand', 'Lake', 'Monroe', 'Jackson', 'Harrison',
    'Cermak-Chinatown', 'Sox-35th', 'Indiana', '43rd', '47th', '51st',
    'Garfield', '63rd', '69th', '79th', '87th', '95th/Dan Ryan'
  ],
  'CTA Blue Line': [
    "O'Hare", 'Rosemont', 'Cumberland', 'Harlem', 'Jefferson Park',
    'Montrose', 'Irving Park', 'Addison', 'Belmont', 'Logan Square',
    'California', 'Western', 'Damen', 'Division', 'Chicago', 'Grand',
    'Clark/Lake', 'Washington', 'Monroe', 'Jackson', 'LaSalle', 'Clinton',
    'UIC-Halsted', 'Racine', 'Illinois Medical District', 'Western',
    'Kedzie-Homan', 'Pulaski', 'Cicero', 'Austin', 'Oak Park',
    'Harlem', 'Forest Park'
  ],
  'CTA Green Line': [
    'Harlem/Lake', 'Oak Park', 'Ridgeland', 'Austin', 'Central',
    'Laramie', 'Cicero', 'Pulaski', 'Conservatory', 'Kedzie',
    'California', 'Ashland', 'Morgan', 'Clinton', 'Clark/Lake',
    'State/Lake', 'Washington/Wabash', 'Adams/Wabash', 'Roosevelt',
    'Cermak-McCormick Place', '35th-Bronzeville-IIT', '43rd', '47th',
    '51st', 'Garfield', 'Halsted', 'King Drive', 'Cottage Grove',
    'Oakton/Skokie', 'Dempster-Skokie'
  ],
  'CTA Brown Line': [
    'Kimball', 'Kedzie', 'Francisco', 'Rockwell', 'Western', 'Damen',
    'Montrose', 'Irving Park', 'Addison', 'Paulina', 'Southport',
    'Belmont', 'Wellington', 'Diversey', 'Fullerton', 'Armitage',
    'Sedgwick', 'Chicago', 'Merchandise Mart', 'Clark/Lake',
    'State/Lake', 'Washington/Wabash', 'Adams/Wabash', 'Harold Washington Library-State/Van Buren', 'LaSalle/Van Buren', 'Quincy', 'Washington/Wells', 'Merchandise Mart'
  ],
  'CTA Orange Line': [
    'Midway', 'Pulaski', 'Kedzie', 'Western', '35th/Archer', 'Halsted',
    'Roosevelt', 'Harold Washington Library-State/Van Buren',
    'LaSalle/Van Buren', 'Quincy', 'Washington/Wells', 'Clark/Lake',
    'State/Lake', 'Washington/Wabash', 'Adams/Wabash'
  ],
  'CTA Pink Line': [
    '54th/Cermak', 'Cicero', 'Kostner', 'Pulaski', 'Central Park',
    'Kedzie', 'California', 'Western', 'Damen', 'Ashland', 'Polk',
    'Morgan', 'Clinton', 'Clark/Lake', 'State/Lake', 'Washington/Wabash',
    'Adams/Wabash', 'Harold Washington Library-State/Van Buren',
    'LaSalle/Van Buren', 'Quincy', 'Washington/Wells'
  ],
  'CTA Purple Line': [
    'Linden', 'Central', 'Noyes', 'Foster', 'Davis', 'Dempster',
    'Main', 'South Boulevard', 'Howard', 'Jarvis', 'Morse', 'Loyola',
    'Granville', 'Thorndale', 'Bryn Mawr', 'Berwyn', 'Argyle',
    'Lawrence', 'Wilson', 'Sheridan', 'Addison', 'Belmont', 'Fullerton',
    'Armitage', 'Sedgwick', 'Chicago', 'Merchandise Mart', 'Clark/Lake',
    'State/Lake', 'Washington/Wabash', 'Adams/Wabash',
    'Harold Washington Library-State/Van Buren', 'LaSalle/Van Buren',
    'Quincy', 'Washington/Wells'
  ],
  'CTA Yellow Line': [
    'Dempster-Skokie', 'Oakton-Skokie', 'Howard'
  ],
  'Metra BNSF': [
    "Chicago Union Station", "Halsted Street", "Western Avenue", "Cicero",
    "Berwyn", "Riverside", "Hollywood (Brookfield Zoo)", "Congress Park",
    "LaGrange Road", "LaGrange Stone Avenue", "Western Springs",
    "Highlands", "Hinsdale", "West Hinsdale", "Clarendon Hills",
    "Westmont", "Downers Grove Main Street", "Downers Grove Belmont",
    "Lisle", "Naperville", "Route 59", "Aurora"
  ],
  'Metra UP-N': [
    "Chicago Ogilvie", "Clybourn", "Rogers Park", "Ravenswood",
    "Edgewater", "Loyola", "Rogers Park", "Evanston Central Street",
    "Evanston Davis Street", "Evanston Main Street", "South Boulevard",
    "Wilmette", "Kenilworth", "Indian Hill", "Winnetka",
    "Hubbard Woods", "Glencoe", "Braeside", "Ravinia Park",
    "Ravinia", "Highland Park", "Highwood", "Fort Sheridan",
    "Lake Forest", "Lake Bluff", "North Chicago", "Great Lakes",
    "Waukegan", "Zion", "Winthrop Harbor", "Kenosha"
  ],
  'Metra MD-N': [
    "Chicago Union Station", "Ravenswood", "Grayland", "Mayfair",
    "Forest Glen", "Edgebrook", "Mortons Grove", "Glenview",
    "Golf", "Park Ridge", "Edison Park", "Norwood Park",
    "Des Plaines", "Prospect Heights", "Wheeling", "Buffalo Grove",
    "Prairie View", "Vernon Hills", "Libertyville", "Lake Bluff",
    "Fox Lake"
  ],
  'MTA 1 Train': [
    'Van Cortlandt Park-242nd St', '238th St', '231st St', '225th St',
    '215th St', 'Marble Hill-225th St', 'Dyckman St', '191st St',
    '181st St', '168th St', '157th St', '145th St', '137th St-City College',
    '125th St', '116th St-Columbia University', 'Cathedral Pkwy-110th St',
    '103rd St', '96th St', '86th St', '79th St', '72nd St', '66th St-Lincoln Center',
    '59th St-Columbus Circle', '50th St', '42nd St-Times Square',
    '34th St-Penn Station', '28th St', '23rd St', '18th St', '14th St',
    'Christopher St-Sheridan Square', 'Houston St', 'Canal St',
    'Franklin St', 'Chambers St', 'Cortlandt St-WTC', 'Rector St', 'South Ferry'
  ],
  'MTA 2 Train': [
    'Wakefield-241st St', 'Nereid Av', 'Burke Av', 'Allerton Av',
    'Pelham Pkwy', 'Bronx Park East', 'E 180th St', 'West Farms Sq-E Tremont Av',
    'Freeman St', 'Simpson St', 'Intervale Av', 'Prospect Av', 'Jackson Av',
    '3rd Av-149th St', '149th St-Grand Concourse', '135th St',
    '125th St', '116th St', 'Central Park North-110th St', '72nd St',
    '66th St-Lincoln Center', '59th St-Columbus Circle', '42nd St-Times Square',
    '34th St-Penn Station', '14th St', 'Chambers St', 'Fulton St',
    'Wall St', 'Clark St', 'Borough Hall', 'Nevins St', 'Atlantic Av-Barclays Ctr',
    'Bergen St', 'Grand Army Plaza', 'Eastern Pkwy-Brooklyn Museum',
    'Franklin Av', 'President St-Medgar Evers College', 'Sterling St',
    'Winthrop St', 'Church Av', 'Beverley Rd', 'Newkirk Av',
    'Flatbush Av-Brooklyn College'
  ],
  'MTA 4 Train': [
    'Woodlawn', 'Mosholu Pkwy', 'Bedford Park Blvd-Lehman College',
    'Kingsbridge Rd', 'Fordham Rd', 'E 183rd St', 'E 180th St',
    'Mt Eden Av', 'Burnside Av', '176th St', 'Tremont Av',
    '170th St', '167th St', '161st St-Yankee Stadium',
    '149th St-Grand Concourse', '138th St-Grand Concourse',
    '125th St', '86th St', '59th St', '51st St', 'Grand Central-42nd St',
    '33rd St', '28th St', '23rd St', '14th St-Union Square',
    'City Hall', 'Brooklyn Bridge-City Hall', 'Fulton St', 'Wall St',
    'Bowling Green', 'Borough Hall', 'Nevins St', 'Atlantic Av-Barclays Ctr',
    'Crown Heights-Utica Av', 'Sutter Av', 'Utica Av', 'New Lots Av'
  ],
  'MTA A Train': [
    'Inwood-207th St', '207th St', 'Dyckman St', '190th St', '181st St',
    '175th St', '168th St', '163rd St-Amsterdam Av', '155th St',
    '145th St', '125th St', '59th St-Columbus Circle', '50th St',
    '42nd St-Port Authority Bus Terminal', '34th St-Penn Station',
    '23rd St', '14th St', 'West 4th St', 'Spring St', 'Canal St',
    'Chambers St', 'Fulton St', 'High St', 'Jay St-MetroTech',
    'DeKalb Av', 'Atlantic Av-Barclays Ctr', 'Nostrand Av',
    'Kingston-Throop Avs', 'Utica Av', 'Ralph Av', 'Rockaway Av',
    'Broadway Jct', 'Liberty Av', 'Van Siclen Av', 'Shepherd Av',
    'Euclid Av', 'Grant Av', '80th St', '88th St', 'Rockaway Blvd',
    '104th St', '111th St', 'Ozone Park-Lefferts Blvd',
    'Aqueduct-North Conduit Av', 'Aqueduct Racetrack',
    'Howard Beach-JFK Airport', 'Broad Channel', 'Far Rockaway-Mott Av',
    'Mott Av', 'Beach 25th St', 'Beach 44th St', 'Beach 60th St',
    'Beach 67th St', 'Beach 90th St', 'Beach 98th St', 'Beach 105th St',
    'Rockaway Park-Beach 116th St'
  ],
  'MTA L Train': [
    '8th Av', '6th Av', '14th St-Union Square', '3rd Av', '1st Av',
    'Bedford Av', 'Lorimer St', 'Graham Av', 'Grand St', 'Montrose Av',
    'Morgan Av', 'Jefferson St', 'DeKalb Av', 'Myrtle-Wyckoff Avs',
    'Halsey St', 'Wilson Av', 'Bushwick Av-Aberdeen St',
    'Broadway Jct', 'Atlantic Av', 'Sutter Av', 'Livonia Av',
    'New Lots Av', 'East 105th St', 'Canarsie-Rockaway Pkwy'
  ],
  'Sound Transit 1 Line': [
    'Lynnwood City Center', 'Shoreline North/185th', 'Shoreline South/148th',
    'Northgate', 'Roosevelt', 'U District', 'University of Washington',
    'Capitol Hill', 'Westlake', 'University Street', 'Pioneer Square',
    'International District/Chinatown', 'Stadium', 'SODO', 'Beacon Hill',
    'Mount Baker', 'Columbia City', 'Othello', 'Rainier Beach',
    'Tukwila International Boulevard', 'SeaTac/Airport', 'Angle Lake',
    'Kent/Des Moines', 'Federal Way Downtown'
  ],
  'Sound Transit 2 Line': [
    'Lynnwood City Center', 'Shoreline North/185th', 'Shoreline South/148th',
    'Northgate', 'Roosevelt', 'U District', 'University of Washington',
    'Capitol Hill', 'Westlake', 'University Street', 'Pioneer Square',
    'International District/Chinatown', 'Judkins Park', 'South Bellevue',
    'East Main', 'Bellevue Downtown', 'Wilburton', 'Spring District/120th',
    'Bel-Red/130th', 'Overlake Village', 'Overlake/NE 40th',
    'Microsoft/SE Redmond', 'Downtown Redmond'
  ],
  'King County Metro': ['Multiple stops — enter station name manually'],
};

const ENTRANCE_OPTIONS = [
  'North entrance', 'South entrance', 'East entrance', 'West entrance',
  'Northwest corner', 'Northeast corner', 'Southwest corner', 'Southeast corner',
  'Inside the station (ask staff)', 'Street level on main road', 'In adjacent building'
];

export function ElevatorInfo() {
  const [city, setCity] = useState('Chicago');
  const [summary, setSummary] = useState<ElevatorEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchStation, setSearchStation] = useState('');
  const [stationResults, setStationResults] = useState<ElevatorEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    station_name: '',
    transit_line: '',
    city: 'Chicago',
    entrance_location: '',
    notes: '',
    is_working: true
  });

  const availableLines = Object.keys(STATIONS_BY_LINE).filter(line => {
    if (form.city === 'Chicago') return line.startsWith('CTA') || line.startsWith('Metra');
    if (form.city === 'New York City') return line.startsWith('MTA');
    if (form.city === 'Seattle') return line.startsWith('Sound Transit') || line.startsWith('King County');
    return true;
  });

  const availableStations = form.transit_line ? STATIONS_BY_LINE[form.transit_line] || [] : [];

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || '') + `/api/elevators/summary?city=${encodeURIComponent(city)}`
      );
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch elevator summary:', err);
    }
    setLoading(false);
  };

  const searchByStation = async () => {
    if (!searchStation) return;
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || '') + `/api/elevators/station?station_name=${encodeURIComponent(searchStation)}&city=${encodeURIComponent(city)}`
      );
      const data = await res.json();
      setStationResults(data);
    } catch (err) {
      console.error('Failed to search station:', err);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) { alert('You must be logged in to submit elevator info.'); return; }
    if (!form.station_name || !form.transit_line) { alert('Please select a transit line and station.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || '') + '/api/elevators',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, firebase_uid: user.uid })
        }
      );
      if (res.ok) {
        setSuccessMessage('Thank you for contributing elevator info!');
        setForm({ station_name: '', transit_line: '', city, entrance_location: '', notes: '', is_working: true });
        setShowForm(false);
        fetchSummary();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    }
    setSubmitting(false);
  };

  useEffect(() => { fetchSummary(); }, [city]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ color: '#00ACC1', fontSize: '26px', marginBottom: '8px' }}>Community Elevator Guide</h2>
      <div style={{ width: '48px', height: '4px', backgroundColor: '#F06292', borderRadius: '2px', marginBottom: '16px' }} />
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
        Finding elevators at transit stations can be one of the most frustrating parts of getting around as a disabled traveler.
        Help others by sharing where elevators are located and whether they were working on your visit.
      </p>

      {/* City selector and search */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '6px' }}>City</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
            >
              <option>Chicago</option>
              <option>New York City</option>
              <option>Seattle</option>
            </select>
          </div>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '6px' }}>Search a specific station</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. Clark/Lake, Times Square"
                value={searchStation}
                onChange={e => setSearchStation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchByStation()}
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
              />
              <button
                onClick={searchByStation}
                style={{ padding: '10px 16px', backgroundColor: '#00ACC1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {stationResults.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '15px', color: '#006978', marginBottom: '12px' }}>Results for "{searchStation}"</h3>
            {stationResults.map((entry, i) => (
              <div key={i} style={{ backgroundColor: '#F0F4F3', borderRadius: '6px', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#222' }}>{entry.station_name} — {entry.transit_line}</p>
                    {entry.entrance_location && <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#444' }}>Elevator location: {entry.entrance_location}</p>}
                    {entry.notes && <p style={{ margin: 0, fontSize: '13px', color: '#666', fontStyle: 'italic' }}>{entry.notes}</p>}
                  </div>
                  <span style={{ backgroundColor: entry.is_working ? '#E8F5E9' : '#FFEBEE', color: entry.is_working ? '#2E7D32' : '#B71C1C', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {entry.is_working ? 'Working' : 'Out of service'}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#999' }}>Reported {new Date(entry.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add info button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#006978', fontSize: '16px' }}>
          Community contributions for {city} {loading ? '— loading...' : `(${summary.length} stations)`}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', backgroundColor: '#F06292', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          {showForm ? 'Cancel' : 'Add Elevator Info'}
        </button>
      </div>

      {successMessage && (
        <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #2E7D32', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', color: '#2E7D32', fontWeight: 'bold' }}>
          {successMessage}
        </div>
      )}

      {/* Contribution form */}
      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: '4px solid #F06292' }}>
          <h3 style={{ margin: '0 0 16px', color: '#F06292', fontSize: '16px' }}>Share Elevator Info</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>City</label>
              <select
                value={form.city}
                onChange={e => setForm(prev => ({ ...prev, city: e.target.value, transit_line: '', station_name: '' }))}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option>Chicago</option>
                <option>New York City</option>
                <option>Seattle</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Transit Line</label>
              <select
                value={form.transit_line}
                onChange={e => setForm(prev => ({ ...prev, transit_line: e.target.value, station_name: '' }))}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Select a line...</option>
                {availableLines.map(line => (
                  <option key={line} value={line}>{line}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Station Name</label>
              {availableStations.length === 1 && availableStations[0].includes('manually') ? (
                <input
                  type="text"
                  placeholder="Enter station name"
                  value={form.station_name}
                  onChange={e => setForm(prev => ({ ...prev, station_name: e.target.value }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              ) : (
                <select
                  value={form.station_name}
                  onChange={e => setForm(prev => ({ ...prev, station_name: e.target.value }))}
                  disabled={!form.transit_line}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: !form.transit_line ? '#f5f5f5' : 'white' }}
                >
                  <option value="">{form.transit_line ? 'Select a station...' : 'Select a line first'}</option>
                  {availableStations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Elevator Location</label>
              <select
                value={form.entrance_location}
                onChange={e => setForm(prev => ({ ...prev, entrance_location: e.target.value }))}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Select location...</option>
                {ENTRANCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Was the elevator working on your visit?</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setForm(prev => ({ ...prev, is_working: true }))}
                style={{ padding: '8px 20px', borderRadius: '4px', border: '2px solid', borderColor: form.is_working ? '#2E7D32' : '#ddd', backgroundColor: form.is_working ? '#E8F5E9' : 'white', color: form.is_working ? '#2E7D32' : '#666', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Yes, working
              </button>
              <button
                onClick={() => setForm(prev => ({ ...prev, is_working: false }))}
                style={{ padding: '8px 20px', borderRadius: '4px', border: '2px solid', borderColor: !form.is_working ? '#B71C1C' : '#ddd', backgroundColor: !form.is_working ? '#FFEBEE' : 'white', color: !form.is_working ? '#B71C1C' : '#666', cursor: 'pointer', fontWeight: 'bold' }}
              >
                No, out of service
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Additional notes (optional)</label>
            <textarea
              placeholder="e.g. Elevator is around the back, easy to miss. Take the north entrance and turn left."
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: '10px 24px', backgroundColor: '#00ACC1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}

      {summary.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p style={{ marginBottom: '8px' }}>No elevator info yet for {city}.</p>
          <p style={{ fontSize: '14px' }}>Be the first to contribute!</p>
        </div>
      )}

      {summary.map((station, i) => (
        <div key={i} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${station.all_working ? '#2E7D32' : '#B71C1C'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 'bold', fontSize: '15px', color: '#222' }}>{station.station_name}</p>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#00ACC1' }}>{station.transit_line} — {station.city}</p>
              {station.latest_entrance && <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#444' }}>Elevator location: {station.latest_entrance}</p>}
              {station.latest_notes && <p style={{ margin: 0, fontSize: '13px', color: '#666', fontStyle: 'italic' }}>{station.latest_notes}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', backgroundColor: station.all_working ? '#E8F5E9' : '#FFEBEE', color: station.all_working ? '#2E7D32' : '#B71C1C', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                {station.all_working ? 'Working' : 'Out of service'}
              </span>
              <span style={{ fontSize: '11px', color: '#999' }}>{station.contribution_count} report{Number(station.contribution_count) > 1 ? 's' : ''}</span>
            </div>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#999' }}>Last updated {new Date(station.last_updated!).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
