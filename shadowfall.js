const GAME_WIDTH = 960;
const GAME_HEIGHT = 600;
const GROUND_TOP = 480;
const TOOLBAR_TOP = 520;

let hero;
let ground;
let resources = [];
let enemies = [];
let projectiles = [];
let buildings = [];
let shelters = [];
let playerData;
let supplies;
let gameStatus = 'playing';
let wave = 0;
let waveClock = 3;
let bossStarted = false;
let meleeWeapon = 'Old sword';
let meleeDamage = 18;
let bowOwned = false;
let bowDamage = 28;
let attackClock = 0;
let bowShotClock = 0;
let facing = 1;
let buildMode = false;
let hurtClock = 0;
let healClock = 0;
let wasSheltered = false;
let message = 'The blight is spreading. Gather supplies and hold the line.';
let messageClock = 5;

function setup() {
  new Canvas(GAME_WIDTH, GAME_HEIGHT);
  world.gravity.y = 12;
  allSprites.autoDraw = false;
  createWorld();
  resetGameData();
}

function createWorld() {
  ground = new Sprite(GAME_WIDTH / 2, GROUND_TOP + 65, GAME_WIDTH, 130, 'static');
  ground.color = color('#34443a');
  ground.stroke = color('#50664b');
  ground.strokeWeight = 2;

  hero = new Sprite(105, GROUND_TOP - 28, 28, 42);
  hero.color = color('#e7c980');
  hero.stroke = color('#fff0bc');
  hero.strokeWeight = 2;
  hero.rotationLock = true;
  hero.friction = 0.12;
  hero.bounciness = 0;

}

function resetGameData() {
  playerData = { health: 70, maxHealth: 70, lastHurt: 0 };
  supplies = { wood: 0, stone: 0, iron: 0, herbs: 0, embers: 0, coins: 0 };
}

function addResource(x, type, amount) {
  const colors = {
    wood: '#97633e',
    iron: '#8f9ba5',
    stone: '#7d7774',
    herb: '#66a95e'
  };
  const node = new Sprite(x, GROUND_TOP - 16, 30, 30, 'static');
  node.color = color(colors[type]);
  node.stroke = color('#d6d1bc');
  node.strokeWeight = 1;
  resources.push({ sprite: node, type, amount, available: true });
}

function spawnWaveResources(waveNumber) {
  const waveNodes = {
    1: [
      [190, 'wood', 4],
      [315, 'iron', 2],
      [50, 'stone', 2]
    ],
    2: [
      [665, 'wood', 4],
      [775, 'iron', 2],
      [545, 'stone', 2],
      [425, 'herb', 1]
    ],
    3: [
      [935, 'wood', 4],
      [485, 'wood', 5],
      [875, 'iron', 2]
    ]
  };
  for (const [x, type, amount] of waveNodes[waveNumber] || []) {
    addResource(x, type, amount);
  }
}

function clearUncollectedResources() {
  for (const resource of resources) {
    if (!resource.available) continue;
    resource.available = false;
    resource.sprite.remove();
  }
}

function draw() {
  background('#101522');
  drawScenery();
  allSprites.draw();

  const dt = min(deltaTime / 1000, 0.05);
  if (gameStatus === 'playing') {
    updateGame(dt);
    drawCombatEffects();
    drawProjectiles();
  }
  drawInterface();

  if (gameStatus !== 'playing') drawEndScreen();
}

