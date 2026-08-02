/* ==========================================================================
   Manic Miner: Cyber Edition - Cavern Levels Data (v3.0.2)
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
        airLimit: 120,
        startPos: { x: 50, y: 460 },
        portalPos: { x: 900, y: 70 },
        keys: [
            { id: 'k1', x: 120, y: 410, collected: false },
            { id: 'k2', x: 500, y: 310, collected: false },
            { id: 'k3', x: 860, y: 270, collected: false },
            { id: 'k4', x: 440, y: 130, collected: false }
        ],
        platforms: [
            // Ground Floor
            { x: 0, y: 530, width: 1000, height: 40, type: TILE_TYPES.SOLID },
            
            // Tier 1 Stepping Platforms
            { x: 50, y: 450, width: 140, height: 18, type: TILE_TYPES.SOLID },
            { x: 250, y: 410, width: 160, height: 18, type: TILE_TYPES.SOLID },
            { x: 460, y: 350, width: 180, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 700, y: 380, width: 160, height: 18, type: TILE_TYPES.SOLID },
            
            // Tier 2 Middle Platforms
            { x: 80, y: 310, width: 220, height: 18, type: TILE_TYPES.CONVEYOR_RIGHT },
            { x: 420, y: 250, width: 200, height: 18, type: TILE_TYPES.SOLID },
            { x: 760, y: 310, width: 180, height: 18, type: TILE_TYPES.CRUMBLING },
            
            // Tier 3 Top Platforms
            { x: 340, y: 170, width: 240, height: 18, type: TILE_TYPES.SOLID },
            { x: 840, y: 120, width: 140, height: 18, type: TILE_TYPES.SOLID }
        ],
        enemies: [
            { x: 260, y: 385, minX: 250, maxX: 390, speed: 100, width: 24, height: 24, icon: '👾' },
            { x: 720, y: 355, minX: 700, maxX: 840, speed: 130, width: 24, height: 24, icon: '🌵' },
            { x: 440, y: 225, minX: 420, maxX: 600, speed: 110, width: 24, height: 24, icon: '🤖' }
        ]
    },
    {
        id: 2,
        name: "THE COLD CAVERN",
        airLimit: 110,
        startPos: { x: 50, y: 460 },
        portalPos: { x: 880, y: 70 },
        keys: [
            { id: 'k1', x: 260, y: 390, collected: false },
            { id: 'k2', x: 120, y: 250, collected: false },
            { id: 'k3', x: 680, y: 290, collected: false },
            { id: 'k4', x: 500, y: 130, collected: false }
        ],
        platforms: [
            { x: 0, y: 530, width: 1000, height: 40, type: TILE_TYPES.SOLID },
            { x: 40, y: 450, width: 140, height: 18, type: TILE_TYPES.SOLID },
            { x: 220, y: 430, width: 200, height: 18, type: TILE_TYPES.CONVEYOR_LEFT },
            { x: 580, y: 390, width: 220, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 60, y: 290, width: 240, height: 18, type: TILE_TYPES.SOLID },
            { x: 420, y: 310, width: 160, height: 18, type: TILE_TYPES.CONVEYOR_RIGHT },
            { x: 640, y: 330, width: 180, height: 18, type: TILE_TYPES.SOLID },
            { x: 440, y: 170, width: 220, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 820, y: 120, width: 140, height: 18, type: TILE_TYPES.SOLID }
        ],
        enemies: [
            { x: 230, y: 405, minX: 220, maxX: 400, speed: 120, width: 24, height: 24, icon: '🦩' },
            { x: 80, y: 265, minX: 60, maxX: 280, speed: 150, width: 24, height: 24, icon: '🛸' },
            { x: 660, y: 305, minX: 640, maxX: 800, speed: 140, width: 24, height: 24, icon: '👾' }
        ]
    },
    {
        id: 3,
        name: "THE MUTANT TELEPORTER",
        airLimit: 100,
        startPos: { x: 50, y: 460 },
        portalPos: { x: 900, y: 70 },
        keys: [
            { id: 'k1', x: 220, y: 390, collected: false },
            { id: 'k2', x: 460, y: 290, collected: false },
            { id: 'k3', x: 740, y: 210, collected: false },
            { id: 'k4', x: 320, y: 120, collected: false }
        ],
        platforms: [
            { x: 0, y: 530, width: 1000, height: 40, type: TILE_TYPES.SOLID },
            { x: 40, y: 450, width: 120, height: 18, type: TILE_TYPES.SOLID },
            { x: 180, y: 430, width: 180, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 420, y: 330, width: 200, height: 18, type: TILE_TYPES.CONVEYOR_LEFT },
            { x: 700, y: 250, width: 200, height: 18, type: TILE_TYPES.CRUMBLING },
            { x: 260, y: 160, width: 240, height: 18, type: TILE_TYPES.SOLID },
            { x: 840, y: 120, width: 140, height: 18, type: TILE_TYPES.SOLID }
        ],
        enemies: [
            { x: 200, y: 405, minX: 180, maxX: 340, speed: 160, width: 24, height: 24, icon: '⚡' },
            { x: 440, y: 305, minX: 420, maxX: 600, speed: 150, width: 24, height: 24, icon: '🤖' },
            { x: 720, y: 225, minX: 700, maxX: 880, speed: 170, width: 24, height: 24, icon: '👾' }
        ]
    }
];

window.CAVERN_LEVELS = CAVERN_LEVELS;
window.TILE_TYPES = TILE_TYPES;
