/* ============================================
   SPRITE SYSTEM - Pixel art drawn on canvas
   ============================================ */
const Sprites = {
    T: 32, // tile size

    // Color palette
    C: {
        skin: '#fcd5b8', skinDark: '#dba87e',
        hair1: '#4a3728', hair2: '#8b6914', hair3: '#c0392b', hair4: '#ecf0f1',
        blue: '#3498db', darkBlue: '#2471a3',
        red: '#e74c3c', darkRed: '#c0392b',
        green: '#27ae60', darkGreen: '#1e8449',
        purple: '#8e44ad', darkPurple: '#6c3483',
        gray: '#7f8c8d', darkGray: '#515a5a',
        brown: '#8b6914', darkBrown: '#6e5511',
        gold: '#f1c40f', orange: '#e67e22',
        white: '#ecf0f1', black: '#1a1a2e',
        cyan: '#1abc9c', pink: '#e91e8f',
        // Tile colors
        grass1: '#2d7a3a', grass2: '#3a9e4b',
        path1: '#c4a35a', path2: '#b8963e',
        water1: '#2471a3', water2: '#2e86c1',
        wall1: '#626567', wall2: '#797d7f',
        wood1: '#8b6914', wood2: '#a07d1e',
        roof1: '#c0392b', roof2: '#a93226',
        floor1: '#b7950b', floor2: '#a38302',
        sand1: '#d4ac0d', sand2: '#c49c0e',
        lava1: '#e74c3c', lava2: '#f39c12',
        cave1: '#34495e', cave2: '#2c3e50',
        caveFloor: '#566573', stone: '#808b96',
        snow: '#d5dbdb', ice: '#85c1e9',
        carpet: '#922b21', tile1: '#d5d8dc', tile2: '#aeb6bf',
    },

    // ---- Draw a character sprite ----
    drawCharacter(ctx, x, y, type, dir, frame, scale) {
        const s = scale || 1;
        const sz = this.T * s;
        const data = this.charData[type] || this.charData.knight;
        const c = data.colors;

        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(sz / 2, sz - 2 * s, sz / 3, sz / 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body bounce when walking
        const bounce = frame % 2 === 1 ? -2 * s : 0;

        // Body
        ctx.fillStyle = c.body;
        ctx.fillRect(sz * 0.25, sz * 0.4 + bounce, sz * 0.5, sz * 0.35);

        // Head
        ctx.fillStyle = this.C.skin;
        ctx.fillRect(sz * 0.28, sz * 0.15 + bounce, sz * 0.44, sz * 0.3);

        // Hair
        ctx.fillStyle = c.hair;
        ctx.fillRect(sz * 0.25, sz * 0.12 + bounce, sz * 0.5, sz * 0.12);

        // Eyes
        ctx.fillStyle = this.C.black;
        if (dir === 'left') {
            ctx.fillRect(sz * 0.32, sz * 0.28 + bounce, sz * 0.06, sz * 0.06);
            ctx.fillRect(sz * 0.45, sz * 0.28 + bounce, sz * 0.06, sz * 0.06);
        } else if (dir === 'right') {
            ctx.fillRect(sz * 0.48, sz * 0.28 + bounce, sz * 0.06, sz * 0.06);
            ctx.fillRect(sz * 0.62, sz * 0.28 + bounce, sz * 0.06, sz * 0.06);
        } else if (dir === 'up') {
            // No eyes visible from behind
        } else {
            ctx.fillRect(sz * 0.35, sz * 0.28 + bounce, sz * 0.06, sz * 0.06);
            ctx.fillRect(sz * 0.55, sz * 0.28 + bounce, sz * 0.06, sz * 0.06);
        }

        // Legs
        ctx.fillStyle = c.legs || this.C.darkBrown;
        const legOff = frame % 2 === 0 ? 0 : sz * 0.04;
        ctx.fillRect(sz * 0.3, sz * 0.75 + bounce, sz * 0.15, sz * 0.2 + legOff);
        ctx.fillRect(sz * 0.55, sz * 0.75 + bounce, sz * 0.15, sz * 0.2 - legOff);

        // Weapon/accessory
        if (c.weapon) {
            ctx.fillStyle = c.weapon;
            if (dir === 'right' || dir === 'down') {
                ctx.fillRect(sz * 0.75, sz * 0.35 + bounce, sz * 0.08, sz * 0.35);
            } else {
                ctx.fillRect(sz * 0.17, sz * 0.35 + bounce, sz * 0.08, sz * 0.35);
            }
        }

        ctx.restore();
    },

    // Character type definitions
    charData: {
        knight: { colors: { body: '#3498db', hair: '#4a3728', legs: '#2c3e50', weapon: '#bdc3c7' } },
        mage: { colors: { body: '#8e44ad', hair: '#c0392b', legs: '#4a235a', weapon: '#f1c40f' } },
        ranger: { colors: { body: '#27ae60', hair: '#8b6914', legs: '#1e8449', weapon: '#8b6914' } },
        paladin: { colors: { body: '#f1c40f', hair: '#ecf0f1', legs: '#b7950b', weapon: '#bdc3c7' } },
        ninja: { colors: { body: '#1a1a2e', hair: '#1a1a2e', legs: '#1a1a2e', weapon: '#e74c3c' } },
        dragon: { colors: { body: '#e74c3c', hair: '#f1c40f', legs: '#c0392b', weapon: '#f39c12' } }
    },

    // ---- Draw an NPC ----
    drawNPC(ctx, x, y, type, dir, frame) {
        const data = this.npcData[type] || this.npcData.villager;
        const c = data.colors;
        const sz = this.T;
        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(sz / 2, sz - 2, sz / 3, sz / 8, 0, 0, Math.PI * 2);
        ctx.fill();

        const bounce = frame % 2 === 1 ? -1 : 0;

        // Body
        ctx.fillStyle = c.body;
        ctx.fillRect(sz * 0.25, sz * 0.4 + bounce, sz * 0.5, sz * 0.35);

        // Head
        ctx.fillStyle = c.skin || this.C.skin;
        ctx.fillRect(sz * 0.28, sz * 0.15 + bounce, sz * 0.44, sz * 0.3);

        // Hair/hat
        ctx.fillStyle = c.hair;
        ctx.fillRect(sz * 0.25, sz * 0.1 + bounce, sz * 0.5, sz * 0.14);

        // Eyes
        ctx.fillStyle = this.C.black;
        ctx.fillRect(sz * 0.35, sz * 0.28 + bounce, sz * 0.06, sz * 0.06);
        ctx.fillRect(sz * 0.55, sz * 0.28 + bounce, sz * 0.06, sz * 0.06);

        // Legs
        ctx.fillStyle = c.legs || this.C.darkBrown;
        ctx.fillRect(sz * 0.3, sz * 0.75, sz * 0.15, sz * 0.2);
        ctx.fillRect(sz * 0.55, sz * 0.75, sz * 0.15, sz * 0.2);

        // Special marker (like ! for quest givers)
        if (data.marker) {
            ctx.fillStyle = this.C.gold;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(data.marker, sz / 2, sz * 0.08 + bounce + Math.sin(Date.now() / 300) * 3);
        }

        ctx.restore();
    },

    npcData: {
        villager: { colors: { body: '#8b6914', hair: '#4a3728', legs: '#6e5511', skin: '#fcd5b8' } },
        elder: { colors: { body: '#5b2c6f', hair: '#d5d8dc', legs: '#4a235a', skin: '#fcd5b8' }, marker: '!' },
        shopkeeper: { colors: { body: '#d4ac0d', hair: '#8b6914', legs: '#b7950b', skin: '#fcd5b8' }, marker: '$' },
        guard: { colors: { body: '#7f8c8d', hair: '#2c3e50', legs: '#515a5a', skin: '#fcd5b8' } },
        wizard: { colors: { body: '#2e86c1', hair: '#d5d8dc', legs: '#2471a3', skin: '#fcd5b8' }, marker: '?' },
        girl: { colors: { body: '#e91e8f', hair: '#f1c40f', legs: '#c0392b', skin: '#fcd5b8' } },
        boy: { colors: { body: '#1abc9c', hair: '#4a3728', legs: '#148f77', skin: '#fcd5b8' } },
    },

    // ---- Draw enemy on map ----
    drawEnemy(ctx, x, y, type, frame) {
        const data = this.enemyData[type] || this.enemyData.slime;
        const sz = this.T;
        ctx.save();
        ctx.translate(x, y);

        const bounce = Math.sin(Date.now() / 300 + x) * 3;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(sz / 2, sz - 2, sz / 3, sz / 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Enemy body
        ctx.fillStyle = data.color;
        if (data.shape === 'round') {
            ctx.beginPath();
            ctx.arc(sz / 2, sz * 0.55 + bounce, sz * 0.35, 0, Math.PI * 2);
            ctx.fill();
        } else if (data.shape === 'tall') {
            ctx.fillRect(sz * 0.2, sz * 0.15 + bounce, sz * 0.6, sz * 0.65);
            ctx.fillStyle = data.color2 || data.color;
            ctx.fillRect(sz * 0.25, sz * 0.2 + bounce, sz * 0.5, sz * 0.2);
        } else {
            ctx.fillRect(sz * 0.15, sz * 0.25 + bounce, sz * 0.7, sz * 0.55);
        }

        // Eyes (angry)
        ctx.fillStyle = data.eyeColor || '#ff0000';
        ctx.fillRect(sz * 0.32, sz * 0.4 + bounce, sz * 0.1, sz * 0.08);
        ctx.fillRect(sz * 0.55, sz * 0.4 + bounce, sz * 0.1, sz * 0.08);

        // Enemy label indicator
        ctx.fillStyle = 'rgba(239,68,68,0.8)';
        ctx.beginPath();
        ctx.arc(sz / 2, sz * 0.08, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    enemyData: {
        slime: { color: '#27ae60', shape: 'round', eyeColor: '#fff' },
        skeleton: { color: '#d5d8dc', color2: '#aeb6bf', shape: 'tall', eyeColor: '#e74c3c' },
        darkKnight: { color: '#2c3e50', color2: '#1a252f', shape: 'tall', eyeColor: '#e74c3c' },
        golem: { color: '#7f8c8d', shape: 'rect', eyeColor: '#f1c40f' },
        sprite: { color: '#2ecc71', shape: 'round', eyeColor: '#fff' },
        wolf: { color: '#515a5a', shape: 'rect', eyeColor: '#f1c40f' },
        treant: { color: '#6e5511', shape: 'tall', eyeColor: '#27ae60' },
        wraith: { color: '#4a235a', shape: 'tall', eyeColor: '#af7ac5' },
        mage: { color: '#1a5276', shape: 'tall', eyeColor: '#5dade2' },
        lich: { color: '#1a1a2e', color2: '#4a235a', shape: 'tall', eyeColor: '#e74c3c' },
        rockGolem: { color: '#808b96', shape: 'rect', eyeColor: '#f39c12' },
        eagle: { color: '#5b2c6f', shape: 'round', eyeColor: '#f1c40f' },
        dragon: { color: '#c0392b', color2: '#e74c3c', shape: 'tall', eyeColor: '#f1c40f' },
        demon: { color: '#922b21', shape: 'tall', eyeColor: '#f1c40f' },
        voidWalker: { color: '#1a1a2e', shape: 'tall', eyeColor: '#8e44ad' },
        overlord: { color: '#4a0000', color2: '#8b0000', shape: 'tall', eyeColor: '#f1c40f' },
        boss: { color: '#6c3483', color2: '#4a235a', shape: 'tall', eyeColor: '#e74c3c' },
    },

    // ---- Draw a tile ----
    drawTile(ctx, x, y, type, frame) {
        const sz = this.T;
        ctx.save();
        ctx.translate(x, y);

        switch (type) {
            case 0: // Grass
                ctx.fillStyle = this.C.grass1;
                ctx.fillRect(0, 0, sz, sz);
                // Grass detail
                ctx.fillStyle = this.C.grass2;
                ctx.fillRect(4, 6, 3, 3);
                ctx.fillRect(18, 20, 3, 3);
                ctx.fillRect(12, 10, 2, 3);
                break;

            case 1: // Path
                ctx.fillStyle = this.C.path1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.path2;
                ctx.fillRect(5, 5, 4, 3);
                ctx.fillRect(20, 18, 5, 3);
                break;

            case 2: // Water (animated)
                ctx.fillStyle = this.C.water1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.water2;
                const woff = Math.sin(Date.now() / 500 + x * 0.1) * 3;
                ctx.fillRect(4 + woff, 8, 10, 2);
                ctx.fillRect(16 - woff, 20, 10, 2);
                break;

            case 3: // Wall (stone)
                ctx.fillStyle = this.C.wall1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.wall2;
                ctx.fillRect(1, 1, 14, 14);
                ctx.fillRect(17, 17, 14, 14);
                ctx.strokeStyle = this.C.darkGray;
                ctx.lineWidth = 1;
                ctx.strokeRect(0, 0, sz, sz);
                break;

            case 4: // Tree
                ctx.fillStyle = this.C.grass1;
                ctx.fillRect(0, 0, sz, sz);
                // Trunk
                ctx.fillStyle = this.C.brown;
                ctx.fillRect(12, 18, 8, 14);
                // Leaves
                ctx.fillStyle = '#1e8449';
                ctx.beginPath();
                ctx.arc(16, 14, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#27ae60';
                ctx.beginPath();
                ctx.arc(14, 12, 8, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 5: // Building wall
                ctx.fillStyle = this.C.wood1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.wood2;
                ctx.fillRect(2, 0, sz - 4, 2);
                ctx.fillRect(2, sz / 2, sz - 4, 2);
                break;

            case 6: // Door
                ctx.fillStyle = this.C.floor1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.brown;
                ctx.fillRect(4, 0, sz - 8, sz);
                ctx.fillStyle = this.C.gold;
                ctx.fillRect(sz - 10, sz / 2, 3, 3);
                break;

            case 7: // Floor (indoor)
                ctx.fillStyle = this.C.floor1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.floor2;
                ctx.fillRect(0, 0, sz / 2, sz / 2);
                ctx.fillRect(sz / 2, sz / 2, sz / 2, sz / 2);
                break;

            case 8: // Chest
                ctx.fillStyle = this.C.grass1;
                ctx.fillRect(0, 0, sz, sz);
                // Chest box
                ctx.fillStyle = this.C.brown;
                ctx.fillRect(6, 12, 20, 14);
                ctx.fillStyle = this.C.gold;
                ctx.fillRect(6, 12, 20, 3);
                ctx.fillRect(14, 16, 4, 4);
                break;

            case 9: // Fence
                ctx.fillStyle = this.C.grass1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.wood1;
                ctx.fillRect(0, 10, sz, 4);
                ctx.fillRect(0, 20, sz, 4);
                ctx.fillRect(4, 6, 4, 22);
                ctx.fillRect(24, 6, 4, 22);
                break;

            case 10: // Roof
                ctx.fillStyle = this.C.roof1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.roof2;
                for (let r = 0; r < sz; r += 8) ctx.fillRect(0, r, sz, 2);
                break;

            case 11: // Cave wall
                ctx.fillStyle = this.C.cave1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.cave2;
                ctx.fillRect(3, 3, 8, 8);
                ctx.fillRect(18, 16, 10, 10);
                break;

            case 12: // Cave floor
                ctx.fillStyle = this.C.caveFloor;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.stone;
                ctx.fillRect(8, 12, 4, 3);
                ctx.fillRect(22, 6, 3, 4);
                break;

            case 13: // Lava (animated)
                ctx.fillStyle = this.C.lava1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.lava2;
                const loff = Math.sin(Date.now() / 300 + y * 0.2) * 4;
                ctx.fillRect(4 + loff, 4, 12, 6);
                ctx.fillRect(16 - loff, 18, 10, 6);
                break;

            case 14: // Castle floor
                ctx.fillStyle = this.C.tile1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.tile2;
                ctx.fillRect(0, 0, sz / 2, sz / 2);
                ctx.fillRect(sz / 2, sz / 2, sz / 2, sz / 2);
                ctx.strokeStyle = '#95a5a6';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(0, 0, sz, sz);
                break;

            case 15: // Carpet
                ctx.fillStyle = this.C.tile1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.carpet;
                ctx.fillRect(2, 2, sz - 4, sz - 4);
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(4, 4, sz - 8, sz - 8);
                break;

            case 16: // Flowers on grass
                ctx.fillStyle = this.C.grass1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(6, 10, 4, 4);
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(20, 18, 4, 4);
                ctx.fillStyle = '#3498db';
                ctx.fillRect(14, 6, 4, 4);
                break;

            case 17: // Sign post
                ctx.fillStyle = this.C.grass1;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = this.C.wood1;
                ctx.fillRect(14, 14, 4, 18);
                ctx.fillStyle = this.C.wood2;
                ctx.fillRect(4, 8, 24, 10);
                break;

            case 18: // Portal/stairs
                ctx.fillStyle = this.C.caveFloor;
                ctx.fillRect(0, 0, sz, sz);
                ctx.fillStyle = '#8e44ad';
                ctx.beginPath();
                ctx.arc(sz / 2, sz / 2, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#af7ac5';
                const pOff = Math.sin(Date.now() / 400) * 2;
                ctx.beginPath();
                ctx.arc(sz / 2, sz / 2, 6 + pOff, 0, Math.PI * 2);
                ctx.fill();
                break;

            default:
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, sz, sz);
        }

        ctx.restore();
    },

    // ---- Draw battle character (larger, for battle scene on canvas) ----
    drawBattleSprite(ctx, x, y, type, isEnemy, frame, scale) {
        const s = scale || 3;
        if (isEnemy) {
            this.drawEnemy(ctx, x, y, type, frame);
        } else {
            this.drawCharacter(ctx, x, y, type, 'right', frame, s);
        }
    }
};