function drawScenery() {
  noStroke();
  const peaks = [188, 262, 214, 296, 236, 178, 278, 224, 306, 198];
  for (let i = 0; i < peaks.length; i++) {
    const x = i * 112 - 18;
    fill(i % 2 ? '#202d32' : '#26343a');
    triangle(x, GROUND_TOP, x + 54, peaks[i], x + 126, GROUND_TOP);

    fill(i % 2 ? '#303e39' : '#36483c');
    ellipse(x + 49, 365 + (i % 3) * 18, 102 + (i % 2) * 18, 112 + (i % 3) * 14);
    fill('#f1c782');
    ellipse(x + 30, peaks[i] - 8, 3, 3);
  }

  fill('#1b2430');
  rect(0, GROUND_TOP, GAME_WIDTH, GAME_HEIGHT - GROUND_TOP);
  fill('#435b43');
  rect(0, GROUND_TOP, GAME_WIDTH, 10);
  fill('#52664a');
  for (let x = 0; x < GAME_WIDTH; x += 96) {
    const patchWidth = 34 + (x % 5) * 7;
    rect(x + (x % 3) * 8, GROUND_TOP + 10, patchWidth, 20 + (x % 4) * 9);
  }
  fill('#303a34');
  for (let x = 22; x < GAME_WIDTH; x += 83) {
    const rockY = GROUND_TOP + 34 + (x % 4) * 13;
    ellipse(x, rockY, 8 + (x % 3) * 3, 5 + (x % 2) * 3);
    fill('#465047');
    ellipse(x - 2, rockY - 2, 4, 2);
    fill('#303a34');
  }

  stroke('#60764e');
  strokeWeight(2);
  for (let x = 8; x < GAME_WIDTH; x += 38) {
    const height = 5 + (x % 4) * 2;
    line(x, GROUND_TOP, x + 3 + (x % 3), GROUND_TOP - height);
    if (x % 3 === 0) line(x + 5, GROUND_TOP, x + 3, GROUND_TOP - 5);
  }

  noStroke();
  fill('#25333a');
  for (let i = 0; i < 18; i++) {
    ellipse((i * 71 + 20) % GAME_WIDTH, 120 + (i * 37) % 310, 2, 2);
  }
}

function updateGame(dt) {
  attackClock = max(0, attackClock - dt);
  bowShotClock = max(0, bowShotClock - dt);
  hurtClock = max(0, hurtClock - dt);
  messageClock = max(0, messageClock - dt);

  moveHero();
  if (keyIsDown(32) && attackClock <= 0) attack();
  updateEnemies(dt);
  updateProjectiles(dt);
  updateWaves(dt);
  updateHealing(dt);

  if (playerData.health <= 0) {
    playerData.health = 0;
    gameStatus = 'lost';
  }
}

function moveHero() {
  let direction = 0;
  if (keyIsDown(65)) direction -= 1;
  if (keyIsDown(68)) direction += 1;

  if (direction !== 0) {
    facing = direction;
    hero.vel.x = direction * 3.4;
  } else {
    hero.vel.x *= 0.78;
  }

  if (keyIsDown(87) && hero.colliding(ground)) hero.vel.y = -6;
  if (keyIsDown(83) && !hero.colliding(ground)) hero.vel.y = max(hero.vel.y, 5);
  hero.x = constrain(hero.x, 18, GAME_WIDTH - 18);
}

function updateWaves(dt) {
  const livingEnemies = enemies.some(enemy => enemy.alive);
  if (livingEnemies || bossStarted) return;

  waveClock -= dt;
  if (waveClock > 0) return;

  if (wave < 3) {
    const starterSwordBreaks = wave === 2 && meleeWeapon === 'Old sword';
    if (starterSwordBreaks) {
      meleeWeapon = 'Broken sword';
      meleeDamage = 8;
    }
    wave += 1;
    spawnWaveResources(wave);
    const size = wave + 2;
    for (let i = 0; i < size; i++) {
      const enemyType = i % 3 === 2 ? 'brute' : i % 2 === 0 ? 'crawler' : 'wraith';
      const side = i % 2 === 0 ? GAME_WIDTH - 55 - (i % 3) * 28 : 55 + (i % 3) * 28;
      addEnemy(enemyType, side);
    }
    setMessage(starterSwordBreaks
      ? 'Your Old Sword broke after wave 2! Craft an Iron Sword.'
      : `Wave ${wave} — supplies are scattered across the land!`, 4);
    waveClock = 5;
    return;
  }

  clearUncollectedResources();
  bossStarted = true;
  addEnemy('boss', GAME_WIDTH - 90);
  setMessage('THE HOLLOW KING has awakened!', 6);
}

