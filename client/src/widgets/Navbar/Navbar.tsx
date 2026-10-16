import React from 'react';
import './Navbar.css';

export type TabType = 'home' | 'upload' | 'in_progress' | 'archive';

interface NavbarProps {
    currentTab: TabType;
    onSelectTab: (tab: TabType) => void;
    onLogout: () => void;
    activeTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onLogout, activeTasksCount }) => {
    return (
        <header className="navbar-container">
            <div className="navbar-logo" onClick={() => onSelectTab('home')}>
                <span className="logo-badge">CardioGen</span>
                <span className="logo-sub">Genomics Platform</span>
            </div>

            <nav className="navbar-tabs">
                <button className={`nav-tab-btn ${currentTab === 'home' ? 'active' : ''}`} onClick={() => onSelectTab('home')}>
                    Home
                </button>
                <button className={`nav-tab-btn ${currentTab === 'upload' ? 'active' : ''}`} onClick={() => onSelectTab('upload')}>
                    + New analysis
                </button>
                <button className={`nav-tab-btn ${currentTab === 'in_progress' ? 'active' : ''}`} onClick={() => onSelectTab('in_progress')}>
                    In progress {activeTasksCount > 0 && <span className="tab-counter">{activeTasksCount}</span>}
                </button>
                <button className={`nav-tab-btn ${currentTab === 'archive' ? 'active' : ''}`} onClick={() => onSelectTab('archive')}>
                    Results Archive
                </button>
            </nav>

            <button className="navbar-logout-btn" onClick={onLogout}>Log out</button>
        </header>
    );
};
