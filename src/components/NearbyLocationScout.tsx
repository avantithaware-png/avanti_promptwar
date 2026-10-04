import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Search, ExternalLink, Sparkles, Building2, BookOpen, Coffee, Train, PlusCircle, Check } from 'lucide-react';

interface NearbyPlace {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}

interface NearbyLocationScoutProps {
  decisionTitle: string;
  defaultLocation?: string;
  onAttachToNotes?: (placeText: string) => void;
}

export const NearbyLocationScout: React.FC<NearbyLocationScoutProps> = ({
  decisionTitle,
  defaultLocation = '',
  onAttachToNotes,
}) => {
  const [category, setCategory] = useState<string>('study_workspaces');
  const [cityOrArea, setCityOrArea] = useState<string>(defaultLocation);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultsText, setResultsText] = useState<string | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attachedIdx, setAttachedIdx] = useState<number | null>(null);

  const categories = [
    {
      id: 'study_workspaces',
      label: 'Quiet Study & Focus Spots',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      tagline: 'Check evening focus feasibility',
    },
    {
      id: 'tech_companies',
      label: 'Alternative Tech Employers',
      icon: <Building2 className="w-3.5 h-3.5" />,
      tagline: 'Compare local industry options',
    },
    {
      id: 'coworking_hubs',
      label: 'Co-Working & Innovation Hubs',
      icon: <Coffee className="w-3.5 h-3.5" />,
      tagline: 'Hybrid workspaces & networking',
    },
    {
      id: 'commute_transit',
      label: 'Commute & Transit Hubs',
      icon: <Train className="w-3.5 h-3.5" />,
      tagline: 'Evaluate real travel bottlenecks',
    },
  ];

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setDetectingGps(false);
        setCityOrArea('Current Device Location');
      },
      (err) => {
        setDetectingGps(false);
        setError('Could not detect location. Please type your city or area below.');
      },
      { timeout: 10000 }
    );
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResultsText(null);
    setPlaces([]);

    try {
      const payload: any = {
        decisionTitle,
        category,
        customQuery: customQuery.trim() || undefined,
        cityOrArea: cityOrArea.trim() || undefined,
      };

      if (coords) {
        payload.latitude = coords.lat;
        payload.longitude = coords.lng;
      }

      const res = await fetch('/api/nearby-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch nearby locations.');
      }

      const data = await res.json();
      setResultsText(data.text);
      setPlaces(data.places || []);
    } catch (err: any) {
      setError(err.message || 'Error discovering nearby places.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = (place: NearbyPlace, idx: number) => {
    if (onAttachToNotes) {
      onAttachToNotes(`• Verified Location: ${place.title} (${place.uri})`);
      setAttachedIdx(idx);
      setTimeout(() => setAttachedIdx(null), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-code text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>GEOGRAPHIC REALITY CHECK · GOOGLE MAPS GROUNDING</span>
            </div>
            <h2 className="font-serif-display text-2xl text-zinc-100">
              Nearby Location Scout & Top 3 Recommendations
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Decisions frequently suffer from spatial illusions—assuming a commute is easy, or that a quiet study spot exists nearby. Scout real nearby locations grounded with Google Maps.
            </p>
          </div>
        </div>

        {/* Category Pills / Buttons */}
        <div className="pt-2">
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase font-code mb-2">
            Select Scout Objective:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  category === cat.id
                    ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200 shadow-sm'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-200 mb-0.5">
                  <span className={category === cat.id ? 'text-emerald-400' : 'text-zinc-400'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </div>
                <div className="text-[10px] text-zinc-500">{cat.tagline}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Location Input & GPS Bar */}
        <form onSubmit={handleSearch} className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                value={cityOrArea}
                onChange={(e) => {
                  setCityOrArea(e.target.value);
                  setCoords(null);
                }}
                placeholder="Enter city, neighborhood, or university (e.g., Seattle, WA or Downtown Austin)"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400/80"
              />
            </div>

            <button
              type="button"
              onClick={handleDetectGps}
              disabled={detectingGps}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Navigation className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
              <span>{detectingGps ? 'Locating...' : 'Use My GPS Location'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Optional: Refine search (e.g., 'libraries open until 10 PM' or 'logistics software companies')"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-400/60"
            />

            <button
              type="submit"
              disabled={loading || (!cityOrArea.trim() && !coords)}
              className="w-full sm:w-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Grounding via Google Maps...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Top 3 Locations</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-800 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Results Block */}
      {resultsText && (
        <div className="space-y-4 animate-fade-in">
          {/* Top 3 Verified Places Grid with Direct Google Maps URLs */}
          {places.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-code text-emerald-400 uppercase">
                  TOP 3 VERIFIED GOOGLE MAPS LOCATIONS
                </span>
                <span className="text-[11px] text-zinc-500">Live Grounding Links</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {places.slice(0, 3).map((place, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#12151c] border border-zinc-800/90 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      <div className="text-[10px] font-code text-emerald-400 mb-1">
                        RANK 0{idx + 1}
                      </div>
                      <h4 className="font-semibold text-zinc-100 text-xs line-clamp-2">
                        {place.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                      <a
                        href={place.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>Open in Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {onAttachToNotes && (
                        <button
                          type="button"
                          onClick={() => handleAttach(place, idx)}
                          className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                          title="Save to Decision Notes"
                        >
                          {attachedIdx === idx ? (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Saved
                            </span>
                          ) : (
                            <>
                              <PlusCircle className="w-3 h-3" />
                              <span>Add to Notes</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Analytical Breakdown from Maps Grounding */}
          <div className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-code text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPATIAL DECISION AUDIT & ANALYSIS</span>
            </div>

            <div className="text-xs text-zinc-300 leading-relaxed space-y-3 whitespace-pre-wrap font-sans-body">
              {resultsText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