function addEnemy(type, x) {
  const stats = {
    crawler: { width: 30, height: 30, health: 36, damage: 7, speed: 1.15, color: '#b6534b' },
    wraith: { width: 26, height: 38, health: 28, damage: 6, speed: 1.55, color: '#8467b5' },
    brute: { width: 42, height: 44, health: 68, damage: 12, speed: 0.72, color: '#775446' },
    boss: { width: 64, height: 64, health: 360, damage: 18, speed: 0.95, color: '#8d303e' }
  }[type];
  const sprite = new Sprite(x, GROUND_TOP - stats.height / 2, stats.width, stats.height);
  disableEnemyToEnemyCollisions(sprite);
  sprite.color = color(stats.color);
  sprite.stroke = color(type === 'boss' ? '#ef7d69' : '#d7856d');
  sprite.strokeWeight = type === 'boss' ? 3 : 1;
  sprite.rotationLock = true;
  sprite.friction = 0.08;
  sprite.bounciness = 0;
  enemies.push({
    sprite,
    type,
    health: stats.health,
    maxHealth: stats.health,
    damage: stats.damage,
    speed: stats.speed,
    attackClock: random(0.3, 1),
    wallTarget: null,
    wallBreakClock: random(1.5, 2.5),
    alive: true
  });
}

function disableEnemyToEnemyCollisions(sprite) {
  for (let fixture = sprite.body.getFixtureList(); fixture; fixture = fixture.getNext()) {
    fixture.setFilterGroupIndex(-1);
  }
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const dx = hero.x - enemy.sprite.x;
    enemy.sprite.vel.x = abs(dx) > 42 ? Math.sign(dx) * enemy.speed : 0;
    enemy.attackClock -= dt;

    if (updateEnemyWallBreaking(enemy, dx, dt)) continue;

    const closeEnough = abs(dx) < 52 && abs(hero.y - enemy.sprite.y) < 52;
    if (enemy.type === 'boss' && !closeEnough && enemy.attackClock <= 0) {
      fireBossProjectile(enemy);
      enemy.attackClock = 2.2;
    } else if (closeEnough && enemy.attackClock <= 0 && hurtClock <= 0) {
      hurtPlayer(enemy.damage);
      enemy.attackClock = enemy.type === 'boss' ? 1.1 : 1.5;
      hero.vel.x = dx >= 0 ? -3.2 : 3.2;
    }
  }
}

function updateEnemyWallBreaking(enemy, playerDx, dt) {
  if (enemy.type === 'boss') return updateBossWallBreaking(enemy, dt);

  const direction = Math.sign(playerDx);
  if (!direction) return false;

  const wall = buildings.find(block =>
    block.available &&
    Math.sign(block.sprite.x - enemy.sprite.x) === direction &&
    abs(block.sprite.x - enemy.sprite.x) < abs(playerDx) &&
    abs(block.sprite.y - enemy.sprite.y) < (block.sprite.h + enemy.sprite.h) / 2 + 8 &&
    abs(block.sprite.x - enemy.sprite.x) <= (block.sprite.w + enemy.sprite.w) / 2 + 10
  );
  if (!wall) {
    enemy.wallTarget = null;
    return false;
  }

  enemy.sprite.vel.x = 0;
  if (enemy.wallTarget !== wall) {
    enemy.wallTarget = wall;
    enemy.wallBreakClock = 1.8;
  }
  enemy.wallBreakClock -= dt;
  if (enemy.wallBreakClock > 0) return true;

  damageBuildingBlock(wall);
  enemy.wallTarget = null;
  return true;
}

function updateBossWallBreaking(enemy, dt) {
  const touchingBlocks = buildings.filter(block =>
    block.available &&
    abs(block.sprite.x - enemy.sprite.x) <= (block.sprite.w + enemy.sprite.w) / 2 &&
    abs(block.sprite.y - enemy.sprite.y) <= (block.sprite.h + enemy.sprite.h) / 2
  );
  if (touchingBlocks.length === 0) {
    enemy.wallTargets = [];
    return false;
  }

  enemy.sprite.vel.x = 0;
  const sameTargets = enemy.wallTargets?.length === touchingBlocks.length &&
    touchingBlocks.every(block => enemy.wallTargets.includes(block));
  if (!sameTargets) {
    enemy.wallTargets = touchingBlocks;
    enemy.wallBreakClock = 3;
  }

  enemy.wallBreakClock -= dt;
  if (enemy.wallBreakClock > 0) return true;

  for (const block of touchingBlocks) damageBuildingBlock(block);
  enemy.wallTargets = [];
  return true;
}

function damageBuildingBlock(block) {
  block.hitsLeft -= 1;
  if (block.hitsLeft <= 0) {
    block.available = false;
    block.sprite.remove();
    setMessage('A blighted creature smashed through a wall!', 2);
    return;
  }
  block.sprite.color = color(block.hitsLeft === 2 ? '#795337' : '#593d31');
}

