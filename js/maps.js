/* ============================================
   MAPS - Tile-based world maps
   Tile types: see sprites.js drawTile
   0=grass 1=path 2=water 3=wall 4=tree
   5=building 6=door 7=floor 8=chest 9=fence
   10=roof 11=cave_wall 12=cave_floor 13=lava
   14=castle_floor 15=carpet 16=flowers 17=sign 18=portal
   ============================================ */
const Maps = {

    // Walkable tile types
    walkable: new Set([0, 1, 6, 7, 12, 14, 15, 16, 18]),
    interactable: new Set([6, 8, 17, 18]),

    // ---- VILLAGE MAP ---- (30x22)
    village: {
        name: 'Peaceful Village',
        music: 'village',
        width: 30,
        height: 22,
        playerStart: { x: 14, y: 18 },
        tiles: [
            [4,4,4,4,4,4,4,2,2,2,2,4,4,4,4,4,4,4,4,4,4,4,2,2,2,4,4,4,4,4],
            [4,4,4,4,4,4,2,2,2,2,2,2,4,10,10,10,4,4,4,4,4,2,2,2,2,2,4,4,4,4],
            [4,16,0,0,0,4,2,2,2,2,2,4,4,5,5,5,4,4,10,10,10,4,2,2,2,4,4,0,16,4],
            [4,0,0,0,0,0,0,4,2,2,4,0,0,5,7,5,0,0,5,5,5,0,0,4,4,0,0,0,0,4],
            [4,0,0,16,0,0,0,0,0,0,0,0,0,5,6,5,0,0,5,6,5,0,0,0,0,0,0,16,0,4],
            [4,0,0,0,0,0,0,0,0,17,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,4],
            [9,9,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,9,9],
            [4,0,0,10,10,10,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,10,10,10,0,0,0,4],
            [4,0,0,5,5,5,0,0,1,0,16,0,0,0,1,0,0,0,16,0,1,0,0,5,5,5,0,0,0,4],
            [4,0,0,5,7,5,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,5,7,5,0,0,0,4],
            [4,0,0,5,6,5,0,0,1,0,0,8,0,0,1,0,0,8,0,0,1,0,0,5,6,5,0,0,0,4],
            [4,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,4],
            [4,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,4],
            [4,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
            [4,0,16,0,0,0,0,0,0,16,0,0,0,0,1,0,0,0,0,16,0,0,0,0,0,0,16,0,0,4],
            [4,0,0,0,0,0,4,4,0,0,0,0,0,0,1,0,0,0,0,0,0,4,4,0,0,0,0,0,0,4],
            [4,0,0,0,0,4,4,4,4,0,0,0,0,1,1,1,0,0,0,0,4,4,4,4,0,0,0,0,0,4],
            [4,0,0,0,0,0,4,4,0,0,0,0,1,0,0,0,1,0,0,0,0,4,4,0,0,0,0,0,0,4],
            [4,0,0,16,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,16,0,0,4],
            [4,0,0,0,0,0,0,0,0,0,1,1,0,0,17,0,0,1,1,0,0,0,0,0,0,0,0,0,0,4],
            [4,4,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4],
            [4,4,4,4,4,4,4,4,4,4,4,4,0,0,1,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4],
        ],
        npcs: [
            { id:'elder', type:'elder', x:14, y:3, dir:'down', dialog:[
                'Welcome, warrior! Our village is under threat.',
                'Monsters have invaded the forest to the south.',
                'Defeat them by solving math problems!',
                'The harder the problem, the more damage you deal.',
                'Go south to enter the forest. Good luck!'
            ]},
            { id:'shopkeeper', type:'shopkeeper', x:4, y:9, dir:'right', dialog:[
                'Welcome to my shop! I have potions and items.',
                'Earn gold by defeating enemies in battle.'
            ], action:'shop'},
            { id:'guard1', type:'guard', x:13, y:20, dir:'down', dialog:[
                'The forest lies beyond this path.',
                'Be careful, warrior. Monsters lurk there.'
            ]},
            { id:'girl1', type:'girl', x:20, y:4, dir:'left', dialog:[
                'I heard there are secret chests hidden in the forest!',
                'You need to find them to unlock special rewards.'
            ]},
            { id:'boy1', type:'boy', x:9, y:14, dir:'down', dialog:[
                'Did you know? If you answer quickly, you deal more damage!',
                'Try to solve problems in under 5 seconds!'
            ]},
            { id:'wizard1', type:'wizard', x:24, y:9, dir:'left', dialog:[
                'I sense great mathematical power in you...',
                'Chain correct answers for COMBO damage!',
                'A 5x combo unlocks an achievement.'
            ]},
        ],
        enemies: [],
        exits: [
            { x:14, y:21, toMap:'forest', toX:15, toY:1 }
        ]
    },

    // ---- FOREST MAP ---- (32x24)
    forest: {
        name: 'Dark Forest',
        music: 'forest',
        width: 32,
        height: 24,
        playerStart: { x: 15, y: 1 },
        tiles: [
            [4,4,4,4,4,4,4,4,4,4,4,4,4,0,1,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
            [4,4,4,4,4,4,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4],
            [4,4,4,0,0,0,0,0,16,0,0,0,0,0,1,0,0,0,0,16,0,0,0,0,0,4,4,4,4,4,4,4],
            [4,4,0,0,0,0,0,0,0,0,4,0,0,1,1,1,0,0,4,0,0,0,0,0,0,0,0,4,4,4,4,4],
            [4,0,0,0,4,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,4,0,0,0,0,4,4,4,4],
            [4,0,0,0,0,0,0,0,0,4,0,0,1,1,0,1,1,0,0,4,0,0,0,0,0,0,0,0,0,4,4,4],
            [4,0,16,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,16,0,0,0,4,4,4],
            [4,0,0,0,0,4,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,4,0,0,0,0,0,0,4,4],
            [4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,4,4],
            [4,4,0,0,0,0,0,4,0,0,1,1,0,0,0,0,0,1,1,0,0,4,0,0,0,0,0,0,4,0,0,4],
            [4,4,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,4],
            [4,0,0,0,0,0,4,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,4,0,0,0,8,0,0,0,0,4],
            [4,0,0,4,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,4,0,0,0,0,4,4],
            [4,0,0,0,0,0,0,0,1,1,0,0,4,0,0,0,4,0,0,1,1,0,0,0,0,0,0,0,0,4,4,4],
            [4,4,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,4,4,4],
            [4,4,4,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,4,4,4,4,4],
            [4,4,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,4,4,4,4,4,4],
            [4,0,0,0,0,0,1,1,0,0,0,4,0,0,0,0,0,4,0,0,0,1,1,0,0,0,0,4,4,4,4,4],
            [4,0,0,16,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,16,0,0,4,4,4,4],
            [4,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,4,4,4],
            [4,4,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,0,4,4,4,4],
            [4,4,4,0,0,1,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,1,0,0,0,4,4,4,4,4],
            [4,4,4,4,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,4,4,4,4,4,4],
            [4,4,4,4,4,4,4,4,4,4,4,4,0,0,1,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
        ],
        npcs: [
            { id:'forest_wizard', type:'wizard', x:14, y:8, dir:'down', dialog:[
                'This forest is full of equations to solve...',
                'The deeper you go, the harder they get!',
                'Look for golden chests - they hold keys to secrets.'
            ]},
        ],
        enemies: [
            { id:'e1', type:'slime', x:5, y:5, enemyData:{ name:'Forest Slime', hp:60, damage:10, defense:2 }, topics:['addition','subtraction'], difficulty:'easy' },
            { id:'e2', type:'skeleton', x:22, y:4, enemyData:{ name:'Skeleton Scout', hp:80, damage:14, defense:3 }, topics:['multiplication','division'], difficulty:'easy' },
            { id:'e3', type:'sprite', x:8, y:11, enemyData:{ name:'Forest Sprite', hp:70, damage:12, defense:3 }, topics:['fractions'], difficulty:'easy' },
            { id:'e4', type:'wolf', x:24, y:10, enemyData:{ name:'Shadow Wolf', hp:100, damage:18, defense:5 }, topics:['bodmas','multiplication'], difficulty:'medium' },
            { id:'e5', type:'darkKnight', x:10, y:16, enemyData:{ name:'Dark Knight', hp:120, damage:20, defense:6 }, topics:['bodmas','division','fractions'], difficulty:'medium' },
            { id:'e_boss1', type:'treant', x:14, y:20, enemyData:{ name:'Ancient Treant', hp:180, damage:24, defense:8 }, topics:['fractions','percentages','bodmas'], difficulty:'medium', isBoss:true },
        ],
        exits: [
            { x:14, y:0, toMap:'village', toX:14, toY:20 },
            { x:14, y:23, toMap:'cave', toX:15, toY:1 }
        ]
    },

    // ---- CAVE MAP ---- (28x20)
    cave: {
        name: 'Algebra Caverns',
        music: 'cave',
        width: 28,
        height: 20,
        playerStart: { x: 15, y: 1 },
        tiles: [
            [11,11,11,11,11,11,11,11,11,11,11,11,11,12,1,12,11,11,11,11,11,11,11,11,11,11,11,11],
            [11,11,11,11,12,12,12,12,12,12,12,12,12,12,1,12,12,12,12,12,12,12,12,11,11,11,11,11],
            [11,11,12,12,12,12,12,12,11,12,12,12,12,1,1,1,12,12,12,12,11,12,12,12,12,11,11,11],
            [11,12,12,12,12,11,12,12,12,12,12,12,1,1,12,1,1,12,12,12,12,12,11,12,12,12,11,11],
            [11,12,12,12,12,12,12,12,12,12,12,1,1,12,12,12,1,1,12,12,12,12,12,12,12,12,12,11],
            [11,12,12,12,12,12,12,12,11,12,12,1,12,12,12,12,12,1,12,11,12,12,12,12,12,12,12,11],
            [11,11,12,12,12,12,12,12,12,12,1,1,12,12,12,12,12,1,1,12,12,12,12,12,12,12,11,11],
            [11,12,12,12,12,12,13,12,12,12,1,12,12,12,12,12,12,12,1,12,12,12,13,12,12,12,12,11],
            [11,12,12,12,11,12,13,12,12,12,1,12,12,12,12,12,12,12,1,12,12,13,12,11,12,12,12,11],
            [11,12,12,12,12,12,12,12,12,1,1,12,12,12,12,12,12,12,1,1,12,12,12,12,12,12,12,11],
            [11,12,8,12,12,12,12,12,12,1,12,12,12,12,12,12,12,12,12,1,12,12,12,12,12,8,12,11],
            [11,12,12,12,12,12,12,12,1,1,12,12,12,11,12,11,12,12,12,1,1,12,12,12,12,12,12,11],
            [11,11,12,12,12,12,12,12,1,12,12,12,12,12,12,12,12,12,12,12,1,12,12,12,12,12,11,11],
            [11,12,12,12,12,13,12,1,1,12,12,12,12,12,12,12,12,12,12,12,1,1,12,13,12,12,12,11],
            [11,12,12,12,12,13,12,1,12,12,12,12,12,12,12,12,12,12,12,12,12,1,12,13,12,12,12,11],
            [11,12,12,12,12,12,12,1,12,12,12,12,12,12,12,12,12,12,12,12,12,1,12,12,12,12,12,11],
            [11,12,12,12,12,12,1,1,12,12,12,12,12,12,12,12,12,12,12,12,12,1,1,12,12,12,12,11],
            [11,11,12,12,12,12,1,12,12,12,12,12,12,12,17,12,12,12,12,12,12,12,1,12,12,12,11,11],
            [11,11,11,12,12,12,1,1,12,12,12,12,12,12,1,12,12,12,12,12,12,1,1,12,12,11,11,11],
            [11,11,11,11,11,11,11,11,11,11,11,11,12,12,1,12,12,11,11,11,11,11,11,11,11,11,11,11],
        ],
        npcs: [
            { id:'cave_wizard', type:'wizard', x:14, y:9, dir:'down', dialog:[
                'You have entered the Algebra Caverns!',
                'Equations lurk in every shadow.',
                'Solve for x to survive!',
                'Deeper in lies the castle of the Dark Overlord...'
            ]},
        ],
        enemies: [
            { id:'e6', type:'wraith', x:4, y:4, enemyData:{ name:'Abyss Wraith', hp:120, damage:20, defense:5 }, topics:['linear_equations'], difficulty:'medium' },
            { id:'e7', type:'mage', x:22, y:5, enemyData:{ name:'Dark Mage', hp:110, damage:25, defense:4 }, topics:['linear_equations','expressions'], difficulty:'medium' },
            { id:'e8', type:'golem', x:5, y:12, enemyData:{ name:'Stone Golem', hp:160, damage:22, defense:10 }, topics:['area_perimeter','angles'], difficulty:'medium' },
            { id:'e9', type:'wraith', x:22, y:14, enemyData:{ name:'Phantom', hp:130, damage:28, defense:4 }, topics:['quadratics','linear_equations'], difficulty:'hard' },
            { id:'e_boss2', type:'lich', x:14, y:17, enemyData:{ name:'The Lich King', hp:240, damage:30, defense:10 }, topics:['quadratics','linear_equations','expressions'], difficulty:'hard', isBoss:true },
        ],
        exits: [
            { x:14, y:0, toMap:'forest', toX:14, toY:22 },
            { x:14, y:19, toMap:'castle', toX:14, toY:1 }
        ]
    },

    // ---- CASTLE MAP ---- (26x20)
    castle: {
        name: 'Dark Castle',
        music: 'castle',
        width: 26,
        height: 20,
        playerStart: { x: 14, y: 1 },
        tiles: [
            [3,3,3,3,3,3,3,3,3,3,3,3,3,14,1,14,3,3,3,3,3,3,3,3,3,3],
            [3,3,14,14,14,14,14,14,14,14,14,14,14,14,1,14,14,14,14,14,14,14,14,14,3,3],
            [3,14,14,14,14,14,14,14,14,14,14,14,1,1,1,1,14,14,14,14,14,14,14,14,14,3],
            [3,14,14,14,14,3,14,14,14,14,14,14,1,14,14,1,14,14,14,14,3,14,14,14,14,3],
            [3,14,14,14,14,14,14,14,14,14,14,1,1,14,14,1,1,14,14,14,14,14,14,14,14,3],
            [3,14,14,14,14,14,14,14,3,14,14,1,14,14,14,14,1,14,3,14,14,14,14,14,14,3],
            [3,14,14,14,14,14,14,14,14,14,1,1,14,14,14,14,1,1,14,14,14,14,14,14,14,3],
            [3,14,8,14,14,14,14,14,14,14,1,14,14,14,14,14,14,1,14,14,14,14,14,8,14,3],
            [3,3,14,14,14,14,14,14,14,1,1,14,14,14,14,14,14,1,1,14,14,14,14,14,3,3],
            [3,14,14,14,14,14,14,14,14,1,14,14,14,14,14,14,14,14,1,14,14,14,14,14,14,3],
            [3,14,14,14,14,14,14,14,1,1,14,14,14,14,14,14,14,14,1,1,14,14,14,14,14,3],
            [3,14,14,14,14,3,14,14,1,14,14,14,15,15,15,15,14,14,14,1,14,3,14,14,14,3],
            [3,14,14,14,14,14,14,14,1,14,14,14,15,15,15,15,14,14,14,1,14,14,14,14,14,3],
            [3,14,14,14,14,14,14,1,1,14,14,14,15,15,15,15,14,14,14,1,1,14,14,14,14,3],
            [3,3,14,14,14,14,14,1,14,14,14,14,14,15,15,14,14,14,14,14,1,14,14,14,3,3],
            [3,14,14,14,14,14,1,1,14,14,14,14,14,15,15,14,14,14,14,14,1,1,14,14,14,3],
            [3,14,14,14,14,14,1,14,14,14,14,14,14,14,14,14,14,14,14,14,14,1,14,14,14,3],
            [3,14,14,14,14,1,1,14,14,14,14,14,14,14,17,14,14,14,14,14,14,1,1,14,14,3],
            [3,3,14,14,14,1,14,14,14,14,14,14,14,14,1,14,14,14,14,14,14,14,1,14,3,3],
            [3,3,3,3,3,3,3,3,3,3,3,3,3,14,1,14,3,3,3,3,3,3,3,3,3,3],
        ],
        npcs: [
            { id:'castle_guard', type:'guard', x:14, y:5, dir:'down', dialog:[
                'The Dark Overlord waits in the throne room ahead.',
                'Only the bravest warriors dare challenge him.',
                'You will need mastery of all mathematics!'
            ]},
        ],
        enemies: [
            { id:'e10', type:'rockGolem', x:4, y:4, enemyData:{ name:'Rock Golem', hp:180, damage:26, defense:12 }, topics:['area_perimeter','pythagoras'], difficulty:'hard' },
            { id:'e11', type:'eagle', x:20, y:3, enemyData:{ name:'Storm Eagle', hp:140, damage:30, defense:6 }, topics:['angles','triangles'], difficulty:'hard' },
            { id:'e12', type:'demon', x:5, y:12, enemyData:{ name:'Chaos Demon', hp:200, damage:32, defense:10 }, topics:['statistics','probability'], difficulty:'hard' },
            { id:'e13', type:'voidWalker', x:20, y:14, enemyData:{ name:'Void Walker', hp:220, damage:34, defense:11 }, topics:['powers','roots','ratios'], difficulty:'hard' },
            { id:'e14', type:'dragon', x:10, y:9, enemyData:{ name:'Elder Dragon', hp:260, damage:36, defense:14 }, topics:['pythagoras','triangles','area_perimeter'], difficulty:'hard', isBoss:true },
            { id:'e_final', type:'overlord', x:14, y:17, enemyData:{ name:'The Dark Overlord', hp:350, damage:40, defense:16 }, topics:['quadratics','pythagoras','statistics','bodmas','percentages'], difficulty:'hard', isBoss:true, isFinalBoss:true },
        ],
        exits: [
            { x:14, y:0, toMap:'cave', toX:14, toY:18 }
        ]
    },

    // Get map data
    get(mapId) {
        return this[mapId] || this.village;
    },

    // Check if tile is walkable
    isWalkable(mapId, x, y) {
        const map = this.get(mapId);
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false;
        return this.walkable.has(map.tiles[y][x]);
    },

    // Check if tile is interactable
    isInteractable(mapId, x, y) {
        const map = this.get(mapId);
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false;
        return this.interactable.has(map.tiles[y][x]);
    },

    // Get tile type at position
    getTile(mapId, x, y) {
        const map = this.get(mapId);
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) return -1;
        return map.tiles[y][x];
    }
};
