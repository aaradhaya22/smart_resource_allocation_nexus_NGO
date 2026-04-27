"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const apiCache = {
  countries: null,
  states: {},
  cities: {}
};

async function fetchCountries() {
  if (apiCache.countries) return apiCache.countries;
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries');
    if (!res.ok) throw new Error();
    const data = await res.json();
    const sorted = data.data.map(c => c.country).sort((a, b) => a.localeCompare(b));
    apiCache.countries = sorted;
    return sorted;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function fetchStates(country) {
  if (!country) return [];
  if (apiCache.states[country]) return apiCache.states[country];
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const states = (data?.data?.states || []).map(s => s.name);
    apiCache.states[country] = states;
    return states;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function fetchCities(country, state) {
  if (!country || !state) return [];
  const key = `${country}-${state}`;
  if (apiCache.cities[key]) return apiCache.cities[key];
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, state })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const cities = data?.data || [];
    apiCache.cities[key] = cities;
    return cities;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default function NewVolunteerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    skill: 'Medical',
    secondarySkills: [],
    isAvailable: true
  });

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    setLoadingLocation(true);
    setLocationError(false);
    fetchCountries().then(c => {
      setCountriesList(c);
      if (c.length === 0) setLocationError(true);
      setLoadingLocation(false);
    });
  }, []);

  useEffect(() => {
    setSelectedState('');
    setSelectedCity('');
    setStatesList([]);
    setCitiesList([]);
    if (selectedCountry) {
      setLoadingLocation(true);
      setLocationError(false);
      fetchStates(selectedCountry).then(s => {
        setStatesList(s);
        if (s.length === 0) setLocationError(true);
        setLoadingLocation(false);
      });
    }
  }, [selectedCountry]);

  useEffect(() => {
    setSelectedCity('');
    setCitiesList([]);
    if (selectedCountry && selectedState) {
      setLoadingLocation(true);
      setLocationError(false);
      fetchCities(selectedCountry, selectedState).then(c => {
        setCitiesList(c);
        if (c.length === 0) setLocationError(true);
        setLoadingLocation(false);
      });
    }
  }, [selectedState, selectedCountry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const fullLocation = `${selectedCity}, ${selectedState}, ${selectedCountry}`;
    
    await fetch('/api/volunteers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, location: fullLocation })
    });
    
    router.push('/volunteers');
  };

  return (
    <div className="animate-fade-in" style={{maxWidth: '600px', margin: '0 auto'}}>
      <header className="page-header" style={{marginBottom: '24px'}}>
        <div>
          <Link href="/volunteers" style={{color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', marginBottom: '8px'}}>← Back to Volunteers</Link>
          <h1 className="gradient-text">Register Volunteer</h1>
        </div>
      </header>

      <form className="glass-panel" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <label style={{fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)'}}>Full Name</label>
          <input 
            type="text" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="primary-skill-select w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1f2937] text-black dark:text-white border-none outline-none focus:outline-none transition"
            placeholder="e.g. Dr. Sarah Chen"
          />
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <label style={{fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)'}}>Primary Skill / Category</label>
          <select 
            value={formData.skill}
            onChange={e => setFormData({...formData, skill: e.target.value})}
            className="primary-skill-select w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1f2937] text-black dark:text-white border-none outline-none focus:outline-none transition"
          >
            <option>Medical</option>
            <option>Food</option>
            <option>Shelter</option>
            <option>Logistics</option>
            <option>Education</option>
          </select>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative'}}>
          <label style={{fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)'}}>Secondary Skills</label>
          <div 
            onClick={() => setShowSecondaryDropdown(!showSecondaryDropdown)}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1f2937] text-black dark:text-white border-none outline-none focus:outline-none transition"
            style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
          >
            <span style={{opacity: formData.secondarySkills.length > 0 ? 1 : 0.5}}>
              {formData.secondarySkills.length > 0 ? formData.secondarySkills.join(", ") : "Select skills..."}
            </span>
            <span style={{transform: showSecondaryDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '12px'}}>▼</span>
          </div>
          {showSecondaryDropdown && (
            <div style={{position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>
              {['Medical', 'Food', 'Shelter', 'Logistics', 'Education'].map(skill => (
                <label key={skill} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', background: 'rgba(255,255,255,0.02)'}}>
                  <input 
                    type="checkbox" 
                    checked={formData.secondarySkills.includes(skill)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({...prev, secondarySkills: [...prev.secondarySkills, skill]}));
                      } else {
                        setFormData(prev => ({...prev, secondarySkills: prev.secondarySkills.filter(s => s !== skill)}));
                      }
                    }}
                    style={{width: '16px', height: '16px', accentColor: 'var(--accent-blue)', cursor: 'pointer'}}
                  />
                  <span style={{fontSize: '14px'}}>{skill}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label style={{fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)'}}>
              Country {loadingLocation && <span style={{fontSize:'12px', color:'var(--accent-blue)'}}>(Loading...)</span>}
              {locationError && <span style={{fontSize:'12px', color:'var(--accent-red)'}}>(Failed to load data)</span>}
            </label>
            <select 
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="primary-skill-select w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1f2937] text-black dark:text-white border-none outline-none focus:outline-none transition"
            >
              <option value="">Select Country</option>
              {(countriesList || []).map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label style={{fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)'}}>State</label>
            <select 
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              disabled={!selectedCountry}
              className="primary-skill-select w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1f2937] text-black dark:text-white border-none outline-none focus:outline-none transition"
            >
              <option value="">Select State</option>
              {(statesList || []).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1'}}>
            <label style={{fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)'}}>City</label>
            <select 
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="primary-skill-select w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1f2937] text-black dark:text-white border-none outline-none focus:outline-none transition"
            >
              <option value="">Select City</option>
              {(citiesList || []).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

         <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px'}}>
          <input 
            type="checkbox" 
            id="available"
            checked={formData.isAvailable}
            onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
            style={{width: '18px', height: '18px', accentColor: 'var(--accent-blue)'}}
          />
          <label htmlFor="available" style={{fontWeight: '500', fontSize: '15px', cursor: 'pointer'}}>Currently Available for Deployment</label>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px'}}>
          <Link href="/volunteers" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