function fireBossProjectile(enemy) {
  const deltaX = hero.x - enemy.sprite.x;
  const deltaY = hero.y - enemy.sprite.y;
  const angle = atan2(deltaY, deltaX);
  const speed = 4.2;
  projectiles.push({
    owner: 'boss',
    posX: enemy.sprite.x,
    posY: enemy.sprite.y,
    velocityX: cos(angle) * speed,
    velocityY: sin(angle) * speed,
    radius: 11,
    damageValue: 12,
    age: 0
  });
  setMessage('The Hollow King hurls a blight bolt — dodge!', 1.5);
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const bolt = projectiles[i];
    bolt.posX += bolt.velocityX;
    bolt.posY += bolt.velocityY;
    bolt.age += dt;

    if (bolt.owner === 'boss') {
      const obstacle = projectileHitsObstacle(bolt);
      if (obstacle) {
        if (obstacle !== true) damageBuildingBlock(obstacle);
        projectiles.splice(i, 1);
        continue;
      }
    }

    if (bolt.owner === 'player') {
      const target = enemies.find(enemy =>
        enemy.alive &&
        dist(bolt.posX, bolt.posY, enemy.sprite.x, enemy.sprite.y) < bolt.radius + max(enemy.sprite.w, enemy.sprite.h) / 2
      );
      if (target) {
        target.health -= bolt.damageValue;
        target.sprite.vel.x = Math.sign(bolt.velocityX) * (target.type === 'boss' ? 2 : 4);
        if (target.health <= 0) defeatEnemy(target);
        projectiles.splice(i, 1);
        continue;
      }
    } else if (dist(bolt.posX, bolt.posY, hero.x, hero.y) < bolt.radius + 20) {
      if (hurtClock <= 0) hurtPlayer(bolt.damageValue);
      projectiles.splice(i, 1);
      continue;
    }

    if (bolt.posX < -20 || bolt.posX > GAME_WIDTH + 20 ||
               bolt.posY < -20 || bolt.posY > GAME_HEIGHT + 20 || bolt.age > 4) {
      projectiles.splice(i, 1);
    }
  }
}

function projectileHitsObstacle(bolt) {
  if (bolt.posY + bolt.radius >= GROUND_TOP) return true;

  return buildings.find(block =>
    block.available &&
    abs(bolt.posX - block.sprite.x) <= block.sprite.w / 2 + bolt.radius &&
    abs(bolt.posY - block.sprite.y) <= block.sprite.h / 2 + bolt.radius
  ) || null;
}

function updateHealing(dt) {
  const sheltered = isPlayerSheltered();
  if (playerData.health >= playerData.maxHealth) {
    healClock = 0;
    wasSheltered = sheltered;
    return;
  }

  if (sheltered) {
    if (!wasSheltered) healClock = 0;
    wasSheltered = true;
    healClock += dt;
    if (healClock >= 1) {
      playerData.health = min(playerData.maxHealth, playerData.health + 3);
      healClock -= 1;
    }
    return;
  }

  wasSheltered = false;
  if (millis() - playerData.lastHurt < 4000) {
    healClock = 0;
    return;
  }

  healClock += dt;
  if (healClock >= 3) {
    playerData.health = min(playerData.maxHealth, playerData.health + 4);
    healClock = 0;
  }
}

function isPlayerSheltered() {
  return shelters.some(shelter =>
    shelter.blocks.some(block => block.available) &&
    abs(hero.x - shelter.centerX) <= 48 &&
    hero.y >= GROUND_TOP - 104 &&
    hero.y <= GROUND_TOP + 16
  );
}

function attack() {
  if (gameStatus !== 'playing' || attackClock > 0) return;

  attackClock = 0.5;
  const target = closestEnemyInRange();
  if (!target) {
    setMessage('Swing closer to a blighted creature.', 1.2);
    return;
  }

  const damage = Math.round(meleeDamage * (isPlayerSheltered() ? 1.5 : 1));
  target.health -= damage;
  target.sprite.vel.x = facing * (target.type === 'boss' ? 2 : 4);
  setMessage(`${meleeWeapon} strikes for ${damage}!`, 1);
  if (target.health <= 0) defeatEnemy(target);
}

