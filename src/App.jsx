import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  collection,
  query,
  where,
  updateDoc,
  getDocs,
  deleteDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  signOut,
  getRedirectResult,
  OAuthProvider,
} from 'firebase/auth';

const mapData = [
  // Row 0 (outermost ring - Level 1)
  [{type:'dig',lvl:1,bonus:'2% Coin'},{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:1,bonus:'2% Food'},{type:'village',lvl:1,bonus:'5% Food'},{type:'dig',lvl:1,bonus:'2% Iron'},{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:1,bonus:'2% Coin'},{type:'village',lvl:1,bonus:'5% Food'},{type:'dig',lvl:1,bonus:'2% Food'},{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:1,bonus:'2% Iron'},{type:'village',lvl:1,bonus:'5% Food'},{type:'dig',lvl:1,bonus:'2% Coin'}],
  // Row 1
  [{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:2,bonus:'3% Coin'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:2,bonus:'3% Food'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:2,bonus:'3% Iron'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:2,bonus:'3% Coin'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:2,bonus:'3% Food'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:2,bonus:'3% Iron'},{type:'village',lvl:1,bonus:'5% Food'}],
  // Row 2
  [{type:'dig',lvl:1,bonus:'2% Food'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:3,bonus:'4% Coin'},{type:'factory',lvl:3,bonus:'10% Food'},{type:'dig',lvl:3,bonus:'4% Food'},{type:'factory',lvl:3,bonus:'10% Iron'},{type:'dig',lvl:3,bonus:'4% Iron'},{type:'factory',lvl:3,bonus:'10% Coin'},{type:'dig',lvl:3,bonus:'4% Coin'},{type:'factory',lvl:3,bonus:'10% Food'},{type:'dig',lvl:3,bonus:'4% Food'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:1,bonus:'2% Iron'}],
  // Row 3
  [{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:2,bonus:'3% Food'},{type:'factory',lvl:3,bonus:'10% Iron'},{type:'dig',lvl:4,bonus:'6% Coin'},{type:'train',lvl:4,bonus:'15% Gathering'},{type:'dig',lvl:4,bonus:'6% Food'},{type:'train',lvl:4,bonus:'15% Iron'},{type:'dig',lvl:4,bonus:'6% Iron'},{type:'train',lvl:4,bonus:'15% Coin'},{type:'dig',lvl:4,bonus:'6% Coin'},{type:'factory',lvl:3,bonus:'10% Coin'},{type:'dig',lvl:2,bonus:'3% Iron'},{type:'village',lvl:1,bonus:'5% Food'}],
  // Row 4
  [{type:'dig',lvl:1,bonus:'2% Iron'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:3,bonus:'4% Food'},{type:'train',lvl:4,bonus:'15% Coin'},{type:'dig',lvl:5,bonus:'8% Coin'},{type:'launch',lvl:5,bonus:'20% Coin'},{type:'dig',lvl:5,bonus:'8% Food'},{type:'launch',lvl:5,bonus:'20% Gathering'},{type:'dig',lvl:5,bonus:'8% Iron'},{type:'train',lvl:4,bonus:'15% Food'},{type:'dig',lvl:3,bonus:'4% Iron'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:1,bonus:'2% Coin'}],
  // Row 5
  [{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:2,bonus:'3% Iron'},{type:'factory',lvl:3,bonus:'10% Coin'},{type:'dig',lvl:4,bonus:'6% Food'},{type:'launch',lvl:5,bonus:'20% Iron'},{type:'dig',lvl:6,bonus:'10% Iron'},{type:'palace',lvl:6,bonus:'10% Healing'},{type:'dig',lvl:6,bonus:'10% Coin'},{type:'launch',lvl:5,bonus:'20% Food'},{type:'dig',lvl:4,bonus:'6% Iron'},{type:'factory',lvl:3,bonus:'10% Food'},{type:'dig',lvl:2,bonus:'3% Coin'},{type:'village',lvl:1,bonus:'5% Food'}],
  // Row 6 (center row with Capitol)
  [{type:'dig',lvl:1,bonus:'2% Coin'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:3,bonus:'4% Iron'},{type:'train',lvl:4,bonus:'15% Food'},{type:'dig',lvl:5,bonus:'8% Food'},{type:'palace',lvl:6,bonus:'20% Construction'},{type:'capitol',lvl:0,bonus:'10% March Speed'},{type:'palace',lvl:6,bonus:'5% Training'},{type:'dig',lvl:5,bonus:'8% Iron'},{type:'train',lvl:4,bonus:'15% Iron'},{type:'dig',lvl:3,bonus:'4% Coin'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:1,bonus:'2% Food'}],
  // Row 7
  [{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:2,bonus:'3% Coin'},{type:'factory',lvl:3,bonus:'10% Food'},{type:'dig',lvl:4,bonus:'6% Iron'},{type:'launch',lvl:5,bonus:'20% Coin'},{type:'dig',lvl:6,bonus:'10% Food'},{type:'palace',lvl:6,bonus:'20% Research'},{type:'dig',lvl:6,bonus:'10% Coin'},{type:'launch',lvl:5,bonus:'20% Gathering'},{type:'dig',lvl:4,bonus:'6% Coin'},{type:'factory',lvl:3,bonus:'10% Iron'},{type:'dig',lvl:2,bonus:'3% Food'},{type:'village',lvl:1,bonus:'5% Food'}],
  // Row 8
  [{type:'dig',lvl:1,bonus:'2% Food'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:3,bonus:'4% Coin'},{type:'train',lvl:4,bonus:'15% Iron'},{type:'dig',lvl:5,bonus:'8% Food'},{type:'launch',lvl:5,bonus:'20% Iron'},{type:'dig',lvl:5,bonus:'8% Iron'},{type:'launch',lvl:5,bonus:'20% Food'},{type:'dig',lvl:5,bonus:'8% Coin'},{type:'train',lvl:4,bonus:'15% Coin'},{type:'dig',lvl:3,bonus:'4% Food'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:1,bonus:'2% Iron'}],
  // Row 9
  [{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:2,bonus:'3% Food'},{type:'factory',lvl:3,bonus:'10% Iron'},{type:'dig',lvl:4,bonus:'6% Food'},{type:'train',lvl:4,bonus:'15% Food'},{type:'dig',lvl:4,bonus:'6% Iron'},{type:'train',lvl:4,bonus:'15% Gathering'},{type:'dig',lvl:4,bonus:'6% Coin'},{type:'train',lvl:4,bonus:'15% Gathering'},{type:'dig',lvl:4,bonus:'6% Food'},{type:'factory',lvl:3,bonus:'10% Coin'},{type:'dig',lvl:2,bonus:'3% Iron'},{type:'village',lvl:1,bonus:'5% Food'}],
  // Row 10
  [{type:'dig',lvl:1,bonus:'2% Iron'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:3,bonus:'4% Food'},{type:'factory',lvl:3,bonus:'10% Food'},{type:'dig',lvl:3,bonus:'4% Iron'},{type:'factory',lvl:3,bonus:'10% Iron'},{type:'dig',lvl:3,bonus:'4% Coin'},{type:'factory',lvl:3,bonus:'10% Coin'},{type:'dig',lvl:3,bonus:'4% Food'},{type:'factory',lvl:3,bonus:'10% Food'},{type:'dig',lvl:3,bonus:'4% Iron'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:1,bonus:'2% Coin'}],
  // Row 11
  [{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:2,bonus:'3% Food'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:2,bonus:'3% Iron'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:2,bonus:'3% Coin'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:2,bonus:'3% Food'},{type:'town',lvl:2,bonus:'5% Gathering'},{type:'dig',lvl:2,bonus:'3% Iron'},{type:'town',lvl:2,bonus:'5% Coin'},{type:'dig',lvl:2,bonus:'3% Coin'},{type:'village',lvl:1,bonus:'5% Food'}],
  // Row 12 (outermost ring - Level 1)
  [{type:'dig',lvl:1,bonus:'2% Food'},{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:1,bonus:'2% Iron'},{type:'village',lvl:1,bonus:'5% Food'},{type:'dig',lvl:1,bonus:'2% Coin'},{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:1,bonus:'2% Food'},{type:'village',lvl:1,bonus:'5% Food'},{type:'dig',lvl:1,bonus:'2% Iron'},{type:'village',lvl:1,bonus:'5% Iron'},{type:'dig',lvl:1,bonus:'2% Coin'},{type:'village',lvl:1,bonus:'5% Food'},{type:'dig',lvl:1,bonus:'2% Food'}],
];

const levelInfo = [
  { level: 1, coal: 2736, rarePerHour: 100, cityRare: 350, temp: '-10°C' },
  { level: 2, coal: 2880, rarePerHour: 110, cityRare: 400, temp: '-30°C' },
  { level: 3, coal: 3024, rarePerHour: 120, cityRare: 450, temp: '-40°C' },
  { level: 4, coal: 3168, rarePerHour: 130, cityRare: 800, temp: '-50°C' },
  { level: 5, coal: 3312, rarePerHour: 140, cityRare: 900, temp: '-60°C' },
  { level: 6, coal: 3456, rarePerHour: 150, cityRare: 1000, temp: '-70°C' },
];

const typeConfig = {
  dig: { name: 'Dig Site', icon: '⛏️', baseColor: '#4a3728' },
  village: { name: 'Village', icon: '🏘️', baseColor: '#2d5a3d' },
  town: { name: 'Town', icon: '🏛️', baseColor: '#3d4a6b' },
  factory: { name: 'Factory', icon: '🏭', baseColor: '#5a4a3d' },
  train: { name: 'Train Station', icon: '🚂', baseColor: '#4a3d5a' },
  launch: { name: 'Launch Site', icon: '🚀', baseColor: '#5a3d4a' },
  palace: { name: 'War Palace', icon: '🏰', baseColor: '#6b4a3d' },
  capitol: { name: 'Capitol', icon: '👑', baseColor: '#8b7355' },
};

const levelColors = {
  1: { border: '#6b8e23', glow: 'rgba(107,142,35,0.4)' },
  2: { border: '#4682b4', glow: 'rgba(70,130,180,0.4)' },
  3: { border: '#9370db', glow: 'rgba(147,112,219,0.4)' },
  4: { border: '#ff8c00', glow: 'rgba(255,140,0,0.4)' },
  5: { border: '#dc143c', glow: 'rgba(220,20,60,0.4)' },
  6: { border: '#ffd700', glow: 'rgba(255,215,0,0.5)' },
  0: { border: '#ffffff', glow: 'rgba(255,255,255,0.6)' },
};

const defaultAlliances = [
  { id: 'nova', name: 'Nova Imperium', color: '#00ff88', tag: 'NOVA' },
  { id: 'enemy', name: 'Enemy', color: '#ff4444', tag: 'ENM' },
];

const STORAGE_KEY = 'lastwar-s2-planner-data';
const STORAGE_VERSION = 1;
const ADMIN_PASSWORD_KEY = 'lastwar-s2-admin-password';
const DEFAULT_ADMIN_PASSWORD = 'admin123'; // Change this to your desired password

// Server management constants
const SERVERS_STORAGE_KEY = 'lastwar-s2-servers';
const CURRENT_SERVER_KEY = 'lastwar-s2-current-server';
const DEFAULT_SERVERS = [{ id: 'default', name: 'Server 1642' }];

// Safe localStorage helpers
const safeGet = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};

const safeSet = (key, value) => {
  try { localStorage.setItem(key, value); } catch {}
};

const safeRemove = (key) => {
  try { localStorage.removeItem(key); } catch {}
};

const sanitizeServerId = (raw) =>
  raw.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

const DISCORD_PROVIDER_ID = 'oidc.discord';

const normalizeAllianceName = (name) => name.trim().replace(/\s+/g, ' ');
const normalizeAllianceKey = (name) => normalizeAllianceName(name).toLowerCase();

const buildAllianceTag = (name) => {
  const letters = name.replace(/[^a-z0-9]/gi, '');
  return (letters.substring(0, 4) || 'ALLY').toUpperCase();
};

