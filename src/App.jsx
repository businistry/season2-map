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
} from 'firebase/firestore';
import { db } from './firebase';

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

// Firebase configuration
const ROOM_ID = 'season2-plan'; // Shared room ID for all alliances
const PRESENCE_COLLECTION = 'presence'; // Track active users

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

// Build indexed tile data for optimizer
const allTiles = [];
mapData.forEach((row, rowIdx) => {
  row.forEach((cell, colIdx) => {
    const bonusMatch = cell.bonus.match(/(\d+)%\s+(.+)/);
    if (bonusMatch) {
      allTiles.push({
        key: `${rowIdx}-${colIdx}`,
        row: rowIdx,
        col: colIdx,
        cell,
        bonusType: bonusMatch[2],
        bonusValue: parseInt(bonusMatch[1]),
        level: cell.lvl,
      });
    }
  });
});

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
  
  // History for undo/redo
  const [history, setHistory] = useState([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Screenshot mode
  const [screenshotMode, setScreenshotMode] = useState(false);
  
  // Accessibility mode (grayscale/high-contrast)
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  
  // Resource optimizer
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [optimizerResource, setOptimizerResource] = useState('Food');
  const [optimizerCount, setOptimizerCount] = useState(10);
  const [optimizerMaxLevel, setOptimizerMaxLevel] = useState(6);
  const [optimizerResults, setOptimizerResults] = useState(null);

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
  const lastResetTimestampRef = useRef(0);
  
  // Firebase/Real-time collaboration state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [useFirebase, setUseFirebase] = useState(true); // Toggle between Firebase and localStorage
  const unsubscribeRef = useRef(null);
  const presenceUnsubscribeRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const userNameRef = useRef(USER_NAME);
  
  // Prompt for user name on first Firebase connection (defer to avoid blocking render)
  useEffect(() => {
    if (useFirebase && db && isConnecting && !localStorage.getItem('user-name')) {
      // Use setTimeout to avoid blocking initial render
      const timer = setTimeout(() => {
        const name = prompt('Enter your name (for collaboration):') || `User ${USER_ID.slice(-4)}`;
        localStorage.setItem('user-name', name);
        userNameRef.current = name;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isConnecting, useFirebase]);

  const mapRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Firebase connection and load data
  useEffect(() => {
    // Check if db is available (Firebase might not be initialized)
    const dbAvailable = db !== null && db !== undefined;
    
    if (!useFirebase || !dbAvailable) {
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
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
            // Load locked alliances
            if (data.lockedAlliances) {
              setLockedAlliances(new Set(data.lockedAlliances));
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
        const roomRef = doc(db, 'rooms', ROOM_ID);
        
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
        const currentUserName = localStorage.getItem('user-name') || userNameRef.current || `User ${USER_ID.slice(-4)}`;
        await setDoc(presenceRef, {
          userId: USER_ID,
          userName: currentUserName,
          roomId: ROOM_ID,
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
          where('roomId', '==', ROOM_ID),
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
          const saved = localStorage.getItem(STORAGE_KEY);
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
  }, [useFirebase]);

  // Auto-save to Firebase or localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded) return; // Don't save until initial load is complete
    
    const saveData = async () => {
      try {
        const data = {
          version: STORAGE_VERSION,
          planName,
          alliances,
          cellAssignments,
          activeAlliance,
          lockedAlliances: Array.from(lockedAlliances),
          savedAt: new Date().toISOString(),
        };

        if (useFirebase && db && isConnected) {
          // Save to Firebase
          try {
            const roomRef = doc(db, 'rooms', ROOM_ID);
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setLastSaved(new Date());
            setSaveStatus('Saved locally (Firebase error)');
          }
        } else {
          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  }, [alliances, cellAssignments, activeAlliance, planName, isLoaded, useFirebase, isConnected]);

  // Export data as JSON file
  const exportData = () => {
    const data = {
      version: STORAGE_VERSION,
      planName,
      alliances,
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
      localStorage.removeItem(STORAGE_KEY);
      setAlliances(defaultAlliances);
      setCellAssignments({});
      setActiveAlliance('nova');
      setPlanName('Nova Imperium S2 Plan');
      setHistory([{}]);
      setHistoryIndex(0);
      setLastSaved(null);
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
    
    // Check if tile is locked (and user is not admin)
    if (currentAssignment && lockedAlliances.has(currentAssignment) && !isAdmin) {
      alert(`This tile is locked by ${currentAlliance?.name || 'an alliance'}. Admin access required to modify.`);
      return;
    }
    
    const newAssignments = { ...cellAssignments };
    
    if (newAssignments[key] === activeAlliance) {
      delete newAssignments[key];
    } else {
      newAssignments[key] = activeAlliance;
    }
    
    updateAssignments(newAssignments);
  };

  const clearAlliance = (allianceId) => {
    // Check if alliance tiles are locked (and user is not admin)
    if (lockedAlliances.has(allianceId) && !isAdmin) {
      const alliance = alliances.find(a => a.id === allianceId);
      alert(`Tiles for ${alliance?.name || 'this alliance'} are locked. Admin access required to clear.`);
      return;
    }
    
    const newAssignments = { ...cellAssignments };
    Object.keys(newAssignments).forEach(key => {
      if (newAssignments[key] === allianceId) {
        delete newAssignments[key];
      }
    });
    updateAssignments(newAssignments);
  };

  const clearAll = () => {
    if (lockedAlliances.size > 0 && !isAdmin) {
      alert('Some alliances have locked their tiles. Admin access required to clear all.');
      return;
    }
    updateAssignments({});
  };

  // Toggle lock for an alliance
  const toggleAllianceLock = (allianceId) => {
    const newLocked = new Set(lockedAlliances);
    if (newLocked.has(allianceId)) {
      newLocked.delete(allianceId);
    } else {
      newLocked.add(allianceId);
    }
    setLockedAlliances(newLocked);
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
    } else {
      alert('Incorrect admin password');
      setAdminPassword('');
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setSaveStatus('Admin mode deactivated');
    setTimeout(() => setSaveStatus(''), 2000);
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
        where('roomId', '==', ROOM_ID)
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
    if (!isAdmin) {
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
        where('roomId', '==', ROOM_ID)
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
        const roomRef = doc(db, 'rooms', ROOM_ID);
        lastUpdateRef.current = resetTimestamp; // Set update time to prevent overwrite
        await setDoc(roomRef, {
          version: STORAGE_VERSION,
          planName: 'Nova Imperium S2 Plan',
          alliances: alliances, // Keep alliances
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
        cellAssignments: emptyAssignments,
        activeAlliance: activeAlliance,
        lockedAlliances: [],
        resetTimestamp: resetTimestamp,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaveStatus('New map created locally');
    }
    
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const addAlliance = () => {
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
  };

  const updateAlliance = (id, updates) => {
    setAlliances(alliances.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAlliance = (id) => {
    if (alliances.length <= 1) return;
    clearAlliance(id);
    setAlliances(alliances.filter(a => a.id !== id));
    if (activeAlliance === id) {
      setActiveAlliance(alliances.find(a => a.id !== id)?.id);
    }
    setEditingAlliance(null);
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

  // Resource Optimizer
  const runOptimizer = () => {
    const available = allTiles.filter(t => 
      t.bonusType === optimizerResource && 
      t.level <= optimizerMaxLevel &&
      !cellAssignments[t.key]
    );
    
    // Sort by bonus value (highest first), then by level (lowest first for easier acquisition)
    available.sort((a, b) => {
      if (b.bonusValue !== a.bonusValue) return b.bonusValue - a.bonusValue;
      return a.level - b.level;
    });
    
    const selected = available.slice(0, optimizerCount);
    const totalBonus = selected.reduce((sum, t) => sum + t.bonusValue, 0);
    
    setOptimizerResults({
      tiles: selected,
      totalBonus,
      byLevel: selected.reduce((acc, t) => {
        acc[t.level] = (acc[t.level] || 0) + 1;
        return acc;
      }, {}),
    });
  };

  const applyOptimizerResults = () => {
    if (!optimizerResults) return;
    
    // Check if any target tiles are locked
    const lockedTiles = optimizerResults.tiles.filter(t => {
      const assignedAlliance = cellAssignments[t.key];
      return assignedAlliance && lockedAlliances.has(assignedAlliance) && !isAdmin;
    });
    
    if (lockedTiles.length > 0 && !isAdmin) {
      alert(`${lockedTiles.length} tile(s) are locked. Admin access required to modify locked tiles.`);
      return;
    }
    
    const newAssignments = { ...cellAssignments };
    optimizerResults.tiles.forEach(t => {
      newAssignments[t.key] = activeAlliance;
    });
    updateAssignments(newAssignments);
    setOptimizerResults(null);
    setShowOptimizer(false);
  };

  const highlightOptimized = optimizerResults ? new Set(optimizerResults.tiles.map(t => t.key)) : new Set();

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
      background: 'linear-gradient(135deg, #0a0a12 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#e0e0e0',
      fontFamily: '"Rajdhani", "Segoe UI", sans-serif',
      padding: screenshotMode ? '40px' : '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700&display=swap');
        
        .map-grid { 
          display: grid;
          grid-template-columns: repeat(13, 1fr);
          gap: 3px;
          max-width: 850px;
          margin: 0 auto;
        }
        
        .cell {
          aspect-ratio: 1;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          position: relative;
          overflow: hidden;
        }
        
        .cell:hover {
          transform: scale(1.15);
          z-index: 10;
        }
        
        .cell.dimmed {
          opacity: 0.3;
        }
        
        .cell.optimized {
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0ff; }
          50% { box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0ff; }
        }
        
        .cell-tag {
          position: absolute;
          bottom: 1px;
          font-size: 6px;
          font-weight: 700;
          letter-spacing: -0.5px;
          text-shadow: 0 0 2px rgba(0,0,0,0.8);
        }
        
        .cell-icon {
          font-size: 14px;
          line-height: 1;
        }
        
        .cell-level {
          font-size: 7px;
          font-weight: 700;
          opacity: 0.9;
        }
        
        .cell-type {
          font-size: 7px;
          font-weight: 600;
          text-align: center;
          line-height: 1.1;
          margin-bottom: 1px;
        }
        
        .panel {
          background: rgba(20, 20, 35, 0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 16px;
          backdrop-filter: blur(10px);
        }
        
        .btn {
          background: linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%);
          border: 1px solid rgba(255,255,255,0.2);
          color: #e0e0e0;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          font-size: 12px;
        }
        
        .btn:hover {
          background: linear-gradient(135deg, #3a3a5a 0%, #2a2a3e 100%);
          border-color: rgba(255,255,255,0.4);
        }
        
        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .btn.active {
          border-width: 2px;
        }
        
        .btn-small {
          padding: 4px 8px;
          font-size: 11px;
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #4a2a2a 0%, #2e1a1a 100%);
          border-color: rgba(255,100,100,0.3);
        }
        
        .btn-danger:hover {
          background: linear-gradient(135deg, #5a3a3a 0%, #3e2a2a 100%);
          border-color: rgba(255,100,100,0.5);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #2a4a2a 0%, #1a2e1a 100%);
          border-color: rgba(100,255,100,0.3);
        }
        
        .btn-success:hover {
          background: linear-gradient(135deg, #3a5a3a 0%, #2a3e2a 100%);
          border-color: rgba(100,255,100,0.5);
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
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
          background: rgba(255,255,255,0.05);
        }
        
        .alliance-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .alliance-btn.active {
          background: rgba(255,255,255,0.15);
        }
        
        .alliance-color {
          width: 16px;
          height: 16px;
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
          font-family: 'Orbitron', monospace;
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
            fontFamily: '"Orbitron", monospace',
            fontSize: '2rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ff6347 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(255,215,0,0.3)',
            margin: 0,
          }}>
            POLAR STORM
          </h1>
          <p style={{ 
            fontFamily: '"Orbitron", monospace',
            color: '#888',
            fontSize: '0.8rem',
            letterSpacing: '3px',
            marginTop: '4px',
          }}>
            SEASON 2 TERRITORY PLANNER
          </p>
        </header>
      )}

      {/* Toolbar - hidden in screenshot mode */}
      {!screenshotMode && (
        <div style={{ maxWidth: '850px', margin: '0 auto 16px' }}>
          <div className="toolbar">
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
              className="btn btn-small"
              onClick={() => setShowOptimizer(true)}
              style={{ background: 'linear-gradient(135deg, #2a3a4a 0%, #1a2a3e 100%)' }}
            >
              🎯 Optimizer
            </button>
            
            <button 
              className={`btn btn-small ${accessibilityMode ? 'active' : ''}`}
              onClick={() => setAccessibilityMode(!accessibilityMode)}
              title="Toggle Grayscale/High-Contrast Mode"
            >
              {accessibilityMode ? '🎨 Color' : '⚫ Grayscale'}
            </button>
            
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
                  onClick={startNewMap}
                  title="Force Reset Map - Clears all tiles and user states"
                  style={{ background: '#7a1a1a' }}
                >
                  🔄 Force Reset
                </button>
              </>
            ) : (
              <button 
                className="btn btn-small"
                onClick={() => setShowAdminModal(true)}
                title="Enter admin mode"
              >
                🔑 Admin
              </button>
            )}
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
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
                onClick={() => setShowAddAlliance(true)}
                style={{ fontSize: '14px', padding: '4px 10px' }}
              >+</button>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {alliances.map(alliance => (
                <div
                  key={alliance.id}
                  className={`alliance-btn ${activeAlliance === alliance.id ? 'active' : ''}`}
                  style={{ borderColor: activeAlliance === alliance.id ? alliance.color : 'transparent' }}
                  onClick={() => setActiveAlliance(alliance.id)}
                >
                  <div className="alliance-color" style={{ background: alliance.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {alliance.name}
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
                    onClick={(e) => { e.stopPropagation(); setEditingAlliance(alliance.id); }}
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


          <div className="map-grid">
            {mapData.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const key = `${rowIdx}-${colIdx}`;
                const assignedAlliance = cellAssignments[key];
                const alliance = alliances.find(a => a.id === assignedAlliance);
                const config = typeConfig[cell.type];
                const lvlColor = levelColors[cell.lvl] || levelColors[1];
                const isOptimized = highlightOptimized.has(key);
                
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
                  background: accessibilityMode
                    ? `${cellColor}`
                    : alliance 
                      ? `linear-gradient(135deg, ${cellColor}dd 0%, ${cellColor}99 100%)`
                      : `linear-gradient(135deg, ${cellColor} 0%, ${cellColor}dd 100%)`,
                  border: accessibilityMode
                    ? `${accessibilityPattern.borderWidth} ${accessibilityPattern.borderStyle} ${borderColor}`
                    : `2px solid ${borderColor}`,
                  borderColor: borderColor,
                  opacity: accessibilityMode ? accessibilityPattern.opacity : 1,
                  filter: accessibilityMode ? 'grayscale(100%) contrast(1.3)' : 'none',
                  boxShadow: accessibilityMode
                    ? `0 0 4px ${shadowColor}, inset 0 0 2px rgba(0,0,0,0.1)`
                    : alliance 
                      ? `0 0 12px ${shadowColor}, inset 0 0 8px rgba(255,255,255,0.2)`
                      : `0 0 6px ${shadowColor}`,
                  color: accessibilityMode ? textColor : undefined, // Set text color for accessibility mode
                };

                return (
                  <div
                    key={key}
                    className={`cell ${isOptimized ? 'optimized' : ''}`}
                    style={cellStyle}
                    onClick={() => !screenshotMode && toggleCell(rowIdx, colIdx)}
                    onMouseEnter={(e) => !screenshotMode && setHoveredCell({ cell, row: rowIdx, col: colIdx, x: e.clientX, y: e.clientY, alliance })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <span 
                      className="cell-type" 
                      style={{ 
                        color: accessibilityMode ? textColor : undefined,
                        textShadow: accessibilityMode 
                          ? (textColor === '#ffffff' ? '0 0 2px rgba(0,0,0,0.9)' : '0 0 2px rgba(255,255,255,0.9)')
                          : '0 0 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {config.name}
                    </span>
                    <span 
                      className="cell-level" 
                      style={{ 
                        color: accessibilityMode ? textColor : undefined,
                        textShadow: accessibilityMode 
                          ? (textColor === '#ffffff' ? '0 0 2px rgba(0,0,0,0.9)' : '0 0 2px rgba(255,255,255,0.9)')
                          : '0 0 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      L{cell.lvl}
                    </span>
                    {alliance && (
                      <span 
                        className="cell-tag" 
                        style={{ 
                          color: tagColor,
                          textShadow: accessibilityMode 
                            ? (tagColor === '#ffffff' ? '0 0 3px rgba(0,0,0,0.9)' : '0 0 3px rgba(255,255,255,0.9)')
                            : '0 0 2px rgba(0,0,0,0.8)',
                          fontWeight: accessibilityMode ? '900' : '700'
                        }}
                      >
                        {alliance.tag}
                      </span>
                    )}
                  </div>
                );
              })
            )}
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
            Position: ({hoveredCell.row}, {hoveredCell.col})
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

      {/* Resource Optimizer Modal */}
      {showOptimizer && (
        <div className="modal-overlay" onClick={() => { setShowOptimizer(false); setOptimizerResults(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '400px' }}>
            <h3 style={{ marginTop: 0, fontFamily: '"Orbitron", monospace' }}>🎯 Resource Optimizer</h3>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              Find the best unclaimed tiles to maximize a specific resource bonus.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Resource to Maximize</label>
                <select 
                  className="select"
                  value={optimizerResource}
                  onChange={e => setOptimizerResource(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Food">Food</option>
                  <option value="Iron">Iron</option>
                  <option value="Coin">Coin</option>
                  <option value="Gathering">Gathering</option>
                  <option value="Healing">Healing</option>
                  <option value="Construction">Construction</option>
                  <option value="Research">Research</option>
                  <option value="Training">Training</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Number of Tiles</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="50"
                    value={optimizerCount}
                    onChange={e => setOptimizerCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Max Level</label>
                  <select 
                    className="select"
                    value={optimizerMaxLevel}
                    onChange={e => setOptimizerMaxLevel(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  >
                    {[1,2,3,4,5,6].map(lvl => (
                      <option key={lvl} value={lvl}>Level {lvl} ({levelInfo[lvl-1].temp})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                className="btn"
                onClick={runOptimizer}
                style={{ width: '100%', background: 'linear-gradient(135deg, #3a4a5a 0%, #2a3a4e 100%)' }}
              >
                🔍 Find Optimal Tiles
              </button>
            </div>

            {optimizerResults && (
              <div style={{ 
                background: 'rgba(0,255,136,0.1)', 
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#00ff88' }}>
                  Results: +{optimizerResults.totalBonus}% {optimizerResource}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                  Found {optimizerResults.tiles.length} tiles
                  {Object.entries(optimizerResults.byLevel).map(([lvl, count]) => (
                    <span key={lvl} style={{ marginLeft: '8px', color: levelColors[lvl].border }}>
                      L{lvl}×{count}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: '#666', maxHeight: '100px', overflowY: 'auto' }}>
                  {optimizerResults.tiles.map((t, i) => (
                    <span key={t.key} style={{ marginRight: '8px' }}>
                      ({t.row},{t.col}): +{t.bonusValue}%
                      {i < optimizerResults.tiles.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn" 
                onClick={() => { setShowOptimizer(false); setOptimizerResults(null); }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              {optimizerResults && (
                <button 
                  className="btn btn-success" 
                  onClick={applyOptimizerResults}
                  style={{ flex: 1 }}
                >
                  ✓ Apply to {alliances.find(a => a.id === activeAlliance)?.name}
                </button>
              )}
            </div>
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