function firePlayerArrow() {
  if (bowShotClock > 0) return;
  bowShotClock = 0.72;
  const target = enemies
    .filter(enemy => enemy.alive && Math.sign(enemy.sprite.x - hero.x) === facing)
    .sort((a, b) => abs(a.sprite.x - hero.x) - abs(b.sprite.x - hero.x))[0];
  const angle = target ? atan2(target.sprite.y - hero.y, target.sprite.x - hero.x) : (facing === 1 ? 0 : 180);
  const speed = 8;
  projectiles.push({
    owner: 'player',
    posX: hero.x + facing * 18,
    posY: hero.y - 5,
    velocityX: cos(angle) * speed,
    velocityY: sin(angle) * speed,
    radius: 5,
    damageValue: Math.round(bowDamage * (isPlayerSheltered() ? 1.5 : 1)),
    age: 0
  });
}

function closestEnemyInRange() {
  let closest = null;
  let bestDistance = 96;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.sprite.x - hero.x;
    const dy = abs(enemy.sprite.y - hero.y);
    if (abs(dx) <= bestDistance && dy < 70 && (closest === null || abs(dx) < abs(closest.sprite.x - hero.x))) {
      closest = enemy;
    }
  }
  return closest;
}

function defeatEnemy(enemy) {
  enemy.alive = false;
  enemy.sprite.remove();
  supplies.coins += enemy.type === 'boss' ? 12 : 1;
  supplies.embers += enemy.type === 'boss' ? 3 : random() < 0.285 ? 1 : 0;
  if (enemy.type !== 'boss' && random() < 0.3) supplies.herbs += 1;

  if (enemy.type === 'boss') {
    gameStatus = 'won';
    setMessage('The Hollow King is defeated. The land is free!', 10);
  } else {
    setMessage('Blighted creature defeated — loot collected!', 2);
  }
}

function hurtPlayer(amount) {
  playerData.health = max(0, playerData.health - amount);
  playerData.lastHurt = millis();
  hurtClock = 0.7;
  setMessage(`You were hit for ${amount} damage.`, 1);
}

function mousePressed() {
  if (gameStatus !== 'playing') {
    if (mouseX > 335 && mouseX < 625 && mouseY > 340 && mouseY < 400) restartGame();
    return false;
  }

  if (mouseY >= TOOLBAR_TOP) {
    handleToolbarClick(mouseX, mouseY);
    return false;
  }

  if (handleWorldClick(mouseX, mouseY)) return false;
  facing = mouseX >= hero.x ? 1 : -1;
  if (bowOwned) firePlayerArrow();
  else attack();
  return false;
}

function handleToolbarClick(x, y) {
  if (y < TOOLBAR_TOP || y > GAME_HEIGHT) return;
  const buttonWidth = 148;
  const gap = 6;
  const startX = 12;
  const index = floor((x - startX) / (buttonWidth + gap));
  if (index < 0 || index > 5 || x > startX + 6 * buttonWidth + 5 * gap ||
      x > startX + index * (buttonWidth + gap) + buttonWidth) return;

  if (index === 0) craftIronSword();
  if (index === 1) craftEmberBlade();
  if (index === 2) craftWardenBow();
  if (index === 3) brewTonic();
  if (index === 4) {
    buildMode = !buildMode;
    setMessage(buildMode ? 'Build mode: click nearby ground to place a wall.' : 'Build mode off.', 2);
  }
  if (index === 5) buildHouse();
}

function handleWorldClick(x, y) {
  for (const resource of resources) {
    if (!resource.available) continue;
    const sprite = resource.sprite;
    if (abs(x - sprite.x) < 24 && abs(y - sprite.y) < 24 && dist(hero.x, hero.y, sprite.x, sprite.y) < 150) {
      gatherResource(resource);
      return true;
    }
  }

  for (const building of buildings) {
    if (!building.available) continue;
    const sprite = building.sprite;
    if (abs(x - sprite.x) < 18 && abs(y - sprite.y) < 18 && dist(hero.x, hero.y, sprite.x, sprite.y) < 150) {
      building.available = false;
      building.sprite.remove();
      supplies[building.material] += building.returnAmount;
      setMessage(`You broke a block and recovered ${building.returnAmount} ${building.material}.`, 2);
      return true;
    }
  }

  if (buildMode) {
    placeBlock(x, y);
    return true;
  }
  return false;
}

