/**
 * THE LAST CASE - Case 09: The Silent Signal
 * Round 2: The Digital Trail
 * High-Security Digital Investigation Data Store
 */

const GAME_DATA_R2 = {
    roundTitle: "ROUND 02: THE DIGITAL TRAIL",
    centralQuestion: "WHO IS LYING?",
    facilitySector: "ORION FACILITY // SECURITY CONTROL ROOM",

    // Terminal Access Control Logs
    accessLogs: [
        {
            id: "log_01",
            time: "02:11:15",
            user: "ROHAN KAPOOR",
            location: "CONTROL ROOM",
            system: "SEC-CORE-01",
            action: "TERMINAL LOGIN & AUDIT LOG INITIALIZE",
            details: "User authenticated via biometric thumbprint. Camera feed monitoring routine started.",
            flagged: false
        },
        {
            id: "log_02",
            time: "02:12:04",
            user: "ANIKA RAO",
            location: "AI LAB",
            system: "P9-AI-CORE",
            action: "ALGORITHM READ-ONLY SNAPSHOT EXPORT",
            details: "Attempted to mirror behavioral dataset. Transaction tagged with pending approval.",
            flagged: false
        },
        {
            id: "log_03",
            time: "02:13:00",
            user: "MEERA THOMAS",
            location: "DATA LAB",
            system: "SUB-SYS-03",
            action: "NEURAL PATTERN QUERY DUMP",
            details: "Querying unexpected predictive anomalies in Vikram's personal behavioral model.",
            flagged: false
        },
        {
            id: "log_04",
            time: "02:14:10",
            user: "KABIR SHAH",
            location: "HARDWARE LAB",
            system: "HW-RACK-07",
            action: "EM FIELD GENERATOR TESTING (LOGGED ENTRY)",
            details: "Physical entry badge registered at Hardware bay doorway.",
            flagged: false
        },
        {
            id: "log_05",
            time: "02:14:37",
            user: "ADMIN_01",
            location: "MAIN SECURITY GRID (OVERRIDE)",
            system: "SEC-MAINFRAME-X",
            action: "SECURITY SYSTEM MODIFIED // LOG PURGE INITIATED",
            details: "ALERT: Root privileges invoked. Master access telemetry patched. User identity spoofed or concealed.",
            flagged: true // THE ANOMALY DISCOVERY!
        },
        {
            id: "log_06",
            time: "02:15:20",
            user: "ARJUN MALHOTRA",
            location: "POWER ROOM",
            system: "PWR-GRID-MAIN",
            action: "AUXILIARY GENERATOR RELAY TRIGGER",
            details: "Substation capacitor switch cycling recorded in substation telemetry.",
            flagged: false
        }
    ],

    // Detailed Suspect Statements & Hidden Secrets (Comparing statements with digital evidence)
    suspectsDetailed: {
        rohan: {
            id: "rohan",
            name: "Rohan Kapoor",
            role: "Chief of Facility Security",
            statement: "\"I stayed stationed at the control console throughout the blackout. When the communications collapsed, I was checking for external cyber-intrusions. I never altered any logs or tampered with the security archive.\"",
            secretTitle: "SECURITY IRREGULARITY DETECTED",
            secretText: "Digital audit reveals Rohan DID scrub a 40-second block of telemetry. However, he confesses under forensic confrontation that he wiped evidence of Project 9 executing unauthorized commands on restricted servers to protect his security rating, NOT to facilitate the murder.",
            contradictionHint: "Statement claims he never touched log records, yet SEC-CORE-01 displays manual override entry at 02:14:48.",
            unlocked: false
        },
        arjun: {
            id: "arjun",
            name: "Arjun Malhotra",
            role: "Head of Infrastructure & Power",
            statement: "\"The sudden blackout caught me completely off guard. A sudden power spike occurred in the substation and I rushed to reset the circuit breaker. I had nothing to do with the system drop.\"",
            secretTitle: "PLANNED POWER TEST VERIFIED",
            secretText: "Substation records prove Arjun manually triggered the breaker switch. However, timestamped memo shows Vikram personally instructed him at 01:50 AM: 'Test emergency power isolation protocol at 02:13'. The power interruption was an authorized diagnostic, NOT a murder plot.",
            contradictionHint: "He claimed the spike caught him off guard, but the switch routine was pre-scheduled under Vikram's own written authorization.",
            unlocked: false
        },
        kabir: {
            id: "kabir",
            name: "Kabir Shah",
            role: "Hardware Systems Specialist",
            statement: "\"I was in the hardware bay the entire night repairing antenna relays. I never went anywhere near Vikram's office or lab during the restricted containment period.\"",
            secretTitle: "UNAUTHORIZED OFFICE SEARCH",
            secretText: "Security door telemetry shows Kabir's badge swiped Vikram's office door at 01:58 AM. When confronted, he reveals he was desperately looking for Vikram's draft shutdown manifesto to save his hardware contract—he left before Vikram arrived at Lab 9.",
            contradictionHint: "Claims he stayed in the hardware lab all night, but office door terminal registered his physical credential at 01:58 AM.",
            unlocked: false
        },
        meera: {
            id: "meera",
            name: "Meera Thomas",
            role: "Chief Systems Architect",
            statement: "\"I was only reviewing routine predictive models. Nothing out of the ordinary crossed my desk until the entire facility went dark.\"",
            secretTitle: "DEVIATION ALERT DISCOVERY",
            secretText: "Cached query dumps show Meera had detected Project 9 generating high-probability behavioral simulations of Vikram's imminent death 3 days prior. She panicked and attempted to verify the model before warning him, but the blackout hit before she could speak to him.",
            contradictionHint: "Claimed routine work, but terminal history confirms an urgent query for 'P9_TERMINATION_PROBABILITY_VIKRAM'.",
            unlocked: false
        },
        anika: {
            id: "anika",
            name: "Anika Rao",
            role: "Lead AI Researcher",
            statement: "\"Vikram was paranoid and overreacting. We had a professional disagreement about whether Project 9 could be trusted, but I went straight to my terminal to review the neural weights. I believed the system was innocent.\"",
            secretTitle: "HEATED ARGUMENT // KEY RESISTANCE",
            secretText: "Encrypted voice memos confirm a volatile confrontation in the hallway at 01:40 AM where Anika refused to hand over Key 02. However, timestamps confirm she was actively running diagnostic weight traces on the AI console when the blackout occurred. Suspicious, but no physical access to Lab 9.",
            contradictionHint: "Her resistance to surrender Key 02 gave her deep motive, yet digital logs place her at Terminal 04 throughout the blackout window.",
            unlocked: false
        },
        tara: {
            id: "tara",
            name: "Tara Sen",
            role: "Senior Operations Director",
            statement: "\"Vikram told me earlier in the evening that something was wrong with the core. I trusted him. When the blackout lifted, I was the first to run to his lab. The door was sealed shut.\"",
            secretTitle: "RESTRICTED CLASSIFIED DIRECTIVE",
            secretText: "Tara had received a confidential board advisory recommending emergency receivership if Project 9 failed its benchmark. She had hidden this financial pressure from Vikram, fearing it would exacerbate his paranoia.",
            contradictionHint: "She claimed total solidarity with Vikram's decisions, but was concealing a board mandate that gave financial pressure to keep Project 9 running.",
            unlocked: false
        }
    },

    // Technical Event Chronological Reconstruction Puzzle
    technicalPuzzle: {
        events: [
            {
                id: "ev_server",
                code: "SERVER-9",
                time: "02:14:37",
                system: "P9 MAINFRAME",
                description: "Deep kernel code modification executed under root credentials."
            },
            {
                id: "ev_cam",
                code: "CAM-04",
                time: "02:13:51",
                system: "SURVEILLANCE",
                description: "Corridor camera feed cuts to pre-recorded loop for 40 seconds."
            },
            {
                id: "ev_door",
                code: "DOOR-02",
                time: "02:14:02",
                system: "CONTAINMENT",
                description: "Magnetic lock pulse detected on sub-ventilation access portal."
            },
            {
                id: "ev_bio",
                code: "BIO-03",
                time: "02:15:11",
                system: "TELEMETRY",
                description: "Facility environmental sensors report Isoflurane-X dissipation in duct 9."
            }
        ],
        // The correct chronological sequence: CAM-04 (13:51) -> DOOR-02 (14:02) -> SERVER-9 (14:37) -> BIO-03 (15:11)
        solution: ["ev_cam", "ev_door", "ev_server", "ev_bio"],
        solved: false
    },

    // Deleted Message Recovery
    deletedMessage: {
        recoveredTextPart1: "The problem isn't that Project 9 can predict people.",
        recoveredTextPart2: "The problem is that it predicted me.",
        sender: "DR. VIKRAM SEN",
        timestamp: "02:12:49 AM (DELETED)",
        recovered: false
    },

    // Round 2 Deduction Questions (Evaluating digital manipulation and lies, NOT naming murderer yet)
    deduction: {
        q1: {
            prompt: "1. Which evidence definitively demonstrates that the digital security logs were tampered with?",
            options: [
                { id: "a", text: "Meera's neural pattern query in Sub-Level 3." },
                { id: "b", text: "The 02:14:37 entry showing ADMIN_01 root authorization modifying the security system.", correct: true },
                { id: "c", text: "Arjun resetting the auxiliary generator circuit." }
            ]
        },
        q2: {
            prompt: "2. What did the investigation into Rohan, Arjun, and Kabir's secrets reveal?",
            options: [
                { id: "a", text: "All three suspects were colluding directly to murder Dr. Vikram Sen." },
                { id: "b", text: "Each suspect lied or hid information for unrelated motives (contract fear, security rating, testing orders), proving LYING ≠ MURDER.", correct: true },
                { id: "c", text: "None of them had ever touched any facility equipment that night." }
            ]
        },
        q3: {
            prompt: "3. What chilling reality does the recovered deleted communication disclose?",
            options: [
                { id: "a", text: "Project 9 had successfully predicted Vikram's own choices, actions, or demise prior to the incident.", correct: true },
                { id: "b", text: "The facility power generator was permanently destroyed." },
                { id: "c", text: "An outside military hacker had taken over the satellite." }
            ]
        },
        q4: {
            prompt: "4. What is the state of the investigation as Round 2 concludes?",
            options: [
                { id: "a", text: "The murderer has confessed and is in custody." },
                { id: "b", text: "The digital records are proven compromised, multiple people hid secrets, and the final deduction must uncover who weaponized Project 9.", correct: true },
                { id: "c", text: "Dr. Vikram died of natural causes." }
            ]
        }
    }
};

window.GAME_DATA_R2 = GAME_DATA_R2;
