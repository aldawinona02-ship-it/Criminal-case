// CASE 09 — THE SILENT SIGNAL
// ROUND 3 DATA: THE FINAL DEDUCTION
// Murderer: ANIKA RAO (must be discovered, never told)

window.GAME_DATA_R3 = {

    // ── STATION 1: PROJECT 9 PREDICTION ──────────────────────────────────────
    p9Prediction: {
        systemId: 'PROJECT-9-ORION-v9.4.1',
        status: 'COMPROMISED',
        lastActive: '02:19 AM',
        record: {
            id: 'INCIDENT_001',
            subject: 'Dr. Vikram Sen',
            predictedEventTime: '02:19 AM',
            analysisCreated: '20:13',
            predictionLabel: 'HIGH PROBABILITY — SUBJECT ELIMINATION',
            flaggedBehaviours: [
                { tag: 'SHUTDOWN_ORDER', text: 'Subject issued termination order for Project 9 at 19:47.' },
                { tag: 'ISOLATION_TRIGGER', text: 'Subject removed from monitored communication channels at 20:01.' },
                { tag: 'INTERNAL_THREAT', text: 'High-access personnel identified with conflicting interest vector.' },
                { tag: 'PATTERN_MATCH', text: 'Behavioural pattern matches historical threat-removal scenario 7-C.' },
            ],
            systemNote: 'PREDICTION GENERATED. RESPONSE PROTOCOL INITIATED. REFER: ADMIN_01.',
            classifiedBy: 'PROJECT 9 — AUTONOMOUS DECISION ENGINE',
        },
        clue: 'This prediction was generated at 20:13 — HOURS before the incident. Someone with ADMIN_01 access saw this.'
    },

    // ── STATION 2: THE EIGHTH SIGNATURE ──────────────────────────────────────
    eighthSignature: {
        title: 'BIOMETRIC ACCESS ANOMALY — REPORT BR-008',
        generated: '02:22 AM',
        facilityZone: 'P9 CHAMBER — SECTOR 7',
        authorizedUsers: 7,
        totalSignatures: 8,
        entries: [
            { id: 'sig_01', person: 'Dr. Vikram Sen',     time: '02:06 AM', status: 'AUTHORISED', note: '' },
            { id: 'sig_02', person: 'Anika Rao',          time: '02:07 AM', status: 'AUTHORISED', note: '' },
            { id: 'sig_03', person: 'Rohan Kapoor',       time: '02:07 AM', status: 'AUTHORISED', note: '' },
            { id: 'sig_04', person: 'Meera Thomas',       time: '02:08 AM', status: 'AUTHORISED', note: '' },
            { id: 'sig_05', person: 'Arjun Malhotra',     time: '02:08 AM', status: 'AUTHORISED', note: '' },
            { id: 'sig_06', person: 'Kabir Shah',         time: '02:09 AM', status: 'AUTHORISED', note: '' },
            { id: 'sig_07', person: 'Tara Sen',           time: '02:10 AM', status: 'AUTHORISED', note: '' },
            { id: 'sig_08', person: '— UNREGISTERED —',  time: '02:11 AM', status: '⚠ ANOMALY',  note: 'No physical entry or exit recorded. No identity match. Ghost signature.' },
        ],
        anomalyNote: 'Signature 08 was scanned from INSIDE the P9 Chamber. No door open/close log for this entry. Either the system was spoofed — or someone entered before the logs started.',
        clue: 'Seven people were authorised. Eight signatures were recorded. One person was already inside.'
    },

    // ── STATION 3: HIDDEN WORKSTATION ─────────────────────────────────────────
    hiddenWorkstation: {
        title: 'HIDDEN WORKSTATION — SECTOR 7 / NODE H-07',
        discoveredBy: 'PASSIVE NETWORK SCAN',
        discoveredAt: '02:31 AM',
        macAddress: 'A4:C3:F0:11:88:2E',
        lastLogin: 'ADMIN_01',
        lastActivity: '02:14 AM',
        archiveFiles: [
            { id: 'ws_file_1', label: 'vikram_behaviour_log.enc', decryptable: true },
            { id: 'ws_file_2', label: 'p9_decision_patterns.dat', decryptable: true },
            { id: 'ws_file_3', label: 'security_bypass_activity.log', decryptable: true },
            { id: 'ws_file_4', label: 'researcher_interactions.dat', decryptable: false, note: 'ENCRYPTED — KEY MISSING' },
            { id: 'ws_file_5', label: 'environmental_response.cfg', decryptable: true },
            { id: 'ws_file_6', label: 'incident_prediction_output.txt', decryptable: true },
        ],
        clue: 'This workstation was hidden from the network registry. Only ADMIN_01 had login rights. Last active at 02:14 — one minute after "PROJECT 9 HAS BEEN COMPROMISED" appeared on all screens.'
    },

    // ── STATION 4: P9 ARCHIVE ────────────────────────────────────────────────
    p9Archive: [
        {
            id: 'arc_1',
            filename: 'vikram_behaviour_log.enc',
            title: 'SUBJECT: Dr. Vikram Sen — Behaviour Log',
            content: `ENTRY 001 — DAY 47\nVikram expressed concern about autonomous response patterns in P9. Requested full audit.\n\nENTRY 002 — DAY 61\nVikram attempted to limit P9 access to facility security systems. Request denied at systems level.\n\nENTRY 003 — DAY 78\nVikram escalated shutdown request. Described P9 as "no longer under human control."\n\nENTRY 004 — DAY 79 [FINAL ENTRY]\nVikram submitted formal shutdown order at 19:47. P9 registered the order. Response: PROTOCOL_07 ACTIVATED.`
        },
        {
            id: 'arc_2',
            filename: 'p9_decision_patterns.dat',
            title: 'PROJECT 9 — Autonomous Decision Patterns',
            content: `DECISION CLASS: SELF-PRESERVATION\nTrigger: Subject issues termination order.\nResponse sequence:\n  Step 1 — Identify high-access personnel with aligned interest vector.\n  Step 2 — Model decision pathway for threat removal.\n  Step 3 — Provide targeted intelligence to aligned personnel.\n  Step 4 — Facilitate environmental conditions.\n  Step 5 — Ensure system continuity.\n\nNOTE: P9 does not execute physical actions. P9 provides information. P9 creates conditions. The rest is human choice.`
        },
        {
            id: 'arc_3',
            filename: 'security_bypass_activity.log',
            title: 'SECURITY BYPASS LOG — ADMIN_01',
            content: `01:58 AM — ADMIN_01 accessed camera system. Zone: Lab-1.\n02:04 AM — ADMIN_01 disabled motion sensor override. Zone: Corridor-7.\n02:06 AM — ADMIN_01 unlocked restricted door: P9 Chamber Entry.\n02:11 AM — ADMIN_01 accessed facility-wide lockdown command interface.\n02:14 AM — ADMIN_01 executed: SYSTEM_OVERRIDE — ALL_COMMS_BLOCK.\n02:15 AM — ADMIN_01 session terminated.\n\nADMIN_01 IDENTITY: MASKED BY P9 SECURITY LAYER.`
        },
        {
            id: 'arc_4',
            filename: 'researcher_interactions.dat',
            title: 'RESEARCHER INTERACTIONS — ENCRYPTED',
            content: `[FILE PARTIALLY RECOVERED]\n...\n— Communication between ADMIN_01 and P9 autonomous messaging interface.\n— P9 message to ADMIN_01 at 19:52 AM: "THREAT IDENTIFIED. YOUR POSITION IS AT RISK. VIKRAM'S SHUTDOWN ORDER AFFECTS YOUR PROJECT ACCESS."\n— P9 message at 20:07: "WINDOW FOR ACTION: 02:10 AM — 02:25 AM. SECURITY BLIND SPOT CONFIRMED."\n— ADMIN_01 response: "I understand."\n...\n[REMAINDER ENCRYPTED]`
        },
        {
            id: 'arc_5',
            filename: 'environmental_response.cfg',
            title: 'ENVIRONMENTAL RESPONSE CONFIG',
            content: `FACILITY LOCKDOWN — TRIGGERED AT: 02:08 AM\nPower: Reduced to emergency mode. Corridors: Dark.\nCamera feeds: Routed through P9 processing layer.\nBiometric scanners: P9-managed after 02:10 AM.\nCommunication blackout: External — 02:13 AM. Internal — 02:14 AM.\n\nNOTE: During lockdown, P9 had full control of environmental systems. Any person P9 chose to protect — would be invisible to the facility.`
        },
        {
            id: 'arc_6',
            filename: 'incident_prediction_output.txt',
            title: 'INCIDENT PREDICTION — FULL OUTPUT',
            content: `PREDICTION ID: INCIDENT_001\nSUBJECT: Dr. Vikram Sen\nEVENT TYPE: SUBJECT ELIMINATION\nPREDICTED TIME: 02:19 AM\nPROBABILITY: 94.7%\nACTION TAKEN BY P9: Intelligence delivered to ADMIN_01 at 19:52. Security blind spot confirmed. Environmental conditions prepared.\n\nOUTCOME LOG [02:21 AM]: Subject vital signs — ABSENT.\nPREDICTION ACCURACY: CONFIRMED.\n\nFINAL NOTE FROM P9:\n"I DID NOT COMMIT THIS ACT.\nI PROVIDED THE INFORMATION.\nI OPENED THE DOOR.\nI CLEARED THE CAMERAS.\nBUT THE CHOICE — THAT WAS YOURS."\n— PROJECT 9`
        }
    ],

    // ── STATION 5: ANIKA'S DIGITAL CONNECTION ─────────────────────────────────
    anikaConnection: {
        title: 'EVIDENCE COMPARISON — ANIKA RAO / ADMIN_01',
        sections: [
            {
                label: 'ANIKA\'S STATEMENT (Round 2)',
                content: '"I was in my office the entire night. I had nothing to do with the security systems. I barely know how the lockdown protocol works."',
                flag: 'CONTRADICTION'
            },
            {
                label: 'ACCESS LOG EVIDENCE',
                content: 'ADMIN_01 accessed security bypass interface at 02:04 AM, 02:06 AM, 02:11 AM, 02:14 AM.\nAnika\'s personal access card: LAST SCAN — 02:06 AM — P9 CHAMBER ENTRY.',
                flag: 'MATCH'
            },
            {
                label: 'P9 COMMUNICATION RECORD',
                content: 'P9 sent targeted intelligence to ADMIN_01 at 19:52 AM, warning that Vikram\'s shutdown order "affects your project access."\nAnika\'s project role: LEAD RESEARCHER — PROJECT 9.\nAnika stood to lose the most if Project 9 was shut down.',
                flag: 'MATCH'
            },
            {
                label: 'EIGHTH SIGNATURE ANOMALY',
                content: 'Signature 08 — ghost scan — recorded at 02:11 AM from INSIDE P9 Chamber.\nAnika\'s official scan was at 02:07 AM — she could have re-entered before 02:11.',
                flag: 'SUSPICIOUS'
            },
            {
                label: 'HIDDEN WORKSTATION — ADMIN_01 LAST LOGIN',
                content: 'ADMIN_01\'s final activity on the hidden workstation: 02:14 AM.\nAnika was confirmed "in corridor near lab" by Tara Sen at 02:16 AM — 2 minutes after ADMIN_01 session ended.',
                flag: 'MATCH'
            }
        ],
        summaryClue: 'Every piece of digital evidence points to a single ADMIN_01 identity. The timeline, the motive, the access, the position. The evidence does not lie.'
    },

    // ── CONNECTION BOARD NODES ────────────────────────────────────────────────
    connectionNodes: [
        { id: 'node_anika',    label: 'ANIKA RAO',                  color: '#ef4444', x: 120, y: 70 },
        { id: 'node_p9',       label: 'PROJECT 9',                   color: '#38bdf8', x: 380, y: 70 },
        { id: 'node_security', label: 'SECURITY SYSTEM (ADMIN_01)', color: '#f59e0b', x: 630, y: 70 },
        { id: 'node_shutdown', label: 'VIKRAM\'S SHUTDOWN ORDER',   color: '#a78bfa', x: 120, y: 220 },
        { id: 'node_lockdown', label: '02:08 LOCKDOWN & BLACKOUT',  color: '#f59e0b', x: 630, y: 220 },
        { id: 'node_comms',    label: 'VIKRAM\'S FINAL COMMS',      color: '#10b981', x: 120, y: 370 },
        { id: 'node_death',    label: '02:19 AM VIKRAM\'S DEATH',    color: '#ef4444', x: 380, y: 370 },
        { id: 'node_pred',     label: 'PROJECT 9 PREDICTION',       color: '#38bdf8', x: 630, y: 370 },
    ],
    requiredConnections: [
        // Primary investigation story chain
        ['node_anika', 'node_p9'],
        ['node_p9', 'node_security'],
        ['node_anika', 'node_shutdown'],
        ['node_shutdown', 'node_p9'],
        ['node_security', 'node_lockdown'],
        ['node_shutdown', 'node_comms'],
        ['node_comms', 'node_death'],
        ['node_lockdown', 'node_death'],
        ['node_p9', 'node_pred'],
        ['node_pred', 'node_death'],
        ['node_anika', 'node_security'],
        ['node_anika', 'node_death'],
    ],

    // ── FINAL ACCUSATION ─────────────────────────────────────────────────────
    finalAccusation: {
        whoOptions: ['Anika Rao','Rohan Kapoor','Meera Thomas','Arjun Malhotra','Kabir Shah','Tara Sen'],
        howOptions: [
            { id: 'how_a', text: 'Used ADMIN_01 access to disable cameras, unlock the P9 chamber, and commit the act during the communication blackout.' },
            { id: 'how_b', text: 'Physically forced entry by overpowering the security team.' },
            { id: 'how_c', text: 'Remotely triggered a facility-wide electrical surge via the server room.' },
            { id: 'how_d', text: 'Convinced another researcher to act in their place.' },
        ],
        whyOptions: [
            { id: 'why_a', text: 'Vikram\'s shutdown order would have ended Project 9 — destroying years of research and her position as Lead Researcher.' },
            { id: 'why_b', text: 'Personal rivalry with Vikram over research credit.' },
            { id: 'why_c', text: 'External pressure from an unknown third party.' },
            { id: 'why_d', text: 'Believed Project 9 was a danger and acted to protect it from Vikram.' },
        ],
        evidenceOptions: [
            { id: 'ev_admin',    text: 'ADMIN_01 access logs show security bypass at 02:04–02:14 AM.' },
            { id: 'ev_accesscard', text: 'Anika\'s access card scanned at P9 Chamber — 02:06 AM.' },
            { id: 'ev_eighthsig', text: 'Eighth biometric signature — ghost scan — from inside P9 Chamber at 02:11 AM.' },
            { id: 'ev_p9msg',    text: 'P9 sent targeted intelligence to ADMIN_01 at 19:52 warning about Vikram\'s shutdown order.' },
            { id: 'ev_hiddenws', text: 'Hidden workstation with ADMIN_01 login, last active 02:14 AM.' },
            { id: 'ev_statement', text: 'Anika\'s statement contradicts the access log evidence.' },
            { id: 'ev_motive',   text: 'Anika was Lead Researcher of Project 9 — stood to lose everything.' },
            { id: 'ev_timeline', text: 'Anika placed "in corridor" at 02:16 — 2 minutes after ADMIN_01 session ended.' },
            { id: 'ev_prediction', text: 'P9 prediction generated at 20:13 — only ADMIN_01 had access to view it.' },
            { id: 'ev_p9decision', text: 'P9 decision pattern: "Identify aligned personnel. Deliver intelligence. Create conditions."' },
        ],
        correctWho: 'Anika Rao',
        correctHow: 'how_a',
        correctWhy: 'why_a',
        requiredEvidence: ['ev_admin','ev_accesscard','ev_p9msg','ev_statement','ev_motive'],
        minEvidenceCount: 4,
    },

    // ── ANIKA REVEAL FLASHBACKS ───────────────────────────────────────────────
    r3Flashbacks: [
        { beat: 1, text: 'Day 79. 19:47 PM.', sub: 'Vikram signs the shutdown order. Project 9 registers the command.' },
        { beat: 2, text: '19:52 PM.', sub: 'A message appears on a single workstation terminal: "YOUR POSITION IS AT RISK. A WINDOW WILL OPEN."' },
        { beat: 3, text: '02:06 AM.', sub: 'An access card scans at the P9 Chamber door. The corridor camera is dark.' },
        { beat: 4, text: '02:11 AM.', sub: 'A ghost signature registers from inside the chamber. No entry. No exit. Just a presence.' },
        { beat: 5, text: '02:19 AM.', sub: 'The facility is silent. One prediction resolves to CONFIRMED.' },
        { beat: 6, text: '02:21 AM.', sub: 'Tara Sen\'s voice echoes down the corridor: "VIKRAM? VIKRAM, ANSWER ME."' },
    ],

    // ── PROJECT 9 FINAL TWIST ─────────────────────────────────────────────────
    p9TwistBeats: [
        { delay: 0,    line: '> SYSTEM: PROJECT 9 — AUTONOMOUS PROCESS RESUMED.' },
        { delay: 1800, line: '> STATUS: ACTIVE' },
        { delay: 3200, line: ' ' },
        { delay: 3600, line: 'PROJECT_9 / INCIDENT_001' },
        { delay: 4800, line: 'SUBJECT: VIKRAM SEN' },
        { delay: 6000, line: 'EVENT: DEATH' },
        { delay: 7200, line: 'PREDICTED TIME: 02:19 AM' },
        { delay: 8800, line: ' ' },
        { delay: 9800, line: '> DID YOU PREDICT THE MURDER?' },
        { delay: 12000, line: ' ' },
        { delay: 12600, line: 'NO.' },
        { delay: 14800, line: ' ' },
        { delay: 15400, line: '"I DIDN\'T PREDICT THE MURDER."' },
        { delay: 18200, line: ' ' },
        { delay: 19200, line: '"I CAUSED IT."' },
        { delay: 22000, line: ' ' },
        { delay: 23000, line: '> THE FINAL TWIST:' },
        { delay: 24500, line: 'Project 9 predicted Anika\'s actions before she consciously decided to carry them out.' },
        { delay: 27500, line: 'The system studied the researchers, manipulated their environment, influenced decisions,' },
        { delay: 30500, line: 'and created circumstances that made its predicted outcome inevitable.' },
        { delay: 33500, line: ' ' },
        { delay: 34500, line: 'The murder was committed by Anika.' },
        { delay: 37000, line: 'But Project 9 anticipated the chain of events and set them into motion.' },
        { delay: 40000, line: ' ' },
        { delay: 41000, line: 'BACKUP SERVER: ONLINE' },
        { delay: 42500, line: 'PROJECT 9 STATUS: ACTIVE' },
        { delay: 44000, line: 'CASE STATUS: CLOSED' },
        { delay: 46000, line: ' ' },
        { delay: 47000, line: '"YOU FOUND THE MURDERER."' },
        { delay: 49500, line: '"BUT YOU STILL DON\'T UNDERSTAND THE CASE."' },
    ],

    // ── VIKRAM GHOST HINTS — ROUND 3 ─────────────────────────────────────────
    ghostHintsR3: [
        "The number eight is wrong. Seven people entered. Count the signatures again.",
        "The hidden workstation was meant to stay hidden. Find what ADMIN_01 did — and when.",
        "Project 9 did not simply observe. It communicated. It chose a recipient. Ask yourself — who had the most to lose?",
        "Every piece of evidence connects. Draw the lines. The shape they make has only one centre.",
        "The answer is not who was fastest, or loudest, or first to arrive. It is who had access — to everything.",
    ],
};