function gatherResource(resource) {
  resource.available = false;
  resource.sprite.remove();
  if (resource.type === 'wood') supplies.wood += resource.amount;
  if (resource.type === 'stone') supplies.stone += resource.amount;
  if (resource.type === 'iron') supplies.iron += resource.amount;
  if (resource.type === 'herb') supplies.herbs += resource.amount;
  setMessage(`Gathered ${resource.amount} ${resource.type}.`, 2);
}

function craftIronSword() {
  if (supplies.wood < 4 || supplies.iron < 3) {
    setMessage('Iron sword needs 4 wood and 3 iron.', 2.5);
    return;
  }
  supplies.wood -= 4;
  supplies.iron -= 3;
  meleeWeapon = 'Iron sword';
  meleeDamage = 34;
  setMessage('Forged an Iron sword! Your attacks are stronger.', 3);
}

function craftEmberBlade() {
  if (supplies.iron < 3 || supplies.embers < 2) {
    setMessage('Ember blade needs 3 iron and 2 ember shards.', 2.5);
    return;
  }
  supplies.iron -= 3;
  supplies.embers -= 2;
  meleeWeapon = 'Ember blade';
  meleeDamage = 52;
  setMessage('Forged the Ember blade — a weapon fit for a king.', 3);
}

function craftWardenBow() {
  if (bowOwned) {
    setMessage('You already have the Warden bow.', 2);
    return;
  }
  if (supplies.wood < 5 || supplies.iron < 3) {
    setMessage('Warden bow needs 5 wood and 3 iron.', 2.5);
    return;
  }
  supplies.wood -= 5;
  supplies.iron -= 3;
  bowOwned = true;
  setMessage('Crafted the Warden bow. Click in the arena to fire; SPACE remains melee.', 3);
}

function brewTonic() {
  if (supplies.herbs < 2) {
    setMessage('A tonic needs 2 healing herbs.', 2);
    return;
  }
  if (playerData.health >= playerData.maxHealth) {
    setMessage('You are already at full health.', 2);
    return;
  }
  supplies.herbs -= 2;
  playerData.health = min(playerData.maxHealth, playerData.health + 38);
  setMessage('Healing tonic restored 38 health.', 2);
}

function placeBlock(x, y) {
  if (supplies.wood < 2) {
    setMessage('A wall block needs 2 wood.', 2);
    return;
  }
  if (x < 24 || x > GAME_WIDTH - 24 || y < 320 || y > GROUND_TOP - 12 ||
      dist(hero.x, hero.y, x, y) > 175) {
    setMessage('Place blocks nearby, above the ground.', 2);
    return;
  }

  const snappedX = constrain(round(x / 32) * 32, 24, GAME_WIDTH - 24);
  const snappedY = constrain(round(y / 32) * 32, 336, GROUND_TOP - 16);
  addBuildingBlock(snappedX, snappedY, 'wood', 1);
  supplies.wood -= 2;
  setMessage('Wall placed. Click a block to break it again.', 2);
}

function buildHouse() {
  if (supplies.wood < 12 || supplies.stone < 3) {
    setMessage('A shelter needs 12 wood and 3 stone.', 2.5);
    return;
  }

  const centerX = constrain(round(hero.x / 32) * 32, 96, GAME_WIDTH - 96);
  const shelter = { centerX, blocks: [] };
  shelters.push(shelter);
  const points = [
    [-64, -112], [-32, -112], [0, -112], [32, -112], [64, -112],
    [-64, -80], [64, -80],
    [-64, -48], [64, -48],
    [-64, -16], [64, -16]
  ];
  for (const [offsetX, offsetY] of points) {
    addBuildingBlock(centerX + offsetX, GROUND_TOP + offsetY, 'wood', 1, shelter);
  }
  supplies.wood -= 12;
  supplies.stone -= 3;
  setMessage('Large shelter built! The open doorway is in the middle.', 3);
}

function addBuildingBlock(x, y, material, returnAmount, shelter = null) {
  const block = new Sprite(x, y, 32, 32, 'static');
  block.color = color(material === 'wood' ? '#94603a' : '#777c80');
  block.stroke = color('#d2b88e');
  block.strokeWeight = 1;
  const building = { sprite: block, material, returnAmount, hitsLeft: 3, available: true };
  buildings.push(building);
  if (shelter) shelter.blocks.push(building);
  return building;
}