const allianceColorPalette = ['#00ff88', '#ff4444', '#ff8800', '#4682b4', '#9370db', '#6b8e23', '#dc143c', '#ffd700'];
const pickAllianceColor = (existing) => {
  const used = new Set(existing.map(a => a.color));
  const available = allianceColorPalette.find(color => !used.has(color));
  return available || `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
};

// Firebase configuration
const ROOM_ID = 'season2-plan'; // Shared room ID for all alliances (fallback)
const PRESENCE_COLLECTION = 'presence'; // Track active users

// Server-based key helpers
const getRoomId = (serverId) => {
  if (!serverId || serverId === 'undefined' || serverId === 'null') {
    return ROOM_ID;
  }
  return `room-${serverId}`;
};

const getStorageKey = (serverId) => {
  if (!serverId || serverId === 'undefined' || serverId === 'null') {
    return STORAGE_KEY;
  }
  return `${STORAGE_KEY}-${serverId}`;
};

// Generate unique user ID for this session (safe access)
const getUserId = () => {
  try {
    let userId = localStorage.getItem('user-id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user-id', userId);
    }
    return userId;
  } catch (e) {
    // Fallback if localStorage is unavailable
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

const USER_ID = getUserId();

// Get or create user name (lazy initialization)
const getUserName = () => {
  const saved = localStorage.getItem('user-name');
  if (saved) return saved;
  // Default name if not set (will prompt on first use)
  return `User ${USER_ID.slice(-4)}`;
};

let USER_NAME = getUserName();

export default function Season2MapPlanner() {
  const [alliances, setAlliances] = useState(defaultAlliances);
  const [activeAlliance, setActiveAlliance] = useState('nova');
  const [cellAssignments, setCellAssignments] = useState({});
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [editingAlliance, setEditingAlliance] = useState(null);
  const [newAllianceName, setNewAllianceName] = useState('');
  const [newAllianceTag, setNewAllianceTag] = useState('');
  const [newAllianceColor, setNewAllianceColor] = useState('#ff8800');
  const [showAddAlliance, setShowAddAlliance] = useState(false);
  const [selectedAllianceStats, setSelectedAllianceStats] = useState(null);
  const [allianceAuth, setAllianceAuth] = useState({});
  const [authorizedAllianceIds, setAuthorizedAllianceIds] = useState([]);
  const [showAllianceAccess, setShowAllianceAccess] = useState(false);
  const [accessAllianceName, setAccessAllianceName] = useState('');
  const [accessPasscode, setAccessPasscode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [accessLoading, setAccessLoading] = useState(false);
  const [allianceAccessPrompted, setAllianceAccessPrompted] = useState(false);
  const [passcodeDraft, setPasscodeDraft] = useState('');
  const [passcodeConfirm, setPasscodeConfirm] = useState('');
  const [passcodeMessage, setPasscodeMessage] = useState('');
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showUserAllianceModal, setShowUserAllianceModal] = useState(false);
  const [userAllianceSelection, setUserAllianceSelection] = useState('');
  const [userAllianceMessage, setUserAllianceMessage] = useState('');
  const [allowCrossAllianceEdits, setAllowCrossAllianceEdits] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  
  // History for undo/redo
  const [history, setHistory] = useState([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Screenshot mode
  const [screenshotMode, setScreenshotMode] = useState(false);
  
  // Accessibility mode (grayscale/high-contrast)
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  
  // Persistence state
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [planName, setPlanName] = useState('Nova Imperium S2 Plan');
  
  // Tile locking state
  const [lockedAlliances, setLockedAlliances] = useState(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isServerAdmin, setIsServerAdmin] = useState(false);
  const [showServerAdminModal, setShowServerAdminModal] = useState(false);
  const [serverAdminPassword, setServerAdminPassword] = useState('');
  const [serverAdminConfirm, setServerAdminConfirm] = useState('');
  const [serverAdminMessage, setServerAdminMessage] = useState('');
  const [serverAdminAuth, setServerAdminAuth] = useState(null);
  const lastResetTimestampRef = useRef(0);

  const isPrivileged = isAdmin || isServerAdmin;
  
  // Firebase/Real-time collaboration state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [useFirebase, setUseFirebase] = useState(true); // Toggle between Firebase and localStorage
  const unsubscribeRef = useRef(null);
  const presenceUnsubscribeRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const userNameRef = useRef(USER_NAME);
  const isResettingRef = useRef(false);
  
  // Server management state - lazy initialization from localStorage
  const [servers, setServers] = useState(() => {
    try {
      const raw = safeGet(SERVERS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SERVERS;
    } catch {
      return DEFAULT_SERVERS;
    }
  });
  const [currentServerId, setCurrentServerId] = useState(() => {
    const saved = safeGet(CURRENT_SERVER_KEY);
    return saved || 'default';
  });
  const [showServerModal, setShowServerModal] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerId, setNewServerId] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingServerInput, setOnboardingServerInput] = useState('');
  
  // Prompt for user name on first Firebase connection (defer to avoid blocking render)
  useEffect(() => {
    if (useFirebase && db && isConnecting && !localStorage.getItem('user-name') && !authUser) {
      // Use setTimeout to avoid blocking initial render
      const timer = setTimeout(() => {
        const name = prompt('Enter your name (for collaboration):') || `User ${USER_ID.slice(-4)}`;
        localStorage.setItem('user-name', name);
        userNameRef.current = name;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isConnecting, useFirebase, authUser]);

  useEffect(() => {
    setPasscodeDraft('');
    setPasscodeConfirm('');
    setPasscodeMessage('');
  }, [editingAlliance]);

  useEffect(() => {
    if (!showServerAdminModal) {
      setServerAdminPassword('');
      setServerAdminConfirm('');
      setServerAdminMessage('');
    }
  }, [showServerAdminModal]);

  useEffect(() => {
    if (!showAllianceAccess) {
      setAccessAllianceName('');
      setAccessPasscode('');
      setAccessError('');
      setAccessLoading(false);
    }
  }, [showAllianceAccess]);

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (!user) {
        setShowUserAllianceModal(false);
        setUserAllianceSelection('');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth) return;
    let isMounted = true;
    getRedirectResult(auth)
      .then((result) => {
        if (!isMounted || !result?.user) return;
        setSaveStatus('Discord login successful');
        setTimeout(() => setSaveStatus(''), 2000);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error('Discord redirect login failed:', error);
        setSaveStatus('Discord login failed');
        setTimeout(() => setSaveStatus(''), 2000);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authUser || !currentServerId || showOnboarding) return;
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const userRef = doc(db, 'users', authUser.uid);
        const snap = await getDoc(userRef);
        if (!isMounted) return;
        const data = snap.exists() ? snap.data() : {};
        const serverData = data?.servers?.[currentServerId];
        if (serverData?.allianceId) {
          setUserAllianceSelection(serverData.allianceId);
          if (!authorizedAllianceIds.includes(serverData.allianceId)) {
            setAuthorizedAllianceIds((prev) => [...prev, serverData.allianceId]);
          }
          setShowUserAllianceModal(false);
        } else {
          setShowUserAllianceModal(true);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        if (isMounted) {
          setShowUserAllianceModal(true);
        }
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [authUser, currentServerId, showOnboarding, authorizedAllianceIds]);

  useEffect(() => {
    setAuthorizedAllianceIds([]);
  }, [currentServerId]);

  useEffect(() => {
    if (showOnboarding) return;
    if (!isLoaded) return;
    if (isAdmin || isServerAdmin) return;
    if (showAllianceAccess) return;
    if (allianceAccessPrompted) return;
    if (authorizedAllianceIds.length > 0) return;
    if (isViewOnly) return;
    setAllianceAccessPrompted(true);
    setShowAllianceAccess(true);
  }, [showOnboarding, isLoaded, isAdmin, isServerAdmin, showAllianceAccess, allianceAccessPrompted, authorizedAllianceIds.length, isViewOnly]);

  useEffect(() => {
    if (!isAdmin && !isServerAdmin && authorizedAllianceIds.length === 0) {
      setIsViewOnly(true);
    }
  }, [authorizedAllianceIds.length, isAdmin, isServerAdmin]);

  useEffect(() => {
    if (!showAuditLog || !isPrivileged || !db || !useFirebase || !isConnected) {
      setAuditLogs([]);
      return;
    }
    setAuditLoading(true);
    const logsQuery = query(
      collection(db, 'auditLogs'),
      where('roomId', '==', getRoomId(currentServerId)),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const next = [];
      snapshot.forEach((docSnap) => {
        next.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAuditLogs(next);
      setAuditLoading(false);
    }, (error) => {
      console.error('Audit log fetch failed:', error);
      setAuditLoading(false);
    });
    return () => unsubscribe();
  }, [showAuditLog, isPrivileged, db, useFirebase, isConnected, currentServerId]);

  const logAuditEvent = async (actionType, payload = {}) => {
    try {
      if (!db || !useFirebase || !isConnected) return;
      if (!authUser) return;
      const logEntry = {
        uid: authUser.uid,
        userName: authUser.displayName || authUser.email || authUser.uid,
        serverId: currentServerId,
        roomId: getRoomId(currentServerId),
        actionType,
        payload,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(collection(db, 'auditLogs')), logEntry);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  };

  const loginWithDiscord = async () => {
    if (!auth) {
      setSaveStatus('Auth not available');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    try {
      const provider = new OAuthProvider(DISCORD_PROVIDER_ID);
      provider.addScope('identify');
      provider.addScope('email');
      await signInWithPopup(auth, provider);
      setSaveStatus('Discord login successful');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Discord login failed:', error);
      const popupErrors = new Set([
        'auth/popup-blocked',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
      ]);
      if (popupErrors.has(error?.code)) {
        try {
          const provider = new OAuthProvider(DISCORD_PROVIDER_ID);
          provider.addScope('identify');
          provider.addScope('email');
          setSaveStatus('Popup blocked - redirecting to Discord...');
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error('Discord redirect login failed:', redirectError);
        }
      }
      setSaveStatus('Discord login failed');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const logoutDiscord = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setSaveStatus('Signed out');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const saveUserAlliance = async () => {
    if (!authUser) return;
    if (!currentServerId) return;
    const alliance = alliances.find(a => a.id === userAllianceSelection);
    if (!alliance) {
      setUserAllianceMessage('Select a valid alliance.');
      return;
    }
    try {
      await setDoc(doc(db, 'users', authUser.uid), {
        uid: authUser.uid,
        userName: authUser.displayName || authUser.email || authUser.uid,
        servers: {
          [currentServerId]: {
            allianceId: alliance.id,
            allianceName: alliance.name,
          },
        },
        updatedAt: serverTimestamp(),
      }, { merge: true });
      if (!authorizedAllianceIds.includes(alliance.id)) {
        setAuthorizedAllianceIds((prev) => [...prev, alliance.id]);
      }
      setActiveAlliance(alliance.id);
      setIsViewOnly(false);
      setShowUserAllianceModal(false);
      setUserAllianceMessage('');
      logAuditEvent('userAllianceSet', {
        allianceId: alliance.id,
        allianceName: alliance.name,
      });
    } catch (error) {
      console.error('Failed to save user alliance:', error);
      setUserAllianceMessage('Unable to save alliance selection.');
    }
  };

  const mapRef = useRef(null);
  const fileInputRef = useRef(null);

  const isAuthorizedForAlliance = useCallback((allianceId) => {
    return isPrivileged || authorizedAllianceIds.includes(allianceId);
  }, [isPrivileged, authorizedAllianceIds]);

  const hashPasscode = async (passcode) => {
    if (!window.crypto?.subtle) {
      throw new Error('Secure hashing is not available in this browser.');
    }
    const normalized = passcode.trim();
    const encoded = new TextEncoder().encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  // Initialize Firebase connection and load data
  useEffect(() => {
    if (showOnboarding) return; // Wait until server selection is complete
    if (!currentServerId) return; // Don't run until server is initialized
    
    // Check if db is available (Firebase might not be initialized)
    const dbAvailable = db !== null && db !== undefined;
    
    if (!useFirebase || !dbAvailable) {
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem(getStorageKey(currentServerId));
        if (saved) {
          const data = JSON.parse(saved);
          if (data.version === STORAGE_VERSION) {
            setAlliances(data.alliances || defaultAlliances);
            setCellAssignments(data.cellAssignments || {});
            setActiveAlliance(data.activeAlliance || 'nova');
            setPlanName(data.planName || 'Nova Imperium S2 Plan');
            setHistory([data.cellAssignments || {}]);
            setHistoryIndex(0);
            setLastSaved(data.savedAt ? new Date(data.savedAt) : null);
            setSaveStatus('Loaded from localStorage');
            setAllianceAuth(data.allianceAuth || {});
            setServerAdminAuth(data.serverAdminAuth || null);
            setAllowCrossAllianceEdits(!!data.allowCrossAllianceEdits);
            // Load locked alliances
            if (data.lockedAlliances) {
              setLockedAlliances(new Set(data.lockedAlliances));
            }
        if (data.allianceAuth) {
          setAllianceAuth(data.allianceAuth);
        }
            // Track reset timestamp
            if (data.resetTimestamp) {
              lastResetTimestampRef.current = data.resetTimestamp;
            }
          }
        }
      } catch (e) {
        console.error('Failed to load saved data:', e);
        setSaveStatus('Failed to load saved data');
      }
      setIsConnecting(false);
      setIsLoaded(true);
      return;
    }

    // Initialize Firebase real-time sync
    const initFirebase = async () => {
      if (!db) {
        setIsConnecting(false);
        setIsLoaded(true);
        return;
      }
      
      try {
        const roomId = getRoomId(currentServerId);
        const roomRef = doc(db, 'rooms', roomId);
        
        // Try to load existing data
        const docSnap = await getDoc(roomRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.version === STORAGE_VERSION) {
            setAlliances(data.alliances || defaultAlliances);
            setCellAssignments(data.cellAssignments || {});
            setActiveAlliance(data.activeAlliance || 'nova');
            setPlanName(data.planName || 'Nova Imperium S2 Plan');
            setHistory([data.cellAssignments || {}]);
            setHistoryIndex(0);
            setLastSaved(data.updatedAt?.toDate() || null);
            setSaveStatus('Connected - Real-time collaboration active');
            setIsConnected(true);
            setAllianceAuth(data.allianceAuth || {});
            setServerAdminAuth(data.serverAdminAuth || null);
            setAllowCrossAllianceEdits(!!data.allowCrossAllianceEdits);
          }
        } else {
          // Create initial room document
          await setDoc(roomRef, {
            version: STORAGE_VERSION,
            planName: 'Nova Imperium S2 Plan',
            alliances: defaultAlliances,
            cellAssignments: {},
            activeAlliance: 'nova',
            lockedAlliances: [],
            allianceAuth: {},
            serverAdminAuth: null,
            allowCrossAllianceEdits: false,
            updatedAt: serverTimestamp(),
          });
          setSaveStatus('Connected - Room created');
          setIsConnected(true);
        }

        // Set up real-time listener
        unsubscribeRef.current = onSnapshot(roomRef, (snapshot) => {
          if (!snapshot.exists()) return;
          
          const data = snapshot.data();
          const now = Date.now();
          
          // Prevent infinite loops - ignore updates we just sent
          if (now - lastUpdateRef.current < 2000) {
            return;
          }
          
          // Check if there's been a reset - if so, ignore old data
          if (data.resetTimestamp && data.resetTimestamp > lastResetTimestampRef.current) {
            lastResetTimestampRef.current = data.resetTimestamp;
            isResettingRef.current = true; // Prevent auto-save during reset
            // Reset was initiated - apply it
            if (data.version === STORAGE_VERSION) {
              setAlliances(data.alliances || defaultAlliances);
              setCellAssignments(data.cellAssignments || {});
              setHistory([data.cellAssignments || {}]);
              setHistoryIndex(0);
              setActiveAlliance(data.activeAlliance || 'nova');
              setPlanName(data.planName || 'Nova Imperium S2 Plan');
              if (data.lockedAlliances) {
                setLockedAlliances(new Set(data.lockedAlliances));
              } else {
                setLockedAlliances(new Set());
              }
            setAllianceAuth(data.allianceAuth || {});
            setServerAdminAuth(data.serverAdminAuth || null);
            setAllowCrossAllianceEdits(!!data.allowCrossAllianceEdits);
              setLastSaved(data.updatedAt?.toDate() || null);
              setSaveStatus('Map was reset');
              setTimeout(() => {
                setSaveStatus('');
                isResettingRef.current = false;
              }, 3000);
            }
            return;
          }
          
          // If we've had a more recent reset, ignore older data (check for 10 seconds after reset)
          if (lastResetTimestampRef.current > 0) {
            const timeSinceReset = now - lastResetTimestampRef.current;
            if (timeSinceReset < 10000) { // 10 second window
              if (!data.resetTimestamp || data.resetTimestamp < lastResetTimestampRef.current) {
                return; // Ignore old data after a reset
              }
            }
          }
          
          // Update state only if data changed
          if (data.version === STORAGE_VERSION) {
            setAlliances(data.alliances || defaultAlliances);
            const newAssignments = data.cellAssignments || {};
            
            // Load locked alliances
            if (data.lockedAlliances) {
              setLockedAlliances(new Set(data.lockedAlliances));
            }
            setAllianceAuth(data.allianceAuth || {});
            setServerAdminAuth(data.serverAdminAuth || null);
            setAllowCrossAllianceEdits(!!data.allowCrossAllianceEdits);
            
            // Only update if different (to avoid unnecessary re-renders)
            if (JSON.stringify(newAssignments) !== JSON.stringify(cellAssignments)) {
              setCellAssignments(newAssignments);
              setHistory([newAssignments]);
              setHistoryIndex(0);
            }
            
            setActiveAlliance(data.activeAlliance || 'nova');
            setPlanName(data.planName || 'Nova Imperium S2 Plan');
            setLastSaved(data.updatedAt?.toDate() || null);
            setSaveStatus('');
          }
        }, (error) => {
          console.error('Firebase sync error:', error);
          setSaveStatus('Sync error - using local mode');
          setIsConnected(false);
        });

        // Set up presence tracking
        const presenceRef = doc(db, PRESENCE_COLLECTION, USER_ID);
        
        // Mark user as online
      const currentUserName = authUser?.displayName || authUser?.email || localStorage.getItem('user-name') || userNameRef.current || `User ${USER_ID.slice(-4)}`;
        await setDoc(presenceRef, {
          userId: USER_ID,
          userName: currentUserName,
          roomId: getRoomId(currentServerId),
          lastSeen: serverTimestamp(),
          online: true,
        });

        // Update last seen every 30 seconds
        const presenceInterval = setInterval(async () => {
          if (isConnected) {
            try {
              await updateDoc(presenceRef, {
                lastSeen: serverTimestamp(),
                online: true,
              });
            } catch (e) {
              console.error('Presence update failed:', e);
            }
          }
        }, 30000);

        // Listen for other users' presence
        const presenceQuery = query(
          collection(db, PRESENCE_COLLECTION),
          where('roomId', '==', getRoomId(currentServerId)),
          where('online', '==', true)
        );
        
        presenceUnsubscribeRef.current = onSnapshot(presenceQuery, (snapshot) => {
          const users = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Exclude current user
            if (data.userId !== USER_ID) {
              users.push({
                id: data.userId,
                name: data.userName || 'Anonymous',
                lastSeen: data.lastSeen?.toDate() || new Date(),
              });
            }
          });
          setActiveUsers(users);
        });

        // Cleanup on unmount
        return () => {
          clearInterval(presenceInterval);
          if (unsubscribeRef.current) unsubscribeRef.current();
          if (presenceUnsubscribeRef.current) presenceUnsubscribeRef.current();
          // Mark user as offline
          updateDoc(presenceRef, { online: false }).catch(() => {});
        };

      } catch (error) {
        console.error('Firebase initialization failed:', error);
        setSaveStatus('Firebase unavailable - using localStorage');
        setIsConnected(false);
        
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem(getStorageKey(currentServerId));
          if (saved) {
            const data = JSON.parse(saved);
            if (data.version === STORAGE_VERSION) {
              setAlliances(data.alliances || defaultAlliances);
              setCellAssignments(data.cellAssignments || {});
              setActiveAlliance(data.activeAlliance || 'nova');
              setPlanName(data.planName || 'Nova Imperium S2 Plan');
              setHistory([data.cellAssignments || {}]);
              setHistoryIndex(0);
              setLastSaved(data.savedAt ? new Date(data.savedAt) : null);
            }
          }
        } catch (e) {
          console.error('localStorage fallback failed:', e);
        }
      } finally {
        setIsConnecting(false);
        setIsLoaded(true);
      }
    };

    initFirebase();

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (presenceUnsubscribeRef.current) {
        presenceUnsubscribeRef.current();
      }
    };
  }, [useFirebase, currentServerId, showOnboarding, authUser]);

  // Keep localStorage in sync if someone edits it externally
  useEffect(() => {
    // heal empty state if something cleared localStorage
    if (!servers || servers.length === 0) setServers(DEFAULT_SERVERS);
    if (!currentServerId) setCurrentServerId('default');
  }, [servers, currentServerId]);

  // Auto-save to Firebase or localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded) return; // Don't save until initial load is complete
    if (showOnboarding) return; // Don't save until server selection is complete
    
    const saveData = async () => {
      try {
        const data = {
          version: STORAGE_VERSION,
          planName,
          alliances,
          cellAssignments,
          activeAlliance,
          allianceAuth,
          serverAdminAuth,
          allowCrossAllianceEdits,
          lockedAlliances: Array.from(lockedAlliances),
          savedAt: new Date().toISOString(),
        };

        if (useFirebase && db && isConnected) {
          // Save to Firebase
          try {
            const roomRef = doc(db, 'rooms', getRoomId(currentServerId));
            lastUpdateRef.current = Date.now();
            await setDoc(roomRef, {
              ...data,
              lockedAlliances: Array.from(lockedAlliances),
              updatedAt: serverTimestamp(),
            }, { merge: true });
            setLastSaved(new Date());
            setSaveStatus('Saved to cloud');
          } catch (firebaseError) {
            console.error('Firebase save failed, falling back to localStorage:', firebaseError);
            // Fallback to localStorage
            localStorage.setItem(getStorageKey(currentServerId), JSON.stringify(data));
            setLastSaved(new Date());
            setSaveStatus('Saved locally (Firebase error)');
          }
        } else {
          // Save to localStorage
          localStorage.setItem(getStorageKey(currentServerId), JSON.stringify(data));
          setLastSaved(new Date());
          setSaveStatus('Auto-saved');
        }
        
        // Clear status after 2 seconds
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (e) {
        console.error('Failed to save:', e);
        setSaveStatus('Save failed!');
      }
    };

    // Debounce saves
    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [alliances, cellAssignments, activeAlliance, planName, allianceAuth, serverAdminAuth, allowCrossAllianceEdits, isLoaded, useFirebase, isConnected, currentServerId, lockedAlliances, showOnboarding]);

  // Export data as JSON file
  const exportData = () => {
    const data = {
      version: STORAGE_VERSION,
      planName,
      alliances,
      allianceAuth,
      serverAdminAuth,
      allowCrossAllianceEdits,
      cellAssignments,
      activeAlliance,
      lockedAlliances: Array.from(lockedAlliances),
      exportedAt: new Date().toISOString(),
      server: '1642',
      season: 'Season 2 - Polar Storm',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${planName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSaveStatus('Exported!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Import data from JSON file
  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        
        if (data.version !== STORAGE_VERSION) {
          alert('This file is from a different version and may not be compatible.');
        }
        
          if (data.alliances) setAlliances(data.alliances);
          if (data.cellAssignments) {
            setCellAssignments(data.cellAssignments);
            setHistory([data.cellAssignments]);
            setHistoryIndex(0);
          }
        if (data.allianceAuth) {
          setAllianceAuth(data.allianceAuth);
        }
        if (data.serverAdminAuth) {
          setServerAdminAuth(data.serverAdminAuth);
        }
        if (typeof data.allowCrossAllianceEdits === 'boolean') {
          setAllowCrossAllianceEdits(data.allowCrossAllianceEdits);
        }
          if (data.lockedAlliances) {
            setLockedAlliances(new Set(data.lockedAlliances));
          }
        if (data.activeAlliance) setActiveAlliance(data.activeAlliance);
        if (data.planName) setPlanName(data.planName);
        
        setSaveStatus('Imported successfully!');
        setShowImportExport(false);
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import file. Make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be imported again
    event.target.value = '';
  };

  // Clear all saved data
  const clearSavedData = () => {
    if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
      localStorage.removeItem(getStorageKey(currentServerId));
      setAlliances(defaultAlliances);
      setCellAssignments({});
      setActiveAlliance('nova');
      setPlanName('Nova Imperium S2 Plan');
      setHistory([{}]);
      setHistoryIndex(0);
      setLastSaved(null);
      setAllianceAuth({});
      setAuthorizedAllianceIds([]);
      setServerAdminAuth(null);
      setIsServerAdmin(false);
      setSaveStatus('Data cleared');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // Update assignments with history tracking
  const updateAssignments = useCallback((newAssignments) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...newAssignments });
    // Limit history to 50 entries
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCellAssignments(newAssignments);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCellAssignments(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCellAssignments(history[newIndex]);
    }
  }, [history, historyIndex]);

  const toggleCell = (row, col) => {
    const key = `${row}-${col}`;
    const currentAssignment = cellAssignments[key];
    const currentAlliance = alliances.find(a => a.id === currentAssignment);
    const activeAllianceName = alliances.find(a => a.id === activeAlliance)?.name;

    if (isViewOnly && !isPrivileged) {
      alert('View-only mode is enabled. Disable it to edit.');
      return;
    }

    if (!requireAllianceAccess(activeAlliance, activeAllianceName)) {
      return;
    }
    
    // Check if tile is locked (and user is not admin)
    if (currentAssignment && lockedAlliances.has(currentAssignment) && !isPrivileged) {
      alert(`This tile is locked by ${currentAlliance?.name || 'an alliance'}. Admin access required to modify.`);
      return;
    }

    // Prevent modifying another alliance's tiles unless admin
    if (currentAssignment && currentAssignment !== activeAlliance && !isPrivileged && !(allowCrossAllianceEdits && authUser)) {
      alert(`This tile belongs to ${currentAlliance?.name || 'another alliance'}. Switch to that alliance or use admin access.`);
      return;
    }
    
    const newAssignments = { ...cellAssignments };
    
    if (newAssignments[key] === activeAlliance) {
      delete newAssignments[key];
    } else {
      newAssignments[key] = activeAlliance;
    }
    
    updateAssignments(newAssignments);
    const position = `${String.fromCharCode(65 + col)}${row + 1}`;
    logAuditEvent(newAssignments[key] ? 'tileAssigned' : 'tileUnassigned', {
      key,
      row,
      col,
      position,
      allianceId: newAssignments[key] || currentAssignment || null,
    });
  };

  const clearAlliance = (allianceId) => {
    const alliance = alliances.find(a => a.id === allianceId);
    if (isViewOnly && !isPrivileged) {
      alert('View-only mode is enabled. Disable it to edit.');
      return;
    }
    if (!requireAllianceAccess(allianceId, alliance?.name)) return;
    // Check if alliance tiles are locked (and user is not admin)
    if (lockedAlliances.has(allianceId) && !isPrivileged) {
      alert(`Tiles for ${alliance?.name || 'this alliance'} are locked. Admin access required to clear.`);
      return;
    }
    
    const newAssignments = { ...cellAssignments };
    let clearedCount = 0;
    Object.keys(newAssignments).forEach(key => {
      if (newAssignments[key] === allianceId) {
        delete newAssignments[key];
        clearedCount += 1;
      }
    });
    updateAssignments(newAssignments);
    logAuditEvent('clearAlliance', {
      allianceId,
      allianceName: alliance?.name,
      clearedCount,
    });
  };

  const clearAll = () => {
    if (isViewOnly && !isPrivileged) {
      alert('View-only mode is enabled. Disable it to edit.');
      return;
    }
    if (!isPrivileged) {
      alert('Admin access required to clear all territories.');
      return;
    }
    updateAssignments({});
    logAuditEvent('clearAll', {});
  };

  // Toggle lock for an alliance
  const toggleAllianceLock = (allianceId) => {
    const alliance = alliances.find(a => a.id === allianceId);
    if (isViewOnly && !isPrivileged) {
      alert('View-only mode is enabled. Disable it to edit.');
      return;
    }
    if (!requireAllianceAccess(allianceId, alliance?.name)) return;
    const newLocked = new Set(lockedAlliances);
    if (newLocked.has(allianceId)) {
      newLocked.delete(allianceId);
    } else {
      newLocked.add(allianceId);
    }
    setLockedAlliances(newLocked);
    logAuditEvent(newLocked.has(allianceId) ? 'lockAlliance' : 'unlockAlliance', {
      allianceId,
      allianceName: alliance?.name,
    });
  };

  // Admin authentication
  const checkAdminPassword = () => {
    const savedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
    if (adminPassword === savedPassword) {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPassword('');
      setSaveStatus('Admin mode activated');
      setTimeout(() => setSaveStatus(''), 2000);
      logAuditEvent('adminLogin', {});
    } else {
      alert('Incorrect admin password');
      setAdminPassword('');
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setSaveStatus('Admin mode deactivated');
    setTimeout(() => setSaveStatus(''), 2000);
    logAuditEvent('adminLogout', {});
  };

  const checkServerAdminPassword = async () => {
    if (!serverAdminPassword.trim()) {
      setServerAdminMessage('Enter a passcode.');
      return;
    }
    try {
      const hashed = await hashPasscode(serverAdminPassword);
      if (serverAdminAuth?.passcodeHash) {
        if (hashed !== serverAdminAuth.passcodeHash) {
          setServerAdminMessage('Incorrect server admin passcode.');
          return;
        }
      } else {
        if (serverAdminPassword.trim() !== serverAdminConfirm.trim()) {
          setServerAdminMessage('Passcodes do not match.');
          return;
        }
        setServerAdminAuth({
          passcodeHash: hashed,
          updatedAt: Date.now(),
        });
      }
      setIsServerAdmin(true);
      setShowServerAdminModal(false);
      setServerAdminPassword('');
      setServerAdminConfirm('');
      setServerAdminMessage('');
      setSaveStatus('Server admin activated');
      setTimeout(() => setSaveStatus(''), 2000);
      logAuditEvent('serverAdminLogin', {});
    } catch (error) {
      console.error('Server admin check failed:', error);
      setServerAdminMessage('Unable to verify passcode.');
    }
  };

  const logoutServerAdmin = () => {
    setIsServerAdmin(false);
    setSaveStatus('Server admin deactivated');
    setTimeout(() => setSaveStatus(''), 2000);
    logAuditEvent('serverAdminLogout', {});
  };

  // Refresh and clean up stale users
  const refreshUsers = async () => {
    if (!useFirebase || !db || !isConnected) {
      setSaveStatus('Not connected to Firebase');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }

    try {
      const presenceQuery = query(
        collection(db, PRESENCE_COLLECTION),
        where('roomId', '==', getRoomId(currentServerId))
      );
      
      const snapshot = await getDocs(presenceQuery);
      const now = new Date();
      const staleThreshold = 120000; // 2 minutes
      let cleanedCount = 0;

      snapshot.forEach(async (docSnap) => {
        const data = docSnap.data();
        const lastSeen = data.lastSeen?.toDate() || new Date();
        const timeSinceSeen = now - lastSeen;

        // Mark users offline if they haven't been seen in 2 minutes
        if (timeSinceSeen > staleThreshold && data.online) {
          try {
            await updateDoc(doc(db, PRESENCE_COLLECTION, docSnap.id), {
              online: false,
            });
            cleanedCount++;
          } catch (e) {
            console.error('Failed to clean user:', e);
          }
        }
      });

      setSaveStatus(`Refreshed users - cleaned ${cleanedCount} stale entries`);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to refresh users:', error);
      setSaveStatus('Failed to refresh users');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // Admin function to clear all user presence (force cleanup)
  const clearAllUsers = async () => {
    if (!isPrivileged) {
      alert('Admin access required');
      return;
    }

    if (!confirm('Clear all user presence records? This will remove all users from the active list.')) {
      return;
    }

    if (!useFirebase || !db || !isConnected) {
      setSaveStatus('Not connected to Firebase');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }

    try {
      const presenceQuery = query(
        collection(db, PRESENCE_COLLECTION),
        where('roomId', '==', getRoomId(currentServerId))
      );
      
      const snapshot = await getDocs(presenceQuery);
      let deletedCount = 0;

      snapshot.forEach(async (docSnap) => {
        // Don't delete current user
        if (docSnap.id !== USER_ID) {
          try {
            await deleteDoc(doc(db, PRESENCE_COLLECTION, docSnap.id));
            deletedCount++;
          } catch (e) {
            console.error('Failed to delete user:', e);
          }
        }
      });

      setActiveUsers([]);
      setSaveStatus(`Cleared ${deletedCount} user records`);
      setTimeout(() => setSaveStatus(''), 3000);
      logAuditEvent('clearUsers', { deletedCount });
    } catch (error) {
      console.error('Failed to clear users:', error);
      setSaveStatus('Failed to clear users');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const startNewMap = async () => {
    if (!confirm('Start a new map? This will clear all territory assignments and reset history. Alliances will be preserved.')) {
      return;
    }
    
    const resetTimestamp = Date.now();
    const emptyAssignments = {};
    const emptyHistory = [{}];
    
    // Update local state immediately
    setCellAssignments(emptyAssignments);
    setHistory(emptyHistory);
    setHistoryIndex(0);
    setPlanName('Nova Imperium S2 Plan');
    setLockedAlliances(new Set()); // Clear all locks
    setSaveStatus('New map started');
    
    // Force update Firebase to override any other users' states
    if (useFirebase && db && isConnected) {
      try {
        const roomRef = doc(db, 'rooms', getRoomId(currentServerId));
        lastUpdateRef.current = resetTimestamp + 5000; // Set far in future to prevent overwrite
        await setDoc(roomRef, {
          version: STORAGE_VERSION,
          planName: 'Nova Imperium S2 Plan',
          alliances: alliances, // Keep alliances
          allianceAuth: allianceAuth,
          serverAdminAuth: serverAdminAuth,
          allowCrossAllianceEdits: allowCrossAllianceEdits,
          cellAssignments: emptyAssignments,
          activeAlliance: activeAlliance,
          lockedAlliances: [],
          resetTimestamp: resetTimestamp, // Mark when reset happened
          updatedAt: serverTimestamp(),
        }, { merge: false }); // Use merge: false to completely replace
        setSaveStatus('New map created - forcing reset for all users');
      } catch (error) {
        console.error('Failed to reset map in Firebase:', error);
        setSaveStatus('New map created locally');
      }
    } else {
      // localStorage fallback
      const data = {
        version: STORAGE_VERSION,
        planName: 'Nova Imperium S2 Plan',
        alliances: alliances,
        allianceAuth: allianceAuth,
        serverAdminAuth: serverAdminAuth,
        allowCrossAllianceEdits: allowCrossAllianceEdits,
        cellAssignments: emptyAssignments,
        activeAlliance: activeAlliance,
        lockedAlliances: [],
        resetTimestamp: resetTimestamp,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(getStorageKey(currentServerId), JSON.stringify(data));
      setSaveStatus('New map created locally');
    }
    
    setTimeout(() => setSaveStatus(''), 2000);
    logAuditEvent('startNewMap', {});
  };

  const fullResetMap = async () => {
    if (!isPrivileged) {
      alert('Admin access required to force reset.');
      return;
    }
    if (!confirm('Force reset everything? This will clear alliances, users, passwords, and all assignments.')) {
      return;
    }

    const resetTimestamp = Date.now();
    const emptyAssignments = {};
    const emptyHistory = [{}];

    setAlliances(defaultAlliances);
    setAllianceAuth({});
    setServerAdminAuth(null);
    setAuthorizedAllianceIds([]);
    setActiveAlliance('nova');
    setCellAssignments(emptyAssignments);
    setHistory(emptyHistory);
    setHistoryIndex(0);
    setPlanName('Nova Imperium S2 Plan');
    setLockedAlliances(new Set());
    setAllowCrossAllianceEdits(false);
    setIsViewOnly(true);
    setSaveStatus('Full reset complete');

    if (useFirebase && db && isConnected) {
      try {
        const roomRef = doc(db, 'rooms', getRoomId(currentServerId));
        lastUpdateRef.current = resetTimestamp + 5000;
        await setDoc(roomRef, {
          version: STORAGE_VERSION,
          planName: 'Nova Imperium S2 Plan',
          alliances: defaultAlliances,
          allianceAuth: {},
          serverAdminAuth: null,
          allowCrossAllianceEdits: false,
          cellAssignments: emptyAssignments,
          activeAlliance: 'nova',
          lockedAlliances: [],
          resetTimestamp: resetTimestamp,
          updatedAt: serverTimestamp(),
        }, { merge: false });

        const presenceQuery = query(
          collection(db, PRESENCE_COLLECTION),
          where('roomId', '==', getRoomId(currentServerId))
        );
        const snapshot = await getDocs(presenceQuery);
        snapshot.forEach(async (docSnap) => {
          try {
            await deleteDoc(doc(db, PRESENCE_COLLECTION, docSnap.id));
          } catch (e) {
            console.error('Failed to delete user:', e);
          }
        });
      } catch (error) {
        console.error('Full reset failed:', error);
        setSaveStatus('Reset completed locally');
      }
    } else {
      const data = {
        version: STORAGE_VERSION,
        planName: 'Nova Imperium S2 Plan',
        alliances: defaultAlliances,
        allianceAuth: {},
        serverAdminAuth: null,
        allowCrossAllianceEdits: false,
        cellAssignments: emptyAssignments,
        activeAlliance: 'nova',
        lockedAlliances: [],
        resetTimestamp: resetTimestamp,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(getStorageKey(currentServerId), JSON.stringify(data));
    }

    setTimeout(() => setSaveStatus(''), 2000);
    logAuditEvent('fullReset', {});
  };

  // Server management functions
  // Server management functions
  const persistServers = (nextServers, nextCurrentId) => {
    safeSet(SERVERS_STORAGE_KEY, JSON.stringify(nextServers));
    safeSet(CURRENT_SERVER_KEY, nextCurrentId);
  };

  const switchServer = (serverId) => {
    if (!serverId) return;

    // reset connection flags so UI reflects switching immediately
    setIsLoaded(false);
    setIsConnecting(true);
    setIsConnected(false);
    setActiveUsers([]);
    setIsServerAdmin(false);
    setSaveStatus(`Switching to ${serverId}...`);

    setCurrentServerId(serverId);
    safeSet(CURRENT_SERVER_KEY, serverId);
    setShowServerModal(false);
    setShowOnboarding(false);
    setAllianceAccessPrompted(false);
  };

  const joinServerFromOnboarding = () => {
    const raw = onboardingServerInput.trim();
    const id = sanitizeServerId(raw);

    if (!id) {
      alert('Please enter a valid server number or ID.');
      return;
    }

    const existing = servers.find(s => s.id === id);
    if (existing) {
      switchServer(id);
      setOnboardingServerInput('');
      return;
    }

    const name = raw ? `Server ${raw}` : `Server ${id}`;
    const nextServers = [...servers, { id, name }];
    setServers(nextServers);
    persistServers(nextServers, id);
    setOnboardingServerInput('');
    switchServer(id);
  };

  const addServer = () => {
    const name = newServerName.trim();
    const id = sanitizeServerId(newServerId.trim());

    if (!name || !id) {
      alert('Please enter a server name and a valid server ID.');
      return;
    }

    if (servers.some(s => s.id === id)) {
      alert('That Server ID already exists. Choose a unique ID.');
      return;
    }

    const nextServers = [...servers, { id, name }];
    setServers(nextServers);
    persistServers(nextServers, id);

    setNewServerName('');
    setNewServerId('');

    switchServer(id);
  };

  const deleteServer = (serverId) => {
    if (!serverId) return;
    if (serverId === 'default') {
      alert('The default server cannot be deleted.');
      return;
    }

    const server = servers.find(s => s.id === serverId);
    const ok = confirm(`Delete "${server?.name || serverId}"? This will clear its local map data in this browser.`);
    if (!ok) return;

    // remove local saved plan for that server
    safeRemove(getStorageKey(serverId));

    const nextServers = servers.filter(s => s.id !== serverId);
    const fallbackId = nextServers[0]?.id || 'default';

    // if we deleted the active server, switch
    const nextCurrent = currentServerId === serverId ? fallbackId : currentServerId;

    setServers(nextServers.length ? nextServers : DEFAULT_SERVERS);
    persistServers(nextServers.length ? nextServers : DEFAULT_SERVERS, nextCurrent);

    if (currentServerId === serverId) {
      switchServer(nextCurrent);
    }
  };

  const addAlliance = () => {
    if (!isPrivileged) {
      alert('Only admins can add alliances here. Use Alliance Access to create your alliance.');
      return;
    }
    if (!newAllianceName.trim()) return;
    const id = `alliance_${Date.now()}`;
    setAlliances([...alliances, {
      id,
      name: newAllianceName.trim(),
      tag: newAllianceTag.trim() || newAllianceName.substring(0, 4).toUpperCase(),
      color: newAllianceColor,
    }]);
    setNewAllianceName('');
    setNewAllianceTag('');
    setNewAllianceColor('#ff8800');
    setShowAddAlliance(false);
    setActiveAlliance(id);
    logAuditEvent('addAlliance', { allianceId: id, allianceName: newAllianceName.trim() });
  };

  const openAllianceAccess = (name = '') => {
    setAccessAllianceName(name);
    setIsViewOnly(false);
    setShowAllianceAccess(true);
  };

  const requireAllianceAccess = (allianceId, allianceName) => {
    if (allowCrossAllianceEdits && authUser) return true;
    if (isAuthorizedForAlliance(allianceId)) return true;
    openAllianceAccess(allianceName || '');
    return false;
  };

  const handleAllianceAccess = async () => {
    const name = normalizeAllianceName(accessAllianceName);
    if (!name) {
      setAccessError('Enter your alliance name.');
      return;
    }
    if (!accessPasscode.trim()) {
      setAccessError('Enter your alliance passcode.');
      return;
    }
    setAccessLoading(true);
    setAccessError('');
    try {
      const nameKey = normalizeAllianceKey(name);
      let alliance = alliances.find(a => normalizeAllianceKey(a.name) === nameKey);
      let nextAlliances = alliances;
      if (!alliance) {
        const id = `alliance_${Date.now()}`;
        alliance = {
          id,
          name,
          tag: buildAllianceTag(name),
          color: pickAllianceColor(alliances),
        };
        nextAlliances = [...alliances, alliance];
        setAlliances(nextAlliances);
        logAuditEvent('createAllianceFromAccess', {
          allianceId: id,
          allianceName: name,
        });
      }

      const existingAuth = allianceAuth[alliance.id];
      const hashed = await hashPasscode(accessPasscode);

      if (existingAuth && existingAuth.passcodeHash !== hashed) {
        setAccessError('Incorrect passcode for this alliance.');
        setAccessLoading(false);
        return;
      }

      if (!existingAuth) {
        setAllianceAuth({
          ...allianceAuth,
          [alliance.id]: {
            allianceId: alliance.id,
            allianceName: alliance.name,
            nameKey,
            passcodeHash: hashed,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        });
      }

      if (!authorizedAllianceIds.includes(alliance.id)) {
        setAuthorizedAllianceIds([...authorizedAllianceIds, alliance.id]);
      }

      setIsViewOnly(false);
      setActiveAlliance(alliance.id);
      setShowAllianceAccess(false);
      logAuditEvent('allianceAccessGranted', {
        allianceId: alliance.id,
        allianceName: alliance.name,
      });
    } catch (error) {
      console.error('Alliance access failed:', error);
      setAccessError('Unable to verify passcode. Try again.');
    } finally {
      setAccessLoading(false);
    }
  };

  const handlePasscodeUpdate = async (alliance) => {
    if (!alliance) return;
    if (!isAuthorizedForAlliance(alliance.id)) {
      alert('You are not authorized to change this passcode.');
      return;
    }
    if (!passcodeDraft.trim()) {
      setPasscodeMessage('Enter a new passcode.');
      return;
    }
    if (passcodeDraft.trim() !== passcodeConfirm.trim()) {
      setPasscodeMessage('Passcodes do not match.');
      return;
    }
    try {
      const hashed = await hashPasscode(passcodeDraft);
      const nameKey = normalizeAllianceKey(alliance.name);
      setAllianceAuth((prev) => ({
        ...prev,
        [alliance.id]: {
          allianceId: alliance.id,
          allianceName: alliance.name,
          nameKey,
          passcodeHash: hashed,
          createdAt: prev[alliance.id]?.createdAt || Date.now(),
          updatedAt: Date.now(),
        },
      }));
      setPasscodeDraft('');
      setPasscodeConfirm('');
      setPasscodeMessage('Passcode updated.');
      logAuditEvent('updateAlliancePasscode', {
        allianceId: alliance.id,
        allianceName: alliance.name,
      });
    } catch (error) {
      console.error('Passcode update failed:', error);
      setPasscodeMessage('Unable to update passcode.');
    }
  };

  const updateAlliance = (id, updates) => {
    if (isViewOnly && !isPrivileged) {
      alert('View-only mode is enabled. Disable it to edit.');
      return;
    }
    if (!requireAllianceAccess(id, alliances.find(a => a.id === id)?.name)) return;
    if (updates.name) {
      const nameKey = normalizeAllianceKey(updates.name);
      const conflict = alliances.some(a => a.id !== id && normalizeAllianceKey(a.name) === nameKey);
      if (conflict) {
        alert('An alliance with that name already exists.');
        return;
      }
    }
    setAlliances(alliances.map(a => a.id === id ? { ...a, ...updates } : a));
    logAuditEvent('updateAlliance', { allianceId: id, updates });
    if (updates.name) {
      const nameKey = normalizeAllianceKey(updates.name);
      setAllianceAuth((prev) => {
        const existing = prev[id];
        if (!existing) return prev;
        return {
          ...prev,
          [id]: {
            ...existing,
            allianceName: updates.name,
            nameKey,
            updatedAt: Date.now(),
          },
        };
      });
    }
  };

  const deleteAlliance = (id) => {
    if (isViewOnly && !isPrivileged) {
      alert('View-only mode is enabled. Disable it to edit.');
      return;
    }
    if (!isPrivileged) {
      alert('Only admins can delete alliances.');
      return;
    }
    if (alliances.length <= 1) return;
    clearAlliance(id);
    setAlliances(alliances.filter(a => a.id !== id));
    setAllianceAuth((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setAuthorizedAllianceIds((prev) => prev.filter(aId => aId !== id));
    if (activeAlliance === id) {
      setActiveAlliance(alliances.find(a => a.id !== id)?.id);
    }
    setEditingAlliance(null);
    logAuditEvent('deleteAlliance', { allianceId: id });
  };

  const getAllianceStats = (allianceId) => {
    const result = {
      total: 0,
      byLevel: {},
      byType: {},
      bonuses: {},
      coalPerHour: 0,
      rarePerHour: 0,
    };

    Object.entries(cellAssignments).forEach(([key, assignedAlliance]) => {
      if (assignedAlliance !== allianceId) return;
      
      const [row, col] = key.split('-').map(Number);
      const cell = mapData[row][col];
      
      result.total++;
      result.byLevel[cell.lvl] = (result.byLevel[cell.lvl] || 0) + 1;
      result.byType[cell.type] = (result.byType[cell.type] || 0) + 1;
      
      const bonusMatch = cell.bonus.match(/(\d+)%\s+(.+)/);
      if (bonusMatch) {
        const [, pct, type] = bonusMatch;
        result.bonuses[type] = (result.bonuses[type] || 0) + parseInt(pct);
      }

      if (cell.lvl > 0) {
        const levelData = levelInfo[cell.lvl - 1];
        result.coalPerHour += levelData.coal;
        result.rarePerHour += levelData.rarePerHour;
      }
    });

    return result;
  };

  const allStats = useMemo(() => {
    const stats = {};
    alliances.forEach(alliance => {
      stats[alliance.id] = getAllianceStats(alliance.id);
    });
    return stats;
  }, [cellAssignments, alliances]);


  const getActiveAllianceColor = () => {
    return alliances.find(a => a.id === activeAlliance)?.color || '#00ff88';
  };

  // Convert hex color to grayscale
  const toGrayscale = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return `#${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}`;
  };

  // Get high-contrast patterns for building types
  const getAccessibilityPattern = (type) => {
    const patterns = {
      dig: { borderStyle: 'solid', borderWidth: '2px', opacity: 1 },
      village: { borderStyle: 'dashed', borderWidth: '2px', opacity: 0.9 },
      town: { borderStyle: 'dotted', borderWidth: '2px', opacity: 0.95 },
      factory: { borderStyle: 'double', borderWidth: '3px', opacity: 1 },
      train: { borderStyle: 'solid', borderWidth: '3px', opacity: 0.9 },
      launch: { borderStyle: 'solid', borderWidth: '4px', opacity: 0.95 },
      palace: { borderStyle: 'solid', borderWidth: '4px', opacity: 1 },
      capitol: { borderStyle: 'solid', borderWidth: '5px', opacity: 1 },
    };
    return patterns[type] || patterns.dig;
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastSaved.toLocaleDateString();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: screenshotMode ? '40px' : '20px',
    }}>
      <style>{`
        .map-grid-axis { 
          display: grid;
          grid-template-columns: 26px repeat(13, 1fr);
          gap: 4px;
          max-width: 1000px;
          margin: 0 auto;
          align-items: center;
        }

        .axis-cell {
          font-size: 10px;
          color: #888;
          text-align: center;
          user-select: none;
        }
        
        .cell {
          aspect-ratio: 1;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          position: relative;
          overflow: hidden;
        }
        
        .cell:hover {
          opacity: 0.8;
        }
        
        .cell.dimmed {
          opacity: 0.3;
        }
        
        .cell-tag {
          position: absolute;
          bottom: 2px;
          font-size: 10px;
        }
        
        .cell-icon {
          font-size: 18px;
          line-height: 1;
        }
        
        .cell-level {
          font-size: 12px;
        }
        
        .cell-type {
          font-size: 11px;
          text-align: center;
          line-height: 1.2;
          margin-bottom: 2px;
        }
        
        .panel {
          background: #2a2a3e;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 20px;
        }
        
        .btn {
          background: #3a3a4a;
          border: 2px solid rgba(255,255,255,0.3);
          color: #e0e0e0;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
        }
        
        .btn:hover {
          background: #4a4a5a;
          border-color: rgba(255,255,255,0.5);
        }
        
        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .btn.active {
          border-width: 2px;
        }
        
        .btn-small {
          padding: 8px 12px;
          font-size: 14px;
        }
        
        .btn-danger {
          background: #5a2a2a;
          border-color: rgba(255,100,100,0.5);
        }
        
        .btn-danger:hover {
          background: #6a3a3a;
        }
        
        .btn-success {
          background: #2a5a2a;
          border-color: rgba(100,255,100,0.5);
        }
        
        .btn-success:hover {
          background: #3a6a3a;
        }
        
        .tooltip {
          position: fixed;
          background: rgba(10,10,20,0.98);
          border: 1px solid rgba(255,215,0,0.5);
          border-radius: 10px;
          padding: 12px;
          z-index: 1000;
          pointer-events: none;
          min-width: 180px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        
        .alliance-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          background: rgba(255,255,255,0.1);
          font-size: 16px;
        }
        
        .alliance-btn:hover {
          background: rgba(255,255,255,0.15);
        }
        
        .alliance-btn.active {
          background: rgba(255,255,255,0.2);
          border-color: currentColor;
        }
        
        .alliance-color {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        
        .color-picker {
          width: 32px;
          height: 32px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          padding: 0;
        }
        
        .input {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          padding: 8px 12px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 13px;
          outline: none;
        }
        
        .input:focus {
          border-color: rgba(255,255,255,0.4);
        }
        
        .select {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          padding: 8px 12px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }
        
        .stat-bar {
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 3px;
        }
        
        .stat-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: #1a1a2e;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          padding: 24px;
          min-width: 320px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .screenshot-watermark {
          text-align: center;
          padding: 16px;
          color: rgba(255,255,255,0.5);
          font-size: 12px;
        }
        
        .toolbar {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 8px 12px;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.2);
          margin: 0 4px;
        }
        
        .save-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #888;
          padding: 4px 8px;
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        
        .save-indicator.saving {
          color: #ffd700;
        }
        
        .save-indicator.saved {
          color: #00ff88;
        }
        
        .save-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
        }
        
        .save-dot.unsaved {
          background: #ff8800;
        }
        
        .connection-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          padding: 4px 8px;
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        
        .user-list {
          display: flex;
          gap: 4px;
          align-items: center;
          font-size: 10px;
          color: #888;
        }
      `}</style>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={importData}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Screenshot mode header */}
      {screenshotMode && (
        <div className="screenshot-watermark">
          SERVER 1642 • POLAR STORM SEASON 2 • {planName.toUpperCase()}
        </div>
      )}

      {!screenshotMode && (
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#ffd700',
            margin: 0,
          }}>
            POLAR STORM
          </h1>
          <p style={{ 
            color: '#aaa',
            fontSize: '1.2rem',
            marginTop: '8px',
          }}>
            SEASON 2 TERRITORY PLANNER
          </p>
        </header>
      )}

      {/* Onboarding: Server Selection */}
      {showOnboarding && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '420px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>🌐 Join Your Server</h3>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              Enter your server number. Collaboration and alliances are isolated per server.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                  Server Number
                </label>
                <input
                  className="input"
                  value={onboardingServerInput}
                  onChange={e => setOnboardingServerInput(e.target.value)}
                  placeholder="e.g. 1642"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  autoFocus
                  onKeyPress={e => e.key === 'Enter' && joinServerFromOnboarding()}
                />
              </div>
              <button
                className="btn btn-success"
                onClick={joinServerFromOnboarding}
                style={{ width: '100%' }}
              >
                Join Server
              </button>
            </div>

            {servers.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>
                  Existing Servers
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {servers.map(server => (
                    <button
                      key={server.id}
                      className="btn btn-small"
                      onClick={() => switchServer(server.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: currentServerId === server.id ? '#2a5a2a' : '#3a3a4a',
                      }}
                    >
                      <span>{server.name}</span>
                      <span style={{ fontSize: '10px', color: '#bbb' }}>{server.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: '16px' }}>
              <button
                className="btn"
                onClick={() => { setIsViewOnly(true); setShowOnboarding(false); }}
                style={{ width: '100%' }}
              >
                Continue in View-Only Mode
              </button>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '6px' }}>
                You can observe updates in real time without editing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Server Selection Modal */}
      {showServerModal && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '400px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>🌐 Select Server</h3>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              Choose a server or create a new one. Each server has its own isolated map.
            </p>
            
            {servers.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>Existing Servers</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {servers.map(server => (
                    <div key={server.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px',
                      background: currentServerId === server.id ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      border: currentServerId === server.id ? '1px solid rgba(0,255,136,0.3)' : '1px solid transparent',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{server.name}</div>
                        <div style={{ fontSize: '10px', color: '#888' }}>ID: {server.id}</div>
                      </div>
                      <button
                        className="btn btn-small"
                        onClick={() => switchServer(server.id)}
                        style={{ background: currentServerId === server.id ? '#2a5a2a' : '#3a3a4a' }}
                      >
                        {currentServerId === server.id ? '✓ Active' : 'Select'}
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => deleteServer(server.id)}
                        style={{ padding: '4px 8px' }}
                        title="Delete server"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>Create New Server</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Server Name</label>
                  <input
                    className="input"
                    value={newServerName}
                    onChange={e => setNewServerName(e.target.value)}
                    placeholder="e.g. Server 1642"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Server ID (unique identifier)</label>
                  <input
                    className="input"
                    value={newServerId}
                    onChange={e => setNewServerId(e.target.value)}
                    placeholder="e.g. server-1642"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                    Use lowercase letters, numbers, and hyphens only
                  </div>
                </div>
                <button 
                  className="btn btn-success" 
                  onClick={addServer}
                  style={{ width: '100%' }}
                >
                  ➕ Create Server
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar - hidden in screenshot mode */}
      {!screenshotMode && currentServerId && (
        <div style={{ maxWidth: '850px', margin: '0 auto 16px' }}>
          <div className="toolbar">
            <button 
              className="btn btn-small"
              onClick={() => setShowServerModal(true)}
              style={{ background: '#2a3a4a' }}
              title="Switch server"
            >
              🌐 {servers.find(s => s.id === currentServerId)?.name || 'Server'}
            </button>
            
            <div className="toolbar-divider" />
            
            <button 
              className="btn btn-small" 
              onClick={undo} 
              disabled={historyIndex <= 0}
              title="Undo"
            >
              ↶ Undo
            </button>
            <button 
              className="btn btn-small" 
              onClick={redo} 
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              Redo ↷
            </button>
            <span style={{ fontSize: '10px', color: '#666' }}>
              {historyIndex}/{history.length - 1}
            </span>
            
            <div className="toolbar-divider" />
            
            <button 
              className={`btn btn-small ${accessibilityMode ? 'active' : ''}`}
              onClick={() => setAccessibilityMode(!accessibilityMode)}
              title="Toggle Grayscale/High-Contrast Mode"
            >
              {accessibilityMode ? '🎨 Color' : '⚫ Grayscale'}
            </button>
            
            {(isAdmin || isServerAdmin || authorizedAllianceIds.length > 0) && (
              <button 
                className={`btn btn-small ${isViewOnly ? 'active' : ''}`}
                onClick={() => setIsViewOnly(!isViewOnly)}
                title="Toggle View-Only Mode"
              >
                {isViewOnly ? '👀 View Only' : '✏️ Edit Mode'}
              </button>
            )}

            {isPrivileged && (
              <button
                className={`btn btn-small ${allowCrossAllianceEdits ? 'active' : ''}`}
                onClick={() => {
                  const next = !allowCrossAllianceEdits;
                  setAllowCrossAllianceEdits(next);
                  logAuditEvent('setCrossAllianceEdits', { enabled: next });
                }}
                title="Allow edits across alliances"
              >
                {allowCrossAllianceEdits ? '🔓 Cross-Alliance' : '🔒 Own Alliance'}
              </button>
            )}
            
            <button 
              className="btn btn-small"
              onClick={() => setScreenshotMode(true)}
            >
              📸 Screenshot
            </button>
            
            <div className="toolbar-divider" />
            
            <button 
              className="btn btn-small btn-danger"
              onClick={startNewMap}
              title="Start a new map"
            >
              🆕 New Map
            </button>
            
            <button 
              className="btn btn-small"
              onClick={() => setShowImportExport(true)}
            >
              💾 Save/Load
            </button>
            
            <div className="toolbar-divider" />
            
            {isAdmin ? (
              <>
                <button 
                  className="btn btn-small"
                  onClick={logoutAdmin}
                  style={{ background: '#5a2a2a', borderColor: '#ff4444' }}
                  title="Admin Mode Active"
                >
                  👑 Admin
                </button>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={fullResetMap}
                  title="Force Reset - Clears alliances, users, passwords, and tiles"
                  style={{ background: '#7a1a1a' }}
                >
                  🔄 Force Reset
                </button>
              </>
            ) : isServerAdmin ? (
              <>
                <button 
                  className="btn btn-small"
                  onClick={logoutServerAdmin}
                  style={{ background: '#2a5a3a', borderColor: '#44ff88' }}
                  title="Server Admin Active"
                >
                  🛡️ Server Admin
                </button>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={fullResetMap}
                  title="Force Reset - Clears alliances, users, passwords, and tiles"
                  style={{ background: '#7a1a1a' }}
                >
                  🔄 Force Reset
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-small"
                  onClick={() => setShowAdminModal(true)}
                  title="Enter admin mode"
                >
                  🔑 Admin
                </button>
                <button 
                  className="btn btn-small"
                  onClick={() => setShowServerAdminModal(true)}
                  title="Enter server admin mode"
                >
                  🛡️ Server Admin
                </button>
              </>
            )}

            {isPrivileged && (
              <button
                className="btn btn-small"
                onClick={() => setShowAuditLog(true)}
                title="View audit log"
              >
                📝 Audit Log
              </button>
            )}
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
              {authReady && !authUser ? (
                <button className="btn btn-small" onClick={loginWithDiscord}>
                  🔐 Discord Login
                </button>
              ) : authUser ? (
                <>
                  <div className="save-indicator" style={{ fontSize: '10px' }}>
                    <span>👤 {authUser.displayName || authUser.email || 'Discord User'}</span>
                  </div>
                  <button className="btn btn-small" onClick={() => setShowUserAllianceModal(true)}>
                    Change Alliance
                  </button>
                  <button className="btn btn-small" onClick={logoutDiscord}>
                    Sign Out
                  </button>
                </>
              ) : null}
              {/* Connection Status */}
              {isConnecting ? (
                <div className="save-indicator" style={{ fontSize: '10px' }}>
                  <span>🔌 Connecting...</span>
                </div>
              ) : isConnected && useFirebase ? (
                <div className="save-indicator saved" style={{ fontSize: '10px' }}>
                  <div className="save-dot" />
                  <span>🟢 Online ({activeUsers.length + 1} active)</span>
                </div>
              ) : useFirebase ? (
                <div className="save-indicator" style={{ fontSize: '10px', color: '#ff8800' }}>
                  <span>🔴 Offline (local mode)</span>
                </div>
              ) : null}
              
              {/* Active Users List */}
              {isConnected && activeUsers.length > 0 && (
                <div style={{ 
                  position: 'relative',
                  fontSize: '10px',
                  color: '#888',
                }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span>👥</span>
                    <span>{activeUsers.map(u => u.name).join(', ')}</span>
                  </div>
                </div>
              )}
              
              {/* Save Status - Just the dot */}
              <div 
                className="save-dot" 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%',
                  background: saveStatus ? '#00ff88' : (lastSaved ? '#00ff88' : '#ff8800'),
                  transition: 'background 0.2s ease',
                  cursor: 'default',
                  flexShrink: 0
                }}
                title={saveStatus || (lastSaved ? `Last saved: ${formatLastSaved()}` : 'Not saved')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Exit screenshot mode button */}
      {screenshotMode && (
        <button
          className="btn"
          onClick={() => setScreenshotMode(false)}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            opacity: 0.7,
          }}
        >
          ✕ Exit Screenshot Mode
        </button>
      )}

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Alliance Panel - hidden in screenshot mode */}
        {!screenshotMode && (
          <div className="panel" style={{ flex: '0 0 240px', alignSelf: 'flex-start' }}>
            <h3 style={{ 
              fontFamily: '"Orbitron", monospace',
              fontSize: '0.9rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '8px',
              marginTop: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              🏴 ALLIANCES
              <button 
                className="btn btn-small"
                onClick={() => {
                  if (!isPrivileged) {
                    alert('Only admins can add alliances here. Use Alliance Access to create your alliance.');
                    return;
                  }
                  setShowAddAlliance(true);
                }}
                style={{ fontSize: '14px', padding: '4px 10px' }}
              >+</button>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {alliances.map(alliance => (
                <div
                  key={alliance.id}
                  className={`alliance-btn ${activeAlliance === alliance.id ? 'active' : ''}`}
                  style={{ borderColor: activeAlliance === alliance.id ? alliance.color : 'transparent' }}
                  onClick={() => {
                    if (requireAllianceAccess(alliance.id, alliance.name)) {
                      setActiveAlliance(alliance.id);
                    }
                  }}
                >
                  <div className="alliance-color" style={{ background: alliance.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {alliance.name}
                      {!isAuthorizedForAlliance(alliance.id) && !isPrivileged && (
                        <span style={{ fontSize: '10px' }} title="Passcode required">🔐</span>
                      )}
                      {lockedAlliances.has(alliance.id) && (
                        <span style={{ fontSize: '10px' }} title="Locked">🔒</span>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      [{alliance.tag}] • {allStats[alliance.id]?.total || 0} tiles
                    </div>
                  </div>
                  <button
                    className="btn btn-small"
                    onClick={(e) => { e.stopPropagation(); toggleAllianceLock(alliance.id); }}
                    style={{ 
                      padding: '4px 8px', 
                      fontSize: '12px',
                      background: lockedAlliances.has(alliance.id) ? '#5a3a3a' : '#3a3a4a',
                      borderColor: lockedAlliances.has(alliance.id) ? '#ff6600' : 'rgba(255,255,255,0.3)'
                    }}
                    title={lockedAlliances.has(alliance.id) ? 'Unlock tiles' : 'Lock tiles'}
                  >
                    {lockedAlliances.has(alliance.id) ? '🔓' : '🔒'}
                  </button>
                  <button
                    className="btn btn-small"
                    onClick={(e) => { 
                      e.stopPropagation();
                      if (requireAllianceAccess(alliance.id, alliance.name)) {
                        setEditingAlliance(alliance.id);
                      }
                    }}
                    style={{ padding: '2px 6px', fontSize: '10px' }}
                  >⚙</button>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
              Click map tiles to assign to: <span style={{ color: getActiveAllianceColor(), fontWeight: 600 }}>
                {alliances.find(a => a.id === activeAlliance)?.name}
              </span>
            </div>

            <button className="btn btn-danger" onClick={clearAll} style={{ width: '100%' }}>
              Clear All Territories
            </button>
          </div>
        )}

        {/* Main Map */}
        <div className="panel" style={{ flex: '1 1 550px', maxWidth: '850px' }} ref={mapRef}>
          {/* Alliance Legend for screenshot mode */}
          {screenshotMode && (
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '16px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              {alliances.filter(a => allStats[a.id]?.total > 0).map(alliance => (
                <div key={alliance.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '14px', 
                    height: '14px', 
                    borderRadius: '3px', 
                    background: alliance.color 
                  }} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>
                    {alliance.name} ({allStats[alliance.id]?.total})
                  </span>
                </div>
              ))}
            </div>
          )}


          <div className="map-grid-axis">
            <div className="axis-cell" />
            {mapData[0].map((_, colIdx) => (
              <div key={`col-${colIdx}`} className="axis-cell">
                {String.fromCharCode(65 + colIdx)}
              </div>
            ))}
            {mapData.map((row, rowIdx) => (
              <React.Fragment key={`row-${rowIdx}`}>
                <div className="axis-cell">{rowIdx + 1}</div>
                {row.map((cell, colIdx) => {
                  const key = `${rowIdx}-${colIdx}`;
                  const assignedAlliance = cellAssignments[key];
                  const alliance = alliances.find(a => a.id === assignedAlliance);
                  const config = typeConfig[cell.type];
                  const lvlColor = levelColors[cell.lvl] || levelColors[1];
                  // Calculate colors based on accessibility mode
                  let cellColor, borderColor, shadowColor, tagColor, textColor;
                  const accessibilityPattern = getAccessibilityPattern(cell.type);
                  
                  if (accessibilityMode) {
                    // Grayscale/high-contrast mode: consistent dark background with white text
                    // Use border brightness to indicate level (lighter border = higher level)
                    const baseBrightness = alliance ? 40 : 35; // Dark gray background
                    const levelBorderBrightness = 60 + (cell.lvl * 5); // Range: 60-90% for borders
                    
                    // Consistent dark background for all cells (easy to read white text)
                    cellColor = `hsl(0, 0%, ${baseBrightness}%)`;
                    
                    // Border brightness indicates level (higher level = brighter border)
                    borderColor = `hsl(0, 0%, ${levelBorderBrightness}%)`;
                    
                    shadowColor = 'rgba(0,0,0,0.8)';
                    
                    // Always use white text on dark background for maximum contrast
                    textColor = '#ffffff';
                    tagColor = '#ffffff';
                  } else {
                    // Normal color mode
                    cellColor = alliance ? alliance.color : config.baseColor;
                    borderColor = alliance ? alliance.color : lvlColor.border;
                    shadowColor = alliance 
                      ? `${alliance.color}88`
                      : lvlColor.glow;
                    tagColor = alliance ? alliance.color : '#ffffff';
                    textColor = '#ffffff';
                  }

                  const cellStyle = {
                    background: alliance ? cellColor : cellColor,
                    border: `3px solid ${borderColor}`,
                    borderColor: borderColor,
                    opacity: accessibilityMode ? accessibilityPattern.opacity : 1,
                    filter: accessibilityMode ? 'grayscale(100%) contrast(1.3)' : 'none',
                    color: accessibilityMode ? textColor : undefined,
                  };

                  return (
                    <div
                      key={key}
                      className="cell"
                      style={cellStyle}
                      onClick={() => !screenshotMode && toggleCell(rowIdx, colIdx)}
                      onMouseEnter={(e) => !screenshotMode && setHoveredCell({ cell, row: rowIdx, col: colIdx, x: e.clientX, y: e.clientY, alliance })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span 
                        className="cell-type" 
                        style={{ 
                          color: accessibilityMode ? textColor : '#ffffff',
                          fontWeight: '600'
                        }}
                      >
                        {config.name}
                      </span>
                      <span 
                        className="cell-level" 
                        style={{ 
                          color: accessibilityMode ? textColor : '#ffffff',
                          fontWeight: '700'
                        }}
                      >
                        L{cell.lvl}
                      </span>
                      {alliance && (
                        <span 
                          className="cell-tag" 
                          style={{ 
                            color: tagColor,
                            fontWeight: '700'
                          }}
                        >
                          {alliance.tag}
                        </span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stats Panel - hidden in screenshot mode */}
        {!screenshotMode && (
          <div className="panel" style={{ flex: '0 0 260px', alignSelf: 'flex-start' }}>
            <h3 style={{ 
              fontFamily: '"Orbitron", monospace',
              fontSize: '0.9rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '8px',
              marginTop: 0,
            }}>
              📊 TERRITORY STATS
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <button
                  className={`btn btn-small ${selectedAllianceStats === null ? 'active' : ''}`}
                  onClick={() => setSelectedAllianceStats(null)}
                  style={{ 
                    borderColor: selectedAllianceStats === null ? '#ffd700' : undefined,
                    color: selectedAllianceStats === null ? '#ffd700' : undefined,
                  }}
                >All</button>
                {alliances.map(a => (
                  <button
                    key={a.id}
                    className={`btn btn-small ${selectedAllianceStats === a.id ? 'active' : ''}`}
                    onClick={() => setSelectedAllianceStats(a.id)}
                    style={{ 
                      borderColor: selectedAllianceStats === a.id ? a.color : undefined,
                      color: selectedAllianceStats === a.id ? a.color : undefined,
                    }}
                  >{a.tag}</button>
                ))}
              </div>
            </div>

            {(() => {
              const stats = selectedAllianceStats 
                ? allStats[selectedAllianceStats] 
                : Object.values(allStats).reduce((acc, s) => ({
                    total: acc.total + s.total,
                    byLevel: Object.keys({ ...acc.byLevel, ...s.byLevel }).reduce((o, k) => ({ ...o, [k]: (acc.byLevel[k] || 0) + (s.byLevel[k] || 0) }), {}),
                    byType: Object.keys({ ...acc.byType, ...s.byType }).reduce((o, k) => ({ ...o, [k]: (acc.byType[k] || 0) + (s.byType[k] || 0) }), {}),
                    bonuses: Object.keys({ ...acc.bonuses, ...s.bonuses }).reduce((o, k) => ({ ...o, [k]: (acc.bonuses[k] || 0) + (s.bonuses[k] || 0) }), {}),
                    coalPerHour: acc.coalPerHour + s.coalPerHour,
                    rarePerHour: acc.rarePerHour + s.rarePerHour,
                  }), { total: 0, byLevel: {}, byType: {}, bonuses: {}, coalPerHour: 0, rarePerHour: 0 });

              const displayColor = selectedAllianceStats 
                ? alliances.find(a => a.id === selectedAllianceStats)?.color || '#ffd700'
                : '#ffd700';

              return (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: displayColor }}>
                      {stats.total}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Territories Claimed</div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>By Level</div>
                    {[1,2,3,4,5,6].map(lvl => (
                      <div key={lvl} style={{ marginBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                          <span style={{ color: levelColors[lvl].border }}>Level {lvl}</span>
                          <span>{stats.byLevel[lvl] || 0}</span>
                        </div>
                        <div className="stat-bar">
                          <div 
                            className="stat-fill"
                            style={{ 
                              width: `${((stats.byLevel[lvl] || 0) / Math.max(stats.total, 1)) * 100}%`,
                              background: levelColors[lvl].border,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Bonuses</div>
                    {Object.entries(stats.bonuses).filter(([,v]) => v > 0).map(([type, value]) => (
                      <div key={type} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '0.7rem',
                        padding: '3px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <span>{type}</span>
                        <span style={{ color: '#00ff88', fontWeight: 600 }}>+{value}%</span>
                      </div>
                    ))}
                    {Object.values(stats.bonuses).every(v => v === 0) && (
                      <div style={{ fontSize: '0.7rem', color: '#666' }}>No territories selected</div>
                    )}
                  </div>

                  <div style={{ 
                    background: 'rgba(255,140,0,0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#ff8c00', marginBottom: '2px' }}>⛏️ Coal/Hour</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{stats.coalPerHour.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9370db', marginBottom: '2px', marginTop: '6px' }}>💎 Rare Soil/Hour</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{stats.rarePerHour.toLocaleString()}</div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Legend Panel - hidden in screenshot mode */}
        {showLegend && !screenshotMode && (
          <div className="panel" style={{ flex: '0 0 180px', alignSelf: 'flex-start' }}>
            <h3 style={{ 
              fontFamily: '"Orbitron", monospace',
              fontSize: '0.85rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '8px',
              marginTop: 0,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              📍 LEGEND
              <button 
                onClick={() => setShowLegend(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' }}
              >✕</button>
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>Building Types</div>
              {Object.entries(typeConfig).map(([type, config]) => (
                <div key={type} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '2px 0',
                  fontSize: '0.7rem',
                }}>
                  <span>{config.icon}</span>
                  <span>{config.name}</span>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>Level Colors</div>
              {levelInfo.map(info => (
                <div key={info.level} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '2px 0',
                  fontSize: '0.65rem',
                }}>
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '2px',
                    border: `2px solid ${levelColors[info.level].border}`,
                    background: 'rgba(0,0,0,0.3)',
                  }} />
                  <span>L{info.level}</span>
                  <span style={{ color: '#888', marginLeft: 'auto' }}>{info.temp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Screenshot mode stats summary */}
      {screenshotMode && (
        <div style={{ 
          maxWidth: '850px', 
          margin: '20px auto 0',
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {alliances.filter(a => allStats[a.id]?.total > 0).map(alliance => {
            const stats = allStats[alliance.id];
            return (
              <div key={alliance.id} style={{ 
                background: `${alliance.color}22`,
                border: `1px solid ${alliance.color}44`,
                borderRadius: '8px',
                padding: '12px 20px',
                minWidth: '150px',
              }}>
                <div style={{ fontSize: '12px', color: alliance.color, fontWeight: 600, marginBottom: '8px' }}>
                  {alliance.name}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>
                  {Object.entries(stats.bonuses).filter(([,v]) => v > 0).map(([type, value]) => (
                    <div key={type}>+{value}% {type}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!showLegend && !screenshotMode && (
        <button 
          className="btn"
          onClick={() => setShowLegend(true)}
          style={{ position: 'fixed', bottom: '20px', right: '20px' }}
        >
          Show Legend
        </button>
      )}

      {/* Tooltip */}
      {hoveredCell && !screenshotMode && (
        <div 
          className="tooltip"
          style={{
            left: Math.min(hoveredCell.x + 15, window.innerWidth - 220),
            top: Math.min(hoveredCell.y + 15, window.innerHeight - 250),
          }}
        >
          <div style={{ 
            fontFamily: '"Orbitron", monospace',
            fontWeight: 700,
            color: levelColors[hoveredCell.cell.lvl].border,
            marginBottom: '6px',
            fontSize: '0.9rem',
          }}>
            {typeConfig[hoveredCell.cell.type].icon} {typeConfig[hoveredCell.cell.type].name}
          </div>
          {hoveredCell.alliance && (
            <div style={{ 
              fontSize: '0.8rem', 
              marginBottom: '6px',
              padding: '4px 8px',
              background: `${hoveredCell.alliance.color}22`,
              borderRadius: '4px',
              border: `1px solid ${hoveredCell.alliance.color}44`,
            }}>
              <span style={{ color: hoveredCell.alliance.color }}>⚑ {hoveredCell.alliance.name}</span>
            </div>
          )}
          <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ color: '#888' }}>Level:</span> {hoveredCell.cell.lvl}
          </div>
          <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ color: '#888' }}>Bonus:</span>{' '}
            <span style={{ color: '#00ff88' }}>{hoveredCell.cell.bonus}</span>
          </div>
          {hoveredCell.cell.lvl > 0 && (
            <>
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                Coal: {levelInfo[hoveredCell.cell.lvl - 1].coal}/hr
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                Rare Soil: {levelInfo[hoveredCell.cell.lvl - 1].rarePerHour}/hr
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                Temp: {levelInfo[hoveredCell.cell.lvl - 1].temp}
              </div>
            </>
          )}
          <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '6px' }}>
            Position: {String.fromCharCode(65 + hoveredCell.col)}{hoveredCell.row + 1}
          </div>
        </div>
      )}

      {/* User Alliance Selection */}
      {showUserAllianceModal && authUser && (
        <div className="modal-overlay" onClick={() => setShowUserAllianceModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '360px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>Select Your Alliance</h3>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              Choose your alliance for this server. You can change this later.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Alliance</label>
                <select
                  className="select"
                  value={userAllianceSelection}
                  onChange={e => setUserAllianceSelection(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select alliance</option>
                  {alliances.map(alliance => (
                    <option key={alliance.id} value={alliance.id}>
                      {alliance.name}
                    </option>
                  ))}
                </select>
              </div>
              {userAllianceMessage && (
                <div style={{ fontSize: '11px', color: '#ff8800' }}>
                  {userAllianceMessage}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" onClick={() => setShowUserAllianceModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={saveUserAlliance} style={{ flex: 1 }}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alliance Access Modal */}
      {showAllianceAccess && (
        <div className="modal-overlay" onClick={() => setShowAllianceAccess(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '360px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>Alliance Access</h3>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              Enter your alliance name and passcode. If the alliance does not exist, this will create it.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Alliance Name</label>
                <input
                  className="input"
                  value={accessAllianceName}
                  onChange={e => setAccessAllianceName(e.target.value)}
                  placeholder="e.g. Nova Imperium"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Passcode</label>
                <input
                  className="input"
                  type="password"
                  value={accessPasscode}
                  onChange={e => setAccessPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  onKeyPress={e => e.key === 'Enter' && handleAllianceAccess()}
                />
              </div>
              {accessError && (
                <div style={{ fontSize: '11px', color: '#ff8800' }}>
                  {accessError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button className="btn" onClick={() => setShowAllianceAccess(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button
                  className="btn btn-small"
                  onClick={() => { setIsViewOnly(true); setShowAllianceAccess(false); }}
                  style={{ flex: 1 }}
                >
                  View Only
                </button>
                <button className="btn btn-success" onClick={handleAllianceAccess} style={{ flex: 1 }} disabled={accessLoading}>
                  {accessLoading ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Alliance Modal */}
      {showAddAlliance && (
        <div className="modal-overlay" onClick={() => setShowAddAlliance(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>Add Alliance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Alliance Name</label>
                <input
                  className="input"
                  placeholder="e.g. SuperNova"
                  value={newAllianceName}
                  onChange={e => setNewAllianceName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Tag (4 chars)</label>
                  <input
                    className="input"
                    placeholder="e.g. SNVA"
                    value={newAllianceTag}
                    onChange={e => setNewAllianceTag(e.target.value.substring(0, 4))}
                    maxLength={4}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Color</label>
                  <input
                    type="color"
                    className="color-picker"
                    value={newAllianceColor}
                    onChange={e => setNewAllianceColor(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="btn" onClick={() => setShowAddAlliance(false)} style={{ flex: 1 }}>Cancel</button>
                <button 
                  className="btn" 
                  onClick={addAlliance}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #00aa55 0%, #008844 100%)', borderColor: '#00ff88' }}
                >Add Alliance</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Alliance Modal */}
      {editingAlliance && (
        <div className="modal-overlay" onClick={() => setEditingAlliance(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>Edit Alliance</h3>
            {(() => {
              const alliance = alliances.find(a => a.id === editingAlliance);
              if (!alliance) return null;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Alliance Name</label>
                    <input
                      className="input"
                      value={alliance.name}
                      onChange={e => updateAlliance(alliance.id, { name: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Tag</label>
                      <input
                        className="input"
                        value={alliance.tag}
                        onChange={e => updateAlliance(alliance.id, { tag: e.target.value.substring(0, 4) })}
                        maxLength={4}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Color</label>
                      <input
                        type="color"
                        className="color-picker"
                        value={alliance.color}
                        onChange={e => updateAlliance(alliance.id, { color: e.target.value })}
                      />
                    </div>
                  </div>
                  {(isAdmin || isAuthorizedForAlliance(alliance.id)) && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Alliance Passcode</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          className="input"
                          type="password"
                          placeholder="New passcode"
                          value={passcodeDraft}
                          onChange={e => setPasscodeDraft(e.target.value)}
                          style={{ flex: 1, boxSizing: 'border-box' }}
                        />
                        <input
                          className="input"
                          type="password"
                          placeholder="Confirm passcode"
                          value={passcodeConfirm}
                          onChange={e => setPasscodeConfirm(e.target.value)}
                          style={{ flex: 1, boxSizing: 'border-box' }}
                        />
                      </div>
                      <button
                        className="btn btn-small"
                        onClick={() => handlePasscodeUpdate(alliance)}
                        style={{ width: '100%' }}
                      >
                        Update Passcode
                      </button>
                      {passcodeMessage && (
                        <div style={{ fontSize: '11px', color: passcodeMessage.includes('updated') ? '#00ff88' : '#ff8800', marginTop: '6px' }}>
                          {passcodeMessage}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => deleteAlliance(alliance.id)}
                      style={{ flex: 1 }}
                    >Delete</button>
                    <button 
                      className="btn" 
                      onClick={() => clearAlliance(alliance.id)}
                      style={{ flex: 1 }}
                    >Clear Tiles</button>
                    <button 
                      className="btn" 
                      onClick={() => setEditingAlliance(null)}
                      style={{ flex: 1, background: 'linear-gradient(135deg, #00aa55 0%, #008844 100%)', borderColor: '#00ff88' }}
                    >Done</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Admin Password Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => { setShowAdminModal(false); setAdminPassword(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '300px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>🔑 Admin Access</h3>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              Enter admin password to unlock all tiles and modify locked alliances.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Admin Password</label>
                <input
                  className="input"
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && checkAdminPassword()}
                  placeholder="Enter password"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  autoFocus
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  className="btn" 
                  onClick={() => { setShowAdminModal(false); setAdminPassword(''); }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={checkAdminPassword}
                  style={{ flex: 1 }}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Server Admin Password Modal */}
      {showServerAdminModal && (
        <div className="modal-overlay" onClick={() => { setShowServerAdminModal(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '320px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>🛡️ Server Admin Access</h3>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              {serverAdminAuth?.passcodeHash
                ? 'Enter the server admin passcode.'
                : 'Set a new server admin passcode for this server.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                  Server Admin Passcode
                </label>
                <input
                  className="input"
                  type="password"
                  value={serverAdminPassword}
                  onChange={e => setServerAdminPassword(e.target.value)}
                  placeholder="Enter passcode"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  autoFocus
                  onKeyPress={e => e.key === 'Enter' && checkServerAdminPassword()}
                />
              </div>
              {!serverAdminAuth?.passcodeHash && (
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                    Confirm Passcode
                  </label>
                  <input
                    className="input"
                    type="password"
                    value={serverAdminConfirm}
                    onChange={e => setServerAdminConfirm(e.target.value)}
                    placeholder="Confirm passcode"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              )}
              {serverAdminMessage && (
                <div style={{ fontSize: '11px', color: '#ff8800' }}>{serverAdminMessage}</div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  className="btn"
                  onClick={() => { setShowServerAdminModal(false); }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={checkServerAdminPassword}
                  style={{ flex: 1 }}
                >
                  {serverAdminAuth?.passcodeHash ? 'Login' : 'Set Passcode'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && isPrivileged && (
        <div className="modal-overlay" onClick={() => setShowAuditLog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '420px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>Audit Log</h3>
            {auditLoading ? (
              <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div>
            ) : auditLogs.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#888' }}>No entries yet.</div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {auditLogs.map((log) => {
                  const timestamp = log.createdAt?.toDate ? log.createdAt.toDate() : null;
                  return (
                    <div key={log.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
                        {timestamp ? timestamp.toLocaleString() : 'Pending'} • {log.userName || log.uid}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>
                        {log.actionType}
                      </div>
                      {log.payload && (
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                          {JSON.stringify(log.payload)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn" onClick={() => setShowAuditLog(false)} style={{ flex: 1 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <div className="modal-overlay" onClick={() => setShowImportExport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '400px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>💾 Save & Load</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Plan Name</label>
              <input
                className="input"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                placeholder="e.g. Nova Imperium S2 Plan"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ 
              background: 'rgba(0,255,136,0.1)', 
              border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '12px', color: '#00ff88', fontWeight: 600, marginBottom: '8px' }}>
                ✓ Auto-Save Enabled
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                Your map is automatically saved to this browser. Last saved: {formatLastSaved()}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>Export / Import</div>
              
              <button 
                className="btn"
                onClick={exportData}
                style={{ width: '100%' }}
              >
                📤 Export to JSON File
              </button>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '-8px' }}>
                Download your plan to share with R4s or backup
              </div>
              
              <button 
                className="btn"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%' }}
              >
                📥 Import from JSON File
              </button>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '-8px' }}>
                Load a previously exported plan
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <button 
                className="btn btn-danger"
                onClick={clearSavedData}
                style={{ width: '100%' }}
              >
                🗑️ Clear All Saved Data
              </button>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                Reset everything and start fresh
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button 
                className="btn" 
                onClick={() => setShowImportExport(false)}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
