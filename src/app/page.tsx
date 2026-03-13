'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import MilestoneCongrats from './components/MilestoneCongrats';
import Modal from './components/Modal';
import { User } from './utils/types';
import { WARNING_THRESHOLD } from './utils/constants';
import { calculateBlackholeData, validateNumberInput } from './utils/calculator';

export default function Home() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [cursusBeginDate, setCursusBeginDate] = useState<string>('');
	const [campusName, setCampusName] = useState<string>('');
	const [milestone, setMilestone] = useState<string>('');
	const [freezeDays, setFreezeDays] = useState<number | string>('');
	const [results, setResults] = useState<string>('');
	const [bodyClass, setBodyClass] = useState<string>('');
	const [showMilestone6Banner, setShowMilestone6Banner] = useState(false);
	const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);


	// Check if user is authenticated and load user data
	useEffect(() => {
		fetch('/42-blackhole-calculator/api/auth/session')
			.then(res => res.json())
			.then(data => {
				if (data.user && data.user.authenticated) {
					// User is authenticated, now fetch user data
					fetch('/42-blackhole-calculator/api/user-data')
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
								// If cursus begin date is after 8 Dec 2025, show unsupported modal
								const threshold = new Date('2025-12-08');
								try {
									const beginDate = new Date(userData.cursusBeginDate);
									if (!Number.isNaN(beginDate.getTime()) && beginDate > threshold) {
										setShowUnsupportedModal(true);
									}
								} catch (e) {
									console.error('Invalid cursusBeginDate:', e);
								}
							}
							 if (userData.campusName) {
                                setCampusName(userData.campusName);

                                // Trigger unsupported modal for specific campuses (case-insensitive / partial match)
                                const unsupportedCampuses = ['marseille', 'tirana', 'irbid'];
                                const campusLower = String(userData.campusName).toLowerCase();
                                if (unsupportedCampuses.some(c => campusLower.includes(c))) {
                                    setShowUnsupportedModal(true);
                                }
                            }
							if (userData.detectedMilestone !== undefined) {
								setMilestone(userData.detectedMilestone.toString());
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

	const calculateBlackhole = () => {
		const data = calculateBlackholeData({
			cursusBeginDate,
			milestone,
			freezeDays,
			campusName
		});

		if (!data) {
			setResults('');
			setBodyClass('');
			return;
		}

		const { deadlineDate, daysRemaining, isOverdue, isInDanger } = data;

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

		if (cursusBeginDate && !isNaN(parseInt(milestone))) {
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

	// Confetti is rendered inside the MilestoneCongrats component when shown.

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
							<Image src="/42-blackhole-calculator/logo/42_Logo.svg.png" alt="42 Logo" className="logo-42" width={30} height={30} />
							<div className="blackhole">⚫</div>
						</div>
						<span>Blackhole Calculator</span>
					</span>
				</h2>
				<div className="input-group">
					<button
						onClick={() => window.location.href = '/42-blackhole-calculator/api/auth/login'}
						className="input btn btn-login"
					>
						Login with 42 School
					</button>
				</div>
				<div className="footer">
					Made with ❤️ by <a href="https://github.com/erdelp" target="_blank">edelplan</a>
				</div>
			</div>
		);
	}

	if (showUnsupportedModal) {
		return (
			<Modal
				open={true}
				title="Unsupported — New Common Core"
				displayOnly={true}
				content="This tool is not usable for the new common core. Sorry :() ! "
				backHref="/"
				onClose={() => setShowUnsupportedModal(false)}
				onSubmit={() => { }}
			/>
		);
	}

	if (user && milestone === '7') {
		return <MilestoneCongrats />;
	}

	return (
		<div className="card">
			<h2>
				<span className="title-container">
					<div className="logo-container">
						<Image src="/42-blackhole-calculator/logo/42_Logo.svg.png" alt="42 Logo" className="logo-42" width={30} height={30} />
						<div className="blackhole">⚫</div>
					</div>
					<span>Blackhole Calculator</span>
				</span>
			</h2>

			<div className="input-group input-row">
				<label className="label label--no-margin">Hello, {user.name || user.login}!</label>
				<button
					className="btn btn-logout"
					onClick={() => window.location.href = '/42-blackhole-calculator/api/auth/logout'}
				>
					Logout
				</button>
			</div>

			{cursusBeginDate && (
				<div className="input-group">
					<label className="label">Cursus beginning date:</label>
					<div className="input input--readonly">
						{new Date(cursusBeginDate).toLocaleDateString('fr-FR', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric'
						})}
					</div>
				</div>
			)}

			{milestone !== '' && (
				<div className="input-group">
					<label className="label">Current Milestone:</label>
					<div className="input input--readonly">
						Milestone {milestone}
					</div>
				</div>
			)}

			<div className="input-group">
				<label className="label">Freeze Days Taken:</label>
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
					{cursusBeginDate && new Date(cursusBeginDate) < new Date('2025-07-01') && campusName === 'Paris' && (
						<p className="bonus-note">+10 days added for 42UP Move (Paris campus)</p>
					)}
					NOTE: Freeze day deadline calculation is inaccurate, but should give you a gross idea of when your blackhole is. Always assume it's earlier.
				</small>
			</div>

			{/* {showMilestone6Banner && <MilestoneCongrats />} */}

			<div id="results" className="results" dangerouslySetInnerHTML={{ __html: results }}></div>

			<div className="footer">
				Made with ❤️ by <a href="https://github.com/erdelp" target="_blank">edelplan</a>
			</div>
		</div>
	);
}