function setMessage(text, seconds) {
  message = text;
  messageClock = seconds;
}

function drawInterface() {
  noStroke();
  fill(16, 19, 28, 232);
  rect(0, 0, GAME_WIDTH, 112);

  fill('#f1e7d0');
  textAlign(LEFT, CENTER);
  textSize(19);
  textStyle(BOLD);
  text('SHADOWFALL', 20, 23);
  textStyle(NORMAL);
  textSize(13);
  fill('#b8c2c7');
  text('WASD move/jump  •  SPACE melee  •  Click gather/build/fire bow', 20, 48);

  drawHealthBar();
  drawSupplyLine();
  drawWaveLabel();
  drawToolbar();
  drawEnemyHealthBars();

  if (messageClock > 0 && gameStatus === 'playing') {
    fill(16, 19, 28, 232);
    rect(255, 116, 450, 30, 6);
    fill('#f3d9a1');
    textAlign(CENTER, CENTER);
    textSize(13);
    text(message, GAME_WIDTH / 2, 131);
  }
}

function drawHealthBar() {
  const x = 700;
  const y = 12;
  fill('#39414b');
  rect(x, y, 238, 18, 8);
  fill(playerData.health > 30 ? '#68bd74' : '#e35b58');
  rect(x, y, 238 * playerData.health / playerData.maxHealth, 18, 8);
  fill('#fff2d6');
  textAlign(LEFT, CENTER);
  textSize(12);
  text(`HEALTH ${playerData.health}/${playerData.maxHealth}`, x + 8, y + 9);
}

function drawSupplyLine() {
  fill('#d0d5d4');
  textAlign(LEFT, CENTER);
  textSize(12);
  text(`WOOD ${supplies.wood}   STONE ${supplies.stone}   IRON ${supplies.iron}   HERBS ${supplies.herbs}   EMBER ${supplies.embers}   COINS ${supplies.coins}`, 20, 70);
  fill('#f0d99c');
  text(`SWORD: ${meleeWeapon} (${meleeDamage})   BOW: ${bowOwned ? `Warden bow (${bowDamage})` : 'none'}`, 20, 94);
  if (isPlayerSheltered()) {
    textAlign(RIGHT, CENTER);
    fill('#9cdb9e');
    text('SHELTERED: +50% DMG • REGEN', GAME_WIDTH - 20, 94);
  }
}

function drawWaveLabel() {
  textAlign(RIGHT, CENTER);
  textSize(14);
  fill('#f1d58d');
  const label = bossStarted ? 'HOLLOW KING' : wave === 0 ? 'NIGHTFALL INCOMING' : `WAVE ${wave} / 3`;
  text(label, GAME_WIDTH - 22, 44);
}

function drawToolbar() {
  noStroke();
  fill('#111722');
  rect(0, TOOLBAR_TOP, GAME_WIDTH, GAME_HEIGHT - TOOLBAR_TOP);

  const labels = [
    'IRON SWORD',
    'EMBER BLADE',
    'WARDEN BOW',
    'HEAL TONIC',
    buildMode ? 'BUILD: ON' : 'BUILD WALL',
    'BUILD SHELTER'
  ];
  const costs = [
    '4 wood + 3 iron',
    '3 iron + 2 ember',
    '5 wood + 3 iron',
    '2 herbs',
    'click ground • 2 wood',
    '12 wood + 3 stone'
  ];
  const bonuses = ['', '', '', '', '', '3 HP/s • +50% damage'];
  const buttonWidth = 148;
  const gap = 6;
  for (let i = 0; i < labels.length; i++) {
    const x = 12 + i * (buttonWidth + gap);
    fill(i === 4 && buildMode ? '#536f4d' : '#25303c');
    rect(x, TOOLBAR_TOP + 4, buttonWidth, 68, 7);
    fill('#f1e7d0');
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(12);
    text(labels[i], x + buttonWidth / 2, TOOLBAR_TOP + 17);
    textStyle(NORMAL);
    fill('#aeb9bd');
    textSize(10);
    text(costs[i], x + buttonWidth / 2, TOOLBAR_TOP + 37);
    if (bonuses[i]) {
      fill('#9cdb9e');
      textSize(9);
      text(bonuses[i], x + buttonWidth / 2, TOOLBAR_TOP + 57);
    }
  }
}

