'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface MilestoneData {
  milestone: number;
  days: number;
}

interface User {
  id?: string;
  login?: string;
  name?: string;
  authenticated?: boolean;
}

const milestoneData: MilestoneData[] = [
  { milestone: 0, days: 45 },
  { milestone: 1, days: 118 },
  { milestone: 2, days: 178 },
  { milestone: 3, days: 306 },
  { milestone: 4, days: 447 },
  { milestone: 5, days: 644 },
  { milestone: 6, days: 730 }
];

const WARNING_THRESHOLD = 30;

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cursusBeginDate, setCursusBeginDate] = useState<string>('');
  const [milestone, setMilestone] = useState<string>('');
  const [freezeDays, setFreezeDays] = useState<number | string>('');
  const [results, setResults] = useState<string>('');
  const [bodyClass, setBodyClass] = useState<string>('');

  // Check if user is authenticated and load user data
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.authenticated) {
          // User is authenticated, now fetch user data
          fetch('/api/user-data')
            .then(res => res.json())
            .then(userData => {
              if (userData.user) {
                setUser({
                  id: userData.user.id,
                  login: userData.user.login,
                  name: userData.user.login,
                  authenticated: true
                });
              }
              if (userData.cursusBeginDate) {
                setCursusBeginDate(userData.cursusBeginDate);
              }
              setLoading(false);
            })
            .catch(error => {
              console.error('Error fetching user data:', error);
              setLoading(false);
            });
        } else {
          setUser(null);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching session:', error);
        setLoading(false);
      });
  }, []);

  const validateNumberInput = (value: string): number => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(cleanValue) || 0;
    return numValue > 180 ? 180 : numValue;
  };

  const calculateBlackhole = () => {
    if (!cursusBeginDate || !milestone || isNaN(parseInt(milestone))) {
      setResults('');
      setBodyClass('');
      return;
    }

    const milestoneNum = parseInt(milestone);
    if (milestoneNum < 0 || milestoneNum > 6) {
      setResults('');
      setBodyClass('');
      return;
    }

    const today = new Date();
    const targetData = milestoneData.find(m => m.milestone === milestoneNum);

    if (!targetData) return;

    // Check if user joined before July 2025 for 42UP Move bonus
    const cursusStart = new Date(cursusBeginDate);
    const july2025 = new Date('2025-07-01');
    const isEligibleFor42UPMove = cursusStart < july2025;
    const bonusDays = isEligibleFor42UPMove ? 10 : 0;

    const freezeDaysNum = typeof freezeDays === 'string' ? (freezeDays === '' ? 0 : parseInt(freezeDays)) : freezeDays;
    const deadlineDate = new Date(cursusBeginDate);
    deadlineDate.setDate(deadlineDate.getDate() + targetData.days + freezeDaysNum + bonusDays);
    deadlineDate.setHours(23, 59, 59, 999);

    const daysRemaining = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0;
    const isInDanger = daysRemaining <= WARNING_THRESHOLD && daysRemaining >= 0;

    let resultHTML = `
      <p><strong>Days Remaining:</strong>
        <span class="${isOverdue || isInDanger ? 'danger' : 'safe'}">
          ${isOverdue ? 'OVERDUE by ' + Math.abs(daysRemaining) + ' days' : daysRemaining + ' days'}
        </span>
      </p>
      <p><strong>Blackhole Date:</strong>
        <span class="${isOverdue || isInDanger ? 'danger' : 'safe'}">
          ${deadlineDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      </p>
    `;

    if (cursusBeginDate && !isNaN(milestoneNum)) {
      const shareText = `My blackhole date ${isOverdue ? 'was' : 'is'} ${deadlineDate.toLocaleDateString('fr-FR')}. I have ${isOverdue ? 'MISSED it by ' + Math.abs(daysRemaining) : daysRemaining} days ${isOverdue ? '' : 'remaining'}!`;
      
      resultHTML += `
        <button id="shareButton" class="share-button" onclick="window.handleShare('${shareText}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="share-icon">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
          </svg>
          Share
        </button>
      `;
    }

    setResults(resultHTML);

    if (isOverdue || isInDanger) {
      setBodyClass('danger-zone');
    } else if (daysRemaining > WARNING_THRESHOLD) {
      setBodyClass('safe-zone');
    } else {
      setBodyClass('');
    }
  };

  const handleShare = (shareText: string) => {
    if (navigator.share) {
      navigator.share({
        title: '42 Blackhole Calculator',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText + ' Calculate yours: ' + window.location.href)
        .then(() => alert('Results copied to clipboard!'));
    }
  };

  // Make handleShare available globally for the button
  useEffect(() => {
    (window as any).handleShare = handleShare;
  }, []);

  useEffect(() => {
    calculateBlackhole();
  }, [cursusBeginDate, milestone, freezeDays]);

  // Apply body class
  useEffect(() => {
    document.body.className = bodyClass;
  }, [bodyClass]);

  if (loading) {
    return (
      <div className="card">
        <div className="results">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card">
        <h2>
          <span className="title-container">
            <div className="logo-container">
              <Image src="/logo/42_Logo.svg.png" alt="42 Logo" className="logo-42" width={30} height={30} />
              <div className="blackhole">⚫</div>
            </div>
            <span>Blackhole Calculator</span>
          </span>
        </h2>
        <div className="input-group">
          <button 
            onClick={() => window.location.href = '/api/auth/login'} 
            className="input"
            style={{
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Login with 42 School
          </button>
        </div>
        <div className="footer">
          Made with ❤️ (et a l'arrache) by <a href="https://github.com/erdelp" target="_blank">edelplan</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>
        <span className="title-container">
          <div className="logo-container">
            <Image src="/logo/42_Logo.svg.png" alt="42 Logo" className="logo-42" width={30} height={30} />
            <div className="blackhole">⚫</div>
          </div>
          <span>Blackhole Calculator</span>
        </span>
      </h2>

      <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="label" style={{ marginBottom: '0' }}>Hello, {user.name || user.login}!</label>
        <button 
          onClick={() => window.location.href = '/api/auth/logout'} 
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
          }}
        >
          Logout
        </button>
      </div>

      {cursusBeginDate && (
        <div className="input-group">
          <label className="label">Cursus beginning date:</label>
          <div className="input" style={{ backgroundColor: '#2d2d2d', border: '1px solid #333' }}>
            {new Date(cursusBeginDate).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            })}
          </div>
        </div>
      )}

      <div className="input-group">
        <label className="label">Current Milestone:</label>
        <select 
          id="milestone" 
          className="input" 
          value={milestone} 
          onChange={(e) => setMilestone(e.target.value)}
        >
          <option value="">Select milestone</option>
          <option value="0">Milestone 0</option>
          <option value="1">Milestone 1</option>
          <option value="2">Milestone 2</option>
          <option value="3">Milestone 3</option>
          <option value="4">Milestone 4</option>
          <option value="5">Milestone 5</option>
          <option value="6">Milestone 6</option>
        </select>
      </div>

      <div className="input-group">
        <label className="label">Freeze Days:</label>
        <input 
          type="number" 
          id="freezeDays" 
          className="input" 
          value={freezeDays} 
          placeholder="0"
          min="0" 
          max="180"
          onChange={(e) => setFreezeDays(e.target.value === '' ? '' : validateNumberInput(e.target.value))}
        />
        <small className="disclaimer">
          {cursusBeginDate && new Date(cursusBeginDate) < new Date('2025-07-01') && (
            <p style={{ color: '#4ade80', fontWeight: 'bold' }}>+10 days added for 42UP Move</p>
          )}
          NOTE: Freeze day deadline calculation is inaccurate, but should give you a gross idea of when your blackhole is. Always assume it's earlier.
        </small>
      </div>

      <div id="results" className="results" dangerouslySetInnerHTML={{ __html: results }}></div>

      <div className="footer">
        Made with ❤️ (et a l'arrache) by <a href="https://github.com/erdelp" target="_blank">edelplan</a>
      </div>
    </div>
  );
}
