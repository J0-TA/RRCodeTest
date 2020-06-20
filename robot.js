async function main(tank) {
  while(true){
    const config = {
      angles: {
        N: 90,
        S: 270,
        W: 180,
        E: 0,
        NW: 135,
        NE: 45,
        SW: 225,
        SE: 315
      },
      boundaries: {
        x: 1340,
        y: 1000
      },
      directions: ["N", "E", "S", "W"],
      directionIndex: null,
      maxSpeed: 75,
      midSpeed: 50,
      securityDistanceToBorder: 300,
      yourState: {
        last: null,
        current: null
      }
    };
  
    const updateState = async tank => {
      const x = await tank.getX();
      const y = await tank.getY();
      const speed = await tank.getSpeed();
      config.yourState.last = config.yourState.current;
      config.yourState.current = {
        x,
        y,
        speed
      };
    };
  
    const checkPosition = (x, y) => {
      if (x < config.boundaries.x / 2) {
        if (y === config.boundaries.y / 2) {
          return ["NE", "SE", "E"];
        } else if (y < config.boundaries.y / 2) {
          return ["N", "NE", "E"];
        }
        return ["S", "SE", "E"];
      }
      if (y === config.boundaries.y / 2) {
        return ["NW", "SW", "W"];
      } else if (y < config.boundaries.y / 2) {
        return ["N", "NW", "W"];
      }
      return ["S", "SW", "W"];
    };
  
    const checkAngles = (x, y) =>
      checkPosition(x, y).map(direction => config.angles[direction]);
  
    const run = async tank => {
      const { x, y } = config.yourState.current;
      const anglesToCheck = checkAngles(x, y);
      for (const direction of anglesToCheck) {
        const scan = await tank.scan(direction, 10);
        scan && (await attack(tank, scan, direction, 1));
      }
    };
  
    const findNearestBorder = (x, y) => {
      if (x < config.boundaries.x / 2) {
        if (y === config.boundaries.y / 2) {
          return "W";
        }
        if (y < config.boundaries.y / 2) {
          return "S";
        }
        return "N";
      }
      if (y === config.boundaries.y / 2) {
        return "E";
      }
      if (y < config.boundaries.y / 2) {
        return "S";
      }
      return "N";
    };
  
    const stop = async tank => {
      const { x, y } = config.yourState.current;
      const nearestBorder = findNearestBorder(x, y);
      const direction = config.angles[nearestBorder];
      await tank.drive(direction, config.maxSpeed);
      let whileFlag = true;
      while (whileFlag) {
        await updateState(tank);
        const { x, y } = config.yourState.current;
        if (
          x < config.securityDistanceToBorder ||
          x > config.boundaries.x - config.securityDistanceToBorder ||
          y < config.securityDistanceToBorder ||
          y > config.boundaries.y - config.securityDistanceToBorder
        ) {
          whileFlag = false;
          await tank.drive(direction, 0);
        }
      }
    };
  
    const avoidCollision = async tank => {
      const { x, y } = config.yourState.current;
      const {
        direction,
        angle
      } = getDirectionAndAngle();
      if (direction === "N") {
        if (y > config.boundaries.y - config.securityDistanceToBorder) {
          await tank.drive(angle, 0);
        }
      }
      if (direction === "E") {
        if (x > config.boundaries.x - config.securityDistanceToBorder) {
          await tank.drive(angle, 0);
        }
      }
      if (direction === "S") {
        if (y < config.securityDistanceToBorder) {
          await tank.drive(angle, 0);
        }
      }
      if (direction === "W") {
        if (x < config.securityDistanceToBorder) {
          await tank.drive(angle, 0);
        }
      }
    };
  
    const getDirectionAndAngle = () => {
      const direction = config.directions[config.directionIndex];
      const angle = config.angles[direction];
      return { 
        direction, 
        angle 
      };
    };
  
    const move = async tank => {
      const { x, y } = config.yourState.current;
      const nearestBorder = findNearestBorder(x, y);
      const nearestBorderIndex = config.directions.indexOf(nearestBorder);
      config.directionIndex = nearestBorderIndex;
    };
  
    const getNextDirectionIndex = () => (config.directionIndex + 1) % config.directions.length;
  
    const turn = async tank => {
      if (config.yourState.current.speed === 0) {
        config.directionIndex = getNextDirectionIndex();
        const { angle } = getDirectionAndAngle();
        await tank.drive(angle, config.maxSpeed);
      }
    };
  
    const findCenter = centerDirection => {
      switch (centerDirection) {
        case "N":
          return ["NW", "N", "NE"];
        case "E":
          return ["NE", "E", "SE"];
        case "S":
          return ["SW", "S", "SE"];
        case "W":
          return ["NW", "W", "SW"];
      }
    };
  
    const getOppositeDirecion = direction => {
      switch (direction) {
        case "N":
          return "S";
        case "E":
          return "w";
        case "S":
          return "N";
        case "w":
          return "E";
      }
    };
  
    const attack = async (tank, scan, angle, number = 1) => {
      if (number === 2) {
        await tank.shoot(angle, scan);
        await tank.shoot(angle + (Math.random() > 0.5 ? -10 : +10), scan);
      } else {
        await tank.shoot(angle, scan);
      }
    };
  
    const ensureStraightMove = async tank => {
      const { x: lastX, y: lastY } = config.yourState.last;
      const { x, y } = config.yourState.current;
  
      if ([0, 2].includes(config.directionIndex)) {
        if (Math.abs(x - lastX) > 10) {
          const { angle } = getDirectionAndAngle();
          await tank.drive(angle, config.maxSpeed);
        }
      } else {
        if (Math.abs(y - lastY) > 10) {
          const { angle } = getDirectionAndAngle();
          await tank.drive(angle, config.maxSpeed);
        }
      }
    };
  
    const getCenterDirectionIndex = () => {
      switch (config.directionIndex) {
        case 0:
          return 1;
        case 1:
          return 2;
        case 2:
          return 3;
        case 3:
          return 0;
      }
    };
  
    const scanCenter = async tank => {
      const { angle: sameDirectionAngle, direction } = getDirectionAndAngle();
      const sameDirectionScan = await tank.scan(sameDirectionAngle, 10);
      sameDirectionScan && (await attack(tank, sameDirectionScan, sameDirectionAngle, 2));
      const centerDirectionIndex = getCenterDirectionIndex();
      const centerDirection = config.directions[centerDirectionIndex];
      const positionsToCheck = [...findCenter(centerDirection), getOppositeDirecion(direction)];
      for (const position of positionsToCheck) {
        const angle = config.angles[position];
        const scan = await tank.scan(angle, 10);
        scan && await attack(tank, scan, angle, 2);
      }
    };
  
    const init = async tank => {
      await move(tank);
      while (true) {
        await updateState(tank);
        await turn(tank);
        await avoidCollision(tank);
        await ensureStraightMove(tank);
        if (config.yourState.current.speed > config.midSpeed) {
          await scanCenter(tank);
        }
      }
    };
  
    await updateState(tank);
    await run(tank);
    await stop(tank);
    await init(tank);
  }
}