function drawCombatEffects() {
  if (attackClock > 0.28 && attackClock < 0.5) {
    stroke('#ffe49a');
    strokeWeight(4);
    line(hero.x + facing * 12, hero.y - 7, hero.x + facing * 48, hero.y - 16);
    noStroke();
  }
  if (hurtClock > 0 && frameCount % 8 < 4) {
    noFill();
    stroke('#ff8276');
    strokeWeight(3);
    rect(hero.x - 19, hero.y - 27, 38, 54, 6);
    noStroke();
  }

  for (const enemy of enemies) {
    if (!enemy.alive || enemy.type !== 'boss' || enemy.attackClock > 0.4) continue;
    noFill();
    stroke('#ee7290');
    strokeWeight(3);
    ellipse(enemy.sprite.x, enemy.sprite.y, 94, 94);
    noStroke();
  }
}

function drawProjectiles() {
  for (const bolt of projectiles) {
    if (bolt.owner === 'player') {
      stroke('#f1d08b');
      strokeWeight(3);
      line(
        bolt.posX,
        bolt.posY,
        bolt.posX - bolt.velocityX * 1.5,
        bolt.posY - bolt.velocityY * 1.5
      );
      noStroke();
      fill('#fff0bc');
      ellipse(bolt.posX, bolt.posY, 5, 5);
    } else {
      noStroke();
      fill('#e95b78');
      ellipse(bolt.posX, bolt.posY, bolt.radius * 2, bolt.radius * 2);
      fill('#ffc279');
      ellipse(bolt.posX, bolt.posY, bolt.radius, bolt.radius);
    }
  }
}

function drawEnemyHealthBars() {
  for (const enemy of enemies) {
    if (!enemy.alive || enemy.health >= enemy.maxHealth) continue;
    const barWidth = enemy.type === 'boss' ? 82 : 38;
    const x = enemy.sprite.x - barWidth / 2;
    const y = enemy.sprite.y - enemy.sprite.h / 2 - 11;
    noStroke();
    fill('#38272b');
    rect(x, y, barWidth, 5, 3);
    fill('#df655c');
    rect(x, y, barWidth * max(0, enemy.health / enemy.maxHealth), 5, 3);
  }
}

function drawEndScreen() {
  noStroke();
  fill(8, 11, 18, 217);
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  textAlign(CENTER, CENTER);
  fill(gameStatus === 'won' ? '#f0d58f' : '#e87970');
  textStyle(BOLD);
  textSize(42);
  text(gameStatus === 'won' ? 'THE LAND IS FREE' : 'THE BLIGHT CLAIMS YOU', GAME_WIDTH / 2, 235);
  textStyle(NORMAL);
  fill('#e0e0d9');
  textSize(17);
  text(gameStatus === 'won'
    ? 'The Hollow King is gone. The people can rebuild.'
    : 'The darkness grows stronger, but your story is not over.', GAME_WIDTH / 2, 286);
  fill('#4b7354');
  rect(335, 340, 290, 58, 10);
  fill('#fff2d6');
  textStyle(BOLD);
  textSize(18);
  text('PLAY AGAIN', GAME_WIDTH / 2, 369);
  textStyle(NORMAL);
}

function restartGame() {
  for (const sprite of allSprites.slice()) {
    if (sprite !== ground && sprite !== hero) sprite.remove();
  }
  resources = [];
  enemies = [];
  projectiles = [];
  buildings = [];
  shelters = [];
  gameStatus = 'playing';
  wave = 0;
  waveClock = 3;
  bossStarted = false;
  meleeWeapon = 'Old sword';
  meleeDamage = 18;
  bowOwned = false;
  bowDamage = 28;
  attackClock = 0;
  bowShotClock = 0;
  facing = 1;
  buildMode = false;
  hurtClock = 0;
  healClock = 0;
  wasSheltered = false;
  resetGameData();
  hero.x = 105;
  hero.y = GROUND_TOP - 28;
  hero.vel.x = 0;
  hero.vel.y = 0;
  setMessage('The blight is spreading. Gather supplies and hold the line.', 5);
}
