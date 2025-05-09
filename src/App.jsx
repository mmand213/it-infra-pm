import React, { useState, useEffect } from 'react';
import NinjaStarsBackground from './components/NinjaStarsBackground';
import Dashboard from './components/Dashboard';
import ProjectsView from './components/ProjectsView';
import ReportsView from './components/ReportsView';
import ProjectModal from './components/ProjectModal';
import FilterPanel from './components/FilterPanel';
import SearchBar from './components/SearchBar';
import SignupModal from './components/SignupModal';
import LoginModal from './components/LoginModal';
import Settings from './components/Settings';
import { loadProjects, saveProjects } from './utils/storage';
import { loadUsers } from './utils/users';
import { loadCurrentUser, saveCurrentUser } from './utils/auth';

export default function App() {
  // PROJECT STATE
  const [projects, setProjects] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [modalProject, setModalProject] = useState(null);

  // NAV TABS
  const [activeTab, setActiveTab] = useState('dashboard');

  // AUTH
  const [users, setUsers]           = useState([]);
  const [currentUser, setCurrentUser] = useState(loadCurrentUser());
  const [authMode, setAuthMode]     = useState('login'); // 'login' or 'signup'

  // load + persist projects
  useEffect(() => setProjects(loadProjects()), []);
  useEffect(() => saveProjects(projects), [projects]);

  // load users
  useEffect(() => setUsers(loadUsers()), []);

  // project modal
  const openModal = proj =>
    setModalProject(
      proj || {
        id: Date.now(),
        title: '',
        agent: '',
        tasks: [],
        status: 'upcoming',
        deadline: '',
      }
    );
  const closeModal = () => setModalProject(null);
  function saveProject(proj) {
    setProjects(ps => {
      const exists = ps.find(p => p.id === proj.id);
      return exists
        ? ps.map(p => (p.id === proj.id ? proj : p))
        : [...ps, proj];
    });
    closeModal();
  }

  // clear all (settings)
  const clearAll = () => {
    if (window.confirm('Really clear all projects?')) {
      setProjects([]);
      saveProjects([]);
    }
  };

  // if not logged in, show login/signup
  if (!currentUser) {
    return authMode === 'login' ? (
      <LoginModal
        onClose={() => {}}
        onLogin={user => {
          saveCurrentUser(user);
          setCurrentUser(user);
        }}
        onSwitch={() => setAuthMode('signup')}
      />
    ) : (
      <SignupModal
        onClose={() => setAuthMode('login')}
        onUsersChange={us => {
          setUsers(us);
          setAuthMode('login');
        }}
        onSwitch={() => setAuthMode('login')}
      />
    );
  }

  // main app UI
  return (
    <>
      <NinjaStarsBackground />

      {/* NAV */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary to-primaryLight rounded-full shadow-lg">
              <span className="text-white text-3xl font-extrabold">PM</span>
            </div>
            <span className="ml-4 text-2xl font-medium text-gray-800">Project Manager</span>
          </div>

          {/* Tabs */}
          <nav className="hidden md:flex space-x-8 text-lg">
            {['dashboard', 'projects', 'reports', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                } pb-1 transition`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hello, {currentUser.name}</span>
            <button
              onClick={() => {
                saveCurrentUser(null);
                setCurrentUser(null);
              }}
              className="text-red-600 hover:underline"
            >
              Sign Out
            </button>
            <button
              onClick={() => {
                openModal();
                setActiveTab('dashboard');
              }}
              className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primaryLight transition"
            >
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        {activeTab === 'dashboard' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
              <SearchBar value={search} onChange={setSearch} />
              <FilterPanel filter={filter} onChange={setFilter} />
            </div>
            <Dashboard
              projects={projects}
              filter={filter}
              search={search}
              onEdit={openModal}
              onDelete={id => setProjects(ps => ps.filter(p => p.id !== id))}
            />
          </>
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            onEdit={openModal}
            onDelete={id => setProjects(ps => ps.filter(p => p.id !== id))}
          />
        )}

        {activeTab === 'reports' && <ReportsView projects={projects} />}

        {activeTab === 'settings' && <Settings onClearAll={clearAll} users={users} setUsers={setUsers} />}

        {modalProject && (
          <ProjectModal
            project={modalProject}
            onSave={saveProject}
            onCancel={closeModal}
            users={users}
          />
        )}
      </main>
    </>
  );
}
