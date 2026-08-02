/* ==========================================================================
   Manic Miner: Cyber Edition - Cavern Levels Data
   ========================================================================== */

const TILE_TYPES = {
    EMPTY: 0,
    SOLID: 1,
    CRUMBLING: 2,
    CONVEYOR_LEFT: 3,
    CONVEYOR_RIGHT: 4,
    PORTAL: 5,
    KEY: 6,
    AIR_CANISTER: 7
};

const CAVERN_LEVELS = [
    {
        id: 1,
        name: "THE CENTRAL CAVERN",
        airLimit: 100, // seconds
        startPos: { x: 50, y: 480 },
        portalPos: { x: 900, y: 80 },
        keys: [
            { id: 'k1', x: 220, y: 380, collected: false },
            { id: 'k2', x: 520, y: 240, collected: false },
            { id: 'k3', x: 820, y: 340, collected: false },
            { id: 'k4', x: 440, y: 100, collected: false }
        ],
        platforms: [
            // Floor
            { x: 0, y: 540, width: 1000, height: 40, type: TILE_TYPES.SOLID },
            // Tier 1
            { x: 180, y: 420, width: 180, height: 18, type: TILE_TYPES.SOLID },
            { x: 420, y: 440, width: 160, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 740, y: 400, width: 220, height: 18, type: TILE_TYPES.SOLID },
            // Tier 2
            { x: 50, y: 300, width: 200, height: 18, type: TILE_TYPES.CONVEYOR_RIGHT },
            { x: 450, y: 280, width: 200, height: 18, type: TILE_TYPES.SOLID },
            { x: 780, y: 260, width: 160, height: 18, type: TILE_TYPES.CRUMBLING },
            // Tier 3 Top
            { x: 380, y: 140, width: 240, height: 18, type: TILE_TYPES.SOLID },
            { x: 850, y: 120, width: 120, height: 18, type: TILE_TYPES.SOLID }
        ],
        enemies: [
            { x: 200, y: 395, minX: 180, maxX: 340, speed: 100, width: 24, height: 24, icon: '👾' },
            { x: 760, y: 375, minX: 740, maxX: 940, speed: 140, width: 24, height: 24, icon: '🌵' },
            { x: 470, y: 255, minX: 450, maxX: 630, speed: 120, width: 24, height: 24, icon: '🤖' }
        ]
    },
    {
        id: 2,
        name: "THE COLD CAVERN",
        airLimit: 90,
        startPos: { x: 50, y: 480 },
        portalPos: { x: 880, y: 80 },
        keys: [
            { id: 'k1', x: 300, y: 420, collected: false },
            { id: 'k2', x: 120, y: 220, collected: false },
            { id: 'k3', x: 680, y: 300, collected: false },
            { id: 'k4', x: 500, y: 100, collected: false }
        ],
        platforms: [
            { x: 0, y: 540, width: 1000, height: 40, type: TILE_TYPES.SOLID },
            { x: 220, y: 460, width: 200, height: 18, type: TILE_TYPES.CONVEYOR_LEFT },
            { x: 600, y: 420, width: 220, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 60, y: 260, width: 240, height: 18, type: TILE_TYPES.SOLID },
            { x: 420, y: 300, width: 160, height: 18, type: TILE_TYPES.CONVEYOR_RIGHT },
            { x: 640, y: 340, width: 180, height: 18, type: TILE_TYPES.SOLID },
            { x: 440, y: 140, width: 220, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 820, y: 120, width: 140, height: 18, type: TILE_TYPES.SOLID }
        ],
        enemies: [
            { x: 230, y: 435, minX: 220, maxX: 400, speed: 130, width: 24, height: 24, icon: '🦩' },
            { x: 80, y: 235, minX: 60, maxX: 280, speed: 160, width: 24, height: 24, icon: '🛸' },
            { x: 660, y: 315, minX: 640, maxX: 800, speed: 150, width: 24, height: 24, icon: '👾' }
        ]
    },
    {
        id: 3,
        name: "THE MUTANT TELEPORTER",
        airLimit: 80,
        startPos: { x: 50, y: 480 },
        portalPos: { x: 900, y: 80 },
        keys: [
            { id: 'k1', x: 240, y: 420, collected: false },
            { id: 'k2', x: 480, y: 320, collected: false },
            { id: 'k3', x: 760, y: 220, collected: false },
            { id: 'k4', x: 320, y: 100, collected: false }
        ],
        platforms: [
            { x: 0, y: 540, width: 1000, height: 40, type: TILE_TYPES.SOLID },
            { x: 180, y: 460, width: 180, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 420, y: 360, width: 200, height: 18, type: TILE_TYPES.CONVEYOR_LEFT },
            { x: 700, y: 260, width: 200, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 260, y: 140, width: 240, height: 18, type: TILE_TYPES.SOLID },
            { x: 840, y: 120, width: 140, height: 18, type: TILE_TYPES.SOLID }
        ],
        enemies: [
            { x: 200, y: 435, minX: 180, maxX: 340, speed: 180, width: 24, height: 24, icon: '⚡' },
            { x: 440, y: 335, minX: 420, maxX: 600, speed: 170, width: 24, height: 24, icon: '🤖' },
            { x: 720, y: 235, minX: 700, maxX: 880, speed: 190, width: 24, height: 24, icon: '👾' }
        ]
    }
];

window.CAVERN_LEVELS = CAVERN_LEVELS;
window.TILE_TYPES = TILE_TYPES;
